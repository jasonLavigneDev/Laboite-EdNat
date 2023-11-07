import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';
import Minio from 'minio';

import s3Client from './config';
import { isActive } from '../../utils';
import logServer, { levels, scopes } from '../../logging';
import Services from '../../services/services';
import { hasAdminRightOnStructure } from '../../structures/utils';
import Structures from '../../structures/structures';

const { minioEndPoint, minioBucket, minioPort } = Meteor.settings.public;

const HOST = `https://${minioEndPoint}${minioPort ? `:${minioPort}` : ''}/${minioBucket}/`;

const checkUserAdminRights = (path, userId) => {
  // check if current user has admin rights
  const isAdmin = isActive(userId) && Roles.userIsInRole(userId, 'admin');
  if (!isAdmin) {
    // check specific permissions if not admin
    const isUserPath = path === `users/${userId}`;
    let isGroupAdmin = false;
    if (path.includes('groups/')) {
      const groupID = path.slice(-17);
      isGroupAdmin = Roles.userIsInRole(userId, ['animator', 'admin'], groupID);
    }
    let isStructureAdmin = false;
    if (path.startsWith('services/')) {
      const serviceID = path.split('/')[1];
      if (serviceID === 'undefined') {
        // creating new service (temporary state before service is created)
        isStructureAdmin = true;
      } else {
        const service = Services.findOne(serviceID);
        isStructureAdmin = service.structure && hasAdminRightOnStructure({ userId, structureId: service.structure });
      }
    } else if (path.startsWith('structures/')) {
      const structureId = path.split('/')[1];
      if (structureId !== undefined) {
        const structure = Structures.findOne(structureId);
        isStructureAdmin = structure && hasAdminRightOnStructure({ userId, structureId });
      }
    }
    if (!isUserPath && !isGroupAdmin && !isStructureAdmin) {
      logServer(
        `FILES - METHODS - METEOR ERROR - checkUserAdminRights - ${i18n.__('api.users.adminNeeded')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { path, userId },
      );
      throw new Meteor.Error('api.users.notPermitted', i18n.__('api.users.adminNeeded'));
    }
  }
};

function _validatePath(path) {
  const allowedTypes = ['users', 'groups', 'services', 'structures'];
  const parts = path.split('/');
  if (parts.length >= 2) {
    if (allowedTypes.includes(parts[0])) {
      // don't allow .. or * as second part of path
      let partsOk = true;
      parts.slice(1).forEach((part) => {
        if (part === '..' || part === '*') partsOk = false;
      });
      if (partsOk) return undefined;
    }
  }
  return SimpleSchema.ErrorTypes.VALUE_NOT_ALLOWED;
}

const fileNameRegex = /[*/|\\:!<>&]/;

function _validateName(name) {
  // check filename safety (should not include ..,*,/,|,\,:,!,<,>,&)
  return fileNameRegex.test(name) || name.includes('..') ? SimpleSchema.ErrorTypes.VALUE_NOT_ALLOWED : undefined;
}

function validateFilePath() {
  const path = this.value;
  return _validatePath(path);
}

function validateFileName() {
  const name = this.value;
  return _validateName(name);
}

function validateFileFull() {
  const fullName = this.value.replace(HOST, '');
  // validate path part and file part
  const parts = fullName.split('/');
  if (parts.length === 3) {
    const path = parts.slice(0, 2).join('/');
    if (_validatePath(path) === undefined && _validateName(parts[2]) === undefined) return undefined;
  }
  return SimpleSchema.ErrorTypes.VALUE_NOT_ALLOWED;
}

function checkExtension(name) {
  const fileTypes = [
    ...Meteor.settings.public.imageFilesTypes,
    ...Meteor.settings.public.audioFilesTypes,
    ...Meteor.settings.public.videoFilesTypes,
    ...Meteor.settings.public.textFilesTypes,
    ...Meteor.settings.public.otherFilesTypes,
  ];
  const extension = name.split('.').pop();
  if (!fileTypes.includes(extension)) {
    logServer(
      `FILES - METHODS - METEOR ERROR - checkExtension - ${i18n.__(
        'components.UploaderNotifier.formatNotAcceptedTitle',
      )}`,
      levels.ERROR,
      scopes.SYSTEM,
      { name },
    );
    throw new Meteor.Error(
      'components.UploadNotifier.ExtensionNotAllowed',
      i18n.__('components.UploaderNotifier.formatNotAcceptedTitle'),
    );
  }
}

export const filesupload = new ValidatedMethod({
  name: 'files.upload',
  validate: new SimpleSchema({
    file: String,
    name: {
      type: String,
      custom: validateFileName,
    },
    path: {
      type: String,
      custom: validateFilePath,
    },
    fileType: String,
    storage: Boolean,
  }).validator(),
  async run({ file, path, name, fileType, storage }) {
    try {
      checkUserAdminRights(path, this.userId);
      checkExtension(name);
      const { minioFileSize, minioStorageFilesSize } = Meteor.settings.public;
      const size = storage ? minioStorageFilesSize : minioFileSize;
      if (file.length < size) {
        const filePath = `${path}/${name}`;
        const fileArray = file.split(',');
        const [fileData, fileData2] = fileArray;
        const buffer = Buffer.from(fileData2 || fileData, 'base64');
        const metadata = {};

        // ? Needs this to ensure minio serve the SVG with correct content-type in order to have them displayed properly in HTML
        // * ISSUE : https://gitlab.mim-libre.fr/alphabet/laboite/-/issues/158
        if (fileType.includes('svg')) {
          metadata['Content-Type'] = 'image/svg+xml';
        }

        const result = await s3Client.putObject(minioBucket, filePath, buffer, metadata);

        return result;
      }
      throw new Meteor.Error(
        i18n.__('components.UploaderNotifier.fileTooLargeTitle'),
        `${i18n.__('components.UploaderNotifier.fileTooLarge')} ${size / 1000}ko`,
      );
    } catch (error) {
      logServer(`FILES - METHODS - METEOR ERROR - filesupload`, levels.ERROR, scopes.SYSTEM, { error });
      throw new Meteor.Error(error.typeError, error.message);
    }
  },
});

export async function removeFilesFolder(path) {
  const results = new Promise((resolve, reject) => {
    const stream = s3Client.listObjectsV2(minioBucket, path, true, '');
    stream.on('data', (obj) => {
      s3Client.removeObject(minioBucket, obj.name);
    });
    stream.on('error', (error) => {
      reject(error);
    });
    stream.on('end', () => {
      resolve();
    });
  });
  return results;
}

export const removeSelectedFiles = new ValidatedMethod({
  name: 'files.selectedRemove',
  validate: new SimpleSchema({
    toRemove: {
      type: Array,
      optional: true,
    },
    'toRemove.$': {
      type: String,
      custom: validateFileFull,
    },
    toKeep: {
      type: Array,
      optional: true,
    },
    'toKeep.$': {
      type: String,
      custom: validateFileFull,
    },
    path: {
      type: String,
      custom: validateFilePath,
    },
  }).validator(),
  async run({ path, toRemove = [], toKeep = [] }) {
    checkUserAdminRights(path, this.userId);

    if (toRemove.length) {
      const results = new Promise((resolve, reject) => {
        const objectNames = toRemove.map((img) => img.replace(HOST, ''));
        const stream = s3Client.listObjectsV2(minioBucket, `${path}/`, true, '');
        stream.on('data', (obj) => {
          if (objectNames.find((img) => img === obj.name)) {
            s3Client.removeObject(minioBucket, obj.name);
          }
        });
        stream.on('error', (error) => {
          reject(error);
        });
        stream.on('end', () => {
          resolve();
        });
      });
      return results;
    }
    if (toKeep.length) {
      const results = new Promise((resolve, reject) => {
        const objectNames = toKeep.map((img) => img.replace(HOST, ''));
        const stream = s3Client.listObjectsV2(minioBucket, path, true, '');
        stream.on('data', (obj) => {
          if (!objectNames.includes(obj.name)) {
            s3Client.removeObject(minioBucket, obj.name);
          }
        });
        stream.on('error', (error) => {
          reject(error);
        });
        stream.on('end', () => {
          resolve();
        });
      });
      return results;
    }
    return null;
  },
});

export const moveFiles = new ValidatedMethod({
  name: 'files.move',
  validate: new SimpleSchema({
    sourcePath: {
      type: String,
      custom: validateFilePath,
    },
    destinationPath: {
      type: String,
      custom: validateFilePath,
    },
    files: Array,
    'files.$': {
      type: String,
      custom: validateFileFull,
    },
  }).validator(),
  async run({ sourcePath, destinationPath, files }) {
    checkUserAdminRights(destinationPath, this.userId);
    const conds = new Minio.CopyConditions();
    files.forEach((file) => {
      const toReplace = `${HOST}${sourcePath}/`;
      const newFile = file.replace(toReplace, '');

      s3Client.copyObject(
        minioBucket,
        `${destinationPath}/${newFile}`,
        `${minioBucket}/${sourcePath}/${newFile}`,
        conds,
        (err) => {
          s3Client.removeObject(minioBucket, `${sourcePath}/${newFile}`);
          if (err) {
            logServer(
              `FILES - METHODS - ERROR - moveFiles - 
              Error copying ${newFile} from ${minioBucket}/${sourcePath}/${newFile} to ${destinationPath}/${newFile}`,
              levels.ERROR,
              scopes.SYSTEM,
              {
                sourcePath,
                destinationPath,
                files,
                err,
              },
            );
          }
        },
      );
    });
  },
});

export const rename = new ValidatedMethod({
  name: 'files.rename',
  validate: new SimpleSchema({
    path: {
      type: String,
      custom: validateFilePath,
    },
    oldName: {
      type: String,
      custom: validateFileName,
    },
    newName: {
      type: String,
      custom: validateFileName,
    },
  }).validator(),
  async run({ path, oldName, newName }) {
    checkUserAdminRights(path, this.userId);
    checkExtension(newName);
    const conds = new Minio.CopyConditions();
    s3Client.copyObject(minioBucket, `${path}/${newName}`, `${minioBucket}/${path}/${oldName}`, conds, (err) => {
      s3Client.removeObject(minioBucket, `${path}/${oldName}`);
      if (err) {
        logServer(
          `FILES - METHODS - ERROR - rename - Error renaming ${minioBucket}/${path}/${oldName} to ${path}/${newName}`,
          levels.ERROR,
          scopes.SYSTEM,
          {
            path,
            oldName,
            newName,
            err,
          },
        );
      }
    });
  },
});

export const getFilesForCurrentUser = new ValidatedMethod({
  name: 'files.user',
  validate: null,
  async run() {
    const authorized = isActive(this.userId);
    if (!authorized) {
      logServer(
        `FILES - METHODS - METEOR ERROR - getFilesForCurrentUser - ${i18n.__('api.users.adminNeeded')}`,
        levels.ERROR,
        scopes.SYSTEM,
      );
      throw new Meteor.Error('api.users.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    try {
      const results = new Promise((resolve, reject) => {
        const stream = s3Client.listObjectsV2(minioBucket, `users/${this.userId}`, true, '');
        const files = [];
        stream.on('data', (obj) => {
          files.push(obj);
        });
        stream.on('error', (err) => {
          reject(err);
        });

        stream.on('end', () => {
          resolve(files);
        });
      });
      return results;
    } catch (error) {
      logServer(
        `FILES - METHODS - METEOR ERROR - getFilesForCurrentUser - ${i18n.__('api.users.adminNeeded')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { error },
      );
      throw new Meteor.Error(error.typeError, error.message);
    }
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([filesupload, removeSelectedFiles, moveFiles, rename, getFilesForCurrentUser], 'name');

// Only allow 5 list operations per connection per second
DDPRateLimiter.addRule(
  {
    name(name) {
      return _.contains(LISTS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() {
      return true;
    },
  },
  5,
  1000,
);

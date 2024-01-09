import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import SimpleSchema from 'simpl-schema';
import sanitizeHtml from 'sanitize-html';
import { testMeteorSettingsUrl } from '../ui/utils/utilsFuncs';
import logServer, { levels, scopes } from './logging';

export function isActive(userId) {
  if (!userId) return false;
  const user = Meteor.users.findOne(userId, { fields: { isActive: 1 } });
  if (user.isActive === true) return true;
  return false;
}

export function getLabel(i18nLabel) {
  return () => i18n.__(i18nLabel);
}

export const checkPaginationParams = new SimpleSchema({
  page: { type: SimpleSchema.Integer, defaultValue: 1, label: getLabel('api.methods.labels.page') },
  itemPerPage: { type: SimpleSchema.Integer, defaultValue: 10, label: getLabel('api.methods.labels.pageSize') },
  search: { type: String, defaultValue: '', label: getLabel('api.methods.labels.filter') },
});

export function registerSchemaMessages() {
  const regExpMessages = [
    { exp: SimpleSchema.RegEx.Email, msg: 'SimpleSchema.RegEx.Email' },
    { exp: SimpleSchema.RegEx.EmailWithTLD, msg: 'SimpleSchema.RegEx.EmailWithTLD' },
    { exp: SimpleSchema.RegEx.Domain, msg: 'SimpleSchema.RegEx.Domain' },
    { exp: SimpleSchema.RegEx.WeakDomain, msg: 'SimpleSchema.RegEx.WeakDomain' },
    { exp: SimpleSchema.RegEx.IP, msg: 'SimpleSchema.RegEx.IP' },
    { exp: SimpleSchema.RegEx.IPv4, msg: 'SimpleSchema.RegEx.IPv4' },
    { exp: SimpleSchema.RegEx.IPv6, msg: 'SimpleSchema.RegEx.IPv6' },
    { exp: SimpleSchema.RegEx.Url, msg: 'SimpleSchema.RegEx.Url' },
    { exp: SimpleSchema.RegEx.Id, msg: 'SimpleSchema.RegEx.Id' },
    { exp: SimpleSchema.RegEx.ZipCode, msg: 'SimpleSchema.RegEx.ZipCode' },
    { exp: SimpleSchema.RegEx.Phone, msg: 'SimpleSchema.RegEx.Phone' },
  ];
  SimpleSchema.setDefaultMessages({
    messages: {
      en: {
        required: (ctx) => i18n.__('SimpleSchema.required', ctx),
        minString: (ctx) => i18n.__('SimpleSchema.minString', ctx),
        maxString: (ctx) => i18n.__('SimpleSchema.maxString', ctx),
        minNumber: (ctx) => i18n.__('SimpleSchema.minNumber', ctx),
        maxNumber: (ctx) => i18n.__('SimpleSchema.maxNumber', ctx),
        minNumberExclusive: (ctx) => i18n.__('SimpleSchema.minNumberExclusive', ctx),
        maxNumberExclusive: (ctx) => i18n.__('SimpleSchema.maxNumberExclusive', ctx),
        minDate: (ctx) => i18n.__('SimpleSchema.minDate', ctx),
        maxDate: (ctx) => i18n.__('SimpleSchema.maxDate', ctx),
        badDate: (ctx) => i18n.__('SimpleSchema.badDate', ctx),
        minCount: (ctx) => i18n.__('SimpleSchema.minCount', ctx),
        maxCount: (ctx) => i18n.__('SimpleSchema.maxCount', ctx),
        noDecimal: (ctx) => i18n.__('SimpleSchema.noDecimal', ctx),
        notAllowed: (ctx) => i18n.__('SimpleSchema.notAllowed', ctx),
        expectedType: (ctx) => {
          const finalCtx = { ...ctx };
          const i18nEntry = `SimpleSchema.dataTypes.${ctx.dataType}`;
          const typeTranslated = i18n.__(i18nEntry);
          if (typeTranslated !== i18nEntry) {
            // translatation for type is available
            finalCtx.dataType = typeTranslated;
          }
          return i18n.__('SimpleSchema.expectedType', finalCtx);
        },
        keyNotInSchema: (ctx) => i18n.__('SimpleSchema.keyNotInSchema', ctx),
        regEx({ label, regExp }) {
          // See if there's one where exp matches this expression
          let msgObj;
          if (regExp) {
            msgObj = regExpMessages.find((o) => o.exp && o.exp.toString() === regExp);
          }

          const regExpMessage = msgObj ? i18n.__(msgObj.msg) : i18n.__('SimpleSchema.RegEx.Default');

          return `${label} ${regExpMessage}`;
        },
      },
    },
  });
}

export function genRandomPassword(pwdlen = 16) {
  // original code and explanations here :
  // https://www.geeksforgeeks.org/how-to-generate-a-random-password-using-javascript/
  let password = '';
  const allChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';

  for (let i = 1; i <= pwdlen; i += 1) {
    const char = Math.floor(Math.random() * allChars.length + 1);
    password += allChars.charAt(char);
  }

  return password;
}

export function handleResult(resolve, reject) {
  return (error, result) => {
    if (error) {
      msg.error(error.reason);
      reject(error);
    } else {
      msg.success(i18n.__('api.methods.operationSuccessMsg'));
      resolve(result);
    }
  };
}
export function mergeDeep(...objects) {
  const isObject = (obj) => obj && typeof obj === 'object';

  return objects.reduce((prev, obj) => {
    const newData = prev;
    Object.keys(obj).forEach((key) => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        newData[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        newData[key] = mergeDeep(pVal, oVal);
      } else {
        newData[key] = oVal;
      }
    });

    return newData;
  }, {});
}

/** - Transform a flat data into a tree data
 *
 *  - Aimed to use for structures
 */
export const getTree = (
  flatData,
  rootKey = null,
  getParentKey = (node) => node.parentId,
  getKey = (node) => node._id,
) => {
  if (!flatData) {
    return [];
  }

  const childrenToParents = {};
  flatData.forEach((child) => {
    const parentKey = getParentKey(child);

    if (parentKey in childrenToParents) {
      childrenToParents[parentKey].push(child);
    } else {
      childrenToParents[parentKey] = [child];
    }
  });

  if (!(rootKey in childrenToParents)) {
    return [];
  }

  const trav = (parent) => {
    const parentKey = getKey(parent);
    if (parentKey in childrenToParents) {
      return {
        ...parent,
        children: childrenToParents[parentKey].map((child) => trav(child)),
      };
    }

    return { ...parent };
  };

  const result = childrenToParents[rootKey].map((child) => trav(child));

  return result;
};

/**
 * - valid language is like `en` or `fr`
 *
 * - default value of language is current i18n one
 */
export const getCurrentIntroduction = ({ introduction, language = i18n.getLocale().split('-')[0] }) =>
  introduction.find((entry) => entry.language === language);

export const getCurrentText = ({ data, language = i18n.getLocale().split('-')[0] }) =>
  data.find((entry) => entry.language === language) || [];

export const testUrl = (URL, withSlash = false) => {
  const testedUrl = testMeteorSettingsUrl(URL, withSlash);
  return URL.startsWith('http') ? testedUrl : `https://${testedUrl}`;
};

const regValidateStrict = /[<>"'&]/g;
const regValidate = /((<|%3C|&lt;)script)|(('|"|%22|%27) *on[a-z_]+ *(=|%3D))/gi;

/** Check a string for malicious content */
export const validateString = (content, strict = false) => {
  if (content.length > 500000) {
    logServer(
      `UTILS - API - METEOR ERROR - validateString - ${i18n.__('api.utils.stringTooLong')}`,
      levels.WARN,
      scopes.SYSTEM,
      { content, strict },
    );
    throw new Meteor.Error('api.utils.validateString.stringTooLong', i18n.__('api.utils.stringTooLong'));
  }
  /** strict forbids any of the following characters : < > " ' &
      otherwise, forbid script tags and pattern like " onload=... */
  const scriptRegex = strict ? regValidateStrict : regValidate;
  if (content.match(scriptRegex) !== null) {
    logServer(
      `UTILS - API - METEOR ERROR - validateString - ${i18n.__('api.utils.scriptDetected')}`,
      levels.ERROR,
      scopes.SYSTEM,
      { content, strict },
    );
    throw new Meteor.Error(
      'api.utils.validateString.error',
      i18n.__(strict ? 'api.utils.badCharsDetected' : 'api.utils.scriptDetected'),
    );
  }
  return content;
};

export const accentInsensitive = (searchString) => {
  // inspired from https://stackoverflow.com/questions/227950/
  const accented = {
    // eslint-disable-next-line max-len
    A: '[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]',
    // eslint-disable-next-line max-len
    E: '[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]',
    // eslint-disable-next-line max-len
    I: '[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]',
    // eslint-disable-next-line max-len
    O: '[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]',
    // eslint-disable-next-line max-len
    U: '[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]',
    C: '[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]',
  };

  // replace characters by their compositors
  const accentReplacer = (chr) => {
    return accented[chr.toUpperCase()] || chr;
  };
  const result = searchString.replace(/\S/g, accentReplacer);
  return result;
};

export const formatURL = (name) => {
  let finalName = name;
  if (!name.includes('://')) {
    finalName = `https://${name}`;
  }
  return finalName;
};

// allow iframes for embedded videos in blog articles
export const sanitizeParameters = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['iframe', 'img', 'audio', 'video']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    iframe: ['src', 'frameborder', 'allowfullscreen'],
    span: ['contenteditable'],
    audio: ['preload', 'controls', 'src'],
    video: ['preload', 'controls', 'src', 'width'],
    a: ['href', 'name', 'target', 'rel'],
  },
  allowedClasses: {
    ...sanitizeHtml.defaults.allowedClasses,
    iframe: ['ql-video'],
    div: ['embed-audio', 'audio-wrapper', 'embed-responsive', 'webcam-video-wrapper'],
    audio: ['embed-responsive-audio-item'],
    video: ['embed-responsive-item'],
    p: ['ql-indent-*'],
  },
};

export function template(content, options) {
  return Object.entries(options).reduce((acc, [key, value]) => {
    const re = new RegExp(`{{${key}}}`, 'g');

    return acc.replace(re, value);
  }, content);
}

import { Meteor } from 'meteor/meteor';
import * as winston from 'winston';
import i18n from 'meteor/universe:i18n';
import { NOTIFICATIONS_TYPES } from './notifications/enums';

export const levels = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  HTTP: 'http',
  VERBOSE: 'verbose',
  DEBUG: 'debug',
  SILLY: 'silly',
};

export const scopes = {
  SYSTEM: 'SYSTEM',
  ADMIN: 'ADMIN',
  USER: 'USER',
};

let logger = 0;

const { combine, timestamp, printf, colorize, align, padLevels, label } = winston.format;

function logServer(message, level = 'info', scope = 'USER', params = {}) {
  if (Meteor.isServer && !Meteor.isTest) {
    const fileFormat = combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      align(),
      padLevels(),
      label({ label: scope, message: true }),
      printf((info) => `${info.timestamp} [${info.level}] ${info.message}`),
    );

    if (logger === 0) {
      console.log('Initialize logger');
      logger = winston.createLogger({
        transports: [
          new winston.transports.Console({
            level: process.env.LOG_LEVEL || levels.INFO,

            format: combine(colorize({ all: true }), fileFormat),
            silent: Meteor.isTest,
          }),
        ],
      });
    }
    logger.log(level, `${message.toString()} ${JSON.stringify({ ...params })}`);
    if (level === levels.ERROR && params.callerId) {
      // send notification to user if error and callerId is specified
      const expireAt = new Date();
      // notification expires in 7 days
      expireAt.setDate(expireAt.getDate() + 7);
      const notifData = {
        userId: params.callerId,
        title: i18n.__(`api.logging.${level}`),
        content: message.toString(),
        type: NOTIFICATIONS_TYPES.ERROR,
        expireAt,
      };
      Meteor.call('notifications.createNotification', { data: notifData });
    }
  }
}

export default logServer;

import * as winston from 'winston';
import 'winston-daily-rotate-file';

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

const { combine, timestamp, printf, colorize, align, padLevels, label } = winston.format;

function logServer(message, level = 'info', scope = 'USER', params = {}) {
  if (Meteor.isServer) {
    const fileFormat = combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      align(),
      padLevels(),
      label({ label: scope, message: true }),
      printf((info) => `${info.timestamp} [${info.level}] ${info.message} ${JSON.stringify({ ...params })}`),
    );

    const logger = winston.createLogger({
      transports: [
        new winston.transports.Console({
          // level: process.env.LOG_LEVEL,
          level: levels.VERBOSE,

          format: combine(colorize({ all: true }), fileFormat),
        }),
      ],
    });

    logger.log(level, message.toString());
  }
}

export default logServer;

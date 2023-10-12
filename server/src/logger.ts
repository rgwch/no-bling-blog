
import winston from 'winston'
/*
  simple logging configuration. To use this preconfigured logger, don't require 'winston',
  but require('logger')
*/

export const logger = winston.createLogger({
  level: (process.env.NODE_ENV==="debug") ? 'debug' : 'warn',
  silent: false,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.splat(),
    winston.format.simple(),
  ),
  transports: [new winston.transports.Console({ silent: false })],
})

logger.info('no-bling-blog: logger created')


import winston from 'winston'
/*
  simple logging configuration. To use this preconfigured logger, don't require 'winston',
  but require('logger')
*/

const logfile = new winston.transports.File({ filename: '../nbb.log', silent: false })
const console = new winston.transports.Console({ silent: false })
const transports = process.env.NODE_ENV === "debug" ? [console] : [logfile]
export const logger = winston.createLogger({
  level: (process.env.NODE_ENV === "debug") ? 'debug' : 'warn',
  silent: false,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.splat(),
    winston.format.simple(),
  ),
  transports
})

logger.info('no-bling-blog: logger created')

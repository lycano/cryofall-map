/**
 * Winston Logger Module
 */

const winston = require('winston')
const path = require('path')

// Configure custom app-wide logger
module.exports = new winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  exitOnError: false,
  format: winston.format.simple(),
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({
      name: 'info-file',
      filename: path.resolve(__dirname, '../info.log'),
      level: 'info'
    }),
    new (winston.transports.File)({
      name: 'error-file',
      filename: path.resolve(__dirname, '../error.log'),
      level: 'error'
    })
  ]
})

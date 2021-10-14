"use strict";

require('dotenv').config();
const winston = require('winston');

const format = winston.format.combine(
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
);

const options = {
    file: {
        level   : process.env.LOG_LEVEL || 'info',
        filename: process.env.LOG_PATH || './sharemyfiles.log',
        handleExceptions: true,
        json    : false,
        maxsize : 100*1024, // [B]
        maxFiles: 5,
        colorize: false,
        format  : format,
    },
    console: {
        level   : process.env.LOG_LEVEL || 'debug',
        handleExceptions: true,
        json    : false,
        colorize: true,
        format  : format,
    },
};
  
const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    transports: [
        new winston.transports.File(options.file),
    ],
    exitOnError: false
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console(options.console));
};
  
module.exports = logger;

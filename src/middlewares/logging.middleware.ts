import winston from 'winston';
import expressWinston from 'express-winston';
import { logger } from '../utils';

const loggingMiddleware = expressWinston.logger({
    winstonInstance: logger,
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
    format: winston.format.combine(winston.format.colorize(), winston.format.json()),
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}}',
    expressFormat: true,
    colorize: false,
    ignoreRoute: function () {
        return false;
    },
});

const errorLogger = expressWinston.errorLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ],
    format: winston.format.combine(winston.format.colorize(), winston.format.json()),
});

export default {
    logger: loggingMiddleware,
    errorLogger,
};

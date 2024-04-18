import winston from 'winston';

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
        new winston.transports.File({
            filename: 'combined.log',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
    ],
    format: winston.format.combine(winston.format.colorize(), winston.format.json()),
});

export default logger;

import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { validationResult } from 'express-validator';
import winston from 'winston';

/**
 * Middleware function to validate request parameters.
 * @function validateParams
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 * @returns {void}
 * @throws {Object} Returns a 422 status code with an array of validation errors if the request parameters are invalid.
 * @description This middleware function uses the `express-validator` library to validate the request parameters.
 * It checks if there are any validation errors using `validationResult(req)`. If there are errors, it returns a
 * 422 status code with an array of validation errors. If there are no errors, it calls the `next()` function to
 * pass control to the next middleware or route handler.
 */
export function validateParams(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    next();
}

/**
 * Winston logger configuration.
 * @type {Object}
 * @property {Array<Object>} transports - Array of logger transports.
 * @property {Object} transports[0] - Console transport configuration.
 * @property {Object} transports[0].format - Console log format configuration.
 * @property {Object} transports[1] - File transport configuration.
 * @property {string} transports[1].filename - Log file name.
 * @property {Object} transports[1].format - File log format configuration.
 */
export const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
        new winston.transports.File({
            filename: 'combined.log',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
    ],
});

/**
 * Rate limiter middleware configuration.
 * @type {Object}
 * @property {number} windowMs - Time window in milliseconds (15 minutes).
 * @property {number} limit - Maximum number of requests allowed per IP within the time window.
 * @property {string} standardHeaders - Rate limiting headers standard ('draft-7').
 * @property {boolean} legacyHeaders - Flag to disable legacy 'X-RateLimit-*' headers.
 */
export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

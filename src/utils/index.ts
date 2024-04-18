import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

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

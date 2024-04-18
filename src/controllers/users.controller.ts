import { NextFunction, Request, Response } from 'express';
import users from '../services/users.service';

/**
 * Creates a new user.
 * @async
 * @function create
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const response = await users.create(req.body);
        if (response.status === 201) return res.status(response.status).json(response.user);
        return res.status(response.status).json({ message: response.message });
    } catch (err) {
        res.status(500).send({ message: err.message });
        next(err);
    }
}

/**
 * Retrieves multiple users.
 * @async
 * @function get
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
async function get(req: Request, res: Response, next: NextFunction) {
    try {
        const { created } = req.query as { created: 'asc' | 'desc' };
        res.json(await users.getMultiple(created));
    } catch (err) {
        next(err);
    }
}

export default {
    get,
    create,
};

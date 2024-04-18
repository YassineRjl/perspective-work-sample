import { NextFunction, Request, Response } from 'express';
import sessions from '../services/session.service';

/**
 * Handles user signin request.
 * @async
 * @function signin
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 * @returns {Promise<void>} - Returns a JSON response with token or error message.
 */
async function signin(req: Request, res: Response, next: NextFunction) {
    try {
        const response = await sessions.create(req.body);
        if (response.status === 200) return res.json({ token: response.token });
        return res.status(response.status).json({ message: response.message });
    } catch (err) {
        res.status(500).send({ message: err.message });
        next(err);
    }
}

/**
 * Handles user logout request.
 * @async
 * @function logout
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 * @returns {Promise<void>} - Returns a JSON response with success or error message.
 */
async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        const response = await sessions.remove(req.user?.id);
        if (response.status === 200) return res.json({ message: response.message });
        return res.status(response.status).json({ message: response.message });
    } catch (err) {
        res.status(500).send({ message: err.message });
        next(err);
    }
}

export default {
    signin,
    logout,
};

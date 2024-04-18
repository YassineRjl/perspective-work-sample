/// <reference path="../types.d.ts" />

import { User } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../services/db.service';

/**
 * Middleware function to authenticate user based on provided token.
 * @async
 * @function authenticate
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 * @returns {Promise<void>} - Returns a JSON response with an error message if authentication fails, otherwise calls the next middleware.
 */
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Auth Error: No token provided.' });
    }

    // verify the token then retrieve the user
    let id;
    try {
        const { id: tokenId } = jwt.verify(token, process.env.JWT_SECRET as string) as Pick<
            User,
            'id'
        >;
        id = tokenId;
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    // attach the user to be accessible for the next handlers
    req.user = user;
    next();
};

export default authenticate;

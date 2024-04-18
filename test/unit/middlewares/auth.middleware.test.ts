import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../src/services/db.service';
import authMiddleware from '../../../src/middlewares/auth.middleware';

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
}));

jest.mock('../../../src/services/db.service', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
    },
}));

describe('auth.middleware', () => {
    let req: Request;
    let res: Response;
    let next: NextFunction;
    beforeEach(() => {
        req = {
            header: jest.fn(),
        } as unknown as Request;
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        } as unknown as Response;
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 if no token is provided', async () => {
        (req.header as jest.Mock).mockReturnValueOnce(undefined);

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Auth Error: No token provided.' });
    });

    it('should return 401 if token is invalid', async () => {
        const token = 'invalidToken';
        (req.header as jest.Mock).mockReturnValueOnce(`Bearer ${token}`);
        (jwt.verify as jest.Mock).mockImplementationOnce(() => {
            throw new Error('Invalid token');
        });

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    });

    it('should return 401 if user is not found', async () => {
        const token = 'validToken';
        const decodedToken = { id: '1' };
        (req.header as jest.Mock).mockReturnValueOnce(`Bearer ${token}`);
        (jwt.verify as jest.Mock).mockReturnValueOnce(decodedToken);
        (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(undefined);

        await authMiddleware(req, res, next);

        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: decodedToken.id } });
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    });

    it('should attach user to request and call next if token is valid', async () => {
        const token = 'validToken';
        const decodedToken = { id: '1' };
        const user = { id: '1', name: 'John Doe', email: 'john@example.com' };
        (req.header as jest.Mock).mockReturnValueOnce(`Bearer ${token}`);
        (jwt.verify as jest.Mock).mockReturnValueOnce(decodedToken);
        (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(user);

        await authMiddleware(req, res, next);

        expect(req.user).toEqual(user);
        expect(next).toHaveBeenCalled();
    });
});

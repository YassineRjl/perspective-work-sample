import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import sessions from '../../../src/services/session.service';
import { prisma } from '../../../src/services/db.service';

jest.mock('../../../src/services/db.service', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
        session: {
            findMany: jest.fn(),
            create: jest.fn(),
            updateMany: jest.fn(),
        },
    },
}));

describe('sessions.service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('create', () => {
        it('should return 400 if user does not exist', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(undefined);

            const result = await sessions.create({
                email: 'john@example.com',
                password: 'password',
            });

            expect(result).toEqual({ status: 400, message: 'Invalid username or password.' });
        });

        it('should return 400 if password is invalid', async () => {
            const user = { id: '1', password: 'hashedPassword' };
            (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(user);
            jest.spyOn(bcrypt, 'compareSync').mockReturnValueOnce(false);

            const result = await sessions.create({
                email: 'john@example.com',
                password: 'wrongPassword',
            });

            expect(bcrypt.compareSync).toHaveBeenCalledWith('wrongPassword', user.password);
            expect(result).toEqual({ status: 400, message: 'Invalid username or password.' });
        });

        it('should return 409 if there is an active session', async () => {
            const user = { id: '1', password: 'hashedPassword' };
            (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(user);
            (bcrypt.compareSync as jest.Mock).mockReturnValueOnce(true);
            (prisma.session.findMany as jest.Mock).mockResolvedValueOnce([
                { id: '1', isActive: true },
            ]);

            const result = await sessions.create({
                email: 'john@example.com',
                password: 'password',
            });

            expect(prisma.session.findMany).toHaveBeenCalledWith({
                where: { userId: user.id, isActive: true },
            });
            expect(result).toEqual({
                status: 409,
                message: 'There is already an active session using your account.',
            });
        });

        it('should create a new session and return 200 with token', async () => {
            const user = { id: '1', password: 'hashedPassword' };
            const token = 'generatedToken';
            (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(user);
            jest.spyOn(bcrypt, 'compareSync').mockReturnValueOnce(true);
            (prisma.session.findMany as jest.Mock).mockResolvedValueOnce([]);
            jest.spyOn(jwt, 'sign').mockImplementation(() => token);
            (prisma.session.create as jest.Mock).mockResolvedValueOnce({ id: '1', token });

            const result = await sessions.create({
                email: 'john@example.com',
                password: 'password',
            });

            expect(jwt.sign).toHaveBeenCalledWith({ id: user.id }, process.env.JWT_SECRET);
            expect(prisma.session.create).toHaveBeenCalledWith({
                data: { userId: user.id, token },
            });
            expect(result).toEqual({ status: 200, token });
        });
    });

    describe('remove', () => {
        it('should return 403 if user is already logged out', async () => {
            const userId = '1';
            (prisma.session.findMany as jest.Mock).mockResolvedValueOnce([]);

            const result = await sessions.remove(userId);

            expect(prisma.session.findMany).toHaveBeenCalledWith({
                where: { userId, isActive: true },
            });
            expect(result).toEqual({ status: 403, message: 'User already logged out.' });
        });

        it('should terminate all active sessions and return 200', async () => {
            const userId = '1';
            (prisma.session.findMany as jest.Mock).mockResolvedValueOnce([
                { id: '1', isActive: true },
            ]);

            const result = await sessions.remove(userId);

            expect(prisma.session.updateMany).toHaveBeenCalledWith({
                where: { userId },
                data: { isActive: false },
            });
            expect(result).toEqual({ status: 200, message: 'All sessions have been terminated.' });
        });
    });
});

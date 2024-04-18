import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import { prisma } from './db.service';
/**
 * Creates a new user session.
 * @async
 * @function create
 * @param {Object} credentials - User credentials.
 * @param {string} credentials.email - User email.
 * @param {string} credentials.password - User password.
 * @returns {Promise<Object>} Authentication result containing status and token or error message.
 */
async function create({ email, password }: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email } });
    // if user does not exist, return an error
    if (!user) {
        logger.info('Invalid username or password', { email });
        return {
            status: 400,
            message: 'Invalid username or password.',
        };
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    // if password is invalid, return an error
    if (!validPassword) {
        logger.info('Invalid username or password', { email });
        return {
            status: 400,
            message: 'Invalid username or password.',
        };
    }

    const activeSessions = await prisma.session.findMany({
        where: { userId: user.id, isActive: true },
    });
    // if there is an active session, return an error - Only 1 session per user is allowed
    if (activeSessions.length > 0) {
        logger.info('Active session already exists', { userId: user.id });
        return {
            status: 409,
            message: 'There is already an active session using your account.',
        };
    }

    // else, create a new session and return a token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string);
    await prisma.session.create({ data: { userId: user.id, token } });
    logger.info('Session created successfully', { userId: user.id });
    return { status: 200, token };
}

/**
 * Removes a user's active session.
 * @async
 * @function remove
 * @param {string} userId - User ID.
 * @returns {Promise<Object>} Session termination result containing status and message.
 */
async function remove(userId: string) {
    const activeSessions = await prisma.session.findMany({
        where: { userId, isActive: true },
    });
    // if no session is active, then the user is already logged out
    if (activeSessions.length === 0) {
        logger.info('User already logged out', { userId });
        return { status: 403, message: 'User already logged out.' };
    }

    // else, terminate the session
    await prisma.session.updateMany({
        where: { userId },
        data: { isActive: false },
    });
    logger.info('Sessions terminated successfully', { userId });
    return { status: 200, message: 'All sessions have been terminated.' };
}

export default {
    create,
    remove,
};

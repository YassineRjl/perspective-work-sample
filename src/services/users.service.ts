import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from './db.service';

/**
 * Creates a new user.
 * @async
 * @function create
 * @param {Object} data - User data.
 * @returns {Promise<Object>} User creation result containing status, user data (without password), or error message.
 */
async function create(data: Omit<User, 'id'>) {
    // check if a user exists with the same email
    const userExists = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });
    if (userExists)
        return {
            status: 409,
            message: 'User already exists.',
        };

    // hash the password before storing it
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
        data: {
            ...data,
            password: hashedPassword,
        },
    });

    // remove the password from the response
    const { password, ...safeUser } = user;
    return {
        status: 201,
        user: safeUser,
    };
}

/**
 * Retrieves multiple users.
 * @async
 * @function getMultiple
 * @param {string} created - Order of users based on creation date ('desc' or 'asc').
 * @returns {Promise<Object[]>} Array of user objects (without passwords).
 */
async function getMultiple(created: 'desc' | 'asc') {
    const users = await prisma.user.findMany({
        orderBy: {
            created,
        },
    });
    // remove the password from the response
    return users.map(({ password, ...user }) => user);
}

export default {
    getMultiple,
    create,
};

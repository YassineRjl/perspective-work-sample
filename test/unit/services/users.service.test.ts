import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import users from '../../../src/services/users.service';
import { prisma } from '../../../src/services/db.service';

jest.mock('../../../src/services/db.service', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            findMany: jest.fn(),
        },
    },
}));

describe('users.service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('create', () => {
        it('should return 409 if user already exists', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ id: '1' });

            const result = await users.create({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password',
                created: new Date(),
            });

            expect(result).toEqual({ status: 409, message: 'User already exists.' });
        });

        it('should create a new user and return 201', async () => {
            const userData: Omit<User, 'id'> = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password',
                created: new Date(),
            };
            const hashedPassword = 'hashedPassword';
            const createdUser: User = {
                ...userData,
                id: '1',
                password: hashedPassword,
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(undefined);
            jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce(hashedPassword as never);
            (prisma.user.create as jest.Mock).mockResolvedValueOnce(createdUser);

            const result = await users.create(userData);

            expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: { ...userData, password: hashedPassword },
            });
            expect(result).toEqual({
                status: 201,
                user: {
                    id: '1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    created: createdUser.created,
                },
            });
        });
    });

    describe('getMultiple', () => {
        it('should return users ordered by creation date', async () => {
            const userList = [
                {
                    id: '1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password1',
                    created: '2024-01-18T15:17:10.923Z',
                },
                {
                    id: '2',
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    password: 'password2',
                    created: '2024-04-18T15:17:10.923Z',
                },
            ];

            (prisma.user.findMany as jest.Mock).mockResolvedValueOnce(userList);

            const result = await users.getMultiple('asc');

            expect(prisma.user.findMany).toHaveBeenCalledWith({ orderBy: { created: 'asc' } });
            expect(result).toEqual([
                {
                    id: '1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    created: userList[0].created,
                },
                {
                    id: '2',
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    created: userList[1].created,
                },
            ]);
        });
    });
});

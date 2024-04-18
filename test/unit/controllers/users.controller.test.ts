import { Request, Response, NextFunction } from 'express';
import usersController from '../../../src/controllers/users.controller';
import usersService from '../../../src/services/users.service';

jest.mock('../../../src/services/users.service');

describe('users.controller', () => {
    let req: Request;
    let res: Response;
    let next: NextFunction;
    beforeEach(() => {
        req = {
            body: {},
            query: {},
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

    describe('create', () => {
        it('should return 201 and the created user if user creation succeeds', async () => {
            const user = { id: '1', name: 'John Doe', email: 'john@example.com' };
            (usersService.create as jest.Mock).mockResolvedValueOnce({ status: 201, user });

            await usersController.create(req, res, next);

            expect(usersService.create).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(user);
        });

        it('should return the response status and message if user creation fails', async () => {
            const response = { status: 409, message: 'User already exists' };
            (usersService.create as jest.Mock).mockResolvedValueOnce(response);

            await usersController.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(response.status);
            expect(res.json).toHaveBeenCalledWith({ message: response.message });
        });

        it('should return 500 and call next with the error if an error occurs', async () => {
            const error = new Error('Unexpected error');
            (usersService.create as jest.Mock).mockRejectedValueOnce(error);

            await usersController.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ message: error.message });
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('get', () => {
        it('should return the users ordered by creation date', async () => {
            const users = [
                { id: '1', name: 'John Doe', email: 'john@example.com' },
                { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
            ];
            req.query = { created: 'desc' };
            (usersService.getMultiple as jest.Mock).mockResolvedValueOnce(users);

            await usersController.get(req, res, next);

            expect(usersService.getMultiple).toHaveBeenCalledWith('desc');
            expect(res.json).toHaveBeenCalledWith(users);
        });

        it('should call next with the error if an error occurs', async () => {
            const error = new Error('Unexpected error');
            (usersService.getMultiple as jest.Mock).mockRejectedValueOnce(error);

            await usersController.get(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});

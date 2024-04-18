import { Request, Response, NextFunction } from 'express';
import sessionsController from '../../../src/controllers/sessions.controller';
import sessionsService from '../../../src/services/session.service';

jest.mock('../../../src/services/session.service');

describe('sessions.controller', () => {
    let req: Request;
    let res: Response;
    let next: NextFunction;
    beforeEach(() => {
        req = {
            body: {},
            user: { id: '1' },
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

    describe('signin', () => {
        it('should return the token if signin succeeds', async () => {
            const token = 'generatedToken';
            (sessionsService.create as jest.Mock).mockResolvedValueOnce({ status: 200, token });

            await sessionsController.signin(req, res, next);

            expect(sessionsService.create).toHaveBeenCalledWith(req.body);
            expect(res.json).toHaveBeenCalledWith({ token });
        });

        it('should return the response status and message if signin fails', async () => {
            const response = { status: 401, message: 'Invalid username or password' };
            (sessionsService.create as jest.Mock).mockResolvedValueOnce(response);

            await sessionsController.signin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(response.status);
            expect(res.json).toHaveBeenCalledWith({ message: response.message });
        });

        it('should return 500 and call next with the error if an error occurs', async () => {
            const error = new Error('Unexpected error');
            (sessionsService.create as jest.Mock).mockRejectedValueOnce(error);

            await sessionsController.signin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ message: error.message });
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('logout', () => {
        it('should return the response message if logout succeeds', async () => {
            const response = { status: 200, message: 'All sessions have been terminated' };
            (sessionsService.remove as jest.Mock).mockResolvedValueOnce(response);

            await sessionsController.logout(req, res, next);

            expect(sessionsService.remove).toHaveBeenCalledWith(req.user?.id);
            expect(res.json).toHaveBeenCalledWith({ message: response.message });
        });

        it('should return 500 and call next with the error if an error occurs', async () => {
            const error = new Error('Unexpected error');
            (sessionsService.remove as jest.Mock).mockRejectedValueOnce(error);

            await sessionsController.logout(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ message: error.message });
            expect(next).toHaveBeenCalledWith(error);
        });
    });
});

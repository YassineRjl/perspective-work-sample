import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import usersMiddleware from '../../../src/middlewares/users.middleware';

jest.mock('express-validator', () => ({
    body: jest.fn(() => ({
        notEmpty: jest.fn(),
        isLength: jest.fn(),
        isEmail: jest.fn(),
        not: jest.fn(),
    })),
    query: jest.fn(() => ({
        notEmpty: jest.fn(),
        isIn: jest.fn(),
        not: jest.fn(),
    })),
    validationResult: jest.fn(),
}));

describe('users.middleware', () => {
    let req: Request;
    let res: Response;
    let next: NextFunction;
    beforeEach(() => {
        req = {} as Request;
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createUserValidator', () => {
        it('should call next if validation passes', () => {
            (validationResult as unknown as jest.Mock).mockReturnValueOnce({
                isEmpty: jest.fn().mockReturnValue(true),
            });

            usersMiddleware.createUserValidator[usersMiddleware.createUserValidator.length - 1](
                req,
                res,
                next,
            );

            expect(next).toHaveBeenCalled();
        });

        it('should return 422 if validation fails', () => {
            const errors: ValidationError[] = [{ msg: 'Validation error' } as ValidationError];
            (validationResult as unknown as jest.Mock).mockReturnValueOnce({
                isEmpty: jest.fn().mockReturnValue(false),
                array: jest.fn().mockReturnValue(errors),
            });

            usersMiddleware.createUserValidator[usersMiddleware.createUserValidator.length - 1](
                req,
                res,
                next,
            );

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({ errors });
        });
    });

    describe('getUsersValidator', () => {
        it('should call next if validation passes', () => {
            (validationResult as unknown as jest.Mock).mockReturnValueOnce({
                isEmpty: jest.fn().mockReturnValue(true),
            });

            usersMiddleware.getUsersValidator[usersMiddleware.getUsersValidator.length - 1](
                req,
                res,
                next,
            );

            expect(next).toHaveBeenCalled();
        });

        it('should return 422 if validation fails', () => {
            const errors: ValidationError[] = [{ msg: 'Validation error' } as ValidationError];
            (validationResult as unknown as jest.Mock).mockReturnValueOnce({
                isEmpty: jest.fn().mockReturnValue(false),
                array: jest.fn().mockReturnValue(errors),
            });

            usersMiddleware.getUsersValidator[usersMiddleware.getUsersValidator.length - 1](
                req,
                res,
                next,
            );

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({ errors });
        });
    });
});

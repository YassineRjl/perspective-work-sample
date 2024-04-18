import { body, query } from 'express-validator';
import { validateParams } from '../utils';

const createUserValidator = [
    body('name', 'Required').notEmpty(),
    body('name', 'The minimum name length is 3 characters').isLength({ min: 3 }),
    body('email', 'Required').notEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('password', 'Required').notEmpty(),
    body('password', 'The minimum length is 6 characters').isLength({ min: 6 }),
    validateParams,
];

const getUsersValidator = [
    query('created', 'Required').notEmpty(),
    query('created', 'Invalid value').isIn(['asc', 'desc']),
    validateParams,
];

export default {
    createUserValidator,
    getUsersValidator,
};

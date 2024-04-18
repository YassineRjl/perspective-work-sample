import { body } from 'express-validator';
import { validateParams } from '../utils';

const signinValidator = [
    body('email', 'Required').notEmpty(),
    body('password', 'Required').notEmpty(),
    validateParams,
];

export default { signinValidator };

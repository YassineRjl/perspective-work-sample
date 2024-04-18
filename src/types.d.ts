import { User } from '@prisma/client';

// Extend the Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: Omit<User, 'password'>;
        }
    }
}

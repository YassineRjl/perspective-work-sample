import cors from 'cors';
import * as dotenv from 'dotenv';
import express, { Express } from 'express';
import SessionsController from './controllers/sessions.controller';
import UsersController from './controllers/users.controller';
import authMiddleware from './middlewares/auth.middleware';
import sessionsMiddleware from './middlewares/sessions.middleware';
import usersMiddleware from './middlewares/users.middleware';

dotenv.config();

export const app: Express = express();
app.use(cors()).use(express.json()).options('*', cors());

app.post('/users', usersMiddleware.createUserValidator, UsersController.create);
app.get('/users', authMiddleware, usersMiddleware.getUsersValidator, UsersController.get);

// Additional functionality: signin & logout
app.post('/signin', sessionsMiddleware.signinValidator, SessionsController.signin);
app.delete('/logout', authMiddleware, SessionsController.logout);

if (process.env.NODE_ENV !== 'test') {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3111;
    startServer(port);
}

// used for integration tests to start the server in random ports & avoid EADDRINUSE error
export function startServer(port: number) {
    return new Promise((resolve) => {
        const server = app.listen(port, () => {
            console.log(`[server]: Server is running at http://localhost:${port}`);
            resolve(server);
        });
    });
}

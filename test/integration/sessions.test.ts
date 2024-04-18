import request from 'supertest';
import { prisma } from '../../src/services/db.service';
import { app, startServer } from '../../src';

describe('Sessions API', () => {
    let server: any;
    const createdUsers: string[] = [];

    const userData = {
        name: 'Session User',
        email: 'session@example.com',
        password: 'password',
    };

    beforeAll(async () => {
        server = await startServer(0); // Use port 0 to assign a random available port

        // Delete any existing user with the same email
        await prisma.user.deleteMany({ where: { email: userData.email } });

        // Create a new user for the test
        const response = await request(app).post('/users').send(userData);
        createdUsers.push(response.body.id);
    });

    afterAll(async () => {
        await prisma.session.deleteMany();
        await prisma.user.deleteMany();
        await prisma.$disconnect();
        server.close();
    });

    describe('POST /signin', () => {
        it('should return 200 and a token on successful signin', async () => {
            const response = await request(app)
                .post('/signin')
                .send({ email: userData.email, password: userData.password });

            // terminate
            await request(app)
                .delete('/logout')
                .set('Authorization', `Bearer ${response.body.token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
        });

        it('should return 400 if email is invalid', async () => {
            const response = await request(app)
                .post('/signin')
                .send({ email: 'invalid@example.com', password: userData.password });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid username or password.');
        });

        it('should return 400 if password is invalid', async () => {
            const response = await request(app)
                .post('/signin')
                .send({ email: userData.email, password: 'invalidPassword' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid username or password.');
        });

        it('should return 409 if there is an active session', async () => {
            const authenticatedSession = await request(app)
                .post('/signin')
                .send({ email: userData.email, password: userData.password });

            const duplicateSession = await request(app)
                .post('/signin')
                .send({ email: userData.email, password: userData.password });

            // terminate session
            await request(app)
                .delete('/logout')
                .set('Authorization', `Bearer ${authenticatedSession.body.token}`);

            expect(duplicateSession.status).toBe(409);
            expect(duplicateSession.body.message).toBe(
                'There is already an active session using your account.',
            );
        });
    });

    describe('DELETE /logout', () => {
        it('should return 401 if no token is provided', async () => {
            const response = await request(app).delete('/logout');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Auth Error: No token provided.');
        });

        it('should return 401 if an invalid token is provided', async () => {
            const response = await request(app)
                .delete('/logout')
                .set('Authorization', 'Bearer invalidToken');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Invalid token');
        });

        it('should return 200 and terminate all active sessions', async () => {
            const signinResponse = await request(app)
                .post('/signin')
                .send({ email: userData.email, password: userData.password });
            const token = signinResponse.body.token;

            const response = await request(app)
                .delete('/logout')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('All sessions have been terminated.');

            const activeSessions = await prisma.session.findMany({
                where: { userId: signinResponse.body.id, isActive: true },
            });
            expect(activeSessions).toHaveLength(0);
        });

        it('should return 403 if user is already logged out', async () => {
            const signinResponse = await request(app)
                .post('/signin')
                .send({ email: userData.email, password: userData.password });
            const token = signinResponse.body.token;

            await request(app).delete('/logout').set('Authorization', `Bearer ${token}`);

            const secondLogout = await request(app)
                .delete('/logout')
                .set('Authorization', `Bearer ${token}`);

            expect(secondLogout.status).toBe(403);
            expect(secondLogout.body.message).toBe('User already logged out.');
        });
    });
});

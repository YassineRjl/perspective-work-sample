import request from 'supertest';
import { prisma } from '../../src/services/db.service';
import { app, startServer } from '../../src';

describe('Users API', () => {
    let server: any;
    const createdUsers: string[] = [];

    beforeAll(async () => {
        server = await startServer(0); // Use port 0 to assign a random available port
    });

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: {
                id: {
                    in: createdUsers,
                },
            },
        });
        await prisma.$disconnect();
        server.close();
    });

    describe('POST /users', () => {
        it('should create a new user', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password',
            };

            const response = await request(app).post('/users').send(userData);

            createdUsers.push(response.body.id);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe(userData.name);
            expect(response.body.email).toBe(userData.email);
        });

        it('should return 422 if required fields are missing', async () => {
            const response = await request(app).post('/users').send({});

            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('errors');
        });

        it('should return 409 if user already exists', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password',
            };

            await request(app).post('/users').send(userData);
            const response = await request(app).post('/users').send(userData);

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('User already exists.');
        });
    });

    describe('GET /users', () => {
        beforeAll(async () => {
            await prisma.user.createMany({
                data: [
                    {
                        name: 'John Doe',
                        email: 'john@example.com',
                        password: 'password',
                        created: '2024-01-18T15:17:10.923Z',
                    },
                    {
                        name: 'Jane Smith',
                        email: 'jane@example.com',
                        password: 'password',
                        created: '2024-04-18T15:17:10.923Z',
                    },
                ],
                skipDuplicates: true,
            });
        });

        it('should return 401 if no token is provided', async () => {
            const response = await request(app).get('/users');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Auth Error: No token provided.');
        });

        it('should return 401 if an invalid token is provided', async () => {
            const response = await request(app)
                .get('/users')
                .set('Authorization', 'Bearer invalidToken');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Invalid token');
        });

        it('should return users ordered by creation date ascending', async () => {
            const signinResponse = await request(app)
                .post('/signin')
                .send({ email: 'john@example.com', password: 'password' });
            const token = signinResponse.body.token;

            const response = await request(app)
                .get('/users?created=asc')
                .set('Authorization', `Bearer ${token}`);

            // terminate the session
            await request(app).delete('/logout').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body[0].email).toBe('jane@example.com');
            expect(response.body[1].email).toBe('john@example.com');
        });

        it('should return users ordered by creation date descending', async () => {
            // Check for active sessions and terminate them

            const signinResponse = await request(app)
                .post('/signin')
                .send({ email: 'john@example.com', password: 'password' });

            const token = signinResponse.body.token;

            const response = await request(app)
                .get('/users?created=desc')
                .set('Authorization', `Bearer ${token}`);

            // terminate the session
            await request(app).delete('/logout').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body[0].email).toBe('john@example.com');
            expect(response.body[1].email).toBe('jane@example.com');
        });
    });
});

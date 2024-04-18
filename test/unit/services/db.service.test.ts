import { PrismaClient } from '@prisma/client';
import { prisma } from '../../../src/services/db.service';

jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({})),
}));

describe('db.service', () => {
    it('should create a new instance of PrismaClient', () => {
        expect(prisma).toBeDefined();
        expect(PrismaClient).toHaveBeenCalledTimes(1);
    });
});

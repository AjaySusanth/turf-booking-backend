import { INestApplication, ValidationPipe } from "@nestjs/common";
import { PrismaService } from "../src/prisma/prisma.service";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import supertest from 'supertest';
import { createHash } from "crypto";
import { subDays } from "date-fns";

describe('Auth e2e',()=> {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async() => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();

        prisma = app.get(PrismaService);

        // Clear DB before tests
        await prisma.userSession.deleteMany({});
        await prisma.user.deleteMany({});
    })

    afterAll(async () => {
        // Clear DB after tests
        await prisma.userSession.deleteMany({});
        await prisma.user.deleteMany({});
        await app.close();
    });

    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'StrongPass123!',
    };

    let refreshToken: string;
    let accessToken: string;

    it('Signup - success',async () => {
        const res = await supertest(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(201);

        expect(res.body.email).toBe(testUser.email);
        expect(res.body.id).toBeDefined();
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.refreshToken).toBeDefined();

        refreshToken = res.body.refreshToken;
        accessToken = res.body.accessToken;
    }) 

    it('Signup - duplicate email', async () => {
        await supertest(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(400);
    });

    it('Login - success', async () => {
        const res = await supertest(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');

        refreshToken = res.body.refreshToken;
        accessToken = res.body.accessToken;
    });


    it('Login - invalid password', async () => {
        await supertest(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: 'wrongpass' })
        .expect(401);
    });

    it('Login - invalid email', async () => {
        await supertest(app.getHttpServer())
        .post('/auth/login')
        .send({ email: "wrong@gmail.com", password: testUser.password })
        .expect(401);
    });

    it('Profile - protected route', async () => {
        const res = await supertest(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

        expect(res.body.email).toBe(testUser.email);
    });

    it('Profile - unauthorized', async () => {
        await supertest(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('Refresh - should rotate refresh token', async () => {
        const res = await supertest(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

        expect(res.body.accessToken).toBeDefined();
        expect(res.body.refreshToken).toBeDefined();
        expect(res.body.refreshToken).not.toBe(refreshToken);

        
        refreshToken = res.body.refreshToken;
    });

    it('Refresh - invalid token', async () => {
        await supertest(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalidtoken' })
        .expect(401);
    });

    it('Logout - success', async () => {
        const res = await supertest(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken })
        .expect(200);

        expect(res.body.success).toBe(true);

        // Using revoked token should fail
        await supertest(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });

    it('should fail refresh with expired token', async () => {

        const user = await prisma.user.findUnique({ where: { email: testUser.email } });

        if (!user) {
            throw new Error("User not found")
        }

        const expiredRefreshToken = 'expiredtoken123';
        const hash = createHash('sha256').update(expiredRefreshToken).digest('hex');

        await prisma.userSession.upsert({
            where: { userId: user.id }, 
            update: {
                refreshTokenHash: hash,
                expiresAt: subDays(new Date(), 1),
                revokedAt: null,
            },
            create: {
                userId: user.id,
                refreshTokenHash: hash,
                expiresAt: subDays(new Date(), 1),
            },
        });

        await supertest(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: expiredRefreshToken })
        .expect(401);
    });

    it('should fail reuse of old refresh token after rotation', async () => {
        const res = await supertest(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);
        
        refreshToken = res.body.refreshToken;
        accessToken = res.body.accessToken;

        const firstRefresh = await supertest(app.getHttpServer())
            .post('/auth/refresh')
            .send({ refreshToken })
            .expect(200);

        const newRefreshToken = firstRefresh.body.refreshToken;

        await supertest(app.getHttpServer())
            .post('/auth/refresh')
            .send({ refreshToken })
            .expect(401);

        refreshToken = newRefreshToken;
    });

    it('should fail refresh if token is manually revoked', async () => {
        const user = await prisma.user.findUnique({ where: { email: testUser.email } });
        if (!user) throw new Error("User not found");

        // Revoke current session manually
        const session = await prisma.userSession.findUnique({ where: { userId: user.id } });
        if (!session) throw new Error("Session not found");

        await prisma.userSession.update({
            where: { id: session.id },
            data: { revokedAt: new Date() },
        });

        // Attempt to refresh revoked token
        await supertest(app.getHttpServer())
            .post('/auth/refresh')
            .send({ refreshToken })
            .expect(401);
    });

})
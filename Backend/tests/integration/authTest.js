import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';

import app from '../../app.js';
import User from "../../models/User.js"
import { connectTestDB, disconnectTestDB, clearTestDB } from '../setup/db.js';

// ANTI-LEAK: mock config/db instead of mutating it (ESM exports are read-only)
vi.mock('../../config/db.js', () => ({
    connectDB: vi.fn(async () => {
        console.log('🛡️  Test Runner: Bypassed production cloud cluster leak.');
    })
}));

beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_ACCESS_SECRET = 'test_access_secret_999';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_999';
    await connectTestDB();
});

afterAll(async () => await disconnectTestDB());

describe("POST /api/auth/login Security & Flow Verification..", () => {

    const testUser = {
        firstName: "Amir",
        lastName: "Asgar",
        email: "skamir2410@gmail.com",
        password: '123456789'
    };

    beforeEach(async () => {
        await clearTestDB();

        // to prevent controller structural undefined array crashes during testing
        const createdUser = new User(testUser);
        createdUser.refreshTokens = [];
        await createdUser.save();
    });

    it("Should issue an accessToken and a secure HttpOnly refreshToken cookie upon a valid credentials", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: testUser.email, password: testUser.password })
            .expect(200);

        // 1. Verifying Response Payload
        expect(response.body.status).toBe("success");
        expect(response.body.accessToken).toBeDefined();
        expect(typeof response.body.accessToken).toBe('string');
        expect(response.body.user).toEqual(expect.objectContaining({
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            email: testUser.email,
        }));
        expect(response.body.password).toBeUndefined(); // Prevent Password Leakage

        // 2. Verify Cookie Security Flags
        const setCookieHeader = response.headers["set-cookie"];
        expect(setCookieHeader).toBeDefined();
        expect(setCookieHeader[0]).toMatch(/refreshToken=/);
        expect(setCookieHeader[0]).toMatch(/HttpOnly/i);
        expect(setCookieHeader[0]).toMatch(/SameSite=Strict/i);
    });

    it("should reject login attempts with invalid password and return 401 without leaking user existence", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: testUser.email, password: "@Wrongpassword" })
            .expect(401);

        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBe("Incorrect email or password");
        expect(response.headers["set-cookie"]).toBeUndefined();
    });

    it("should detect Compromised token reuse and wipe all user refresh sessions", async () => {

        // Step 1: Login to generate a valid refresh token
        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({ email: testUser.email, password: testUser.password });

        const validCookie = loginRes.headers["set-cookie"][0];

        // Step 2: Use token once to rotate it
        const refreshRes = await request(app)
            .post("/api/auth/refresh")
            .set("Cookie", validCookie)
            .expect(200);

        //Step 3: Attempt to reuse the OLD token (simulating an attacker stealing it)
        const attackRes = await request(app)
            .post("/api/auth/refresh")
            .set("Cookie", validCookie)
            .expect(403);

        expect(attackRes.body.message).toContain("Compromised token usage detected");

        // Step 4: Verify the database wiped all Sessions for this user.
        const compromisedUser = await User.findOne({ email: testUser.email }).select('+refreshTokens');
        expect(compromisedUser.refreshTokens.length).toBe(0);
    });
});


import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../app.js';
import User from "../../models/User.js"
import { connectTestDB, disconnectTestDB, clearTestDB } from '../setup/db.js';

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

const testUser = {
    firstName: 'Amir',
    lastName: 'Asgar',
    email: 'amir@gmail.com',
    password: '123456789',
}

describe("POST /api/auth/register Security & Flow Verification....", () => {

    beforeEach(() => clearTestDB())

    const RegisterUser = (payload) => {
        return request(app)
            .post('/api/auth/register')
            .send(payload);
    }

    // Verify with Valid Credentials
    it("Should Register User Successfully with accessToken and refreshToken ...", async () => {
        const response = await RegisterUser(testUser)
            .expect(201)

        // Verify Status
        expect(response.body.status).toBe('success');

        // Verify accessToken
        expect(response.body.accessToken).toBeDefined()
        expect(typeof response.body.accessToken).toBe('string')

        // verify User Credentials
        expect(response.body.user).toEqual(expect.objectContaining({
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            email: testUser.email,
        }))
        expect(response.body.password).toBeUndefined()

        // Verify Cookies
        const setCookieHeader = response.headers['set-cookie'];
        expect(setCookieHeader).toBeDefined();
        expect(setCookieHeader[0]).toMatch(/refreshToken=/i)
        expect(setCookieHeader[0]).toMatch(/HttpOnly/i)
        expect(setCookieHeader[0]).toMatch(/sameSite=Strict/i)
    });

    // Verify admin role
    it("Should ignore security sensitive fields like role during registration", async () => {
        await RegisterUser({ ...testUser, role: "admin" }).expect(201)

        const user = await User.findOne({ email: testUser.email })
        expect(user).not.toBe("admin")
    });

    // Verify with Duplicate Email
    it("Should Reject and Show User already Exists....", async () => {
        await RegisterUser(testUser)
        const response = await RegisterUser(testUser)
            .expect(403)

        expect(response.status).toBe(403)
        expect(response.body.status).toMatch(/fail/i)
        expect(response.body.message).toMatch(/User with this email already exist/i)
    });

    // Verify with Invalid Email Format
    it("Should Reject and Show Invalid Email Format....", async () => {
        const response = await RegisterUser({
            ...testUser,
            email: 'skgmail.com',
        })
            .expect(400)

        expect(response.status).toBe(400)
        expect(response.body.status).toMatch(/fail/i)
        expect(response.body.message).toMatch(/Please provide a valid email address/i)
    });

    // Verify Email Storing Process
    it("Should Normalize email by trimming spaces and covering to lowercase", async () => {
        await RegisterUser({ ...testUser, email: " Amir@gmail.com " }).expect(201)

        const user = await User.findOne({ email: 'amir@gmail.com' })
        expect(user).not.toBe(null)
    });

    // Verify Email Sending with NoSQL Injection
    it("Should reject non-string query object passed as email (NoSQL Injection)", async () => {
        await RegisterUser({ ...testUser, email: { "$ne": "" } }).expect(400)
    });

    // Verify First Name as a number instead of String
    it("Should Reject and Show FirstName must be String Error....", async () => {
        const response = await RegisterUser({
            ...testUser,
            firstName: 123456789,
        })
            .expect(400)

        expect(response.status).toBe(400)
        expect(response.body.status).toMatch(/fail/i)
        expect(response.body.message).toBe("FirstName can only contain letters and Hyphens (no numbers or spaces).")
    });

    // Verify too Long characters in FirstName
    it("Should Reject and Show FirstName exceeds characters....", async () => {
        const response = await RegisterUser({
            ...testUser,
            firstName: 'AmirShaikh-MohammedAmer',
        })
            .expect(400)

        expect(response.status).toBe(400)
        expect(response.body.status).toMatch(/fail/i)
        expect(response.body.message).toMatch(/Name cannot exceed 25 characters/i)
    });

    // verify leaving Password field empty
    it("Should Reject and throw an error for Password Required....", async () => {
        const response = await RegisterUser({
            ...testUser,
            password: " "
        })
            .expect(400)

        expect(response.status).toBe(400)
        expect(response.body.status).toMatch(/fail/i)
        expect(response.body.message).toMatch(/Please proivde: password/i)
    });

    it("Should Reject Password shorter than minimum length Requirement", async () => {
        const response = await RegisterUser({ ...testUser, password: '1234' }).expect(400)
        expect(response.body.message).toMatch(/Password must be atleast 8 characters/i)
    });

    // Verify Password hashing
    it("Should Verify is Password Properly Hashed or Not....", async () => {
        const response = await RegisterUser(testUser)
            .expect(201)

        const user = await User.findOne({ email: testUser.email }).select("+password")
        expect(user.password).not.toBe(testUser.password);

        const isMatch = await bcrypt.compare(testUser.password, user.password)
        expect(isMatch).toBe(true)

    });

});

describe("POST /api/auth/login Security & Flow Verification..", () => {

    beforeEach(async () => {
        await clearTestDB();

        // to prevent controller structural undefined array crashes during testing
        const createdUser = new User(testUser);
        createdUser.refreshTokens = [];
        await createdUser.save();
    });

    const LoginUser = (payload) => {
        return request(app).post('/api/auth/login').send(payload)
    }

    it("Should issue an accessToken and a secure HttpOnly refreshToken cookie upon a valid credentials", async () => {
        const response = await LoginUser({ email: testUser.email, password: testUser.password })
            .expect(200)

        // 1. Verifying Response Payload
        expect(response.body.status).toMatch(/success/i);
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
        expect(setCookieHeader[0]).toMatch(/refreshToken=/i);
        expect(setCookieHeader[0]).toMatch(/HttpOnly/i);
        expect(setCookieHeader[0]).toMatch(/SameSite=Strict/i);
    });

    it("should reject login attempts with invalid password and return 401 without leaking user existence", async () => {
        const response = await LoginUser({ email: testUser.email, password: "@Wrongpassword" })
            .expect(401);

        expect(response.body.status).toBe('fail');
        expect(response.body.message).toMatch(/Incorrect email or password/i);
        expect(response.headers["set-cookie"]).toBeUndefined();
    });

    it("should detect Compromised token reuse and wipe all user refresh sessions", async () => {

        // Step 1: Login to generate a valid refresh token
        const loginRes = await LoginUser({ email: testUser.email, password: testUser.password })

        const validCookie = loginRes.headers["set-cookie"][0];

        // Step 2: Use token once to rotate it
        await request(app).post("/api/auth/refresh")
            .set("Cookie", validCookie).expect(200);

        //Step 3: Attempt to reuse the OLD token (simulating an attacker stealing it)
        const attackRes = await request(app)
            .post("/api/auth/refresh")
            .set("Cookie", validCookie)
            .expect(403);

        expect(attackRes.body.message).toMatch(/Compromised token usage detected/i);

        // Step 4: Verify the database wiped all Sessions for this user.
        const compromisedUser = await User.findOne({ email: testUser.email }).select('+refreshTokens');
        expect(compromisedUser.refreshTokens.length).toBe(0);
    });

});


import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../app.js';
import User from "../../models/User.js"
import { SignToken } from '../../services/authService.js';
import { connectTestDB, disconnectTestDB, clearTestDB } from '../setup/db.js';

process.env.NODE_ENV = 'test'

vi.mock('../../config/db.js', () => ({
    connectDB: vi.fn(async () => {
        console.log('Test Runner: Bypassed production cloud cluster leak.');
    })
}));

beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_ACCESS_SECRET = 'test_access_secret_999';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_999';
    await connectTestDB();
});

afterAll(async () => {
    await clearTestDB();
    await disconnectTestDB()
});

const testUser = {
    firstName: 'Amir',
    lastName: 'Asgar',
    email: 'amir@gmail.com',
    password: '123456789',
}

describe("POST /api/auth/register - account creation and validation", () => {

    beforeEach(() => clearTestDB());

    const RegisterUser = (payload) => {
        return request(app)
            .post('/api/auth/register')
            .send(payload);
    }

    // Verify with Valid Credentials
    it("creates an account and returns access and refresh tokens", async () => {
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
    it("ignores a client-supplied role during registration", async () => {
        await RegisterUser({ ...testUser, role: "admin" }).expect(201)

        const user = await User.findOne({ email: testUser.email })
        expect(user).not.toBe("admin")
    });

    // Verify with Duplicate Email
    it("rejects an email address that is already registered", async () => {
        await RegisterUser(testUser)
        const response = await RegisterUser(testUser)
            .expect(403)

        expect(response.status).toBe(403)
        expect(response.body.status).toMatch(/fail/i)
        expect(response.body.message).toMatch(/User with this email already exist/i)
    });

    // Verify with Invalid Email Format
    it("rejects an invalid email address", async () => {
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
    it("trims and lowercases email addresses before creating an account", async () => {
        await RegisterUser({ ...testUser, email: " Amir@gmail.com " }).expect(201)

        const user = await User.findOne({ email: 'amir@gmail.com' })
        expect(user).not.toBe(null)
    });

    // Verify Email Sending with NoSQL Injection
    it("rejects an object supplied as the email address", async () => {
        await RegisterUser({ ...testUser, email: { "$ne": "" } }).expect(400)
    });

    // Verify First Name as a number instead of String
    it("rejects a first name that is not a string", async () => {
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
    it("rejects a first name that exceeds the maximum length", async () => {
        const response = await RegisterUser({
            ...testUser,
            firstName: 'AmirShaikh-MohammedAmer',
        })
            .expect(400)

        expect(response.status).toBe(400)
        expect(response.body.status).toMatch(/fail/i)
        expect(response.body.message).toMatch(/Name cannot exceed 15 characters/i)
    });

    // verify leaving Password field empty
    it("requires a password during registration", async () => {
        const response = await RegisterUser({
            ...testUser,
            password: " "
        })
            .expect(400)

        expect(response.status).toBe(400)
        expect(response.body.status).toMatch(/fail/i)
        expect(response.body.message).toMatch(/Please proivde: password/i)
    });

    // Verify Password Length
    it("rejects a password shorter than the minimum length", async () => {
        const response = await RegisterUser({ ...testUser, password: '1234' }).expect(400)
        expect(response.body.message).toMatch(/Password must be atleast 8 characters/i)
    });

    // Verify Password hashing
    it("stores the password as a hash rather than plain text", async () => {
        const response = await RegisterUser(testUser)
            .expect(201)

        const user = await User.findOne({ email: testUser.email }).select("+password")
        expect(user.password).not.toBe(testUser.password);

        const isMatch = await bcrypt.compare(testUser.password, user.password)
        expect(isMatch).toBe(true)

    });

});

describe("POST /api/auth/login - authentication", () => {

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

    it("returns an access token and sets a secure HttpOnly refresh-token cookie", async () => {
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

    it("rejects login when the email and password are missing", async () => {
        const response = await LoginUser({}).expect(400)
        expect(response.body.message).toMatch(/please enter email and password/i)
    });

    it("returns the same unauthorized response for an incorrect password", async () => {
        const response = await LoginUser({ email: testUser.email, password: "@Wrongpassword" })
            .expect(401);

        expect(response.body.status).toBe('fail');
        expect(response.body.message).toMatch(/Incorrect email or password/i);
        expect(response.headers["set-cookie"]).toBeUndefined();
    });

    it("returns the same unauthorized response for an unknown email address", async () => {
        const response = await LoginUser({ email: 'wrong@email.com', password: testUser.password })
            .expect(401);

        expect(response.body.status).toBe('fail');
        expect(response.body.message).toMatch(/Incorrect email or password/i);
        expect(response.headers["set-cookie"]).toBeUndefined();
    });

});

describe("POST /api/auth/user/update - profile updates", () => {

    let accessToken;
    beforeEach(async () => {
        await clearTestDB();

        const user = new User(testUser);
        user.refreshTokens = [];
        await user.save();

        accessToken = SignToken(user._id, user.role).accessToken;
    });

    const UpdateUser = (payload) => {
        const response = request(app).post('/api/auth/user/update').send(payload).set('Authorization', `Bearer ${accessToken}`);
        return response;
    }

    const userData = {
        notification: true,
        location: {
            type: 'Point',
            coordinates: [73.8567, 18.5204],
            address: 'Pune',
        },
    }

    it("updates profile data for an authenticated user", async () => {
        const response = await UpdateUser({ ...userData, token: accessToken })
            .expect(200);

        expect(response.body.message).toMatch(/User settings updated successfully/i)

        const user = await User.findOne({ email: testUser.email });
        expect(user.fcmTokens.includes(accessToken)).toBeTruthy();
        expect(user.notification).toBe(true)
        expect(user.location).toEqual(expect.objectContaining(userData.location))

    });

    it('clears notification data when notifications are disabled', async () => {
        const response = await UpdateUser({ ...userData, notification: false })
            .expect(200)

        expect(response.body.message).toMatch(/User settings updated successfully/i)
        expect(response.body.notification).toBeFalsy();

        const user = await User.findOne({ email: testUser.email });
        expect(user.notification).toBeFalsy();
        expect(user.location).toBeNull()
        expect(user.fcmTokens).toStrictEqual([])
    });

    it('does not save a notification token when none is provided', async () => {
        const response = await UpdateUser({ ...userData, token: '' }).expect(400);

        expect(response.body.message).toMatch(/FCM token is required for notification to be enabled/i);
    });

    it('rejects an invalid or incorrectly formatted location', async () => {
        const response = await UpdateUser({
            ...userData, token: accessToken, location: {
                type: 'Point',
                coordinates: ['ABC', 'XYZ'],
                address: 'Pune'
            }
        }).expect(400);

        expect(response.body.message).toMatch(/Coordinates must contain valid numbers/i)
    });

    it('rejects invalid profile data', async () => {
        const response = await UpdateUser({ ...userData, token: accessToken, location: '' })
            .expect(400);

        expect(response.body.message).toMatch(/Location is Required for notification to be enabled/i);

    });

});

describe('POST /api/auth/logout - session termination', () => {
    beforeEach(async () => {
        await clearTestDB();

        const user = new User(testUser)
        user.refreshTokens = [];
        await user.save()

    });

    it('logs out and clears the refresh-token cookie', async () => {
        const response = await request(app).post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
        expect(response.status).toBe(200);
        expect(response.body.status).toMatch(/success/i)

        const setCookieHeader = response.headers['set-cookie'][0];
        expect(setCookieHeader).toBeDefined();
        expect(setCookieHeader).toMatch(/refreshToken=/i);

        const user = await User.findOne({ email: testUser.email }).select('+refreshTokens')
        expect(user.refreshTokens).not.toBeNull()


        // LogOut
        const cleanCookie = setCookieHeader.split(';')[0];
        const res = await request(app)
            .post('/api/auth/logout')
            .set('Cookie', cleanCookie)
            .set('Authorization', `Bearer ${response.body.accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/logout successfully/i);

        const CookieHeader = res.headers['set-cookie'][0].split(';')[0];
        expect(CookieHeader.refreshTokens).toBeUndefined();

        const updatedUser = await User.findOne({ email: testUser.email }).select('+refreshTokens')
        expect(updatedUser.refreshTokens.length).toBe(0)
    });

    it('rejects logout requests with a missing or expired access token', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });

        const res = await request(app)
            .post('/api/auth/logout')
            .set('Cookie', response.headers['set-cookie'][0].split(';')[0])
            .expect(401)

        expect(res.body.message).toMatch(/Access Denied, Authorization token missing or invalid format/i);
    });

    it('returns an unauthorized response when no refresh token is provided', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });

        const res = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${response.body.accessToken}`)
            .expect(401)

        expect(res.body.message).toMatch(/Refresh token missing or invalid/i);
    });

});

describe('POST /api/auth/refreshToken - token renewal and reuse detection', () => {
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

    it("detects refresh-token reuse and revokes the user's refresh sessions", async () => {

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

    it('rejects a refresh request when no token is provided', async () => {
        await LoginUser({ email: testUser.email, password: testUser.password }).expect(200);

        const response = await request(app).post('/api/auth/refresh').expect(401);
        expect(response.body.message).toMatch(/Authentication token missing/i);
    });

    it('rejects a refresh token that has already been revoked', async () => {
        const loginRes = await LoginUser({ email: testUser.email, password: testUser.password });

        const token = loginRes.headers['set-cookie'][0];
        expect(token).toMatch(/refreshToken=/i);

        await request(app).post('/api/auth/logout')
            .set('Cookie', token)
            .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
            .expect(200);

        const expiredRes = await request(app)
            .post('/api/auth/refresh')
            .set('Cookie', token)
            .expect(403)

        expect(expiredRes.body.message).toMatch(/Compromised token usage detected.*/i)
    });

    it('rejects an invalid refresh token', async () => {
        const wrongRefreshToken = 'refreshToken=not-a-valid-refresh-token';
        const expiredRes = await request(app)
            .post('/api/auth/refresh')
            .set('Cookie', wrongRefreshToken)
            .expect(403)

        expect(expiredRes.body.message).toMatch(/Session Expired or Invalid Toke/i)
    });

});

// Keep this test always at the END **** otherwise it may break all your cases
describe('POST /api/auth/login - rate limiting', () => {

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

    it("blocks further login attempts after the rate limit is reached", async () => {

        for (let i = 0; i <= 10; i++) {
            await LoginUser({ email: testUser.email, password: "WrongPassword" });
        }

        const response = await LoginUser({ email: testUser.email, password: testUser.password }).expect(429)
        expect(response.body.status).toMatch(/fail/i)
        expect(response.body.message).toMatch(/Too many login attempts, Please try again after 15mins/i);
    });
});


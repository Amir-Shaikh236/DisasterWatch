import { beforeAll, beforeEach, afterAll, describe, it, expect, vi } from "vitest"
import request from "supertest"

import app from "../../server.js"
import User from "../../models/User.js"
import Reports from "../../models/Reports.js"
import { connectTestDB, clearTestDB, disconnectTestDB } from "../setup/db.js"

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

afterAll(async () => {
    await disconnectTestDB();
});

describe('POST /api/reports/add - Validation & Flow Verification..', () => {

    const testUser = {
        firstName: "Amir",
        lastName: "Asgar",
        email: "skamir2410@gmail.com",
        password: '123456789'
    };

    const report = {
        "disasterType": "Flood",
        "description": "Water levels have risen above 3 feet, submerging residential streets. Multiple families have been evacuated by local rescue teams.",
        "location": {
            coordinates: [72.8311, 21.1702],
            address: "Shivaji Nagar Pune"
        }

    }

    beforeEach(async () => {
        await clearTestDB();

        const createdUser = new User(testUser);
        createdUser.refreshTokens = [];
        await createdUser.save();
    });

    const loginAsUser = async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password })
            .expect(200);

        return response.body.accessToken;
    };

    const postReport = async (payload) => {
        const accessToken = await loginAsUser();
        const req = request(app)
            .post('/api/reports/add')
            .set('Authorization', `Bearer ${accessToken}`);

        if (payload.disasterType !== undefined) req.field('disasterType', payload.disasterType);
        if (payload.description !== undefined) req.field('description', payload.description);
        if (payload.location !== undefined) req.field('location', JSON.stringify(payload.location));

        return await req;
    };

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

    // it('Should Create Report and save it in DB Upon valid Data.', async () => {

    //     // Sending Request
    //     const response = await postReport(report)
    //         .expect(201);

    //     // Verifying Report
    //     expect(response.body.status).toBe('created')
    //     expect(response.body.report).toEqual(expect.objectContaining({
    //         disasterType: report.disasterType,
    //         description: report.description,
    //         location: {
    //             type: 'Point',
    //             coordinates: report.location.coordinates,
    //             address: report.location.address
    //         },
    //         status: 'investigating'
    //     }));

    //     const saved = await Reports.findById(response.body.report._id);
    //     expect(saved).not.toBeNull();
    //     expect(saved.disasterType).toBe(report.disasterType);
    // });

    it('Should Reject a Report For Not Providing Required Fields', async () => {

        const response = await postReport({
            disasterType: report.disasterType,
            location: report.location
        });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBe('Please proivde: description');

    });

    it('Should Reject a Report For Providing location longitude and latitude without array', async () => {

        const response = await postReport({
            disasterType: report.disasterType,
            description: report.description,
            location: {
                coordinates: "72.8311, 21.1702",
                address: report.location.address
            }
        });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBe('Coordinates must be an array of [Longitude, latitude].');

    });

    it('Should Reject a Report For Providing location, longitude and latitude within array but in string', async () => {

        const response = await postReport({
            disasterType: report.disasterType,
            description: report.description,
            location: {
                coordinates: ['abc', 'xyz'],
                address: report.location.coordinates
            }
        });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBe('Coordinates must contain valid numbers');

    });

    it('Should Reject a Report For Providing location with out of range Coordinates', async () => {

        const response = await postReport({
            disasterType: report.disasterType,
            description: report.description,
            location: {
                coordinates: [200, 100],
                address: report.location.address
            }
        });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBe('Coordinates out of valid range');
    });

});
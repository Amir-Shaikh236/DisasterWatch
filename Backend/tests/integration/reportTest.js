import { beforeAll, beforeEach, afterAll, describe, it, expect, vi } from "vitest"
import request from "supertest"

import app from "../../app.js"
import { connectTestDB, clearTestDB, disconnectTestDB } from "../setup/db.js"
import Reports from "../../models/Reports.js"
import Alerts from "../../models/Alerts.js"

process.env.GEMINI_API_KEY = "test-gemini-api-key";

vi.mock('../../config/db.js', () => ({
    connectDB: vi.fn(async () => {
        console.log('Test Runner: Bypassed production cloud cluster leak.');
    })
}));

vi.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: vi.fn(function GoogleGenerativeAI() {
            return {
                getGenerativeModel: vi.fn(() => ({
                    generateContent: vi.fn().mockResolvedValue({
                        response: {
                            text: vi.fn(() => JSON.stringify({
                                status: "approved",
                                isDisaster: true,
                                typeMatch: true,
                                disasterType: "Flood",
                                confidence: 0.95,
                                severity: "high",
                                description: "Water levels have risen above 3 feet, submerging residential streets. Multiple families have been evacuated by local rescue teams.",
                                keyIndicators: ["Residential streets are submerged."],
                                misinformationScore: 0.05,
                                alertTitle: "Flooding Reported in Shivaji Nagar",
                                rejectionReasons: [],
                                imageAnalysis: [],
                            }))
                        }
                    })
                }))
            };
        })
    }
});

let accessToken;
beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_ACCESS_SECRET = 'test_access_secret_999';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_999';
    await connectTestDB();
    await clearTestDB();

    const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

    accessToken = response.body.accessToken;
});

afterAll(async () => {
    await disconnectTestDB();
});

const testUser = {
    firstName: "Amir",
    lastName: "Asgar",
    email: "amir@gmail.com",
    password: '123456789'
};

const report = {
    "disasterType": "flood",
    "description": "Water levels have risen above 3 feet, submerging residential streets. Multiple families have been evacuated by local rescue teams.",
    "location": {
        coordinates: [72.8311, 21.1702],
        address: "Shivaji Nagar Pune"
    }

}

const postReport = async (payload) => {
    const res = request(app)
        .post('/api/reports/add')
        .set('Authorization', `Bearer ${accessToken}`);

    if (payload.disasterType !== undefined) res.field('disasterType', payload.disasterType);
    if (payload.description !== undefined) res.field('description', payload.description);
    if (payload.location !== undefined) res.field('location', JSON.stringify(payload.location));

    return res;
};

describe('POST /api/reports/add - Validation & Flow Verification..', () => {

    it('Should Create Report and Alert in DB when Report is verified by AI.', async () => {
        // Sending Request
        const response = await postReport(report);
        expect(response.status).toBe(201);

        // Verifying Report
        expect(response.body.status).toBe('created')
        expect(response.body.report).toEqual(expect.objectContaining({
            disasterType: report.disasterType,
            description: report.description,
            location: {
                type: 'Point',
                coordinates: report.location.coordinates,
                address: report.location.address
            },
            status: 'verified',
            media: []
        }));

        const saved = await Reports.findById(response.body.report._id);
        expect(saved).not.toBeNull();
        expect(saved.disasterType).toBe(report.disasterType);
        expect(saved.media).toEqual(expect.objectContaining({}))

        const alert = await Alerts.findById(saved.alertId)
        expect(alert).not.toBeNull()
        expect(alert.media).toEqual(expect.objectContaining({}))
    });

    it('Should Reject Report when user is not Authenticated', async () => {
        const response = await request(app).post('/api/reports/add')
            .send(report).expect(401);

        expect(response.body.status).toMatch(/Fail/i)
        expect(response.body.message).toMatch(/Access Denied, Authorization token missing or invalid format/i)


    });

    it('Should Reject Report on Invalid DisasterType', async () => {
        const response = await postReport({ ...report, disasterType: 'INVALID_DISASTER' });

        expect(response.status).toBe(400)
        expect(response.body.message).toMatch(/Invalid Disaster Type/i)
    });

    it('Should Reject a Report For Not Providing Required Fields', async () => {

        const response = await postReport({
            disasterType: report.disasterType,
            location: report.location
        });

        expect(response.status).toBe(400);
        expect(response.body.status).toMatch(/Fail/i);
        expect(response.body.message).toMatch(/Please proivde: description/i);
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
        expect(response.body.status).toMatch(/fail/i);
        expect(response.body.message).toMatch(/Coordinates must be an array of \[Longitude, latitude\]/i);

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
        expect(response.body.status).toMatch(/fail/i);
        expect(response.body.message).toMatch(/Coordinates must contain valid numbers/i);

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
        expect(response.body.status).toMatch(/fail/i);
        expect(response.body.message).toMatch(/Coordinates out of valid range/i);
    });

    it('Should Reject a Report for Providing Coordinates in Reverse Order', async () => {
        const response = await postReport({
            ...report, location: {
                coordinates: [72.8311, 120],
                address: "Shivaji Nagar Pune"
            }
        })

        expect(response.status).toBe(400);
    });

});


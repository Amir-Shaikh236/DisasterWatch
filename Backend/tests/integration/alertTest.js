import { beforeAll, afterAll, beforeEach, vi, describe, it, expect } from "vitest";
import request from 'supertest';
import app from "../../app";
import { connectTestDB, clearTestDB, disconnectTestDB } from "../setup/db.js"
import Alerts from "../../models/Alerts.js";
import Reports from "../../models/Reports.js";
import User from "../../models/User.js";

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
    await clearTestDB();
    await disconnectTestDB();
});

const testUser = {
    firstName: "Amir",
    lastName: "Shaikh",
    email: "amir@gmail.com",
    password: '123456789'
};

const fakeUser = (payload) => {
    return request(app).post('/api/auth/register').send(payload)
}

const report = {
    "disasterType": "flood",
    "description": "Water levels have risen above 3 feet, submerging residential streets. Multiple families have been evacuated by local rescue teams.",
    "location": {
        coordinates: [72.8311, 21.1702],
        address: "Shivaji Nagar Pune"
    }

}

const postReport = (payload) => {
    const res = request(app)
        .post('/api/reports/add')
        .set('Authorization', `Bearer ${accessToken}`);

    if (payload.disasterType !== undefined) res.field('disasterType', payload.disasterType);
    if (payload.description !== undefined) res.field('description', payload.description);
    if (payload.location !== undefined) res.field('location', JSON.stringify(payload.location));

    return res;
};

const getAlerts = () => {
    return request(app).get('/api/alerts/getAlerts').set('Authorization', `Bearer ${accessToken}`);
}

const deleteAlert = (id, token) => {
    return request(app).delete(`/api/alerts/delete/${id}`).set('Authorization', `Bearer ${token}`);
}

const adminRegister = async (payload) => {
    const res = await request(app).post('/api/auth/register').send(payload);
    const user = await User.findOne({ email: res.body.user?.email });
    user.role = 'admin';
    await user.save();

    return res;
}

describe('GET /api/alerts/get Flow and Verification of Data', () => {

    it('Should return 404 if Alerts length is 0', async () => {
        const alertRes = await getAlerts().expect(404)
        expect(alertRes.body.message).toMatch(/No Alerts Yet!/i)
    });

    it('Should Returns all the alerts for all the users', async () => {
        const reportRes = await postReport(report).expect(201);

        const alertRes = await getAlerts().expect(200);
        const alert = alertRes.body[0];

        expect(alert).toBeDefined();
        expect(alert).toEqual(expect.objectContaining({
            "disasterType": "flood",
            "description": "Water levels have risen above 3 feet, submerging residential streets. Multiple families have been evacuated by local rescue teams.",
            "location": {
                type: 'Point',
                coordinates: [72.8311, 21.1702],
                address: "Shivaji Nagar Pune"
            },
            media: []
        }));

        const reportId = alert.reportId;
        const alertId = alert._id;

        expect(reportId).toEqual(reportRes.body.report._id);

        const savedAlert = await Alerts.findById(alertId);
        expect(savedAlert).not.toBeNull();

        const savedReport = await Reports.findById(reportRes.body.report._id);
        expect(savedReport).not.toBeNull();

        expect(savedAlert.disasterType).toMatch(savedReport.disasterType);

    });

    it("Should return 401 if user don't have valid credentials", async () => {
        const invalidUser = request(app).get('/api/alerts/getAlerts').expect(401);
        expect((await invalidUser).body.message).toMatch(/Access Denied, Authorization token missing or invalid format/i);

    });

});

describe('POST /api/alerts/delete/:id flow and verification for security', () => {

    it('Should Delete Alert along with assets and reports', async () => {
        const reportRes = await postReport(report).expect(201);
        const alertId = reportRes.body?.alert._id;
        const reportId = reportRes.body.report._id;

        expect(await Alerts.findById(alertId)).not.toBeNull()
        expect(await Reports.findById(reportId)).not.toBeNull()

        const deleteRes = await deleteAlert(alertId, accessToken).expect(200);
        expect(deleteRes.body.message).toMatch(/Alert Deleted Successfully/i);

        expect(await Alerts.findById(alertId)).toBeNull()
        expect(await Reports.findById(reportId)).toBeNull()

    });

    it("Shouldn't Delete Alert Because of unAuthorized User", async () => {
        const reportRes = await postReport(report).expect(201);
        const alertId = reportRes.body.alert._id;
        const newUser = await fakeUser({ ...testUser, email: 'fake@gmail.com' }).expect(201);

        const deleteRes = await deleteAlert(alertId, newUser.body.accessToken);
        expect(deleteRes.status).toBe(401);
        expect(deleteRes.body.message).toMatch(/Access Denied, You must be owner of the report or admin to perform this action/i)
    });

    it('Should return 404 error for Providing Non-existed alertId', async () => {
        const deleteRes = await deleteAlert('6ac26f166eddaf49c2de046d', accessToken);
        expect(deleteRes.status).toBe(404);
        expect(deleteRes.body.message).toMatch(/Alert Not Found/i);
    });

    it('Should Delete Alert with Admin Credentials', async () => {
        const reportRes = await postReport(report).expect(201);
        const alertId = reportRes.body.alert._id;

        const admin = await adminRegister({ ...testUser, email: 'admin@gmail.com' });
        expect(admin.status).toBe(201);

        const deleteRes = await deleteAlert(alertId, admin.body.accessToken);
        expect(deleteRes.status).toBe(200);
        expect(deleteRes.body.message).toMatch(/Alert Deleted Successfully/i);
    });

});


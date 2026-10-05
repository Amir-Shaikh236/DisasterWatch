import { beforeAll, beforeEach, afterAll, describe, it, expect, vi } from "vitest"
import request from "supertest"
import jwt from 'jsonwebtoken'
import app from "../../app.js"
import { connectTestDB, clearTestDB, disconnectTestDB } from "../setup/db.js"
import Reports from "../../models/Reports.js"
import Alerts from "../../models/Alerts.js"
import User from "../../models/User.js"

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
    lastName: "Shaikh",
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

const postReport = (payload) => {
    const res = request(app)
        .post('/api/reports/add')
        .set('Authorization', `Bearer ${accessToken}`);

    if (payload.disasterType !== undefined) res.field('disasterType', payload.disasterType);
    if (payload.description !== undefined) res.field('description', payload.description);
    if (payload.location !== undefined) res.field('location', JSON.stringify(payload.location));

    return res;
};

const deleteReport = (id) => {
    return request(app).delete(`/api/reports/delete/${id}`).set('Authorization', `Bearer ${accessToken}`)
}

const getReports = () => {
    return request(app).get(`/api/reports/get`).set('Authorization', `Bearer ${accessToken}`);
}

const fakeUser = (payload) => {
    return request(app).post('/api/auth/register').send(payload)
}

const adminRegister = async (payload) => {
    const res = await request(app).post('/api/auth/register').send(payload);
    const user = await User.findOne({ email: res.body.user?.email });
    user.role = 'admin';
    await user.save();

    return res;
}

describe('GET /api/reports/get Flow Verification', () => {

    it('Should Provide report to the owner of the report and an admin of the system', async () => {
        await postReport(report);

        const response = await getReports();
        expect(response.status).toBe(200);

        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        const userId = decoded.id;

        const savedReport = response.body[0];
        expect(savedReport).toBeDefined();

        expect(String(savedReport.submittedBy)).toBe(String(userId));

    });

    it('Should Provide each and every reports to the Admin', async () => {
        const adminRes = await adminRegister({ ...testUser, email: 'admin2@gmail.com' });
        expect(adminRes.status).toBe(201);

        const getAdminReports = await request(app)
            .get('/api/reports/get')
            .set('Authorization', `Bearer ${adminRes.body.accessToken}`)
            .expect(200);

        expect(getAdminReports).not.toBeNull();
        expect(getAdminReports.body.length).toBe(1)
    });

    it('Should Return 404 for other users if the length of reports is 0', async () => {
        await postReport(report)
        const response = await fakeUser({ ...testUser, email: 'fake@gmail.com' });
        expect(response.status).toBe(201);

        const getReports = await request(app).get('/api/reports/get').set('Authorization', `Bearer ${response.body.accessToken}`);
        expect(getReports.status).toBe(404);
        expect(getReports.body.message).toMatch(/Not Reports have been submitted!/i);

    });

});

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

describe('POST /api/reports/delete/Id Flow Verification', () => {

    it('Should Delete Report along with assets and alerts generated By the Report', async () => {
        const reportRes = await postReport(report);
        expect(reportRes.status).toBe(201)

        const reportId = reportRes.body.report._id;
        const alertId = reportRes.body.alert._id;

        const deleteRes = await deleteReport(reportId);
        expect(deleteRes.status).toBe(200);

        expect(await Reports.findById(reportId)).toBeNull();
        expect(await Alerts.findById(alertId)).toBeNull()

    });

    it('Should return 404 error for Providing Non-existed reportId', async () => {
        const deleteRes = await deleteReport('6ac26f166eddaf49c2de046d');
        expect(deleteRes.status).toBe(404);
        expect(deleteRes.body.message).toMatch(/Report Not Found/i);
    });

    it('Should return 401 error for Because current user if Neither an admin or an owner of the report', async () => {
        const reportRes = await postReport(report)
        expect(reportRes.status).toBe(201);

        const newUser = await fakeUser({ ...testUser, email: 'skamir@gmail.com' });

        const deleteRes = await request(app)
            .delete(`/api/reports/delete/${reportRes.body.report._id}`)
            .set('Authorization', `Bearer ${newUser.body.accessToken}`)
            .expect(401)
        expect(deleteRes.body.message).toMatch(/Access Denied, You must be owner of the report or admin to perform this action/i)
    });

    it('Should Delete report with Admin Credentails ', async () => {
        const reportRes = await postReport(report)
        expect(reportRes.status).toBe(201);

        const admin = await adminRegister({ ...testUser, email: 'admin@gmail.com' });
        expect(admin.status).toBe(201);

        const updatedUser = await User.findOne({ email: admin.body.user?.email });
        expect(updatedUser.role).toBe('admin');

        const deleteRes = await request(app)
            .delete(`/api/reports/delete/${reportRes.body.report._id}`)
            .set('Authorization', `Bearer ${admin.body.accessToken}`)
            .expect(200);

        expect(deleteRes.body.message).toMatch(/Report Deleted Successfully/i);
        expect(await Reports.findById(reportRes.body.report._id)).toBeNull();

    });

});


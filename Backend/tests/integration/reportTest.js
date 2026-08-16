import { beforeAll, beforeEach, afterAll, describe, it, expect, vi } from "vitest"
import request from "supertest"
import mongoose from "mongoose"

import app from "../../server.js"
import Reports from "../../models/Reports.js"
import { connectTestDB, clearTestDB, disconnectTestDB } from "../setup/db.js"

vi.mock('../../config/db.js', () => ({
    connectDB: vi.fn(async () => {
        console.log('🛡️  Test Runner: Bypassed production cloud cluster leak.');
    })
}));

beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectTestDB();
});

afterAll(async () => {
    await disconnectTestDB();
});

describe('POST /api/reports/add - Validation & Flow Verification..', () => {

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
    });

    it('Should Create Report and save it in DB Upon valid Data.', async () => {

        // Sending Request
        const response = await request(app)
            .post("/api/reports/add")
            .send(report)
            .expect(201);

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
            status: 'investigating'
        }));

        const saved = await Reports.findById(response.body.report._id);
        expect(saved).not.toBeNull();
        expect(saved.disasterType).toBe(report.disasterType);
    });

    it('Should Reject a Report For Not Providing Required Fields', async () => {

        const response = await request(app)
            .post('/api/reports/add')
            .send({
                disasterType: report.disasterType,
                location: report.location
            })
            .expect(400);

        expect(response.body.status).toBe('fail')
        expect(response.body.message).toBe('Please Proivde description')

    });

    it('Should Reject a Report For Providing location longitude and latitude without array', async () => {

        const response = await request(app)
            .post('/api/reports/add')
            .send({
                disasterType: report.disasterType,
                description: report.description,
                location: {
                    coordinates: "72.8311, 21.1702",
                    address: report.location.address
                }
            })
            .expect(400);

        expect(response.body.status).toBe('fail')
        expect(response.body.message).toBe('Coordinates must be an array of [Longitude, latitude].')

    });

    it('Should Reject a Report For Providing location, longitude and latitude within array but in string', async () => {

        const response = await request(app)
            .post('/api/reports/add')
            .send({
                disasterType: report.disasterType,
                description: report.description,
                location: {
                    coordinates: ['abc', 'xyz'],
                    address: report.location.coordinates
                }
            })
            .expect(400);

        expect(response.body.status).toBe('fail')
        expect(response.body.message).toBe('Coordinates must contain valid numbers')

    });

    it('Should Reject a Report For Providing location with out of range Coordinates', async () => {

        const response = await request(app)
            .post('/api/reports/add')
            .send({
                disasterType: report.disasterType,
                description: report.description,
                location: {
                    coordinates: [200, 100],
                    address: report.location.address
                }
            })
            .expect(400);

        expect(response.body.status).toBe('fail')
        expect(response.body.message).toBe('Coordinates out of valid range')
    });

});
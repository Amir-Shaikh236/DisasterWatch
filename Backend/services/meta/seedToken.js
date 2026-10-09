
import "dotenv/config";
import mongoose from "mongoose";
import axios from "axios";
import { connectDB } from "../../config/db.js";
import MetaToken from "../../models/MetaToken.js";


const GRAPH_API_VERSION = "v26.0";
const NEVER_EXPIRE_DATE = new Date("2099-12-31T00:00:00.000Z");

async function seedMetaToken() {

    const token = process.env.PAGE_ACCESS_TOKEN;
    if (!token) throw new Error("Set PAGE_ACCESS_TOKEN in .env before running this script");

    if (!process.env.APP_ID || !process.env.APP_SECRET) {
        throw new Error("APP_ID and APP_SECRET must be set in .env");
    }

    const appToken = `${process.env.APP_ID}|${process.env.APP_SECRET}`;

    const { data } = await axios.get(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/debug_token`,
        { params: { input_token: token, access_token: appToken } }
    );

    const info = data.data;
    if (!info.is_valid) throw new Error("Meta says this token is NOT valid. Aborting.");

    if (info.type !== "PAGE") throw new Error(`Expected a PAGE token but got ${info.type}. Aborting.`);

    const neverExpires = !info.expires_at;
    const expiresAt = neverExpires ? NEVER_EXPIRE_DATE : new Date(info.expires_at * 1000)


    const dataAccessExpiresAt = info.data_access_expires_at
        ? new Date(info.data_access_expires_at * 1000)
        : null

    console.log(`Token type: ${info.type}, app: ${info.application}`);

    await connectDB();

    await MetaToken.findOneAndUpdate({ platform: "meta_page" },
        {
            accessToken: token,
            expiresAt,
            dataAccessExpiresAt,
            lastRefreshedAt: new Date(),
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    console.log(neverExpires ? "Seeded. Token never expires." : `Seeded. Expires ${expiresAt.toISOString()}`);

    if (dataAccessExpiresAt) {
        const daysLeft = ((dataAccessExpiresAt - Date.now()) / (1000 * 60 * 60 * 24)).toFixed(1);
        console.log(`Data access expires ${dataAccessExpiresAt.toISOString()} (~${daysLeft} days left)`);
    }

    await mongoose.disconnect();
}

seedMetaToken().catch((err) => {
    console.error("Seed failed:", err.response?.data || err.message);
    process.exit(1);
});
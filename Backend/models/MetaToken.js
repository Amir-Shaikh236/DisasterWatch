import mongoose from "mongoose";

const metaTokenSchema = new mongoose.Schema({
    platform: {
        type: String,
        default: 'meta_page',
        unique: true,
        trim: true,
    },

    accessToken: {
        type: String,
        required: true,
        trim: true
    },

    dataAccessExpiresAt: {
        type: Date
    },

    expiresAt: {
        type: Date,
        required: true
    },

    lastRefreshAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model("MetaToken", metaTokenSchema);


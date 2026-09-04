import mongoose from "mongoose";
import PointSchema from "./PointSchema.js";
import mediaSchema from "./mediaSchema.js";

const AlertSchema = new mongoose.Schema({

    title: { type: String, required: true },
    disasterType: {
        type: String,
        required: true,
        enum: ['flood', 'earthquake', 'wildfire', 'landslide'],
        index: true,
    },

    description: { type: String, required: true },

    severity: {
        type: String,
        enum: ['medium', 'high', 'critical'],
        required: true
    },

    confidence: { type: Number, required: true },

    location: {
        type: PointSchema,
        required: true,
    },

    media: [mediaSchema],

    status: {
        type: String,
        enum: ['Active', 'Resolved', 'false_alarm'],
        default: 'Active',
        index: true,
    },

    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
    },

    socialMediaPostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SocialMediaPost',
    },

    alertBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    source: {
        type: String,
        enum: ['report', 'social_media'],
    },

    sourceCount: {
        type: Number,
        default: 1
    }

}, { timestamps: true });

AlertSchema.index({ location: '2dsphere' });

export default mongoose.model('Alerts', AlertSchema);
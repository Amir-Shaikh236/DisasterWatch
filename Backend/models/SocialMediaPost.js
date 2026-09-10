import mongoose from "mongoose";
import mediaSchema from "./mediaSchema.js";
import PointSchema from "./PointSchema.js";

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    platform: {
        type: String,
        required: true,
        enum: ['twitter', 'facebook', 'instagram']
    },

    postId: {
        type: String,
        required: true,
    },

    username: {
        type: String,
        required: true
    },

    content: {
        type: String,
        required: true,
    },

    media: [mediaSchema],

    location: {
        type: PointSchema,
        required: true
    },

    disasterType: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },

    description: { type: String, required: true },

    alertId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Alert',
        default: null
    },

    severity: {
        type: String,
        enum: ['medium', 'high', 'critical'],
        required: true
    },

    confidence: { type: Number, required: true },

}, { timestamps: true });

export default mongoose.model('SocialMediaPost', PostSchema);
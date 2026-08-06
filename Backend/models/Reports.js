import mongoose from "mongoose";
import PointSchema from "./PointSchema.js";

const mediaSchema = new mongoose.Schema({
    url: { type: String, required: true },
    publicId: { type: String, required: true }

}, { _id: false });

const ReportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },

    disasterType: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },

    description: {
        type: String,
        required: true,
        trim: true,
    },

    location: {
        type: PointSchema,
        required: true,
    },

    media: [mediaSchema],

    status: {
        type: String,
        enum: ['verified', 'rejected', 'investigating'],
        default: 'investigating',
        index: true,
    },

    aiAnalysis: { type: mongoose.Schema.Types.Mixed },

}, { timestamps: true });


ReportSchema.index({ location: '2dsphere' });


export default mongoose.model('Reports', ReportSchema);
import mongoose from "mongoose";
import PointSchema from "./PointSchema.js";
import mediaSchema from "./mediaSchema.js";

const ReportSchema = new mongoose.Schema({
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
        enum: ['verified', 'rejected'],
        default: 'rejected',
        index: true,
    },

    aiAnalysis: { type: mongoose.Schema.Types.Mixed },

}, { timestamps: true });


ReportSchema.index({ location: '2dsphere' });


export default mongoose.model('Reports', ReportSchema);
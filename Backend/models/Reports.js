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

    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    alertId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Alert',
        default: null
    },

    aiAnalysis: { type: mongoose.Schema.Types.Mixed },

}, { timestamps: true });


ReportSchema.index({ location: '2dsphere' });


export default mongoose.model('Reports', ReportSchema);
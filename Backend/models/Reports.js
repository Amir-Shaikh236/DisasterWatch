import mongoose from "mongoose";
import PointSchema from "./PointSchema.js";

const mediaSchema = new mongoose.Schema({
    url: { type: String }, // add required after getting images successfully
    publicId: { type: String }

}, { _id: false });

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
        enum: ['verified', 'rejected', 'investigating'],
        default: 'investigating',
        index: true,
    },

    aiAnalysis: { type: mongoose.Schema.Types.Mixed },

}, { timestamps: true });


ReportSchema.index({ location: '2dsphere' });


export default mongoose.model('Reports', ReportSchema);
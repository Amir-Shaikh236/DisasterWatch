import mongoose from "mongoose";
import PointSchema from "./PointSchema.js";

const AlertSchema = new mongoose.Schema({

    title: { type: String, required: true },
    disasterType: {
        type: String,
        required: true,
        enum: ['flood, earthquake', 'wildfire', 'landslide'],
        index: true,
    },

    description: { type: String, required: true },

    severity: {
        type: String,
        enum: ['medium', 'high', 'critical']
    },

    confidence: { type: Number, required: true },

    location: {
        type: PointSchema,
        required: true,
    },

    status: {
        type: String,
        enum: ['Active', 'Resolved', 'false_alarm'],
        default: 'Active',
        index: true,
    }

}, { timestamps: true });

AlertSchema.index({ location: '2dsphere' });

export default mongoose.model('Alerts', AlertSchema);
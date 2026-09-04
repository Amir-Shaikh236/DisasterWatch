import mongoose from "mongoose";
import PointSchema from "./PointSchema.js";

const LocationAlertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    location: PointSchema,

    radius: {
        type: Number,
        default: 10000,
        min: 500,
        max: 100000
    },

    alertsEnabled: {
        type: Boolean,
        default: true,
        index: true
    },

}, { timestamps: true });

LocationAlertSchema.index({ location: '2dsphere' });

export default mongoose.model('LocationAlert', LocationAlertSchema);
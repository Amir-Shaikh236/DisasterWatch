import mongoose from "mongoose";

const PointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
    },

    coordinates: {
        type: [Number],
        required: true,
        validate: {
            validator: function (val) {
                if (!Array.isArray(val) || val.length !== 2) return false;
                const [lng, lat] = val;
                return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
            },
            message: 'Coordinates must be [longitude, latitude] within valid range.'
        }
    }
}, { _id: false });

export default PointSchema;
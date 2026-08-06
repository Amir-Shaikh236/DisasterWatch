import mongoose from "mongoose";

const LocationAlertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    location: {
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
                message: 'Coordinates must be [longitude, latitude] within valid ranges.'
            }
        }
    },

    radius: {
        type: Number,
        default: 10000, // meters (10km) — sensible platform default
        min: 500,       // prevent absurdly tiny radius (near-useless)
        max: 100000      // prevent absurdly huge radius (defeats the point of "nearby")
    },

    alertsEnabled: {
        type: Boolean,
        default: true,
        index: true // you'll filter on this in every notification job query
    },

    locationName: { type: String, trim: true }, // human-readable, e.g. "Surat, Gujarat" — for display in settings UI

}, { timestamps: true }); // adds createdAt + updatedAt automatically — no need for manual lastUpdated

LocationAlertSchema.index({ location: '2dsphere' });

const LocationAlert = mongoose.model('LocationAlert', LocationAlertSchema);
export default LocationAlert;
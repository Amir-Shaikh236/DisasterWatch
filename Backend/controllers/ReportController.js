import Reports from "../models/Reports.js";
import AppError from "../utils/AppError.js";

const getReports = async (req, res, next) => {
    try {
        const reports = await Reports.find({});
        if (!reports) return next(new AppError(404, 'Reports Not Found'));
        if (reports.length <= 0) return res.status(404).json({ message: 'Not Reports have been submitted!' });

        res.status(200).json(reports);

    } catch (error) {
        next(error)
    }
}

const addReport = async (req, res, next) => {
    try {
        const { title, disasterType, description, locationName, location } = req.body;

        const requiredFields = { title, disasterType, description, location }
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => value === undefined || value === null || value === '')
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return next(new AppError(400, `Please Proivde ${missingFields.join(', ')}`));
        }

        if (!Array.isArray(location) || location.length !== 2) {
            return next(new AppError(400, 'Coordinates must be an array of [Longitude, latitude].'));
        }

        const [lng, lat] = location.map(Number);

        if (Number.isNaN(lng) || Number.isNaN(lat)) {
            return next(new AppError(400, 'Coordinates must contain valid numbers'));
        }

        if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
            return next(new AppError(400, 'Coordinates out of valid range'));
        }

        const report = await Reports.create({
            title: title,
            disasterType: disasterType,
            description: description,
            locationName: locationName,
            location: {
                type: 'Point',
                coordinates: [lng, lat]
            },
            status: 'investigating'
        });

        res.status(201).json({ status: 'created', report: report });

    } catch (error) {
        next(error);

    }
};



export { getReports, addReport }

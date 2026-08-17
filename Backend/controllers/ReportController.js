import Reports from "../models/Reports.js";
import { AnalyzeDisasterReport } from "../services/gemini/AnalyzeDisasterReport.js";
import AppError from "../utils/AppError.js";
import { convertImages, ValidateLocation, ValidateRequiredFields } from "../utils/Validator.js";

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
        const { disasterType, description } = req.body;
        const location = JSON.parse(req.body.location);

        ValidateRequiredFields({ disasterType, description, location });
        const { lng, lat } = ValidateLocation(location);

        const images = convertImages(req.files);
        const currentDate = new Date().toISOString().split("T")[0];

        const analysis = await AnalyzeDisasterReport(images, disasterType, description, location.address, currentDate);

        const status = analysis.status === "approved" ? "investigating" : "rejected";

        const report = await Reports.create({
            disasterType: disasterType,
            description: description,
            location: {
                type: 'Point',
                coordinates: [lng, lat],
                address: location.address
            },
            status,
            aiAnalysis: analysis
        });

        console.log("Report: ", report);
        res.status(201).json({ status: 'created', report: report });

    } catch (error) {
        next(error);

    }
};



export { getReports, addReport }

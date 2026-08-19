import Reports from "../models/Reports.js";
import { AnalyzeDisasterReport } from "../services/gemini/AnalyzeDisasterReport.js";
import AppError from "../utils/AppError.js";
import { convertImages, ValidateLocation, ValidateRequiredFields } from "../utils/validator.js";

export const getReports = async (req, res, next) => {
    try {
        const reports = await Reports.find({});
        if (!reports) return next(new AppError(404, 'Reports Not Found'));
        if (reports.length <= 0) return res.status(404).json({ message: 'Not Reports have been submitted!' });

        res.status(200).json(reports);

    } catch (error) {
        next(error)
    }
}

export const addReport = async (req, res, next) => {

    const REJECT_THRESHOLDS = {
        minConfidence: 0.70, maxMisinforamtionScore: 0.60
    }

    try {
        const { disasterType, description } = req.body;
        const location = JSON.parse(req.body.location);

        ValidateRequiredFields({ disasterType, description, location });
        const { lng, lat } = ValidateLocation(location);

        const images = convertImages(req.files);
        const currentDate = new Date().toISOString().split("T")[0];

        // const analysis = await AnalyzeDisasterReport(images, disasterType, description, location.address, currentDate);
        const analysis = await AnalyzeDisasterReport(images, disasterType, description);

        const shouldReject = !analysis.isDisaster || !analysis.typeMatch || analysis.confidence < REJECT_THRESHOLDS.minConfidence ||
            analysis.misinformationScore >= REJECT_THRESHOLDS.maxMisinforamtionScore;

        if (shouldReject) return res.status(422).json({ success: "false", message: "Report could not be verified", reasons: analysis.rejectionReasons });

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

        res.status(201).json({ status: 'created', report: report });

    } catch (error) {
        if (error.status === 503) return next(new AppError(503, "AI verification service is temporarily unavailable. Please try again shortly."))
        next(error);

    }
};


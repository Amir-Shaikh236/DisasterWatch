import Reports from "../models/Reports.js";
import { AnalyzeDisasterReport } from "../services/gemini/AnalyzeDisasterReport.js";
import { ProcessReport } from "../services/report/ProcessReport.js";
import AppError from "../utils/AppError.js";
import { convertImages, ValidateRequiredFields } from "../utils/validator.js";

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
    try {
        const { disasterType, description } = req.body;
        const location = JSON.parse(req.body.location);

        ValidateRequiredFields({ disasterType, description, location });

        const images = req.files;
        const currentDate = new Date().toISOString().split("T")[0];

        const result = await ProcessReport({ images, disasterType, description, location, currentDate });

        if (!result.approved) {
            return res.status(422).json({ status: "rejected", message: "Report Couldn't verified", analysis: result.analysis });
        }

        return res.status(201).json({ status: "created", message: "Report Submitted Successfully", report: result.report });

    } catch (error) {
        if (error.status === 503) return next(new AppError(503, "AI verification service is temporarily unavailable. Please try again shortly."))
        next(error);

    }
};

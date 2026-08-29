import Reports from "../models/Reports.js";
import { deleteCache, getCache, setCache } from "../services/redis/cacheServices.js";
import { ProcessReport } from "../services/report/ProcessReport.js";
import AppError from "../utils/AppError.js";
import { ValidateRequiredFields } from "../utils/validator.js";
import { DeleteReport } from "../services/report/DeleteProcess.js";

const REPORT_CACHE_KEY = "reports:all"

export const getReports = async (req, res, next) => {
    try {
        const CacheReports = await getCache(REPORT_CACHE_KEY);
        if (CacheReports) return res.status(200).json(CacheReports);

        const filterReports = {}
        if (req.user.role !== "admin") {
            filterReports.submittedBy = req.user._id
        }

        const reports = await Reports.find(filterReports).sort({ createdAt: -1 });
        if (!reports) return next(new AppError(404, "Reports Not Found"));
        if (reports.length == 0) return res.status(404).json({ message: 'Not Reports have been submitted!' });

        await setCache(REPORT_CACHE_KEY, reports, 300);
        res.status(200).json(reports);

    } catch (error) {
        next(error)

    }
}

export const addReport = async (req, res, next) => {
    try {
        const { disasterType, description } = req.body;
        const location = JSON.parse(req.body.location);
        const userId = req.user._id
        console.log('User ID: ', userId)

        ValidateRequiredFields({ disasterType, description, location });

        const images = req.files;
        const currentDate = new Date().toISOString().split("T")[0];

        const result = await ProcessReport({ images, disasterType, description, location, currentDate, userId });
        if (!result.approved) return res.status(422).json({ status: "rejected", message: "Report Couldn't verified", analysis: result.analysis });

        return res.status(201).json({ status: "created", message: "Report Submitted Successfully", report: result.report, alert: result.alert });

    } catch (error) {
        if (error.status === 503) return next(new AppError(503, "AI verification service is temporarily unavailable. Please try again shortly."))
        next(error);

    }
};

export const deleteReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) return next(new AppError(400, "Report id is required"));

        await DeleteReport(id);

        await deleteCache(REPORT_CACHE_KEY);
        return res.status(200).json({ message: "Report Deleted Successfully" });

    } catch (error) {
        next(error);
    }
};
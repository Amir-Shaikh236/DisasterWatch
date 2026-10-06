import redisClient from "../config/redis.js";
import Reports from "../models/Reports.js";
import { DeleteProcess } from "../services/Delete/DeleteReport.js";
import { deleteCache, getCache, setCache } from "../services/redis/cacheServices.js";
import { ProcessReport } from "../services/report/ProcessReport.js";
import AppError from "../utils/AppError.js";
import { getWithTwoTierCache } from "../utils/CacheService.js";
import { ValidateRequiredFields } from "../utils/validator.js";

const REPORT_CACHE_KEY = "reports:all"

export const getReports = async (req, res, next) => {
    try {
        const isAdmin = req.user.role === 'admin';
        const cacheKey = isAdmin ? 'reports:admin' : `reports:user:${req.user._id}`;

        try {
            const CacheReports = await getCache(cacheKey);
            if (CacheReports) return res.status(200).json(CacheReports);

        } catch (error) {
            console.warn(`cache read failed for the Key: ${cacheKey}`, error.message);

        }

        const fetchFromDb = async () => {
            const filterReports = isAdmin ? {} : { submittedBy: req.user._id };
            return await Reports.find(filterReports).sort({ createdAt: -1 });
        }

        const { data: reports } = await getWithTwoTierCache(cacheKey, fetchFromDb, redisClient);

        if (reports.length == 0) return res.status(404).json({ message: 'Not reports have been submitted yet!' });

        await setCache(cacheKey, reports, 300).catch((error) => {
            console.warn(`Cache write failed for the key ${cacheKey}`, error.message)
        });

        return res.status(200).json(reports);

    } catch (error) {
        next(error)

    }
};

export const addReport = async (req, res, next) => {
    try {
        const { disasterType, description } = req.body;
        const location = JSON.parse(req.body.location);
        const userId = req.user._id

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

        const user = req.user;
        if (!user) return next(new AppError(401, 'Unauthorized User'));

        await DeleteProcess(id, user);

        await deleteCache(REPORT_CACHE_KEY);
        return res.status(200).json({ message: "Report Deleted Successfully" });

    } catch (error) {
        next(error);

    }
};


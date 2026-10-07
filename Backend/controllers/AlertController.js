import Alerts from "../models/Alerts.js";
import { DeletePost } from "../services/Delete/DeletePost.js";
import { DeleteProcess } from "../services/Delete/DeleteReport.js";
import { deleteCache, getCache, setCache } from "../services/redis/cacheServices.js";
import AppError from "../utils/AppError.js";

const ALERT_CACHE_KEY = "alerts:all"

export const getAlerts = async (req, res, next) => {
    try {
        const cacheAlerts = await getCache(ALERT_CACHE_KEY);
        if (cacheAlerts) return res.status(200).json(cacheAlerts);

        const alerts = await Alerts.find({}).sort({ createdAt: -1 });
        if (!alerts) return next(new AppError(404, 'Alert Not Found'));
        if (alerts.length == 0) return next(new AppError(404, "No Alerts Yet!"));

        await setCache(ALERT_CACHE_KEY, alerts, 300);
        return res.status(200).json(alerts);

    } catch (error) {
        next(error)

    }
}

export const deleteAlert = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) return next(new AppError(400, "Alert id is required"));

        const alert = await Alerts.findById(id);
        if (!alert) return next(new AppError(404, "Alert Not Found"));

        const user = req.user;
        if (!user) return next(new AppError(401, 'Unauthorized User'));

        if (alert.reportId) {
            await DeleteProcess(alert.reportId, user);

        } else {
            await DeletePost(alert.socialMediaPostId)

        }

        await deleteCache(ALERT_CACHE_KEY);
        return res.status(200).json({ message: "Alert Deleted Successfully" });

    } catch (error) {
        next(error);

    }
};
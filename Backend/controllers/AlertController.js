import Alerts from "../models/Alerts.js";
import { getCache, setCache } from "../services/redis/cacheServices.js";
import AppError from "../utils/AppError.js";

const ALERT_CACHE_KEY = "alerts:all"

export const getAlerts = async (req, res, next) => {
    try {
        const cacheAlerts = await getCache(ALERT_CACHE_KEY);
        if (cacheAlerts) return res.status(200).json(cacheAlerts);

        const alerts = await Alerts.find({}).sort({ createdAt: -1 });
        if (!alerts) return next(new AppError(404, "Alerts Not Found"));
        if (alerts.length <= 0) return res.status(404).json({ message: "No Alerts has been Found" });

        await setCache(ALERT_CACHE_KEY, alerts, 300);
        return res.status(200).json(alerts);

    } catch (error) {
        next(error)

    }
}

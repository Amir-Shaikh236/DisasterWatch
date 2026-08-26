import Alerts from "../models/Alerts.js";
import AppError from "../utils/AppError.js";

export const getAlerts = async (req, res, next) => {
    try {
        const alerts = await Alerts.find({}).sort({ createdAt: -1 });
        if (!alerts) return next(new AppError(404, "Alerts Not Found"));
        if (alerts.length <= 0) return res.status(404).json({ message: "No Alerts has been Found" });
        return res.status(200).json(alerts);

    } catch (error) {
        next(error)
    }
}

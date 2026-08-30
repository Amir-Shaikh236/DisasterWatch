import Alerts from "../../models/Alerts.js";
import AppError from "../../utils/AppError.js";
import { getIO } from "../socket/socket.js";

export const DeleteAlert = async (id) => {
    try {
        const alert = await Alerts.findByIdAndDelete(id);
        if (!alert) return new AppError(404, "Alert Not Found");

        getIO().emit('alert:deleted', { alertId: id });

    } catch (error) {
        console.error('Error Deleting Alert: ', error)

    }
}
import Alerts from "../../models/Alerts.js";
import { getIO } from "../socket/socket.js";

export const DeleteAlert = async (id) => {
    try {
        const alert = await Alerts.findByIdAndDelete(id);
        if (!alert) throw new Error('Alert Not Found!');

        getIO().emit('alert:deleted', { alertId: id });

    } catch (error) {
        console.error('Error Deleting Alert: ', error)

    }
}
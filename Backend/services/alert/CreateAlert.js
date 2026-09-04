import Alerts from "../../models/Alerts.js"
import { ValidateLocation } from "../../utils/validator.js"
import { notifyNearByUser } from "../Notification/notifyNearUsers.js";
import { deleteCache } from "../redis/cacheServices.js";
import { getIO } from "../socket/socket.js";

const ALERT_CACHE_KEY = "alerts:all"

export const createAlert = async (payload) => {
    try {

        const { lng, lat } = ValidateLocation(payload.location);

        const source = Boolean(payload.submittedBy) ? 'report' : "social_media"

        const alertData = {
            title: payload.aiAnalysis?.alertTitle,
            disasterType: payload.disasterType,
            description: payload.description,
            severity: payload.aiAnalysis?.severity,
            confidence: payload.aiAnalysis?.confidence,
            location: {
                type: 'Point',
                coordinates: [lng, lat],
                address: payload.location?.address
            },
            media: payload.media,
            status: "Active",
            reportId: payload._id,
            alertBy: payload.submittedBy,
            source: source
        }

        const alert = await Alerts.create(alertData);
        await deleteCache(ALERT_CACHE_KEY)
        await notifyNearByUser(alert)

        const io = getIO();
        io.emit("alert:created", alert);

        return alert

    } catch (error) {
        console.log('Error While Creating Alert', error);

    }
}
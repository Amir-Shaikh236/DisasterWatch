import { messaging } from "../../config/firebaseAdmin.js";

export const sendNotification = async ({ token, title, body, data = {}, }) => {
    if (!messaging) {
        throw new Error("Firebase messaging is not configured");
    }

    const message = {
        token,

        notification: {
            title: String(title || `🚨 Proximity Alert: ${alert.severity.toUpperCase()}`),
            body: String(body || alert.title),
        },

        data: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)]))
    };

    const response = await messaging.send(message);
    return response;
}
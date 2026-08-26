import User from "../../models/User.js";
import { sendNotification } from "./sendNotification.js";

export const notifyNearByUser = async (alert) => {
    try {
        const users = await User.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: alert.location.coordinates
                    },
                    distanceField: "distance",
                    spherical: true,
                    maxDistance: 15000
                }
            },
            {
                $match: {
                    notification: true,
                    fcmTokens: {
                        $exists: true,
                        $ne: []
                    }
                }
            }
        ]);

        const nearByUsers = users.filter((user) => user.distance <= user.notificationRadius * 1000);

        for (const user of nearByUsers) {
            for (const token of user.fcmTokens) {
                try {
                    await sendNotification({
                        token,

                        title: `${alert.title || "Disater Alert"}`,

                        body: `${alert.description}|| Alert Reported Near You`,

                        data: {
                            alertId: alert._id.toString(),
                            disasterType: alert.disasterType,
                            severity: alert.severity
                        },
                    });
                    console.log('Notification has been sent to: ', user.firstName + " " + user?.lastName);

                } catch (error) {
                    console.error(`Failed to send Notification to User: ${user.firstName}`, error.message);

                }
            }
        }

        return { usersFound: users.length, usersNotified: nearByUsers.length };

    } catch (error) {
        console.error('Failed to send Notification: ', error);

    }
}
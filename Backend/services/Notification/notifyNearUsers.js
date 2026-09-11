import User from "../../models/User.js";
import { sendNotification } from "./sendNotification.js";

export const notifyNearByUser = async (alert) => {
    try {
        const [users, admins] = await Promise.all([
            User.aggregate([
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
                        role: "user",
                        notification: true,
                        fcmTokens: {
                            $exists: true,
                            $ne: []
                        }
                    }
                }
            ]),

            User.find({
                role: "admin",
                // notification: true,
                fcmTokens: {
                    $exists: true,
                    $ne: []
                }
            }).lean()

        ]);

        const nearByUsers = users.filter((user) => user.distance <= user.notificationRadius * 1000);
        const recipients = [...nearByUsers, ...admins];

        if (recipients.length === 0) {
            console.log(`[Notification] No nearby users or admins found for this alert location`)
            return { usersFound: 0, adminsFound: 0, usersNotified: 0, adminsNotified: 0 }
        }

        const notificationPromises = [];

        for (const user of recipients) {
            for (const token of user.fcmTokens) {
                const notificationTask = sendNotification({
                    token,

                    title: `${alert.title || "Disater Alert"}`,

                    body: `${alert.description}|| Alert Reported Near You`,

                    data: {
                        alertId: alert._id.toString(),
                        disasterType: alert.disasterType,
                        severity: alert.severity
                    },

                }).then(() => {
                    console.log('Notification has been sent to: ', user.firstName + " " + user?.lastName);

                }).catch((error) => {
                    console.error(`Failed to send Notification to User: ${user.firstName}`, error.message);

                });

                notificationPromises.push(notificationTask);
            }
        }

        console.log(`Notification Dispatching ${notificationPromises.length} notifications in parallel`)
        await Promise.allSettled(notificationPromises);

        return {
            usersFound: nearByUsers.length,
            adminsFound: admins.length,
            usersNotified: nearByUsers.length,
            adminsNotified: admins.length
        };

    } catch (error) {
        console.error('Failed to send Notification: ', error);
        throw error;
    }
}
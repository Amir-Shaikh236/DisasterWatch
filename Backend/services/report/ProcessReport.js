import Alerts from "../../models/Alerts.js";
import Reports from "../../models/Reports.js";
import User from "../../models/User.js";
import { convertImages, ValidateLocation } from "../../utils/validator.js";
import { UploadToCloud } from "../cloudinary/cloudinaryUpload.js";
import { AnalyzeDisasterReport } from "../gemini/AnalyzeDisasterReport.js";
import { sendNotification } from "../Notification/sendNotification.js";

export const ProcessReport = async ({ images, disasterType, description, location, currentDate }) => {
    const REJECT_THRESHOLDS = {
        minConfidence: 0.70, maxMisinformationScore: 0.60
    }

    const { lng, lat } = ValidateLocation(location);
    const base64Image = convertImages(images)

    const analysis = await AnalyzeDisasterReport(base64Image, disasterType, description);

    const shouldReject = !analysis.isDisaster || !analysis.typeMatch || analysis.confidence < REJECT_THRESHOLDS.minConfidence
        || analysis.misinformationScore >= REJECT_THRESHOLDS.maxMisinformationScore;

    if (shouldReject) return { approved: false, analysis };

    const uploadedImages = [];
    for (const image of images || []) {
        const result = await UploadToCloud(image.buffer);

        uploadedImages.push({
            url: result.secure_url,
            publicId: result.public_id
        });
    }

    const reportData = {
        disasterType: disasterType,
        description: description,
        location: {
            type: 'Point',
            coordinates: [lng, lat],
            address: location.address
        },
        media: uploadedImages,
        status: "verified",
        aiAnalysis: analysis
    };

    const report = await Reports.create(reportData);

    const alertData = {
        title: analysis.alertTitle,
        disasterType: disasterType,
        description: analysis.description,
        severity: analysis.severity,
        confidence: analysis.confidence,
        location: {
            type: 'Point',
            coordinates: [lng, lat],
            address: location.address
        },
        media: uploadedImages,
        status: "Active"
    }

    const alert = await Alerts.create(alertData);

    try {
        const users = await User.find({ fcmTokens: { $exists: true, $ne: [] } }).select('fcmTokens');
        for (const user of users) {
            if (!user.fcmTokens?.length) continue;

            for (const token of user.fcmTokens) {
                try {
                    await sendNotification({
                        token,
                        title: `${analysis.alertTitle || "Disater Alert"}`,

                        body: analysis.description,

                        data: {
                            alertId: alert._id.toString(),
                            disasterType,
                            severity: analysis.severity
                        },
                    });
                } catch (error) {
                    console.error('Failed to send Notifications: ', error);
                }
            }

        }

    } catch (error) {
        console.error('Notification System Error: ', error);
    }

    return { approved: true, report, alert, analysis }
}
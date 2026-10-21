import Reports from "../../models/Reports.js";
import { invalidateKey } from "../../utils/CacheService.js";
import { convertImages, ValidateLocation } from "../../utils/validator.js";
import { createAlert } from "../alert/CreateAlert.js";
import { UploadToCloud } from "../cloudinary/cloudinaryUpload.js";
import { AnalyzeDisasterReport } from "../gemini/AnalyzeDisasterReport.js";
import { deleteCache } from "../redis/cacheServices.js";
import { getIO } from "../socket/socket.js";

export const ProcessReport = async ({ images, disasterType, description, location, currentDate, user }) => {
    const REJECT_THRESHOLDS = { minConfidence: 0.70, maxMisinformationScore: 0.60 }

    const isAdmin = user.role === 'admin';
    const cacheKey = isAdmin ? 'reports:admin' : `reports:user:${user._id}`;

    const { lng, lat } = ValidateLocation(location);
    const base64Image = images?.length ? convertImages(images) : null;

    let analysis;
    try {
        analysis = await AnalyzeDisasterReport(base64Image, disasterType, description);

    } catch (error) {
        return { approved: false, analysisFailed: true, refundable: typeof error.status === "number" };

    }

    if (analysis.analysisFailed) {
        return { approved: false, analysisFailed: true, refundable: analysis.refundable };
    }

    const shouldReject = !analysis.isDisaster || !analysis.typeMatch || analysis.confidence < REJECT_THRESHOLDS.minConfidence
        || analysis.misinformationScore >= REJECT_THRESHOLDS.maxMisinformationScore;

    if (shouldReject) return { approved: false, analysis };

    const uploadedImages = [];
    if (images) {
        for (const image of images || []) {
            const result = await UploadToCloud(image.buffer);

            uploadedImages.push({
                url: result.secure_url,
                publicId: result.public_id
            });
        }
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
        submittedBy: user._id,
        aiAnalysis: analysis,
    };

    const report = await Reports.create(reportData);
    await deleteCache(cacheKey);
    await invalidateKey(cacheKey);

    const io = getIO();
    io.to(`user:${report.submittedBy}`).emit('report:created', report);
    io.to('admin').emit('report:created', report);

    const alert = await createAlert(report)
    if (!alert) throw new Error("Report was saved, but the alert could not be created");

    report.alertId = alert._id
    await report.save();

    return { approved: true, report, alert, analysis }
}


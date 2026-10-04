import cloudinary from "../../config/Cloudinary.js";
import Alerts from "../../models/Alerts.js";
import Reports from "../../models/Reports.js";
import AppError from "../../utils/AppError.js";
import { getIO } from "../socket/socket.js";

export const DeleteProcess = async (id, user) => {
    const report = await Reports.findById(id);
    if (!report) throw new AppError(404, "Report Not Found");

    const isOwner = report.submittedBy?.equals(user._id);
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
        throw new AppError(401, "Access Denied, You must be owner of the report or admin to perform this action")
    }

    if (report.media && report.media?.length > 0) {
        const publicId = report.media.map(media => media.publicId);

        await Promise.all(publicId.map((publicId) =>
            cloudinary.uploader.destroy(publicId)
        ));
    }

    if (report.alertId) {
        const alert = await Alerts.findByIdAndDelete(report.alertId);
        if (alert) getIO().emit('alert:deleted', { alertId: report.alertId });
    }

    await report.deleteOne();
    getIO().emit('report:deleted', { reportId: id });

}
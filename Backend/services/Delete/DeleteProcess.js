import cloudinary from "../../config/Cloudinary.js";
import Alerts from "../../models/Alerts.js";
import Reports from "../../models/Reports.js";
import { getIO } from "../socket/socket.js";

export const DeleteProcess = async (id) => {
    const report = await Reports.findById(id);
    if (!report) throw new AppError(404, "Report Not Found");

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
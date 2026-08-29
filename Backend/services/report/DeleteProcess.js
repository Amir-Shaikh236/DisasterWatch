import cloudinary from "../../config/Cloudinary.js";
import Reports from "../../models/Reports.js"
import { DeleteAlert } from "../alert/DeleteAlert.js";
import { getIO } from "../socket/socket.js";

export const DeleteReport = async (id) => {
    try {
        const report = await Reports.findById(id);
        if (!report) throw new Error('Report Not Found!');

        if (report.media && report.media.length > 0) {
            const publicId = report.media.map(media => media.publicId);

            await Promise.all(publicId.map((publicId) =>
                cloudinary.uploader.destroy(publicId)
            ));
        }

        await DeleteAlert(report.alertId);

        await report.deleteOne();
        getIO().emit('report:deleted', { reportId: id });

    } catch (error) {
        console.error('Error Deleting Report: ', error)

    }
}
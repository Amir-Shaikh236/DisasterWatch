import cloudinary from "../../config/Cloudinary.js";
import Alerts from "../../models/Alerts.js";
import SocialMediaPost from "../../models/SocialMediaPost.js";
import AppError from "../../utils/AppError.js";
import { getIO } from "../socket/socket.js";

export const DeletePost = async (postId) => {
    try {
        console.log('Finding Post to Delete...');
        const post = await SocialMediaPost.findById(postId)
        if (!post) throw new AppError(404, `No Post Found with this Alert: ${postId}`);

        console.log('Deleting Images from Post');
        if (post.media && post.media.length > 0) {
            const publicId = post.media.map(media => media.publicId);
            await Promise.all(publicId.map((publicId) => cloudinary.uploader.destroy(publicId)));
        }
        console.log('Images Deleted');

        console.log('Find and Deleting Alert Related to Post')

        if (post.alertId) {
            const alert = await Alerts.findByIdAndDelete(post.alertId);
            if (alert) getIO().emit('alert:deleted', { alertId: post.alertId });
            console.log('Alert Deleted Successfully');
        }

        await post.deleteOne();
        console.log('Post Deleted Successfully')

    } catch (error) {
        console.error('Error While Deleting Post: ', error)
        throw error;

    }
}
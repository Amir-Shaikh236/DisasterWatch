import { Worker } from 'bullmq'
import { redisQueueConnection } from '../../config/queue.js';
import { UploadToCloud } from '../cloudinary/cloudinaryUpload.js';
import { ValidateLocation } from '../../utils/validator.js';
import { PostToFB } from '../SocialMedia/Facebook/FBpost.js';
import SocialMediaPost from '../../models/SocialMediaPost.js';
import { PostToIG } from '../SocialMedia/Instagram/IGpost.js';
import { createAlert } from '../alert/CreateAlert.js';
import { generateSocialContent } from '../gemini/AnalyzeDisasterReport.js';
import { generateAlertImage } from '../gemini/AnalyzeImage.js';

const processAlert = async (job) => {
    const alertData = job.data;

    try {
        const { imagePrompt, caption } = await generateSocialContent(alertData)
        const imageBuffer = await generateAlertImage(imagePrompt)
        const imageResult = await UploadToCloud(imageBuffer)

        const { lng, lat } = ValidateLocation(alertData.location)

        const media = [{ url: imageResult.secure_url, publicId: imageResult.public_id }];

        const POST_DATA = {
            username: 'DisasterWatch',
            content: caption,
            media: media,
            location: {
                type: 'Point',
                coordinates: [lng, lat]
            },
            disasterType: alertData.disasterType,
            severity: alertData.severity,
            confidence: alertData.confidence
        }

        const FB_RESULT = await PostToFB(imageResult.secure_url, caption);
        const FB_POST = await SocialMediaPost.create({
            ...POST_DATA,
            title: alertData.title,
            platform: 'facebook',
            postId: FB_RESULT.id
        });

        const FB_ALERT = await createAlert(FB_POST)


        const IG_RESULT = await PostToIG(imageResult.secure_url, caption);
        const IG_POST = await SocialMediaPost.create({
            ...POST_DATA,
            title: alertData.title,
            platform: 'instagram',
            postId: IG_RESULT.id
        });

        const IG_ALERT = await createAlert(IG_POST)

        await SocialMediaPost.updateOne(
            { _id: FB_POST._id },
            { $set: { alertId: FB_ALERT._id } }
        );

        await SocialMediaPost.updateOne(
            { _id: IG_POST._id },
            { $set: { alertId: IG_ALERT._id } }
        );

        console.log(FB_POST);

        console.log(`Successfully stored Facebook and Instagram alerts for ${alertData.title} in MongoDB`)

    } catch (error) {
        console.log(`Failed to store alert (Job ID) ${job.id}:  ${error}`)
        throw error;
    }
}


export const alertWorker = new Worker('disaster-alerts', processAlert, {
    connection: redisQueueConnection,
    concurrency: 5,
    limiter: {
        max: 10,
        duration: 60000,
    },
});

alertWorker.on('completed', (job) => {
    console.log(`Job ${job.id} Completed Successfully`)
});

alertWorker.on('failed', (job, err) => {
    console.log(`Job ${job.id} Failed with Error; ${err.message}`)
})
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
    console.log('AlertData in Alertwoker: ', alertData)

    try {
        if (!alertData || !alertData.location) {
            throw new Error('Alert data must include a location');
        }

        console.log('Generating Caption & ImagePrompt....')
        const { imagePrompt, caption } = await generateSocialContent(alertData)

        console.log('Generating Image....')
        const imageBuffer = await generateAlertImage(imagePrompt)

        console.log('Uploading Image....')
        const imageResult = await UploadToCloud(imageBuffer)
        const media = [{ url: imageResult.secure_url, publicId: imageResult.public_id }];


        const { lng, lat } = ValidateLocation(alertData.location)

        const POST_DATA = {
            title: alertData.title,
            disasterType: alertData.disasterType,
            description: alertData.description,
            username: 'DisasterWatch',
            content: caption,
            media: media,
            location: {
                type: 'Point',
                coordinates: [lng, lat]
            },
            severity: alertData.severity,
            confidence: alertData.confidence
        }

        console.log('POST Data: ', POST_DATA)

        console.log('Creating Post on FB')
        const FB_RESULT = await PostToFB(imageResult.secure_url, caption);
        const FB_POST = await SocialMediaPost.create({
            ...POST_DATA,
            platform: 'facebook',
            postId: FB_RESULT.id
        });

        const FB_ALERT = await createAlert(FB_POST)
        console.log('FB Post Data: ', FB_POST)

        console.log('Creating Post on IG')
        const IG_RESULT = await PostToIG(imageResult.secure_url, caption);
        const IG_POST = await SocialMediaPost.create({
            ...POST_DATA,
            platform: 'instagram',
            postId: IG_RESULT.id
        });

        console.log('IG Post Data: ', IG_POST)
        const IG_ALERT = await createAlert(IG_POST)

        await SocialMediaPost.updateOne(
            { _id: FB_POST._id },
            { $set: { alertId: FB_ALERT._id } }
        );

        await SocialMediaPost.updateOne(
            { _id: IG_POST._id },
            { $set: { alertId: IG_ALERT._id } }
        );

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
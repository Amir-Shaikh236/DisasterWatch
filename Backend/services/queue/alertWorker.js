import { Worker } from 'bullmq'
import { redisQueueConnection } from '../../config/queue.js';

const processAlert = async (job) => {
    const alertDate = job.data;

    try {
        console.log(`Successfully stored alert ${alertDate.title} ID in MongoDB`)

    } catch (error) {
        console.log(`Failed to store alert (Job ID) ${job.id}:  ${error}`)
        throw error;
    }
}


export const alertWorker = new Worker('disaster-alerts', processAlert, {
    connection: redisQueueConnection,
    concurrency: 5
});

alertWorker.on('completed', (job) => {
    console.log(`Job ${job.id} Completed Successfully`)
});

alertWorker.on('failed', (job, err) => {
    console.log(`Job ${job.id} Failed with Error; ${err.message}`)
})
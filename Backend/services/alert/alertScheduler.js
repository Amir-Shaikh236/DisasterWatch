import cron from 'node-cron'
import { fetchAlerts } from '../SocialMedia/Sachet/verifiedAlerts.js';

let isPipelineRunning = false;

const runScheduledTask = async () => {
    if (isPipelineRunning) return;

    isPipelineRunning = true;

    try {
        await fetchAlerts();

    } catch (error) {
        throw error;

    } finally {
        isPipelineRunning = false;

    }
};

export const startAlertCron = () => {
    console.log('initializing disaster alert cron job Every 5 Minutes...');
    cron.schedule('*/5 * * * *', runScheduledTask)
}


import { disasterAlertQueue } from "../../config/queue.js";

export const addAlertToQueue = async (formattedAlerts = []) => {
    if (!Array.isArray(formattedAlerts) || formattedAlerts.length === 0) return [];

    const bulkJobs = formattedAlerts.map(alert => ({
        name: 'process-disaster-alert',
        data: alert
    }));

    try {
        const jobs = await disasterAlertQueue.addBulk(bulkJobs);
        console.log(`Successfully queued ${jobs.length} disaster alert jobs`);
        return jobs;

    } catch (error) {
        throw error;
        return [];
    }
}


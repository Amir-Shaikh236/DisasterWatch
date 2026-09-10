import axios from 'axios'
import { FilterAlerts } from '../../alert/FilterAlerts.js';
import { addAlertToQueue } from '../../queue/alertQueue.js';

export const fetchAlerts = async () => {
    try {
        console.log(`[Pipeline] Fetching raw Alerts from SACHET API....`)
        const response = await axios.post('https://sachet.ndma.gov.in/cap_public_website/FetchAllAlertDetails', {}, {
            headers: { "Content-Type": 'application/json', 'Accept': 'application/json' }, timeout: 10000
        });

        const rawAlerts = response.data || [];
        // const alert = await rawAlerts.slice(0, 1)
        // console.log(alert);
        // const NormalizedAlerts = await FilterAlerts(rawAlerts);
        const NormalizedAlerts = (await FilterAlerts(rawAlerts)).slice(0, 1);
        // console.log('Alert after filter : ', NormalizedAlerts);

        if (NormalizedAlerts.length === 0) return [];
        const queueJobs = await addAlertToQueue(NormalizedAlerts)
        console.log(`Successfully pushed ${queueJobs.length} jobs to BullMQ.`)

        return queueJobs;

    } catch (error) {
        throw error;
        return [];

    }
};

// fetchAlerts();
import axios from 'axios'
import { FilterAlerts } from '../../alert/FilterAlerts.js';

export const fetchAlerts = async () => {
    try {
        const response = await axios.post('https://sachet.ndma.gov.in/cap_public_website/FetchAllAlertDetails', {}, {
            headers: { "Content-Type": 'application/json', 'Accept': 'application/json' }, timeout: 10000
        });

        const rawAlerts = response.data || [];
        const NormalizedAlerts = await FilterAlerts(rawAlerts);

        return NormalizedAlerts;

    } catch (error) {
        console.log(`Failed to fetch or process SACHET alerts: ${error.message}`)
        return [];
    }
};
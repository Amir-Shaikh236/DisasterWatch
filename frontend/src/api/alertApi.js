import { privateClient } from "./api";

export const getAlerts = async () => {
    const response = await privateClient.get('/api/alerts/getAlerts');
    return response.data;
}

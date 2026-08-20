import { publicClient } from "./api";

export const getAlerts = async () => {
    const response = await publicClient.get('/api/alerts/getAlerts');
    return response.data;

}

import { privateClient } from "./api";

export const getAlerts = async () => {
    const response = await privateClient.get('/api/alerts/getAlerts');
    return response.data;
}

export const deleteAlert = async (id) => {
    const response = await privateClient.delete(`/api/alerts/delete/${id}`);
    return response.data;
}

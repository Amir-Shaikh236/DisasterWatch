import { privateClient } from "./api"

export const getReports = async () => {
    const response = await privateClient.get('/api/reports/get');
    return response.data;
}

export const deleteReport = async (id) => {
    const response = await privateClient.delete(`/api/reports/delete/${id}`);
    return response.data;
}
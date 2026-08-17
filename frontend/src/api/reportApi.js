import { publicClient } from "./api"

export const getReports = async () => {
    const response = await publicClient.get('/api/reports/get');
    return response.data;
}
import { privateClient } from "./api";

export const getAuthUser = async () => {
    const response = await privateClient.get('/api/auth/me');
    return response.data;
};

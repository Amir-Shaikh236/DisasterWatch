import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const publicClient = axios.create({ baseURL: BASE_URL, withCredentials: true });

export const privateClient = axios.create({ baseURL: BASE_URL, withCredentials: true });

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};


export const setInterceptors = (getAccessToken, setAccessToken, clearSession) => {

    privateClient.interceptors.request.use((config) => {
        const token = getAccessToken();
        if (token && !config.headers["Authorization"]) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
        (error) => Promise.reject(error)
    );

    privateClient.interceptors.response.use((response) => response, async (error) => {
        const originalRequest = error.config;

        if (originalRequest.url?.includes('/api/auth/refresh')) {
            clearSession();
            return Promise.reject(error);

        }

        if (error.response?.status === 401 && !originalRequest._retry) {

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`
                    return privateClient(originalRequest)
                }).catch(err => Promise.reject(err));

            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
                const { accessToken } = response.data;

                setAccessToken(accessToken);
                processQueue(null, accessToken);

                isRefreshing = false;

                originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
                return privateClient(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                clearSession();
                return Promise.reject(refreshError)

            }

        }

        return Promise.reject(error);
    })
};

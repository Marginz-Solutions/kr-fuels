import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const data = error.response?.data;
        const err = new Error(data?.error || 'An error occurred');
        if(data?.details) {
            (err as any).details = data.details
        };
        return Promise.reject(err);
    }
)

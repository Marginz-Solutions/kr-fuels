import axios from "axios";
import { pingRevalidate } from "./revalidate";

// Methods that change data — a successful one should refresh the public site.
const MUTATING = new Set(["post", "put", "patch", "delete"]);

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => {
        if (MUTATING.has((response.config.method ?? "").toLowerCase())) pingRevalidate();
        return response.data;
    },
    (error) => {
        const data = error.response?.data;
        const err = new Error(data?.error || 'An error occurred');
        if(data?.details) {
            (err as any).details = data.details
        };
        return Promise.reject(err);
    }
)

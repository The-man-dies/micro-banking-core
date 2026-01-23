import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

// Create an axios instance
const axiosInstance = axios.create({
    baseURL: "http://localhost:3001/api/v1", // Assumes the server runs on port 3000
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor to include the token in headers
axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers["x-auth-token"] = token;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Define a generic api function
const api = async <T = any>(
    endpoint: string,
    options: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> => {
    try {
        const response = await axiosInstance({
            url: endpoint,
            ...options,
        });
        return response;
    } catch (error: any) {
        // Axios wraps the error, so we extract the relevant part
        const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
        // To keep the error handling consistent with the previous implementation,
        // we throw an error with just the message string.
        throw new Error(errorMessage);
    }
};

export default api;

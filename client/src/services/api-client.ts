import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import useAuthStore from "../features/auth/useAuthStore"; // Import the auth store

declare module "axios" {
  export interface AxiosRequestConfig {
    trackActivity?: boolean;
  }
}

// Create an axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken; // Get accessToken from store
    if (accessToken) {
      config.headers["x-auth-token"] = accessToken;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Activity tracking can be disabled for background/maintenance requests.
    if (response.config.trackActivity !== false) {
      useAuthStore.getState().updateActivity();
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // If 401, immediately logout via the auth store
      useAuthStore.getState().logout();
      return Promise.reject({
        message: "Session expired. Please log in again.",
      });
    }

    // Default error handling for other errors
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred.";
    const status = error.response?.status || 500;
    throw { message, status };
  },
);

// Unified API wrapper
export const api = async <T = any>(
  endpoint: string,
  options: AxiosRequestConfig = {},
): Promise<T> => {
  const response: AxiosResponse<T> = await axiosInstance({
    url: endpoint,
    ...options,
  });
  return response.data; // Return just the data
};

export default axiosInstance;

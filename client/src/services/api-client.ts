import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import useAuthStore from "../features/auth/useAuthStore"; // Import the auth store

// Create an axios instance
const axiosInstance = axios.create({
  baseURL: "http://localhost:3001/api/v1",
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
    // On any successful API call, update last activity timestamp
    useAuthStore.getState().updateActivity();
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
  try {
    const response: AxiosResponse<T> = await axiosInstance({
      url: endpoint,
      ...options,
    });
    return response.data; // Return just the data
  } catch (error: any) {
    // Already handled by interceptor for 401
    throw error;
  }
};

export default axiosInstance;

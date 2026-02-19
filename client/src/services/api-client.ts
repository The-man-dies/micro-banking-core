import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

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
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear tokens and redirect to login on unauthorized response
      localStorage.removeItem("accessToken");
      return Promise.reject({
        message: "Session expired. Please log in again.",
      });
    }
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
    // Extract meaningful message
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred.";

    // Optionally attach status code
    const status = error.response?.status || 500;

    // Throw a structured error object for UI handling
    throw { message, status };
  }
};

export default axiosInstance;

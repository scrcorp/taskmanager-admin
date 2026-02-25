import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./auth";
import { isMockMode, handleMockRequest } from "@/mocks/adapter";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Mock mode: intercept all requests and return mock data
if (isMockMode()) {
  api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const response = await handleMockRequest(config);
      return Promise.reject({ __MOCK_RESPONSE__: response });
    },
  );

  api.interceptors.response.use(
    undefined,
    (error: unknown) => {
      if (
        error &&
        typeof error === "object" &&
        "__MOCK_RESPONSE__" in (error as Record<string, unknown>)
      ) {
        return Promise.resolve(
          (error as { __MOCK_RESPONSE__: unknown }).__MOCK_RESPONSE__,
        );
      }
      return Promise.reject(error);
    },
  );
}

// Request: attach token
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: handle 401 with refresh (mutex prevents concurrent refresh attempts)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isLoginRequest = originalRequest?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest) {
      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        processQueue(error, null);
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/auth/refresh`,
          { refresh_token: refreshToken }
        );
        const newToken = res.data.access_token;
        setTokens(newToken, res.data.refresh_token);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

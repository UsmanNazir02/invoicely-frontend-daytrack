import axios from 'axios';
import type { ApiResponse } from '../types';

// Create axios instance with default config matching backend
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    withCredentials: true, // Required for HTTP-only cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Cookies are sent automatically with withCredentials: true
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Only redirect to login if not already on login page
            // and not during initial auth check
            const isLoginPage = window.location.pathname === '/login';
            const isAuthCheck = error.config?.url?.includes('/users/profile');

            if (!isLoginPage && !isAuthCheck) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Generic API methods
export const apiService = {
    get: async <T>(url: string, params?: object): Promise<ApiResponse<T>> => {
        const response = await api.get<ApiResponse<T>>(url, { params });
        return response.data;
    },

    post: async <T>(url: string, data?: object): Promise<ApiResponse<T>> => {
        const response = await api.post<ApiResponse<T>>(url, data);
        return response.data;
    },

    patch: async <T>(url: string, data?: object): Promise<ApiResponse<T>> => {
        const response = await api.patch<ApiResponse<T>>(url, data);
        return response.data;
    },

    put: async <T>(url: string, data?: object): Promise<ApiResponse<T>> => {
        const response = await api.put<ApiResponse<T>>(url, data);
        return response.data;
    },

    delete: async <T>(url: string): Promise<ApiResponse<T>> => {
        const response = await api.delete<ApiResponse<T>>(url);
        return response.data;
    },
};

export default api;

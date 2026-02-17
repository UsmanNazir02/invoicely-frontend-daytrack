import { apiService } from './api';
import type { LoginCredentials, AuthResponse, User } from '../types';

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await apiService.post<AuthResponse>('/auth/login', credentials);
        return response.data!;
    },

    logout: async (): Promise<void> => {
        await apiService.post('/auth/logout');
    },

    getProfile: async (): Promise<User> => {
        const response = await apiService.get<User>('/users/profile');
        return response.data!;
    },
};

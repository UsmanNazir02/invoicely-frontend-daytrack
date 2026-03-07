import { apiService } from './api';
import type { User, PaginatedResponse, FilterDto } from '../types';

export interface CreateSalesAgentDto {
    fullName: string;
    email: string;
    password?: string;
}

export interface UpdateSalesAgentDto {
    fullName?: string;
    email?: string;
    password?: string;
    isActive?: boolean;
}

export const userService = {
    getSalesAgents: async (params?: FilterDto & { roleFilter?: 'SALES' | 'ADMIN' | 'BOTH' }): Promise<PaginatedResponse<User>> => {
        const response = await apiService.get<any>('/users/sales', params);
        // The backend returns { data: [...], page, limit, totalCount } inside response.data
        return response.data as unknown as PaginatedResponse<User>;
    },

    createSalesAgent: async (data: CreateSalesAgentDto): Promise<User> => {
        const response = await apiService.post<User>('/users/sales', data);
        return response.data!;
    },

    updateSalesAgent: async (id: string, data: UpdateSalesAgentDto): Promise<User> => {
        const response = await apiService.patch<User>(`/users/sales/${id}`, data);
        return response.data!;
    },

    deleteSalesAgent: async (id: string): Promise<void> => {
        await apiService.delete(`/users/sales/${id}`);
    },
};

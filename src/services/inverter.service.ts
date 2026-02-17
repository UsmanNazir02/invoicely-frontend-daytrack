import { apiService } from './api';
import type {
    Inverter,
    CreateInverterDto,
    UpdateInverterDto,
    FilterDto,
    PaginatedResponse,
} from '../types';

export const inverterService = {
    getAll: async (filters?: FilterDto): Promise<PaginatedResponse<Inverter>> => {
        const response = await apiService.get<PaginatedResponse<Inverter>>('/inverters', filters);
        return response.data!;
    },

    getById: async (id: string): Promise<Inverter> => {
        const response = await apiService.get<Inverter>(`/inverters/${id}`);
        return response.data!;
    },

    create: async (data: CreateInverterDto): Promise<Inverter> => {
        const response = await apiService.post<Inverter>('/inverters', data);
        return response.data!;
    },

    update: async (id: string, data: UpdateInverterDto): Promise<Inverter> => {
        const response = await apiService.patch<Inverter>(`/inverters/${id}`, data);
        return response.data!;
    },

    delete: async (id: string): Promise<void> => {
        await apiService.delete(`/inverters/${id}`);
    },
};

import { apiService } from './api';
import type {
    Battery,
    CreateBatteryDto,
    UpdateBatteryDto,
    FilterDto,
    PaginatedResponse,
} from '../types';

export const batteryService = {
    getAll: async (filters?: FilterDto): Promise<PaginatedResponse<Battery>> => {
        const response = await apiService.get<PaginatedResponse<Battery>>('/batteries', filters);
        return response.data!;
    },

    getById: async (id: string): Promise<Battery> => {
        const response = await apiService.get<Battery>(`/batteries/${id}`);
        return response.data!;
    },

    create: async (data: CreateBatteryDto): Promise<Battery> => {
        const response = await apiService.post<Battery>('/batteries', data);
        return response.data!;
    },

    update: async (id: string, data: UpdateBatteryDto): Promise<Battery> => {
        const response = await apiService.patch<Battery>(`/batteries/${id}`, data);
        return response.data!;
    },

    delete: async (id: string): Promise<void> => {
        await apiService.delete(`/batteries/${id}`);
    },
};

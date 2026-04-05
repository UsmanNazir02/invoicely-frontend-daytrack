import { apiService } from './api';
import type {
    ElectricalItem,
    CreateElectricalItemDto,
    UpdateElectricalItemDto,
    FilterDto,
    PaginatedResponse,
} from '../types';

export const electricalItemService = {
    getAll: async (filters?: FilterDto): Promise<PaginatedResponse<ElectricalItem>> => {
        const response = await apiService.get<PaginatedResponse<ElectricalItem>>('/electrical-items', filters);
        return response.data!;
    },

    getById: async (id: string): Promise<ElectricalItem> => {
        const response = await apiService.get<ElectricalItem>(`/electrical-items/${id}`);
        return response.data!;
    },

    create: async (data: CreateElectricalItemDto): Promise<ElectricalItem> => {
        const response = await apiService.post<ElectricalItem>('/electrical-items', data);
        return response.data!;
    },

    update: async (id: string, data: UpdateElectricalItemDto): Promise<ElectricalItem> => {
        const response = await apiService.patch<ElectricalItem>(`/electrical-items/${id}`, data);
        return response.data!;
    },

    delete: async (id: string): Promise<void> => {
        await apiService.delete(`/electrical-items/${id}`);
    },
};

import { apiService } from './api';
import type {
    MiscItem,
    CreateMiscItemDto,
    UpdateMiscItemDto,
    FilterDto,
    PaginatedResponse,
} from '../types';

export const miscItemService = {
    getAll: async (filters?: FilterDto): Promise<PaginatedResponse<MiscItem>> => {
        const response = await apiService.get<PaginatedResponse<MiscItem>>('/misc-items', filters);
        return response.data!;
    },

    getById: async (id: string): Promise<MiscItem> => {
        const response = await apiService.get<MiscItem>(`/misc-items/${id}`);
        return response.data!;
    },

    create: async (data: CreateMiscItemDto): Promise<MiscItem> => {
        const response = await apiService.post<MiscItem>('/misc-items', data);
        return response.data!;
    },

    update: async (id: string, data: UpdateMiscItemDto): Promise<MiscItem> => {
        const response = await apiService.patch<MiscItem>(`/misc-items/${id}`, data);
        return response.data!;
    },

    delete: async (id: string): Promise<void> => {
        await apiService.delete(`/misc-items/${id}`);
    },
};

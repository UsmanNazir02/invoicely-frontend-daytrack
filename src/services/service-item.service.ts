import { apiService } from './api';
import type {
    ServiceItem,
    CreateServiceItemDto,
    UpdateServiceItemDto,
    FilterDto,
    PaginatedResponse,
} from '../types';

export const serviceItemService = {
    getAll: async (filters?: FilterDto): Promise<PaginatedResponse<ServiceItem>> => {
        const response = await apiService.get<PaginatedResponse<ServiceItem>>('/service-items', filters);
        return response.data!;
    },

    getById: async (id: string): Promise<ServiceItem> => {
        const response = await apiService.get<ServiceItem>(`/service-items/${id}`);
        return response.data!;
    },

    create: async (data: CreateServiceItemDto): Promise<ServiceItem> => {
        const response = await apiService.post<ServiceItem>('/service-items', data);
        return response.data!;
    },

    update: async (id: string, data: UpdateServiceItemDto): Promise<ServiceItem> => {
        const response = await apiService.patch<ServiceItem>(`/service-items/${id}`, data);
        return response.data!;
    },

    delete: async (id: string): Promise<void> => {
        await apiService.delete(`/service-items/${id}`);
    },
};

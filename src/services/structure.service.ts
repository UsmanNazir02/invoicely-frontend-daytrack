import { apiService } from './api';
import type {
    Structure,
    CreateStructureDto,
    UpdateStructureDto,
    FilterDto,
    PaginatedResponse,
} from '../types';

export const structureService = {
    getAll: async (filters?: FilterDto): Promise<PaginatedResponse<Structure>> => {
        const response = await apiService.get<PaginatedResponse<Structure>>('/structures', filters);
        return response.data!;
    },

    getById: async (id: string): Promise<Structure> => {
        const response = await apiService.get<Structure>(`/structures/${id}`);
        return response.data!;
    },

    create: async (data: CreateStructureDto): Promise<Structure> => {
        const response = await apiService.post<Structure>('/structures', data);
        return response.data!;
    },

    update: async (id: string, data: UpdateStructureDto): Promise<Structure> => {
        const response = await apiService.patch<Structure>(`/structures/${id}`, data);
        return response.data!;
    },

    delete: async (id: string): Promise<void> => {
        await apiService.delete(`/structures/${id}`);
    },
};

import { apiService } from './api';
import type {
    Brand,
    CreateBrandDto,
    UpdateBrandDto,
    BrandFilterDto,
    BrandType,
    PaginatedResponse,
} from '../types';

export const brandService = {
    getAll: async (filters?: BrandFilterDto): Promise<PaginatedResponse<Brand>> => {
        const response = await apiService.get<PaginatedResponse<Brand>>('/brands', filters);
        return response.data!;
    },

    getById: async (id: string): Promise<Brand> => {
        const response = await apiService.get<Brand>(`/brands/${id}`);
        return response.data!;
    },

    getByType: async (type: BrandType): Promise<Brand[]> => {
        const response = await apiService.get<Brand[]>(`/brands/type/${type}`);
        return response.data!;
    },

    create: async (data: CreateBrandDto): Promise<Brand> => {
        const response = await apiService.post<Brand>('/brands', data);
        return response.data!;
    },

    update: async (id: string, data: UpdateBrandDto): Promise<Brand> => {
        const response = await apiService.patch<Brand>(`/brands/${id}`, data);
        return response.data!;
    },

    delete: async (id: string): Promise<void> => {
        await apiService.delete(`/brands/${id}`);
    },
};

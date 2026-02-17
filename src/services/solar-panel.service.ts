import { apiService } from './api';
import type {
    SolarPanel,
    CreateSolarPanelDto,
    UpdateSolarPanelDto,
    FilterDto,
    PaginatedResponse,
} from '../types';

export const solarPanelService = {
    getAll: async (filters?: FilterDto): Promise<PaginatedResponse<SolarPanel>> => {
        const response = await apiService.get<PaginatedResponse<SolarPanel>>('/solar-panels', filters);
        return response.data!;
    },

    getById: async (id: string): Promise<SolarPanel> => {
        const response = await apiService.get<SolarPanel>(`/solar-panels/${id}`);
        return response.data!;
    },

    create: async (data: CreateSolarPanelDto): Promise<SolarPanel> => {
        const response = await apiService.post<SolarPanel>('/solar-panels', data);
        return response.data!;
    },

    update: async (id: string, data: UpdateSolarPanelDto): Promise<SolarPanel> => {
        const response = await apiService.patch<SolarPanel>(`/solar-panels/${id}`, data);
        return response.data!;
    },

    delete: async (id: string): Promise<void> => {
        await apiService.delete(`/solar-panels/${id}`);
    },
};

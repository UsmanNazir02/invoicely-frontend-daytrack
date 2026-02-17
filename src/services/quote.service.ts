import { apiService } from './api';
import type {
    Quote,
    CreateQuoteDto,
    UpdateQuoteDto,
    QuoteFilterDto,
    QuoteStatus,
    PaginatedResponse,
} from '../types';

export const quoteService = {
    getAll: async (filters?: QuoteFilterDto): Promise<PaginatedResponse<Quote>> => {
        const response = await apiService.get<PaginatedResponse<Quote>>('/quotes', filters);
        return response.data!;
    },

    getById: async (id: string): Promise<Quote> => {
        const response = await apiService.get<Quote>(`/quotes/${id}`);
        return response.data!;
    },

    create: async (data: CreateQuoteDto): Promise<Quote> => {
        const response = await apiService.post<Quote>('/quotes', data);
        return response.data!;
    },

    update: async (id: string, data: UpdateQuoteDto): Promise<Quote> => {
        const response = await apiService.patch<Quote>(`/quotes/${id}`, data);
        return response.data!;
    },

    updateStatus: async (id: string, status: QuoteStatus): Promise<Quote> => {
        const response = await apiService.patch<Quote>(`/quotes/${id}/status`, { status });
        return response.data!;
    },

    delete: async (id: string): Promise<void> => {
        await apiService.delete(`/quotes/${id}`);
    },
};

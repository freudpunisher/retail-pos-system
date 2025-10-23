import axiosInstance from '../lib/axiosInstance';
import { StockResponse, Stock } from '../types/stock.types';

export const StockService = {
    getStocks: async (): Promise<Stock[]> => {  // Changé en Stock[]
        try {
            const response = await axiosInstance.get('/api/stocks/');
            return response.data;
        } catch (error) {
            console.error('Error fetching stocks:', error);
            throw error;
        }
    },

    getStockByPointVente: async (pointVenteId: string): Promise<Stock[]> => {
        try {
            const response = await axiosInstance.get(`/api/stocks/?point_vente=${pointVenteId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching stock by point_vente:', error);
            throw error;
        }
    },

    getStockById: async (id: string): Promise<StockResponse> => {
        try {
          const response = await axiosInstance.get(`/api/stocks/${id}/`);
          return response.data;
        } catch (error) {
          console.error(`Error fetching stock with id ${id}:`, error);
          throw error;
        }
    },
};
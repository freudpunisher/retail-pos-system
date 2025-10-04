import axiosInstance from '../lib/axiosInstance';
import { StockResponse } from '../types/stock';

export const StockService = {
  getStocks: async (): Promise<StockResponse[]> => {
    try {
      const response = await axiosInstance.get('/api/stocks/');
      return response.data;
    } catch (error) {
      console.error('Error fetching stocks:', error);
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
  getStockBySaleOffPoint: async (pointVenteId: string): Promise<StockResponse> => {
        try {
            const response = await axiosInstance.get(`/api/stocks/?point_vente=${pointVenteId}`);
    return response.data;
        } catch (error) {
            console.error(`Error fetching stock with id ${id}:`, error);
            throw error;
        }
  },

};
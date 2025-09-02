import axiosInstance from '../lib/axiosInstance';
import { StockResponse, CreateStockRequest, UpdateStockRequest, StockAdjustmentRequest, Produit, PointVente } from '../types/stock';

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

  createStock: async (stockData: CreateStockRequest): Promise<StockResponse> => {
    try {
      const response = await axiosInstance.post('/api/stocks/', stockData);
      return response.data;
    } catch (error) {
      console.error('Error creating stock:', error);
      throw error;
    }
  },

  updateStock: async (id: string, stockData: UpdateStockRequest): Promise<StockResponse> => {
    try {
      const response = await axiosInstance.patch(`/api/stocks/${id}/`, stockData);
      return response.data;
    } catch (error) {
      console.error(`Error updating stock with id ${id}:`, error);
      throw error;
    }
  },

  deleteStock: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/stocks/${id}/`);
    } catch (error) {
      console.error(`Error deleting stock with id ${id}:`, error);
      throw error;
    }
  },

  adjustStock: async (id: string, adjustmentData: StockAdjustmentRequest): Promise<StockResponse> => {
    try {
      const response = await axiosInstance.post(`/api/stocks/${id}/adjust/`, adjustmentData);
      return response.data;
    } catch (error) {
      console.error(`Error adjusting stock with id ${id}:`, error);
      throw error;
    }
  },

  getProduits: async (): Promise<Produit[]> => {
    try {
      const response = await axiosInstance.get('/api/produits/');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  getPointsVente: async (): Promise<PointVente[]> => {
    try {
      const response = await axiosInstance.get('/api/points-vente/');
      return response.data;
    } catch (error) {
      console.error('Error fetching points of sale:', error);
      throw error;
    }
  },
};
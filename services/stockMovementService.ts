import axiosInstance from '../lib/axiosInstance';
import {
  StockMovementResponse,
  CreateStockMovementRequest,
  UpdateStockMovementRequest,
  Stock,
  Produit,
  PointVente,
  User,
} from '../types/StockMovement';

export const StockMovementService = {
  getStockMovements: async (): Promise<StockMovementResponse[]> => {
    try {
      const response = await axiosInstance.get('/api/mouvements-stock/');
      console.log("Fetched stock movements:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      throw error;
    }
  },

  getStockMovementById: async (id: string): Promise<StockMovementResponse> => {
    try {
      const response = await axiosInstance.get(`/api/mouvements-stock/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stock movement with id ${id}:`, error);
      throw error;
    }
  },

  createStockMovement: async (movementData: CreateStockMovementRequest): Promise<StockMovementResponse> => {
    try {
      const response = await axiosInstance.post('/api/mouvements-stock/', movementData);
      return response.data;
    } catch (error) {
      console.error('Error creating stock movement:', error);
      throw error;
    }
  },

  updateStockMovement: async (id: string, movementData: UpdateStockMovementRequest): Promise<StockMovementResponse> => {
    try {
      const response = await axiosInstance.patch(`/api/mouvements-stock/${id}/`, movementData);
      return response.data;
    } catch (error) {
      console.error(`Error updating stock movement with id ${id}:`, error);
      throw error;
    }
  },

  deleteStockMovement: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/mouvements-stock/${id}/`);
    } catch (error) {
      console.error(`Error deleting stock movement with id ${id}:`, error);
      throw error;
    }
  },

  getStocks: async (): Promise<Stock[]> => {
    try {
      const response = await axiosInstance.get('/api/stocks/');
      return response.data;
    } catch (error) {
      console.error('Error fetching stocks:', error);
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

  getUsers: async (): Promise<User[]> => {
    try {
      const response = await axiosInstance.get('/api/users/');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
};
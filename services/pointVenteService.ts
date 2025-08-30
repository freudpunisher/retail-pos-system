import axiosInstance from '../lib/axiosInstance';
import { PointVente, CreatePointVenteRequest, UpdatePointVenteRequest, PointVenteResponse } from '../types/pointVenteType';

export const pointVenteService = {
  getPointsVente: async (): Promise<PointVenteResponse[]> => {
    try {
      const response = await axiosInstance.get('/api/points-vente/');
      return response.data;
    } catch (error) {
      console.error('Error fetching points of sale:', error);
      throw error;
    }
  },

  getPointVenteById: async (id: string): Promise<PointVenteResponse> => {
    try {
      const response = await axiosInstance.get(`/api/points-vente/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching point of sale with id ${id}:`, error);
      throw error;
    }
  },

  createPointVente: async (pointVenteData: CreatePointVenteRequest): Promise<PointVenteResponse> => {
    try {
      const response = await axiosInstance.post('/api/points-vente/', pointVenteData);
      return response.data;
    } catch (error) {
      console.error('Error creating point of sale:', error);
      throw error;
    }
  },

  updatePointVente: async (id: string, pointVenteData: UpdatePointVenteRequest): Promise<PointVenteResponse> => {
    try {
      const response = await axiosInstance.patch(`/api/points-vente/${id}/`, pointVenteData);
      return response.data;
    } catch (error) {
      console.error(`Error updating point of sale with id ${id}:`, error);
      throw error;
    }
  },

  deletePointVente: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/points-vente/${id}/`);
    } catch (error) {
      console.error(`Error deleting point of sale with id ${id}:`, error);
      throw error;
    }
  },

  togglePointVenteActive: async (id: string, isActive: boolean): Promise<PointVenteResponse> => {
    try {
      const response = await axiosInstance.patch(`/api/points-vente/${id}/`, { is_active: isActive });
      return response.data;
    } catch (error) {
      console.error(`Error toggling active status for point of sale with id ${id}:`, error);
      throw error;
    }
  },
};
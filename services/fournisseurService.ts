import axiosInstance from '../lib/axiosInstance';
import { FournisseurResponse, CreateFournisseurRequest, UpdateFournisseurRequest } from '../types/fournisseur';

export const FournisseurService = {
  getFournisseurs: async (): Promise<FournisseurResponse[]> => {
    try {
      const response = await axiosInstance.get('/api/fournisseurs/');
      return response.data;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  },

  getFournisseurById: async (id: string): Promise<FournisseurResponse> => {
    try {
      const response = await axiosInstance.get(`/api/fournisseurs/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching supplier with id ${id}:`, error);
      throw error;
    }
  },

  createFournisseur: async (fournisseurData: CreateFournisseurRequest): Promise<FournisseurResponse> => {
    try {
      const response = await axiosInstance.post('/api/fournisseurs/', fournisseurData);
      return response.data;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  },

  updateFournisseur: async (id: string, fournisseurData: UpdateFournisseurRequest): Promise<FournisseurResponse> => {
    try {
      const response = await axiosInstance.patch(`/api/fournisseurs/${id}/`, fournisseurData);
      return response.data;
    } catch (error) {
      console.error(`Error updating supplier with id ${id}:`, error);
      throw error;
    }
  },

  deleteFournisseur: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/fournisseurs/${id}/`);
    } catch (error) {
      console.error(`Error deleting supplier with id ${id}:`, error);
      throw error;
    }
  },

  toggleFournisseurActive: async (id: string, isActive: boolean): Promise<FournisseurResponse> => {
    try {
      const response = await axiosInstance.patch(`/api/fournisseurs/${id}/`, { is_active: isActive });
      return response.data;
    } catch (error) {
      console.error(`Error toggling active status for supplier with id ${id}:`, error);
      throw error;
    }
  },
};
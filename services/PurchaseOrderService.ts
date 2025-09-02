import axiosInstance from '../lib/axiosInstance';
import {
  PurchaseOrderResponse,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  OrderLine,
  CreateOrderLineRequest,
  UpdateOrderLineRequest,
  Fournisseur,
  PointVente,
  User,
  Produit,
} from '../types/PurchaseOrder';

export const PurchaseOrderService = {
  getPurchaseOrders: async (): Promise<PurchaseOrderResponse[]> => {
    try {
      const response = await axiosInstance.get('/api/commandes-fournisseurs/');
      return response.data;
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      throw error;
    }
  },

  getPurchaseOrderById: async (id: string): Promise<PurchaseOrderResponse> => {
    try {
      const response = await axiosInstance.get(`/api/commandes-fournisseurs/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching purchase order with id ${id}:`, error);
      throw error;
    }
  },

  createPurchaseOrder: async (orderData: CreatePurchaseOrderRequest): Promise<PurchaseOrderResponse> => {
    try {
      const response = await axiosInstance.post('/api/commandes-fournisseurs/', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
  },

  updatePurchaseOrder: async (id: string, orderData: UpdatePurchaseOrderRequest): Promise<PurchaseOrderResponse> => {
    try {
      const response = await axiosInstance.patch(`/api/commandes-fournisseurs/${id}/`, orderData);
      return response.data;
    } catch (error) {
      console.error(`Error updating purchase order with id ${id}:`, error);
      throw error;
    }
  },

  deletePurchaseOrder: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/commandes-fournisseurs/${id}/`);
    } catch (error) {
      console.error(`Error deleting purchase order with id ${id}:`, error);
      throw error;
    }
  },

  getOrderLines: async (commandeId: string): Promise<OrderLine[]> => {
    try {
      const response = await axiosInstance.get(`/api/lignes-commandes-fournisseurs/?commande=${commandeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order lines for commande ${commandeId}:`, error);
      throw error;
    }
  },

  createOrderLine: async (lineData: CreateOrderLineRequest): Promise<OrderLine> => {
    try {
      const response = await axiosInstance.post('/api/lignes-commandes-fournisseurs/', lineData);
      return response.data;
    } catch (error) {
      console.error('Error creating order line:', error);
      throw error;
    }
  },

  updateOrderLine: async (id: string, lineData: UpdateOrderLineRequest): Promise<OrderLine> => {
    try {
      const response = await axiosInstance.patch(`/api/lignes-commandes-fournisseurs/${id}/`, lineData);
      return response.data;
    } catch (error) {
      console.error(`Error updating order line with id ${id}:`, error);
      throw error;
    }
  },

  deleteOrderLine: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/lignes-commandes-fournisseurs/${id}/`);
    } catch (error) {
      console.error(`Error deleting order line with id ${id}:`, error);
      throw error;
    }
  },

  getFournisseurs: async (): Promise<Fournisseur[]> => {
    try {
      const response = await axiosInstance.get('/api/fournisseurs/');
      return response.data;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
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

  getProduits: async (): Promise<Produit[]> => {
    try {
      const response = await axiosInstance.get('/api/produits/');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
};
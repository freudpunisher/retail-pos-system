import { useState, useCallback } from 'react';
import { PurchaseOrderService } from '../services/PurchaseOrderService';
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

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderResponse[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [pointsVente, setPointsVente] = useState<PointVente[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchaseOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PurchaseOrderService.getPurchaseOrders();
      setPurchaseOrders(data);
    } catch (err) {
      setError('Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // fetchOrderLines removed - using embedded lignes from purchase orders

  const fetchFournisseurs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PurchaseOrderService.getFournisseurs();
      setFournisseurs(data);
    } catch (err) {
      setError('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPointsVente = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PurchaseOrderService.getPointsVente();
      setPointsVente(data);
    } catch (err) {
      setError('Failed to fetch points of sale');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PurchaseOrderService.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProduits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PurchaseOrderService.getProduits();
      setProduits(data);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPurchaseOrder = useCallback(async (orderData: CreatePurchaseOrderRequest) => {
    setLoading(true);
    setError(null);
    try {
      const newOrder = await PurchaseOrderService.createPurchaseOrder(orderData);
      setPurchaseOrders((prev) => [...prev, newOrder]);
      return newOrder;
    } catch (err) {
      setError('Failed to create purchase order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePurchaseOrder = useCallback(async (id: string, orderData: UpdatePurchaseOrderRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updatedOrder = await PurchaseOrderService.updatePurchaseOrder(id, orderData);
      setPurchaseOrders((prev) =>
        prev.map((order) => (order.id === id ? { ...order, ...updatedOrder } : order))
      );
      return updatedOrder;
    } catch (err) {
      setError(`Failed to update purchase order with id ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePurchaseOrder = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await PurchaseOrderService.deletePurchaseOrder(id);
      setPurchaseOrders((prev) => prev.filter((order) => order.id !== id));
    } catch (err) {
      setError(`Failed to delete purchase order with id ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Individual order line operations will be handled through purchase order updates
  // since lignes are embedded in the purchase order

  return {
    purchaseOrders,
    fournisseurs,
    pointsVente,
    users,
    produits,
    loading,
    error,
    fetchPurchaseOrders,
    fetchFournisseurs,
    fetchPointsVente,
    fetchUsers,
    fetchProduits,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
  };
};
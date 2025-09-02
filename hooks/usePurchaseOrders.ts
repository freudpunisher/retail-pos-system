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
  const [orderLines, setOrderLines] = useState<{ [commandeId: string]: OrderLine[] }>({});
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

  const fetchOrderLines = useCallback(async (commandeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await PurchaseOrderService.getOrderLines(commandeId);
      setOrderLines((prev) => ({ ...prev, [commandeId]: data }));
    } catch (err) {
      setError(`Failed to fetch order lines for commande ${commandeId}`);
    } finally {
      setLoading(false);
    }
  }, []);

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
      setOrderLines((prev) => {
        const newLines = { ...prev };
        delete newLines[id];
        return newLines;
      });
    } catch (err) {
      setError(`Failed to delete purchase order with id ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrderLine = useCallback(async (lineData: CreateOrderLineRequest) => {
    setLoading(true);
    setError(null);
    try {
      const newLine = await PurchaseOrderService.createOrderLine(lineData);
      setOrderLines((prev) => ({
        ...prev,
        [lineData.commande]: [...(prev[lineData.commande] || []), newLine],
      }));
      return newLine;
    } catch (err) {
      setError('Failed to create order line');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderLine = useCallback(async (id: string, lineData: UpdateOrderLineRequest, commandeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedLine = await PurchaseOrderService.updateOrderLine(id, lineData);
      setOrderLines((prev) => ({
        ...prev,
        [commandeId]: prev[commandeId].map((line) => (line.id === id ? { ...line, ...updatedLine } : line)),
      }));
      return updatedLine;
    } catch (err) {
      setError(`Failed to update order line with id ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOrderLine = useCallback(async (id: string, commandeId: string) => {
    setLoading(true);
    setError(null);
    try {
      await PurchaseOrderService.deleteOrderLine(id);
      setOrderLines((prev) => ({
        ...prev,
        [commandeId]: prev[commandeId].filter((line) => line.id !== id),
      }));
    } catch (err) {
      setError(`Failed to delete order line with id ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    purchaseOrders,
    orderLines,
    fournisseurs,
    pointsVente,
    users,
    produits,
    loading,
    error,
    fetchPurchaseOrders,
    fetchOrderLines,
    fetchFournisseurs,
    fetchPointsVente,
    fetchUsers,
    fetchProduits,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    createOrderLine,
    updateOrderLine,
    deleteOrderLine,
  };
};
import { useState, useCallback } from 'react';
import { StockMovementService } from '../services/stockMovementService';
import {
  StockMovementResponse,
  CreateStockMovementRequest,
  UpdateStockMovementRequest,
  Stock,
  Produit,
  PointVente,
  User,
} from '../types/StockMovement';

export const useStockMovements = () => {
  const [movements, setMovements] = useState<StockMovementResponse[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [pointsVente, setPointsVente] = useState<PointVente[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStockMovements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await StockMovementService.getStockMovements();
      setMovements(data);
    } catch (err) {
      setError('Failed to fetch stock movements');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await StockMovementService.getStocks();
      setStocks(data);
    } catch (err) {
      setError('Failed to fetch stocks');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProduits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await StockMovementService.getProduits();
      setProduits(data);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPointsVente = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await StockMovementService.getPointsVente();
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
      const data = await StockMovementService.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  const createStockMovement = useCallback(async (movementData: CreateStockMovementRequest) => {
    setLoading(true);
    setError(null);
    try {
      const newMovement = await StockMovementService.createStockMovement(movementData);
      setMovements((prev) => [...prev, newMovement]);
      return newMovement;
    } catch (err) {
      setError('Failed to create stock movement');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStockMovement = useCallback(async (id: string, movementData: UpdateStockMovementRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updatedMovement = await StockMovementService.updateStockMovement(id, movementData);
      setMovements((prev) =>
        prev.map((movement) => (movement.id === id ? { ...movement, ...updatedMovement } : movement))
      );
      return updatedMovement;
    } catch (err) {
      setError(`Failed to update stock movement with id ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStockMovement = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await StockMovementService.deleteStockMovement(id);
      setMovements((prev) => prev.filter((movement) => movement.id !== id));
    } catch (err) {
      setError(`Failed to delete stock movement with id ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    movements,
    stocks,
    produits,
    pointsVente,
    users,
    loading,
    error,
    fetchStockMovements,
    fetchStocks,
    fetchProduits,
    fetchPointsVente,
    fetchUsers,
    createStockMovement,
    updateStockMovement,
    deleteStockMovement,
  };
};
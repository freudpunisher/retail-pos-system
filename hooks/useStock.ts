import { useState, useCallback } from 'react';
import { StockService } from '../services/stockService';
import { StockResponse, CreateStockRequest, UpdateStockRequest, StockAdjustmentRequest, Produit, PointVente } from '../types/stock';

export const useStocks = () => {
  const [stocks, setStocks] = useState<StockResponse[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [pointsVente, setPointsVente] = useState<PointVente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await StockService.getStocks();
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
      const data = await StockService.getProduits();
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
      const data = await StockService.getPointsVente();
      setPointsVente(data);
    } catch (err) {
      setError('Failed to fetch points of sale');
    } finally {
      setLoading(false);
    }
  }, []);

  const createStock = useCallback(async (stockData: CreateStockRequest) => {
    setLoading(true);
    setError(null);
    try {
      const newStock = await StockService.createStock(stockData);
      setStocks((prev) => [...prev, newStock]);
      return newStock;
    } catch (err) {
      setError('Failed to create stock');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStock = useCallback(async (id: string, stockData: UpdateStockRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updatedStock = await StockService.updateStock(id, stockData);
      setStocks((prev) =>
        prev.map((stock) => (stock.id === id ? { ...stock, ...updatedStock } : stock))
      );
      return updatedStock;
    } catch (err) {
      setError(`Failed to update stock with id ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStock = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await StockService.deleteStock(id);
      setStocks((prev) => prev.filter((stock) => stock.id !== id));
    } catch (err) {
      setError(`Failed to delete stock with id ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const adjustStock = useCallback(async (id: string, adjustmentData: StockAdjustmentRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updatedStock = await StockService.adjustStock(id, adjustmentData);
      setStocks((prev) =>
        prev.map((stock) => (stock.id === id ? { ...stock, ...updatedStock } : stock))
      );
      return updatedStock;
    } catch (err) {
      setError(`Failed to adjust stock with id ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stocks,
    produits,
    pointsVente,
    loading,
    error,
    fetchStocks,
    fetchProduits,
    fetchPointsVente,
    createStock,
    updateStock,
    deleteStock,
    adjustStock,
  };
};
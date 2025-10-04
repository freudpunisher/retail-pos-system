import { useState, useCallback } from 'react';
import { StockService } from '../services/stockService';
import { StockResponse, CreateStockRequest, UpdateStockRequest, StockAdjustmentRequest, Produit, PointVente } from '../types/stock';

export const useStocks = () => {
  const [stocks, setStocks] = useState<StockResponse[]>([]);
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
  return {
    stocks,
    loading,
    error,
    fetchStocks,
  };
};
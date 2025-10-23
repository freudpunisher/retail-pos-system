import { useState, useCallback } from 'react';
import { StockService } from '../services/stockService';
import { Stock } from '../types/stock.types';
export const useStocks = () => {
    const [stocks, setStocks] = useState<Stock[]>([]);  // Changé en Stock[]
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
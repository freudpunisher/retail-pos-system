import { useQuery } from '@tanstack/react-query';
import { posStockService } from '@/services/posStockService';
import { 
  Stock, 
  StockFilters 
} from '@/types/stock.types';

// Query Keys
export const posStockQueryKeys = {
  all: ['pos-stocks'] as const,
  lists: () => [...posStockQueryKeys.all, 'list'] as const,
  list: (filters?: Partial<StockFilters>) => [...posStockQueryKeys.lists(), filters] as const,
  details: () => [...posStockQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...posStockQueryKeys.details(), id] as const,
  byPointVente: (pointVenteId: string) => [...posStockQueryKeys.all, 'point-vente', pointVenteId] as const,
  available: (pointVenteId: string) => [...posStockQueryKeys.all, 'available', pointVenteId] as const,
  lowStock: (pointVenteId: string, threshold: number) => [...posStockQueryKeys.all, 'low-stock', pointVenteId, threshold] as const,
  outOfStock: (pointVenteId: string) => [...posStockQueryKeys.all, 'out-of-stock', pointVenteId] as const,
  search: (searchTerm: string, pointVenteId?: string) => [...posStockQueryKeys.all, 'search', searchTerm, pointVenteId] as const,
};

// Hook to get all stocks with optional filters
export const usePOSStocks = (filters?: StockFilters) => {
  return useQuery({
    queryKey: posStockQueryKeys.list(filters || {}),
    queryFn: () => posStockService.getStocks(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to get stocks for a specific point de vente
export const useStocksByPointVente = (pointVenteId: string, filters?: Omit<StockFilters, 'point_vente'>) => {
  const user= localStorage.getItem("user");
const userId = user ? JSON.parse(user).point_vente.id : "" ;
  return useQuery({
    queryKey: posStockQueryKeys.byPointVente(userId),
    queryFn: () => posStockService.getStocksByPointVente(userId, filters),
    enabled: !!pointVenteId,
    staleTime: 1000 * 60 * 3, // 3 minutes for more frequent updates in POS
  });
};

// Hook to get single stock by ID
export const usePOSStock = (id: string) => {
  return useQuery({
    queryKey: posStockQueryKeys.detail(id),
    queryFn: () => posStockService.getStockById(id),
    enabled: !!id,
  });
};

// Hook to get stock for a specific product at a point de vente
export const useStockByProduct = (pointVenteId: string, produitId: string) => {
  return useQuery({
    queryKey: [...posStockQueryKeys.all, 'product', pointVenteId, produitId],
    queryFn: () => posStockService.getStockByProduct(pointVenteId, produitId),
    enabled: !!pointVenteId && !!produitId,
  });
};

// Hook to get available stocks (with quantity > 0)
export const useAvailableStocks = (pointVenteId: string, filters?: Omit<StockFilters, 'point_vente' | 'quantite_min'>) => {
  return useQuery({
    queryKey: posStockQueryKeys.available(pointVenteId),
    queryFn: () => posStockService.getAvailableStocks(pointVenteId, filters),
    enabled: !!pointVenteId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
};

// Hook to search stocks by product name
export const useSearchStocks = (searchTerm: string, pointVenteId?: string) => {
  return useQuery({
    queryKey: posStockQueryKeys.search(searchTerm, pointVenteId),
    queryFn: () => posStockService.searchStocks(searchTerm, pointVenteId),
    enabled: searchTerm.length > 2, // Only search with 3+ characters
    staleTime: 1000 * 60 * 2, // 2 minutes for search results
  });
};

// Hook to get low stock items
export const useLowStocks = (pointVenteId: string, threshold: number = 5) => {
  return useQuery({
    queryKey: posStockQueryKeys.lowStock(pointVenteId, threshold),
    queryFn: () => posStockService.getLowStocks(pointVenteId, threshold),
    enabled: !!pointVenteId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to get out of stock items
export const useOutOfStocks = (pointVenteId: string) => {
  return useQuery({
    queryKey: posStockQueryKeys.outOfStock(pointVenteId),
    queryFn: () => posStockService.getOutOfStocks(pointVenteId),
    enabled: !!pointVenteId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
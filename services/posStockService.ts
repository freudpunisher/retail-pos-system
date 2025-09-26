import axiosInstance from '@/lib/axiosInstance';
import { 
  Stock, 
  StockFilters, 
  StockResponse 
} from '@/types/stock.types';

const BASE_URL = 'http://127.0.0.1:8000/api/stocks';

export const posStockService = {
  // Get all stocks with optional filters
  async getStocks(filters?: StockFilters): Promise<Stock[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `${BASE_URL}/?${queryString}` : `${BASE_URL}/`;
    
    const response = await axiosInstance.get<Stock[]>(url);
    return response.data;
  },

  // Get paginated stocks with optional filters
  async getStocksPaginated(filters?: StockFilters): Promise<StockResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `${BASE_URL}/?${queryString}` : `${BASE_URL}/`;
    
    const response = await axiosInstance.get<StockResponse>(url);
    return response.data;
  },

  // Get stocks for a specific point de vente
  async getStocksByPointVente(pointVenteId: string, filters?: Omit<StockFilters, 'point_vente'>): Promise<Stock[]> {
    return this.getStocks({ ...filters, point_vente: pointVenteId });
  },

  // Get stock for a specific product at a point de vente
  async getStockByProduct(pointVenteId: string, produitId: string): Promise<Stock | null> {
    const stocks = await this.getStocks({ 
      point_vente: pointVenteId, 
      produit: produitId 
    });
    return stocks.length > 0 ? stocks[0] : null;
  },

  // Get single stock by ID
  async getStockById(id: string): Promise<Stock> {
    const response = await axiosInstance.get<Stock>(`${BASE_URL}/${id}/`);
    return response.data;
  },

  // Search stocks by product name
  async searchStocks(searchTerm: string, pointVenteId?: string): Promise<Stock[]> {
    const filters: StockFilters = { search: searchTerm };
    if (pointVenteId) {
      filters.point_vente = pointVenteId;
    }
    return this.getStocks(filters);
  },

  // Get available stocks (with quantity > 0)
  async getAvailableStocks(pointVenteId: string, filters?: Omit<StockFilters, 'point_vente' | 'quantite_min'>): Promise<Stock[]> {
    return this.getStocks({ 
      ...filters, 
      point_vente: pointVenteId, 
      quantite_min: 1 
    });
  },

  // Get low stock items (quantity below threshold)
  async getLowStocks(pointVenteId: string, threshold: number = 5): Promise<Stock[]> {
    const allStocks = await this.getStocksByPointVente(pointVenteId);
    return allStocks.filter(stock => 
      Number(stock.quantite_disponible) <= threshold && 
      Number(stock.quantite_disponible) > 0
    );
  },

  // Get out of stock items
  async getOutOfStocks(pointVenteId: string): Promise<Stock[]> {
    const allStocks = await this.getStocksByPointVente(pointVenteId);
    return allStocks.filter(stock => 
      Number(stock.quantite_disponible) <= 0
    );
  }
};
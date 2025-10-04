import axiosInstance from '@/lib/axiosInstance';
import { 
  Vente, 
  CreateVentePayload, 
  UpdateVentePayload, 
  VenteFilters, 
  VenteResponse 
} from '@/types/vente.types';

const BASE_URL = 'http://127.0.0.1:8000/api/ventes';

export const venteService = {
  // Get all ventes with optional filters
  async getVentes(filters?: VenteFilters): Promise<VenteResponse> {
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
    
    const response = await axiosInstance.get<VenteResponse>(url);
    return response.data;
  },

  // Get single vente by ID
  async getVenteById(id: string): Promise<Vente> {
    const response = await axiosInstance.get<Vente>(`${BASE_URL}/${id}/`);
    return response.data;
  },

  // Create new vente
  async createVente(venteData: CreateVentePayload): Promise<Vente> {
    const response = await axiosInstance.post<Vente>(`${BASE_URL}/`, venteData);
    return response.data;
  },

  // Update existing vente
  async updateVente(id: string, venteData: Partial<UpdateVentePayload>): Promise<Vente> {
    const response = await axiosInstance.patch<Vente>(`${BASE_URL}/${id}/`, venteData);
    return response.data;
  },

  // Delete vente
  async deleteVente(id: string): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}/`);
  },

  // Confirm vente (change status to confirmed)
  async confirmVente(id: string): Promise<Vente> {
    const response = await axiosInstance.patch<Vente>(`${BASE_URL}/${id}/`, {
      status: 'confirmed'
    });
    return response.data;
  },

  // Cancel vente
  async cancelVente(id: string): Promise<Vente> {
    const response = await axiosInstance.patch<Vente>(`${BASE_URL}/${id}/`, {
      status: 'cancelled'
    });
    return response.data;
  },

  // Mark payment as paid
  async markAsPaid(id: string): Promise<Vente> {
    const response = await axiosInstance.patch<Vente>(`${BASE_URL}/${id}/`, {
      payment_status: 'paid'
    });
    return response.data;
  },

  // Get ventes by status
  async getVentesByStatus(status: string, filters?: Omit<VenteFilters, 'status'>): Promise<VenteResponse> {
    return this.getVentes({ ...filters, status });
  },

  // Get ventes by client
  async getVentesByClient(clientId: string, filters?: Omit<VenteFilters, 'client'>): Promise<VenteResponse> {
    return this.getVentes({ ...filters, client: clientId });
  },

  // Get ventes by date range
  async getVentesByDateRange(dateDebut: string, dateFin: string, filters?: Omit<VenteFilters, 'date_debut' | 'date_fin'>): Promise<VenteResponse> {
    return this.getVentes({ ...filters, date_debut: dateDebut, date_fin: dateFin });
  }
};
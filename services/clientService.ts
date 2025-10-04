import axiosInstance from '@/lib/axiosInstance';
import { 
  Client, 
  CreateClientPayload, 
  UpdateClientPayload, 
  ClientFilters, 
  ClientResponse 
} from '@/types/client.types';

const BASE_URL = 'http://127.0.0.1:8000/api/clients';

export const clientService = {
  // Get all clients with optional filters
  async getClients(filters?: ClientFilters): Promise<Client[]> {
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
    
    const response = await axiosInstance.get<Client[]>(url);
    return response.data;
  },

  // Get paginated clients with optional filters
  async getClientsPaginated(filters?: ClientFilters): Promise<ClientResponse> {
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
    
    const response = await axiosInstance.get<ClientResponse>(url);
    return response.data;
  },

  // Get single client by ID
  async getClientById(id: string): Promise<Client> {
    const response = await axiosInstance.get<Client>(`${BASE_URL}/${id}/`);
    return response.data;
  },

  // Create new client
  async createClient(clientData: CreateClientPayload): Promise<Client> {
    const response = await axiosInstance.post<Client>(`${BASE_URL}/`, clientData);
    return response.data;
  },

  // Update existing client
  async updateClient(id: string, clientData: Partial<UpdateClientPayload>): Promise<Client> {
    const response = await axiosInstance.patch<Client>(`${BASE_URL}/${id}/`, clientData);
    return response.data;
  },

  // Delete client
  async deleteClient(id: string): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}/`);
  },

  // Search clients by name or email
  async searchClients(searchTerm: string): Promise<Client[]> {
    return this.getClients({ search: searchTerm });
  },

  // Get active clients only
  async getActiveClients(filters?: Omit<ClientFilters, 'is_active'>): Promise<Client[]> {
    return this.getClients({ ...filters, is_active: true });
  },

  // Get clients by type
  async getClientsByType(type: 'particulier' | 'entreprise' | 'professionnel', filters?: Omit<ClientFilters, 'type_client'>): Promise<Client[]> {
    return this.getClients({ ...filters, type_client: type });
  },

  // Toggle client active status
  async toggleClientStatus(id: string): Promise<Client> {
    // First get the current client to know the current status
    const currentClient = await this.getClientById(id);
    const response = await axiosInstance.patch<Client>(`${BASE_URL}/${id}/`, {
      is_active: !currentClient.is_active
    });
    return response.data;
  },

  // Activate client
  async activateClient(id: string): Promise<Client> {
    const response = await axiosInstance.patch<Client>(`${BASE_URL}/${id}/`, {
      is_active: true
    });
    return response.data;
  },

  // Deactivate client
  async deactivateClient(id: string): Promise<Client> {
    const response = await axiosInstance.patch<Client>(`${BASE_URL}/${id}/`, {
      is_active: false
    });
    return response.data;
  }
};
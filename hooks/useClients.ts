import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '@/services/clientService';
import { 
  Client, 
  CreateClientPayload, 
  UpdateClientPayload, 
  ClientFilters 
} from '@/types/client.types';
import { toast } from 'sonner';

// Query Keys
export const clientQueryKeys = {
  all: ['clients'] as const,
  lists: () => [...clientQueryKeys.all, 'list'] as const,
  list: (filters: ClientFilters) => [...clientQueryKeys.lists(), filters] as const,
  details: () => [...clientQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientQueryKeys.details(), id] as const,
  active: () => [...clientQueryKeys.all, 'active'] as const,
  byType: (type: string) => [...clientQueryKeys.all, 'type', type] as const,
  search: (searchTerm: string) => [...clientQueryKeys.all, 'search', searchTerm] as const,
};

// Hook to get all clients with optional filters
export const useClients = (filters?: ClientFilters) => {
  return useQuery({
    queryKey: clientQueryKeys.list(filters || {}),
    queryFn: () => clientService.getClients(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to get paginated clients with optional filters
export const useClientsPaginated = (filters?: ClientFilters) => {
  return useQuery({
    queryKey: [...clientQueryKeys.list(filters || {}), 'paginated'],
    queryFn: () => clientService.getClientsPaginated(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to get single client by ID
export const useClient = (id: string) => {
  return useQuery({
    queryKey: clientQueryKeys.detail(id),
    queryFn: () => clientService.getClientById(id),
    enabled: !!id,
  });
};

// Hook to get active clients only
export const useActiveClients = (filters?: Omit<ClientFilters, 'is_active'>) => {
  return useQuery({
    queryKey: clientQueryKeys.active(),
    queryFn: () => clientService.getActiveClients(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to get clients by type
export const useClientsByType = (type: 'particulier' | 'entreprise' | 'professionnel', filters?: Omit<ClientFilters, 'type_client'>) => {
  return useQuery({
    queryKey: clientQueryKeys.byType(type),
    queryFn: () => clientService.getClientsByType(type, filters),
    enabled: !!type,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to search clients
export const useSearchClients = (searchTerm: string) => {
  return useQuery({
    queryKey: clientQueryKeys.search(searchTerm),
    queryFn: () => clientService.searchClients(searchTerm),
    enabled: searchTerm.length > 2, // Only search with 3+ characters
    staleTime: 1000 * 60 * 2, // 2 minutes for search results
  });
};

// Hook to create a new client
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (clientData: CreateClientPayload) => clientService.createClient(clientData),
    onSuccess: (newClient: Client) => {
      // Invalidate and refetch clients list
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.active() });
      toast.success('Client créé avec succès');
    },
    onError: (error: any) => {
      console.error('Error creating client:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création du client');
    },
  });
};

// Hook to update a client
export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateClientPayload> }) => 
      clientService.updateClient(id, data),
    onSuccess: (updatedClient: Client) => {
      // Update the cache with the new client data
      queryClient.setQueryData(
        clientQueryKeys.detail(updatedClient.id),
        updatedClient
      );
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.active() });
      toast.success('Client mis à jour avec succès');
    },
    onError: (error: any) => {
      console.error('Error updating client:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du client');
    },
  });
};

// Hook to delete a client
export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => clientService.deleteClient(id),
    onSuccess: () => {
      // Invalidate and refetch clients list
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.active() });
      toast.success('Client supprimé avec succès');
    },
    onError: (error: any) => {
      console.error('Error deleting client:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression du client');
    },
  });
};

// Hook to toggle client active status
export const useToggleClientStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => clientService.toggleClientStatus(id),
    onSuccess: (updatedClient: Client) => {
      // Update the cache
      queryClient.setQueryData(
        clientQueryKeys.detail(updatedClient.id),
        updatedClient
      );
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.active() });
      toast.success(`Client ${updatedClient.is_active ? 'activé' : 'désactivé'} avec succès`);
    },
    onError: (error: any) => {
      console.error('Error toggling client status:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du changement de statut du client');
    },
  });
};

// Hook to activate client
export const useActivateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => clientService.activateClient(id),
    onSuccess: (activatedClient: Client) => {
      // Update the cache
      queryClient.setQueryData(
        clientQueryKeys.detail(activatedClient.id),
        activatedClient
      );
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.active() });
      toast.success('Client activé avec succès');
    },
    onError: (error: any) => {
      console.error('Error activating client:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'activation du client');
    },
  });
};

// Hook to deactivate client
export const useDeactivateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => clientService.deactivateClient(id),
    onSuccess: (deactivatedClient: Client) => {
      // Update the cache
      queryClient.setQueryData(
        clientQueryKeys.detail(deactivatedClient.id),
        deactivatedClient
      );
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.active() });
      toast.success('Client désactivé avec succès');
    },
    onError: (error: any) => {
      console.error('Error deactivating client:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la désactivation du client');
    },
  });
};
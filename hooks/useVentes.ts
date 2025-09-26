import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { venteService } from '@/services/venteService';
import { 
  Vente, 
  CreateVentePayload, 
  UpdateVentePayload, 
  VenteFilters 
} from '@/types/vente.types';
import { toast } from 'sonner';

// Query Keys
export const venteQueryKeys = {
  all: ['ventes'] as const,
  lists: () => [...venteQueryKeys.all, 'list'] as const,
  list: (filters: VenteFilters) => [...venteQueryKeys.lists(), filters] as const,
  details: () => [...venteQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...venteQueryKeys.details(), id] as const,
  byStatus: (status: string) => [...venteQueryKeys.all, 'status', status] as const,
  byClient: (clientId: string) => [...venteQueryKeys.all, 'client', clientId] as const,
};

// Hook to get all ventes with optional filters
export const useVentes = (filters?: VenteFilters) => {
  return useQuery({
    queryKey: venteQueryKeys.list(filters || {}),
    queryFn: () => venteService.getVentes(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to get single vente by ID
export const useVente = (id: string) => {
  return useQuery({
    queryKey: venteQueryKeys.detail(id),
    queryFn: () => venteService.getVenteById(id),
    enabled: !!id,
  });
};

// Hook to get ventes by status
export const useVentesByStatus = (status: string, filters?: Omit<VenteFilters, 'status'>) => {
  return useQuery({
    queryKey: venteQueryKeys.byStatus(status),
    queryFn: () => venteService.getVentesByStatus(status, filters),
    enabled: !!status,
  });
};

// Hook to get ventes by client
export const useVentesByClient = (clientId: string, filters?: Omit<VenteFilters, 'client'>) => {
  return useQuery({
    queryKey: venteQueryKeys.byClient(clientId),
    queryFn: () => venteService.getVentesByClient(clientId, filters),
    enabled: !!clientId,
  });
};

// Hook to create a new vente
export const useCreateVente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (venteData: CreateVentePayload) => venteService.createVente(venteData),
    onSuccess: (newVente: Vente) => {
      // Invalidate and refetch ventes list
      queryClient.invalidateQueries({ queryKey: venteQueryKeys.lists() });
      toast.success('Vente créée avec succès');
    },
    onError: (error: any) => {
      console.error('Error creating vente:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création de la vente');
    },
  });
};

// Hook to update a vente
export const useUpdateVente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateVentePayload> }) => 
      venteService.updateVente(id, data),
    onSuccess: (updatedVente: Vente) => {
      // Update the cache with the new vente data
      queryClient.setQueryData(
        venteQueryKeys.detail(updatedVente.id!),
        updatedVente
      );
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: venteQueryKeys.lists() });
      toast.success('Vente mise à jour avec succès');
    },
    onError: (error: any) => {
      console.error('Error updating vente:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour de la vente');
    },
  });
};

// Hook to delete a vente
export const useDeleteVente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => venteService.deleteVente(id),
    onSuccess: () => {
      // Invalidate and refetch ventes list
      queryClient.invalidateQueries({ queryKey: venteQueryKeys.lists() });
      toast.success('Vente supprimée avec succès');
    },
    onError: (error: any) => {
      console.error('Error deleting vente:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression de la vente');
    },
  });
};

// Hook to confirm a vente
export const useConfirmVente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => venteService.confirmVente(id),
    onSuccess: (confirmedVente: Vente) => {
      // Update the cache
      queryClient.setQueryData(
        venteQueryKeys.detail(confirmedVente.id!),
        confirmedVente
      );
      queryClient.invalidateQueries({ queryKey: venteQueryKeys.lists() });
      toast.success('Vente confirmée avec succès');
    },
    onError: (error: any) => {
      console.error('Error confirming vente:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la confirmation de la vente');
    },
  });
};

// Hook to cancel a vente
export const useCancelVente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => venteService.cancelVente(id),
    onSuccess: (cancelledVente: Vente) => {
      // Update the cache
      queryClient.setQueryData(
        venteQueryKeys.detail(cancelledVente.id!),
        cancelledVente
      );
      queryClient.invalidateQueries({ queryKey: venteQueryKeys.lists() });
      toast.success('Vente annulée avec succès');
    },
    onError: (error: any) => {
      console.error('Error cancelling vente:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation de la vente');
    },
  });
};

// Hook to mark a vente as paid
export const useMarkVenteAsPaid = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => venteService.markAsPaid(id),
    onSuccess: (paidVente: Vente) => {
      // Update the cache
      queryClient.setQueryData(
        venteQueryKeys.detail(paidVente.id!),
        paidVente
      );
      queryClient.invalidateQueries({ queryKey: venteQueryKeys.lists() });
      toast.success('Paiement confirmé avec succès');
    },
    onError: (error: any) => {
      console.error('Error marking vente as paid:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la confirmation du paiement');
    },
  });
};
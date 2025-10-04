import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { allVentesService, UpdateVentePayload } from '@/services/allVentesService';
import { Vente } from '@/types/vente.types';
import { toast } from 'sonner';

// Hook to fetch all sales
export const useAllVentes = () => {
  return useQuery({
    queryKey: ['all-ventes'],
    queryFn: allVentesService.getAllVentes,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to update a sale
export const useUpdateVente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVentePayload }) => 
      allVentesService.updateVente(id, data),
    onSuccess: (data: Vente) => {
      // Invalidate and refetch sales data
      queryClient.invalidateQueries({ queryKey: ['all-ventes'] });
      queryClient.invalidateQueries({ queryKey: ['ventes'] }); // Also invalidate regular ventes if exists
      toast.success(`Vente ${data.numero_facture || data.id} mise à jour avec succès`);
    },
    onError: (error: any) => {
      console.error('Error updating vente:', error);
      toast.error('Erreur lors de la mise à jour de la vente');
    },
  });
};

// Hook specifically for updating sale status (returns, cancellations, etc.)
export const useUpdateVenteStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, originalVente }: { id: string; status: 'draft' | 'completed' | 'cancelled' | 'returned'; originalVente: Vente }) => 
      allVentesService.updateVenteStatus(id, status, originalVente),
    onSuccess: (data: Vente, variables) => {
      // Invalidate and refetch sales data
      queryClient.invalidateQueries({ queryKey: ['all-ventes'] });
      queryClient.invalidateQueries({ queryKey: ['ventes'] }); // Also invalidate regular ventes if exists
      
      const statusLabels = {
        draft: 'brouillon',
        completed: 'terminée',
        cancelled: 'annulée',
        returned: 'retournée'
      };
      
      toast.success(`Vente ${data.numero_facture || data.id} marquée comme ${statusLabels[variables.status]}`);
    },
    onError: (error: any) => {
      console.error('Error updating vente status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    },
  });
};

// Hook for removing items from sale
export const useRemoveItemFromSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ saleId, itemId, originalVente }: { saleId: string; itemId: string; originalVente: Vente }) => 
      allVentesService.removeItemFromSale(saleId, itemId, originalVente),
    onSuccess: (data: Vente) => {
      // Invalidate and refetch sales data
      queryClient.invalidateQueries({ queryKey: ['all-ventes'] });
      queryClient.invalidateQueries({ queryKey: ['ventes'] });
      toast.success('Article retiré de la vente avec succès');
    },
    onError: (error: any) => {
      console.error('Error removing item from sale:', error);
      toast.error('Erreur lors de la suppression de l\'article');
    },
  });
};

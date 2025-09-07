import { useQuery, useMutation, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import {
    fetchCommandesFournisseurs,
    fetchCommandeFournisseurLignes,
    fetchFournisseurs,
    fetchPointsVente,
    fetchUsers,
    fetchProduits,
    createCommandeFournisseur,
    updateCommandeFournisseur,
    deleteCommandeFournisseur,
    createCommandeFournisseurLigne,
    updateCommandeFournisseurLigne,
    deleteCommandeFournisseurLigne,
} from '@/services/commandesFournisseursService';
import {
    CommandeFournisseur,
    CreateCommandeFournisseur,
    UpdateCommandeFournisseur,
    CommandeFournisseurLigne,
    CreateCommandeFournisseurLigne,
    UpdateCommandeFournisseurLigne,
    Fournisseur,
    PointVente,
    User,
    Produit,
} from '@/types/commandesFournisseurs';
import { useQueryClient } from '@tanstack/react-query';

export const useCommandesFournisseurs = (): UseQueryResult<
    CommandeFournisseur[],
    Error
> => {
    return useQuery<CommandeFournisseur[], Error>({
        queryKey: ['commandesFournisseurs'],
        queryFn: fetchCommandesFournisseurs,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useCommandeFournisseurLignes = (
    commandeId: string | null
): UseQueryResult<CommandeFournisseurLigne[], Error> => {
    return useQuery({
        queryKey: ['commandeFournisseurLignes', commandeId],
        queryFn: () => {
            if (!commandeId) return Promise.resolve([]);
            return fetchCommandeFournisseurLignes(commandeId);
        },
        enabled: !!commandeId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useFournisseurs = (): UseQueryResult<Fournisseur[], Error> => {
    return useQuery({
        queryKey: ['fournisseurs'],
        queryFn: fetchFournisseurs,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const usePointsVente = (): UseQueryResult<PointVente[], Error> => {
    return useQuery({
        queryKey: ['pointsVente'],
        queryFn: fetchPointsVente,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useUsers = (): UseQueryResult<User[], Error> => {
    return useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useProduits = (): UseQueryResult<Produit[], Error> => {
    return useQuery({
        queryKey: ['produits'],
        queryFn: fetchProduits,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useCreateCommandeFournisseur = (): UseMutationResult<
    CommandeFournisseur,
    Error,
    CreateCommandeFournisseur
> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCommandeFournisseur,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['commandesFournisseurs'] });
        },
    });
};

export const useUpdateCommandeFournisseur = (): UseMutationResult<
    CommandeFournisseur,
    Error,
    { id: string; data: UpdateCommandeFournisseur }
> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => {
            return updateCommandeFournisseur(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['commandesFournisseurs'] });
        },
    });
};

export const useDeleteCommandeFournisseur = (): UseMutationResult<void, Error, string> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCommandeFournisseur,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['commandesFournisseurs'] });
        },
    });
};

export const useCreateCommandeFournisseurLigne = (): UseMutationResult<
    CommandeFournisseurLigne,
    Error,
    CreateCommandeFournisseurLigne
> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCommandeFournisseurLigne,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['commandeFournisseurLignes', variables.commande] });
        },
    });
};

export const useUpdateCommandeFournisseurLigne = (): UseMutationResult<
    CommandeFournisseurLigne,
    Error,
    { id: string; data: UpdateCommandeFournisseurLigne; commandeId: string }
> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateCommandeFournisseurLigne(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['commandeFournisseurLignes', variables.commandeId] });
        },
    });
};

export const useDeleteCommandeFournisseurLigne = (): UseMutationResult<void, Error, { id: string; commandeId: string }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }) => deleteCommandeFournisseurLigne(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['commandeFournisseurLignes', variables.commandeId] });
        },
    });
};
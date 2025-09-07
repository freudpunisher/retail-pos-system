import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getTransfertsStock,
    createTransfertStock,
    updateTransfertStock,
    deleteTransfertStock,
    getTransfertStockLignes,
    createTransfertStockLigne,
    updateTransfertStockLigne,
    deleteTransfertStockLigne,
} from '@/services/transfertsStockService';
import { TransfertStock, CreateTransfertStock, UpdateTransfertStock, TransfertStockLigne } from '@/types/transfertsStock';

export const useTransfertsStock = () => {
    const queryClient = useQueryClient();

    const transfertsQuery = useQuery<TransfertStock[], Error>({
        queryKey: ['transfertsStock'],
        queryFn: getTransfertsStock,
    });

    const lignesQuery = (transfertId: string | null) =>
        useQuery<TransfertStockLigne[], Error>({
            queryKey: ['transfertStockLignes', transfertId],
            queryFn: () => getTransfertStockLignes(transfertId!),
            enabled: !!transfertId,
        });

    const createTransfertMutation = useMutation<TransfertStock, Error, CreateTransfertStock>({
        mutationFn: createTransfertStock,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transfertsStock'] });
        },
    });

    const updateTransfertMutation = useMutation<TransfertStock, Error, { id: string; data: UpdateTransfertStock }>({
        mutationFn: ({ id, data }) => updateTransfertStock(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transfertsStock'] });
        },
    });

    const deleteTransfertMutation = useMutation<void, Error, string>({
        mutationFn: deleteTransfertStock,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transfertsStock'] });
        },
    });

    const createLigneMutation = useMutation<TransfertStockLigne, Error, { transfertId: string; data: TransfertStockLigne }>({
        mutationFn: ({ transfertId, data }) => createTransfertStockLigne(transfertId, data),
        onSuccess: (_, { transfertId }) => {
            queryClient.invalidateQueries({ queryKey: ['transfertStockLignes', transfertId] });
        },
    });

    const updateLigneMutation = useMutation<TransfertStockLigne, Error, { transfertId: string; ligneId: string; data: TransfertStockLigne }>({
        mutationFn: ({ transfertId, ligneId, data }) => updateTransfertStockLigne(transfertId, ligneId, data),
        onSuccess: (_, { transfertId }) => {
            queryClient.invalidateQueries({ queryKey: ['transfertStockLignes', transfertId] });
        },
    });

    const deleteLigneMutation = useMutation<void, Error, { transfertId: string; ligneId: string }>({
        mutationFn: ({ transfertId, ligneId }) => deleteTransfertStockLigne(transfertId, ligneId),
        onSuccess: (_, { transfertId }) => {
            queryClient.invalidateQueries({ queryKey: ['transfertStockLignes', transfertId] });
        },
    });

    return {
        transferts: transfertsQuery.data || [],
        isLoading: transfertsQuery.isLoading,
        error: transfertsQuery.error,
        fetchTransferts: transfertsQuery.refetch,
        createTransfert: createTransfertMutation.mutateAsync,
        updateTransfert: updateTransfertMutation.mutateAsync,
        deleteTransfert: deleteTransfertMutation.mutateAsync,
        fetchLignes: lignesQuery,
        createLigne: createLigneMutation.mutateAsync,
        updateLigne: updateLigneMutation.mutateAsync,
        deleteLigne: deleteLigneMutation.mutateAsync,
    };
};
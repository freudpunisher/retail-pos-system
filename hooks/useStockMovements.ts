// hooks/useStockMovements.ts

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StockMovementService } from '@/services/stockMovementService';
import { MouvementStock } from '@/types/StockMovement';

// Custom hook for fetching stock movements with filters
export const useStockMovements = (filters?: {
    type_mouvement?: string;
    point_vente_nom?: string;
    produit_nom?: string;
    produit_reference?: string;
    categorie_nom?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
}) => {
    return useQuery({
        queryKey: ['stockMovements', filters],
        queryFn: () => StockMovementService.getStockMovements(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
    });
};

// Custom hook for fetching a single stock movement by ID
export const useStockMovement = (id: string | null) => {
    return useQuery({
        queryKey: ['stockMovement', id],
        queryFn: () => StockMovementService.getStockMovementById(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
    });
};

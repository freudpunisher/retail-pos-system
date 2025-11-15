import axiosInstance from '../lib/axiosInstance';
import {
    MouvementStock,
    UniteMesure,
    TypeMouvement,
} from '../types/StockMovement';

// Fonction générique pour gérer les requêtes et erreurs
async function handleRequest<T>(promise: Promise<{ data: T }>, errorMessage: string): Promise<T> {
    try {
        const response = await promise;
        return response.data;
    } catch (error) {
        console.error(errorMessage, error);
        throw error;
    }
}

export const StockMovementService = {
    // -------------------------
    // Mouvement de stock avec filtres
    // -------------------------
    getStockMovements: (filters?: {
        type_mouvement?: string;
        point_vente_nom?: string;
        produit_nom?: string;
        produit_reference?: string;
        categorie_nom?: string;
        search?: string;
        date_from?: string;
        date_to?: string;
    }): Promise<MouvementStock[]> => {
        const params: any = {};

        if (filters?.type_mouvement) params.type_mouvement = filters.type_mouvement;
        if (filters?.point_vente_nom) params.point_vente_nom = filters.point_vente_nom;
        if (filters?.produit_nom) params.produit_nom = filters.produit_nom;
        if (filters?.produit_reference) params.produit_reference = filters.produit_reference;
        if (filters?.categorie_nom) params.categorie_nom = filters.categorie_nom;
        if (filters?.search) params.search = filters.search;
        if (filters?.date_from) params.created_at__gte = filters.date_from;
        if (filters?.date_to) params.created_at__lte = filters.date_to;

        return handleRequest(
            axiosInstance.get('/api/mouvements-stock/', { params }),
            'Error fetching stock movements'
        );
    },

    getStockMovementById: (id: string): Promise<MouvementStock> =>
        handleRequest(
            axiosInstance.get(`/api/mouvements-stock/${id}/`),
            `Error fetching stock movement with id ${id}`
        ),
};

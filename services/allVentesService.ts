import axiosInstance from '@/lib/axiosInstance';
import { Vente } from '@/types/vente.types';

export interface UpdateVentePayload {
  point_vente?: string;
  caisse?: string;
  client?: string;
  vendeur?: string;
  status?: 'draft' | 'completed' | 'cancelled' | 'returned';
  payment_status?: 'pending' | 'paid';
  remise_globale?: string;
  date_echeance?: string;
  is_synced?: boolean;
  device_id?: string;
  offline_created?: boolean;
  commentaire?: string;
  lignes?: Array<{
    produit: string;
    unite: 'piece' | 'kg' | 'litre' | 'metre';
    quantite: number;
    prix_unitaire_ht: string;
    taux_tva: string;
    remise_pourcentage: string;
  }>;
}

export const allVentesService = {
  // Fetch all sales
  getAllVentes: async (): Promise<Vente[]> => {
    const response = await axiosInstance.get('/api/ventes/');
    return response.data;
  },

  // Update a specific sale
  updateVente: async (id: string, data: UpdateVentePayload): Promise<Vente> => {
    const response = await axiosInstance.put(`/api/ventes/${id}/`, data);
    return response.data;
  },

  // Update sale status (commonly used for returns)
  updateVenteStatus: async (id: string, status: 'draft' | 'completed' | 'cancelled' | 'returned', originalVente: Vente): Promise<Vente> => {
    // Send complete sale data with updated status to avoid validation errors
    const updateData = {
      point_vente: originalVente.point_vente,
      caisse: originalVente.caisse,
      client: originalVente.client,
      vendeur: originalVente.vendeur,
      status: status,
      payment_status: originalVente.payment_status,
      remise_globale: originalVente.remise_globale || "0",
      date_echeance: originalVente.date_echeance,
      is_synced: originalVente.is_synced,
      device_id: originalVente.device_id,
      offline_created: originalVente.offline_created,
      commentaire: originalVente.commentaire || "",
      lignes: originalVente.lignes?.map(ligne => ({
        produit: ligne.produit,
        unite: ligne.unite,
        quantite: ligne.quantite,
        prix_unitaire_ht: ligne.prix_unitaire_ht,
        taux_tva: ligne.taux_tva,
        remise_pourcentage: ligne.remise_pourcentage
      })) || []
    };
    
    const response = await axiosInstance.put(`/api/ventes/${id}/`, updateData);
    return response.data;
  },

  // Remove item from sale
  removeItemFromSale: async (id: string, itemId: string, originalVente: Vente): Promise<Vente> => {
    const updatedLignes = originalVente.lignes?.filter(ligne => ligne.id !== itemId) || [];
    
    const updateData = {
      point_vente: originalVente.point_vente,
      caisse: originalVente.caisse,
      client: originalVente.client,
      vendeur: originalVente.vendeur,
      status: originalVente.status,
      payment_status: originalVente.payment_status,
      remise_globale: originalVente.remise_globale || "0",
      date_echeance: originalVente.date_echeance,
      is_synced: originalVente.is_synced,
      device_id: originalVente.device_id,
      offline_created: originalVente.offline_created,
      commentaire: originalVente.commentaire || "",
      lignes: updatedLignes.map(ligne => ({
        produit: ligne.produit,
        unite: ligne.unite,
        quantite: ligne.quantite,
        prix_unitaire_ht: ligne.prix_unitaire_ht,
        taux_tva: ligne.taux_tva,
        remise_pourcentage: ligne.remise_pourcentage
      }))
    };
    
    const response = await axiosInstance.put(`/api/ventes/${id}/`, updateData);
    return response.data;
  }
};
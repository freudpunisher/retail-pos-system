export interface Stock {
    id?: string;
    quantite_actuelle: number;
    quantite_reservee: number;
    date_derniere_entree: string;
    date_derniere_sortie: string;
    updated_at: string;
    produit: string;
    point_vente_nom: string;
    produit_reference: string;
    produit_nom: string;
    produit_unite_mesure: string;
    produit_categorie: string;
    type_stock: string;
    point_vente: string;
}

export interface TransfertFormData {
    numero_transfert: string;
    point_vente_source: string;
    point_vente_destination: string;
    status: 'pending' | 'validated' | 'shipped' | 'received' | 'cancelled';
    demandeur: string;
    validateur?: string;
    date_validation?: string;
    date_expedition?: string;
    date_reception?: string;
    commentaire?: string;
    lignes: {
        produit: string;
        quantite_demandee: number;
        quantite_expediee: number;
        quantite_recue: number;
    }[];
}

export interface StockResponse extends Stock {
  // Additional fields from API response, if any
}

export interface CreateStockRequest {
    quantite_actuelle: number;
    quantite_reservee: number;
    date_derniere_entree: string;
    date_derniere_sortie: string;
    produit: string;
    point_vente: string;
}

export interface UpdateStockRequest {
    quantite_actuelle?: number;
    quantite_reservee?: number;
    produit?: string;
    point_vente?: string;
}

export interface StockAdjustmentRequest {
  type: 'adjustment' | 'damage' | 'found' | 'expired';
  quantity: number;
  reason: string;
  reference?: string;
}

export interface Produit {
  id: string;
  nom: string;
  categorie: string; // Assuming category is a string; could be UUID if linked to a categories endpoint
}

export interface PointVente {
  id: string;
  nom: string;
}
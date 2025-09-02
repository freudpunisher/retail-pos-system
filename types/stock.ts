export interface Stock {
  id: string;
  quantite_actuelle: number;
  quantite_reservee: number;
  date_derniere_entree: string;
  date_derniere_sortie: string;
  produit: string; // UUID referencing Produit
  point_vente: string; // UUID referencing PointVente
  minimum?: number; // Optional, for future use
  maximum?: number; // Optional, for future use
}

export interface StockResponse extends Stock {
  // Additional fields from API response, if any
}

export interface CreateStockRequest {
  quantite_actuelle: number;
  quantite_reservee: number;
  produit: string;
  point_vente: string;
  minimum?: number;
  maximum?: number;
}

export interface UpdateStockRequest {
  quantite_actuelle?: number;
  quantite_reservee?: number;
  produit?: string;
  point_vente?: string;
  minimum?: number;
  maximum?: number;
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
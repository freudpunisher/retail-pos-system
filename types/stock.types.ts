export interface Stock {
  id: string;
  produit: string;
  produit_nom: string;
  point_vente: string;
  quantite_actuelle: number;
  quantite_reservee: number;
  date_derniere_entree: string;
  date_derniere_sortie: string;
  updated_at: string;
  quantite_disponible: string;
}

export interface StockFilters {
  point_vente?: string;
  produit?: string;
  quantite_min?: number;
  page?: number;
  limit?: number;
  search?: string;
}

export interface StockResponse {
  results: Stock[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Extended interface for POS usage with additional product details if needed
export interface POSStock extends Stock {
  // Add any additional fields we might need for POS operations
  prix_unitaire?: number;
  taux_tva?: number;
  code_barre?: string;
  reference?: string;
  unite?: "piece" | "kg" | "litre" | "metre";
}
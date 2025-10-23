export interface Stock {
    id: string;
    produit: string;
    produit_nom: string;
    produit_reference: string;
    categorie_nom: string;
    point_vente: string;
    point_vente_nom: string;
    quantite_actuelle: number;
    quantite_reservee: number;
    date_derniere_entree: string | null;
    date_derniere_sortie: string | null;
    updated_at: string;
    quantite_disponible: number;
}

export interface StockFilters {
  point_vente?: string;
  produit?: string;
  produit_nom: string;
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
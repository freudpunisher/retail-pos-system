export interface StockMovement {
  id: string;
  type_mouvement: 'entree' | 'sortie' | 'transfert_in' | 'transfert_out' | 'ajustement' | 'inventaire';
  quantite: number;
  prix_unitaire: number; // Price in FBU
  reference_document: string;
  motif: string;
  date_expiration?: string; // Optional, ISO date
  stock: string; // UUID referencing Stock
  utilisateur: string; // UUID referencing User
  created_at: string; // ISO date
}

export interface StockMovementResponse extends StockMovement {
  // Additional fields from API response, if any
}

export interface CreateStockMovementRequest {
  type_mouvement: 'entree' | 'sortie' | 'transfert_in' | 'transfert_out' | 'ajustement' | 'inventaire';
  quantite: number;
  prix_unitaire: number;
  reference_document?: string;
  motif: string;
  date_expiration?: string;
  stock: string;
  utilisateur: string;
}

export interface UpdateStockMovementRequest {
  type_mouvement?: 'entree' | 'sortie' | 'transfert_in' | 'transfert_out' | 'ajustement' | 'inventaire';
  quantite?: number;
  prix_unitaire?: number;
  reference_document?: string;
  motif?: string;
  date_expiration?: string;
  stock?: string;
  utilisateur?: string;
}

export interface Stock {
  id: string;
  produit: string; // UUID referencing Produit
  point_vente: string; // UUID referencing PointVente
}

export interface Produit {
  id: string;
  nom: string;
  categorie: string;
}

export interface PointVente {
  id: string;
  nom: string;
}

export interface User {
  id: string;
  nom: string; // or username
}
export interface PurchaseOrder {
  id: string;
  numero_commande: string;
  status: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';
  date_livraison_prevue: string; // ISO date
  montant_total: number; // In FBU
  commentaire?: string;
  fournisseur: string; // UUID referencing Fournisseur
  point_vente: string; // UUID referencing PointVente
  utilisateur: string; // UUID referencing User
  created_at: string; // ISO date
  lignes?: lignes[]; // Order lines/items
}

export interface PurchaseOrderResponse extends PurchaseOrder {
  // Additional fields from API response, if any
}
export interface lignes {
  id?: string; // Optional for creation, required for updates
  quantite_commandee: number;
  quantite_recue: number;
  prix_unitaire: number; // In FBU
  montant_ligne?: number; // In FBU - calculated field
  commande?: string; // UUID referencing PurchaseOrder
  produit: string; // UUID referencing Produit
}

export interface CreatePurchaseOrderRequest {

  status?: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';
  date_livraison_prevue: string;
  commentaire?: string;
  fournisseur: string;
  point_vente: string;
  utilisateur: string;
  lignes : lignes[];
}

export interface UpdatePurchaseOrderRequest {
  numero_commande?: string;
  status?: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';
  date_livraison_prevue?: string;
  commentaire?: string;
  fournisseur?: string;
  point_vente?: string;
  utilisateur?: string;
  lignes : lignes[];
} 

export interface OrderLine {
  id: string;
  quantite_commandee: number;
  quantite_recue: number;
  prix_unitaire: number; // In FBU
  montant_ligne: number; // In FBU
  commande: string; // UUID referencing PurchaseOrder
  produit: string; // UUID referencing Produit
}

export interface CreateOrderLineRequest {
  quantite_commandee: number;
  quantite_recue?: number;
  prix_unitaire: number;
  produit: string;
  commande: string;
}

export interface UpdateOrderLineRequest {
  quantite_commandee?: number;
  quantite_recue?: number;
  prix_unitaire?: number;
  produit?: string;
}

export interface Fournisseur {
  id: string;
  nom: string;
}

export interface PointVente {
  id: string;
  nom: string;
}

export interface User {
  id: string;
  nom: string; // or username
}

export interface Produit {
  id: string;
  nom: string;
  categorie: string;
}

// Extended types with populated references for display purposes
export interface LigneDetailed extends lignes {
  produit_details?: Produit; // Populated product information
  montant_ligne_calculated?: number; // Calculated line total
}

export interface PurchaseOrderDetailed extends PurchaseOrder {
  fournisseur_details?: Fournisseur; // Populated supplier information
  point_vente_details?: PointVente; // Populated point of sale information
  utilisateur_details?: User; // Populated user information
  lignes_detailed?: LigneDetailed[]; // Populated line items with product details
  montant_total_calculated?: number; // Calculated total from line items
}

// Helper type for table display
export interface PurchaseOrderTableRow extends PurchaseOrder {
  fournisseur_nom?: string;
  point_vente_nom?: string;
  utilisateur_nom?: string;
  items_count?: number;
}

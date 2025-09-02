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
}

export interface PurchaseOrderResponse extends PurchaseOrder {
  // Additional fields from API response, if any
}

export interface CreatePurchaseOrderRequest {
  numero_commande: string;
  status?: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';
  date_livraison_prevue: string;
  commentaire?: string;
  fournisseur: string;
  point_vente: string;
  utilisateur: string;
}

export interface UpdatePurchaseOrderRequest {
  numero_commande?: string;
  status?: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';
  date_livraison_prevue?: string;
  commentaire?: string;
  fournisseur?: string;
  point_vente?: string;
  utilisateur?: string;
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
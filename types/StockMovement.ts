import {CommandeFournisseurLigne} from "@/types/commandesFournisseurs";

export interface StockMovementLigne {
    id?: string;
    unite: 'piece' | 'kg' | 'litre' | 'metre' | 'paquet' | 'boite' | 'sac';
    quantite_mouvement: number;
    prix_unitaire: string;
    mouvement_stock?: string;
    montant_ligne?: string;
    produit: string;
}

export interface StockMovement {
  id: string;
  type_mouvement: 'entree' | 'sortie' | 'transfert_in' | 'transfert_out' | 'ajustement' | 'inventaire';
  lignes?: StockMovementLigne[];
  stock: string;
  stock_nom: string;
  point_vente_nom: string;
  utilisateur_non: string;
  reference: string;
  reference_document: string;
  utilisateur: string;
  created_at: string;
}

export interface StockMovementFormData {
    type_mouvement: 'entree' | 'sortie' | 'transfert_in' | 'transfert_out' | 'ajustement' | 'inventaire';
    reference_document: string;
    reference: string;
    stock: string;
    utilisateur: string;
    lignes: {
        produit: string;
        unite: 'piece' | 'kg' | 'litre' | 'metre' | 'paquet' | 'boite' | 'sac';
        quantite_mouvement: number;
        prix_unitaire: number;
    }[];
}

export interface StockMovementResponse extends StockMovement {
    id: string;
    type_mouvement: 'entree' | 'sortie' | 'transfert_in' | 'transfert_out' | 'ajustement' | 'inventaire';
    lignes?: StockMovementLigne[];
    stock_nom: string;
    point_vente_nom: string;
    utilisateur_non: string;
    reference: string;
    reference_document: string;
    utilisateur: string;
    created_at: string;
}

export interface CreateStockMovementRequest {
    type_mouvement: 'entree' | 'sortie' | 'transfert_in' | 'transfert_out' | 'ajustement' | 'inventaire';
    reference_document: string;
    reference: string;
    stock: string;
    utilisateur: string;
}

export interface UpdateStockMovementRequest {
    type_mouvement: 'entree' | 'sortie' | 'transfert_in' | 'transfert_out' | 'ajustement' | 'inventaire';
    reference_document: string;
    reference: string;
    stock: string;
    utilisateur: string;
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
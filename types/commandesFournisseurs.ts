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
    nom: string;
}

export interface Produit {
    id: string;
    nom: string;
}

export interface CommandeFournisseurLigne {
    id?: string;
    produit: string;
    produit_nom?: string;
    quantite_commandee: number;
    quantite_recue: number;
    prix_unitaire: string;
    montant_ligne?: string;
    commande?: string;
}

export interface CommandeFournisseur {
    id?: string;
    numero_commande: string;
    fournisseur: string;
    fournisseur_nom?: string;
    point_vente: string;
    point_vente_nom?: string;
    status: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';
    date_commande?: string;
    date_livraison_prevue: string;
    montant_total?: string;
    utilisateur: string;
    utilisateur_nom?: string;
    commentaire: string;
    lignes?: CommandeFournisseurLigne[];
}

export interface CreateCommandeFournisseur {
    numero_commande: string;
    fournisseur: string;
    point_vente: string;
    status: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';
    date_livraison_prevue: string;
    utilisateur: string;
    commentaire: string;
}

export interface UpdateCommandeFournisseur {
    numero_commande?: string;
    fournisseur?: string;
    point_vente?: string;
    status?: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';
    date_livraison_prevue?: string;
    utilisateur?: string;
    commentaire?: string;
}

export interface CreateCommandeFournisseurLigne {
    produit: string;
    quantite_commandee: number;
    quantite_recue: number;
    prix_unitaire: string;
    commande: string;
}

export interface UpdateCommandeFournisseurLigne {
    produit?: string;
    quantite_commandee?: number;
    quantite_recue?: number;
    prix_unitaire?: string;
}
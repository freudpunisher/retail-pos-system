export interface PointVente {
    id: string;
    nom: string;
}

export interface Utilisateur {
    id: string;
    nom: string;
    username: string;
}

export interface Produit {
    id: string;
    nom: string;
    categorie?: string;
}

export interface TransfertStockLigne {
    id?: string;
    produit: string;
    produit_nom?: string;
    quantite_demandee: number;
    quantite_expediee: number;
    quantite_recue: number;
}

export interface TransfertStock {
    id?: string;
    numero_transfert: string;
    point_vente_source: string;
    point_vente_source_nom?: string;
    point_vente_destination: string;
    point_vente_destination_nom?: string;
    status: 'pending' | 'validated' | 'shipped' | 'received' | 'cancelled'| 'completed';
    demandeur: string;
    demandeur_username?: string;
    validateur?: string;
    validateur_username?: string;
    date_demande: string;
    date_validation?: string;
    date_expedition?: string;
    date_reception?: string;
    commentaire?: string;
    lignes?: TransfertStockLigne[];
}

export interface CreateTransfertStock {
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
    lignes: Array<{
        produit: string;
        quantite_demandee: number;
        quantite_expediee: number;
        quantite_recue: number;
    }>;
}

export interface UpdateTransfertStock {
    numero_transfert?: string;
    point_vente_source?: string;
    point_vente_destination?: string;
    status?: 'pending' | 'validated' | 'shipped' | 'received' | 'cancelled'|'completed';
    demandeur?: string;
    validateur?: string;
    date_validation?: string;
    date_expedition?: string;
    date_reception?: string;
    commentaire?: string;
}
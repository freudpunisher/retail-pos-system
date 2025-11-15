// types/stockMovement.ts

// Enum pour les types de mouvement
export type TypeMouvement =
    | 'entree'
    | 'sortie'
    | 'transfert_in'
    | 'transfert_out'
    | 'ajustement'
    | 'inventaire';

// Enum pour les unités de mesure
export type UniteMesure =
    | 'piece'
    | 'kg'
    | 'litre'
    | 'metre'
    | 'paquet'
    | 'boite'
    | 'sac';

export interface MouvementStock {
    point_vente_nom: ReactNode;
    produit_nom: ReactNode;
    produit_reference: ReactNode;
    id: string;
    stock: string;
    type_mouvement: 'entree' | 'sortie' | 'transfert_in' | 'transfert_out' | 'ajustement' | 'inventaire';
    quantite: number;
    prix_unitaire: number | null;
    motif: string;
    utilisateur: string | null;
    date_expiration: string | null;
    created_at: string;
    stock_produit_nom?: string;
    stock_produit_refrence?: string;
    stock_point_vente_nom?: string;
    stock_categorie_nom?: string;
}

export interface Fournisseur {
    id: string;
    nom: string;
    contact_nom: string;
    email: string;
    telephone: string;
    adresse: string;
    conditions_paiement: string;
    delai_livraison: number;
    is_active: boolean;
    created_at: string;
}

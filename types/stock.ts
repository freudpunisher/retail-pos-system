interface StockResponse {
    id: string;
    type_stock: "principale" | "secondaire";
    quantite_actuelle: number;
    quantite_reservee: number;
    date_derniere_entree?: string;
    date_derniere_sortie?: string;
    point_vente_nom: string;
    produit_nom: string;
    produit_reference: string;
    produit_categorie: string;
    produit_unite_mesure: string;
}

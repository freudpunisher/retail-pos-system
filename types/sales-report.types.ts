// src/types/sales-report.types.ts
export interface SaleProduct {
  produit_id: string;
  produit_nom: string;
  quantite: number;
  prix_unitaire_ht: string;
  taux_tva: string;
  remise_pourcentage: string;
  montant_ht: string;
  montant_tva: string;
  montant_ttc: string;
}

export interface Sale {
  numero_facture: string;
  date_vente: string;
  client_nom: string;
  vendeur_nom: string;
  montant_ttc: string;
  status: string;
  payment_status: string;
  nombre_articles: number;
  produits: SaleProduct[];
}

export interface SalesDetailResponse {
  periode: string;
  date_debut: string;
  date_fin: string;
  point_vente: string;
  caisse: string;
  caissier: string;
  totals: {
    total_ht: number;
    total_tva: number;
    total_ttc: number;
    total_ventes: number;
    total_articles: number;
    ventes_payees: number;
    ventes_impayees: number;
    ventes_partielles: number;
  };
  ventes: Sale[];
}
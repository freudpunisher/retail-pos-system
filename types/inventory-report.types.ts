// types/inventory-report.types.ts
export interface InventoryProductDetail {
  produit: string;
  point_vente: string;
  quantite: number;
  stock_minimum: number;
  alerte: boolean;
  rupture: boolean;
  valeur_achat: number;
  valeur_vente: number;
}

export interface InventoryReportResponse {
  point_vente: string;
  periode: {
    debut: string;
    fin: string;
    periode_selectionnee: string;
  };
  totaux: {
    produits_total: number;
    en_stock: number;
    rupture: number;
    alerte: number;
  };
  valeurs: {
    valeur_achat: number;
    valeur_vente: number;
    marge_potentielle: number;
  };
  mouvements: {
    entrees: number;
    sorties: number;
    transferts_in: number;
    transferts_out: number;
    inventaires: number;
  };
  inventaire: {
    inventaires_valides: number;
    produits_ajustes: number;
    ecarts: {
      ecarts_positifs: number;
      ecarts_negatifs: number;
    };
  };
  details_produits: InventoryProductDetail[];
}
export interface VenteLigne {
  id?: string;
  produit: string;
  produit_nom?: string;
  unite: "piece" | "kg" | "litre" | "metre";
  quantite: number;
  prix_unitaire_ht: string;
  taux_tva: string;
  remise_pourcentage: string;
  montant_ht?: string;
  montant_tva?: string;
  montant_ttc?: string;
}

export interface Vente {
  id: string; // Make required since API always provides it
  numero_facture?: string;
  point_vente: string;
  caisse?: string;
  client?: string;
  vendeur?: string;
  status: "draft" | "completed" | "confirmed" | "cancelled" | "returned";
  payment_status: "pending" | "paid" | "partial" | "refunded";
  montant_ht?: string;
  montant_tva?: string;
  montant_ttc?: string;
  remise_globale?: string;
  date_vente: string; // Date when sale was made
  date_echeance: string;
  is_synced: boolean;
  device_id: string;
  offline_created: boolean;
  commentaire?: string;
  lignes?: VenteLigne[];
  created_at?: string;
  updated_at?: string;
  total_ht?: string;
  total_tva?: string;
  total_ttc?: string;
}

export interface CreateVentePayload {
  point_vente: string;
  client?: string; // Optional client field
  vendeur?: string;
  status: "draft" | "completed" | "cancelled" | "returned";
  payment_status: "pending" | "paid";
  remise_globale: string;
  date_echeance: string;
  is_synced: boolean;
  device_id: string;
  offline_created: boolean;
  commentaire: string;
  lignes: Omit<VenteLigne, 'id'>[];
}

export interface UpdateVentePayload extends Partial<CreateVentePayload> {
  id: string;
}

export interface VenteFilters {
  status?: string;
  payment_status?: string;
  client?: string;
  vendeur?: string;
  point_vente?: string;
  date_debut?: string;
  date_fin?: string;
  page?: number;
  limit?: number;
}

export interface VenteResponse {
  results: Vente[];
  count: number;
  next: string | null;
  previous: string | null;
}
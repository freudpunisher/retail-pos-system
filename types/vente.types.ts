export interface VenteLigne {
  id?: string;
  produit: string;
  unite: "piece" | "kg" | "litre" | "metre";
  quantite: number;
  prix_unitaire_ht: string;
  taux_tva: string;
  remise_pourcentage: string;
}

export interface Vente {
  id?: string;
  point_vente: string;
  caisse?: string; // Optional caisse field
  client?: string; // Optional client field
  vendeur: string;
  status: "draft" | "confirmed" | "cancelled" | "returned";
  payment_status: "pending" | "paid" | "partial" | "refunded";
  remise_globale: string;
  date_echeance: string;
  is_synced: boolean;
  device_id: string;
  offline_created: boolean;
  commentaire: string;
  lignes: VenteLigne[];
  created_at?: string;
  updated_at?: string;
  total_ht?: string;
  total_tva?: string;
  total_ttc?: string;
  numero_facture?: string;
}

export interface CreateVentePayload {
  point_vente: string;
  client?: string; // Optional client field
  vendeur: string;
  status: "draft" | "confirmed";
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
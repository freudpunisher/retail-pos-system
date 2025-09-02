
export interface Fournisseur {
  id: string;
  nom: string;
  contact_nom: string;
  telephone: string;
  email: string;
  conditions_paiement: string;
  delai_livraison: number;
  adresse: string;
  is_active: boolean;
  created_at: string;
}

export interface FournisseurResponse extends Fournisseur {
  // Optionally include additional fields returned by the API
}

export interface CreateFournisseurRequest {
  nom: string;
  contact_nom: string;
  telephone: string;
  email: string;
  conditions_paiement: string;
  delai_livraison: number;
  adresse: string;
  is_active: boolean;
}

export interface UpdateFournisseurRequest {
  nom?: string;
  contact_nom?: string;
  telephone?: string;
  email?: string;
  conditions_paiement?: string;
  delai_livraison?: number;
  adresse?: string;
  is_active?: boolean;
}

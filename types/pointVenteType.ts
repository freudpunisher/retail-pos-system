export interface PointVente {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  is_active: boolean;
  responsable: string; // UUID referencing User.id
}

export interface PointVenteResponse extends PointVente {
  // Optionally include additional fields returned by the API, e.g., created_at
}

export interface CreatePointVenteRequest {
  nom: string;
  adresse: string;
  telephone: string;
  is_active: boolean;
  responsable: string;
}

export interface UpdatePointVenteRequest {
  nom?: string;
  adresse?: string;
  telephone?: string;
  is_active?: boolean;
  responsable?: string;
}
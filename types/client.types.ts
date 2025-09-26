export interface Client {
  id: string;
  nom: string;
  prenom: string;
  type_client: "particulier" | "entreprise" | "professionnel";
  email: string;
  telephone: string;
  adresse: string;
  numero_compte: string;
  credit_limite: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateClientPayload {
  nom: string;
  prenom: string;
  type_client: "particulier" | "entreprise" | "professionnel";
  email: string;
  telephone: string;
  adresse: string;
  numero_compte: string;
  credit_limite: string;
  is_active: boolean;
}

export interface UpdateClientPayload extends Partial<CreateClientPayload> {
  id: string;
}

export interface ClientFilters {
  nom?: string;
  prenom?: string;
  type_client?: string;
  email?: string;
  telephone?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface ClientResponse {
  results: Client[];
  count: number;
  next: string | null;
  previous: string | null;
}
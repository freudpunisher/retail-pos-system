export interface Category {
  nom: string;
  description: string;
  is_active: boolean;
}

export interface CategoryResponse {
  id: string;
  nom: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
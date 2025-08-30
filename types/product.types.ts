export enum UniteMesureEnum {
  Piece = 'piece',
  Kg = 'kg',
  Litre = 'litre',
  Metre = 'metre',
  Paquet = 'paquet',
  Boite = 'boite',
  Sac = 'sac',
}

export interface Product {
  nom: string;
  description: string;
  code_barre: string;
  reference: string;
  unite_mesure: UniteMesureEnum;
  prix_achat: string;
  prix_vente: string;
  taux_tva: string;
  stock_minimum: number;
  stock_maximum: number;
  is_active: boolean;
  has_expiry: boolean;
  categorie: string;
}

export interface ProductResponse extends Product {
  id: string;
  created_at: string;
  updated_at: string;
}
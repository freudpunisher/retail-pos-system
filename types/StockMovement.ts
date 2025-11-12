// types/stock-movement.ts
export interface StockMovement {
  id: string
  stock: string
  stock_name: string
  type_mouvement: "entree" | "sortie" | "transfert_in" | "transfert_out" | "ajustement" | "inventaire"
  quantite: number
  prix_unitaire: string
  motif: string
  utilisateur: string
  date_expiration?: string
  created_at: string
}

export interface Product {
  id: string
  nom: string
}

export interface PointVente {
  id: string
  nom: string
}

export interface User {
  id: string
  prenom?: string
  nom?: string
}
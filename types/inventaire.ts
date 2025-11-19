// src/types/inventaire.ts
export interface InventaireLigne {
  id?: string
  inventaire_stock: string
  produit: string
  quantite_stock: number
  quantite_reel: number
  prix_achat?: string
  prix_vente?: string
}

export interface Inventaire {
  id?: string
  numero_inventaire: string
  point_vente: string
  status: "pending" | "validate"
  utilisateur_cree: string
  utilisateur_valide?: string
  date_creation?: string
  date_validation?: string
  commentaire?: string
  stock_inventaire_traitee: boolean
  lignes: InventaireLigne[]
}

export type CreateInventaire = Omit<Inventaire, "id" | "date_creation" | "date_validation" | "utilisateur_valide">
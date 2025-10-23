import { TransfertStock, CreateTransfertStock, UpdateTransfertStock } from "@/types/transfertsStock"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"

// 🔹 Liste des transferts
export async function fetchTransferts(): Promise<TransfertStock[]> {
    const res = await fetch(`${API_URL}api/transferts-stock/`)
    if (!res.ok) throw new Error("Erreur lors du chargement des transferts")
    return res.json()
}

// 🔹 Détails d’un transfert
export async function fetchTransfertById(id: string): Promise<TransfertStock> {
    const res = await fetch(`${API_URL}api/transferts-stock/${id}/`)
    if (!res.ok) throw new Error("Transfert introuvable")
    return res.json()
}

// 🔹 Création d’un transfert (avec lignes)
export async function createTransfert(data: CreateTransfertStock): Promise<TransfertStock> {
    const res = await fetch(`${API_URL}api/transferts-stock/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        const err = await res.json()
        throw new Error(`Erreur lors de la création du transfert: ${JSON.stringify(err)}`)
    }
    return res.json()
}

// 🔹 Mise à jour d’un transfert
export async function updateTransfert(id: string, data: UpdateTransfertStock): Promise<TransfertStock> {
    const res = await fetch(`${API_URL}api/transferts-stock/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        const err = await res.json()
        throw new Error(`Erreur lors de la mise à jour du transfert: ${JSON.stringify(err)}`)
    }
    return res.json()
}

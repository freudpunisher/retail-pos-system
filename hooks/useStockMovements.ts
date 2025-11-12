// hooks/useStockMovements.ts
import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import { StockMovement, Product, PointVente, User } from "@/types/StockMovement"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export function useStockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [pointsVente, setPointsVente] = useState<PointVente[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWithError = async (url: string, name: string) => {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed to load ${name}`)
      return await res.json()
    } catch (err: any) {
      throw new Error(err.message || `Error loading ${name}`)
    }
  }

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [movementsData, productsData, pointsData, usersData] = await Promise.all([
        fetchWithError(`${API_BASE}api/mouvements-stock/`, "movements"),
        fetchWithError(`${API_BASE}api/produits/`, "products"),
        fetchWithError(`${API_BASE}api/points-vente/`, "points de vente"),
        fetchWithError(`${API_BASE}api/users/`, "users"),
      ])

      setMovements(movementsData)
      setProducts(productsData)
      setPointsVente(pointsData)
      setUsers(usersData)
      toast.success("Données chargées")
    } catch (err: any) {
      setError(err.message)
      toast.error("Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return {
    movements,
    products,
    pointsVente,
    users,
    loading,
    error,
    refetch: loadData,
  }
}
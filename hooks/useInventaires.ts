// src/hooks/useInventaires.ts
import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import axiosInstance from "@/lib/axiosInstance"
import { Inventaire, CreateInventaire } from "@/types/inventaire"
import { getCurrentUser } from "@/lib/auth"

export const useInventaires = () => {
  const [inventaires, setInventaires] = useState<Inventaire[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await axiosInstance.get<Inventaire[]>("api/inventaires/")
      setInventaires(data)
    } catch (err: any) {
      console.error("Failed to load inventaires:", err)
      toast.error(err.response?.data?.detail || "Erreur chargement inventaires")
    } finally {
      setLoading(false)
    }
  }

  const add = async (payload: CreateInventaire) => {
    try {
      await axiosInstance.post("api/inventaires/", payload)
      toast.success("Inventaire créé")
      load()
    } catch (err: any) {
      console.error("Add failed:", err)
      toast.error(err.response?.data?.detail || "Échec création")
      throw err
    }
  }

  const edit = async (id: string, payload: Partial<Inventaire>) => {
    try {
      await axiosInstance.patch(`api/inventaires/${id}`, payload)
      toast.success("Inventaire mis à jour")
      load()
    } catch (err: any) {
      console.error("Edit failed:", err)
      toast.error(err.response?.data?.detail || "Échec mise à jour")
      throw err
    }
  }

  const validate = async (id: string) => {
    const currentUser = getCurrentUser()
    if (!currentUser?.id) {
      toast.error("Utilisateur non connecté")
      return
    }

    await edit(id, {
      status: "validated",
      date_validation: new Date().toISOString(),
      utilisateur_valide: currentUser.id,
    })
  }

  useEffect(() => {
    load()
  }, [])

  return { inventaires, loading, load, add, edit, validate }
}
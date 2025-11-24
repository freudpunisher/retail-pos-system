// hooks/usePurchasesDetail.ts
import { useState, useEffect } from "react";
import api from "@/lib/axiosInstance";

export type PurchaseProduit = {
  produit_id: string;
  produit_nom: string;
  quantite: number;
  prix_unitaire: string;
  montant_total: string;
};

export type PurchaseCommande = {
  numero_commande: string;
  date_commande: string;
  fournisseur: string;
  status: "Brouillon" | "Envoyée" | "Confirmée" | "Reçue" | "Annulée";
  montant_total: string;
  produits: PurchaseProduit[];
};

export type PurchaseTotals = {
  nombre_commandes: number;
  commandes_draft: number;
  commandes_envoyees: number;
  commandes_recues: number;
  commandes_annulees: number;
  montant_total_commandes: number;
  montant_commandes_recues: number;
  nombre_fournisseurs: number;
};

export type PurchaseReportResponse = {
  periode: string;
  date_debut: string;
  date_fin: string;
  totals: PurchaseTotals;
  montant_en_attente: string;
  delai_moyen_livraison: string;
  commandes: PurchaseCommande[];
};

type Filters = {
  periode: "today" | "week" | "month" | "year" | "custom";
  date_debut?: string;
  date_fin?: string;
  fournisseur?: string;
  status?: string;
};

export function usePurchasesDetail() {
  const [data, setData] = useState<PurchaseReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    periode: "month",
  });

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        periode: filters.periode,
      };

      if (filters.periode === "custom") {
        if (!filters.date_debut || !filters.date_fin) {
          setError("Veuillez sélectionner une période personnalisée valide");
          setLoading(false);
          return;
        }
        params.date_debut = filters.date_debut;
        params.date_fin = filters.date_fin;
        params.periode = "custom";
      }

      if (filters.fournisseur) params.fournisseur = filters.fournisseur;
      if (filters.status) params.status = filters.status;

      const res = await api.get<PurchaseReportResponse>("/purchases/", { params });
      setData(res.data);
    } catch (err: any) {
      console.error("Erreur chargement achats:", err);
      setError(err.response?.data?.detail || "Impossible de charger le rapport achats");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return {
    data,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchPurchases,
  };
}
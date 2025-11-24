// src/hooks/useSalesDetail.ts
import { useState, useEffect } from "react";
import axios from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import type { SalesDetailResponse } from "@/types/sales-report.types";


export type Periode = "today" | "week" | "month" | "year" | "custom";

// export interface SalesDetailResponse { /* (même que avant) */ }

interface Filters {
  periode: Periode;
  point_vente?: string;
  vendeur?: string;
  date_debut?: string;
  date_fin?: string;
}

interface UseSalesDetailReturn {
  data: SalesDetailResponse | null;
  loading: boolean;
  error: string | null;
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  refetch: () => Promise<void>;
}

export function useSalesDetail(initialFilters: Partial<Filters> = {}): UseSalesDetailReturn {
  const [data, setData] = useState<SalesDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<Filters>({
    periode: "year",
    point_vente: "",
    vendeur: "",
    date_debut: "",
    date_fin: "",
    ...initialFilters,
  });

  const setFilters = (newFilters: Partial<Filters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const fetchSales = async () => {
    setLoading(true);
    setError(null);

    const params: any = {};
    if (filters.periode !== "custom") {
      params.periode = filters.periode;
    } else {
      if (filters.date_debut) params.date_debut = filters.date_debut;
      if (filters.date_fin) params.date_fin = filters.date_fin;
    }
    if (filters.point_vente) params.point_vente = filters.point_vente;
    if (filters.vendeur) params.vendeur = filters.vendeur;

    try {
      const res = await axios.get<SalesDetailResponse>("/sales/detail/", { params });
      setData(res.data);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Erreur lors du chargement";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchSales();
  };

  useEffect(() => {
    fetchSales();
  }, [filters]);

  return { data, loading, error, filters, setFilters, refetch };
}
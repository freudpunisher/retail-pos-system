// hooks/useInventoryReport.ts
import { useState, useEffect } from "react";
import api from "@/lib/axiosInstance";
import type { InventoryReportResponse } from "@/types/inventory-report.types";

type Filters = {
  periode: "today" | "week" | "month" | "year";
  point_vente?: string;
  etat?: "alerte" | "rupture" | "normal";
};

export function useInventoryReport() {
  const [data, setData] = useState<InventoryReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ periode: "month" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = { periode: filters.periode };
      if (filters.point_vente) params.point_vente = filters.point_vente;
      if (filters.etat) params.etat = filters.etat;

      const res = await api.get("/inventory/", { params });
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur chargement stock");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  return { data, loading, error, filters, setFilters, refetch: fetchData };
}
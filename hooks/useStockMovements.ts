// hooks/useStockMovements.ts
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axiosInstance"; // <-- Ton axiosInstance personnalisé
import { StockMovement, Product, PointVente, User } from "@/types/StockMovement";

// URLs de ton API
const API_ROUTES = {
  movements: "/api/mouvements-stock/",
  products: "/api/produits/",
  pointsVente: "/api/points-vente/",
  users: "/api/users/",
};

export function useStockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pointsVente, setPointsVente] = useState<PointVente[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [movementsRes, productsRes, pointsRes, usersRes] = await Promise.all([
        axiosInstance.get(API_ROUTES.movements),
        axiosInstance.get(API_ROUTES.products),
        axiosInstance.get(API_ROUTES.pointsVente),
        axiosInstance.get(API_ROUTES.users),
      ]);

      setMovements(movementsRes.data);
      setProducts(productsRes.data);
      setPointsVente(pointsRes.data);
      setUsers(usersRes.data);

      toast.success("Mouvements de stock chargés avec succès");
    } catch (err: any) {
      console.error("Erreur lors du chargement des données :", err);

      // Gestion fine des erreurs (Axios ou réseau)
      const message =
        err.response?.data?.message ||
        err.message ||
        "Erreur inconnue lors du chargement des données";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fonction pour recharger manuellement
  const refetch = () => loadData();

  return {
    movements,
    products,
    pointsVente,
    users,
    loading,
    error,
    refetch,
  };
}
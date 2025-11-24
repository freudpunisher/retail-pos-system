// app/dashboard/page.tsx  (ou app/page.tsx)
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { POSLayout } from "@/components/pos-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, DollarSign, Package, ShoppingCart, TrendingUp, Users, AlertTriangle, Receipt } from "lucide-react";
import api from "@/lib/axiosInstance";

interface DashboardData {
  kpis: {
    chiffre_affaires_ttc: number;
    nombre_ventes: number;
    panier_moyen: number;
    marge_brute: number;
    taux_marge: number;
  };
  top_produits: {
    produit__nom: string;
    produit__reference: string;
    quantite: number;
  }[];
  alertes_stock: number;
  ventes_impayees: number;
  periode: string;
  date_debut: string;
  date_fin: string;
}

const formatCurrency = (value: number) =>
  value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " FBU";

const formatDate = (date: string) =>
  format(new Date(date), "dd MMMM yyyy", { locale: fr });

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/sales/dashboard/");
        setData(res.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <POSLayout currentPath="/">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      </POSLayout>
    );
  }

  if (error || !data) {
    return (
      <POSLayout currentPath="/">
        <div className="p-8 text-center text-red-600 text-2xl">
          Impossible de charger le tableau de bord
        </div>
      </POSLayout>
    );
  }

  return (
    <POSLayout currentPath="/">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-10">
        <div className="max-w-screen-2xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-800 flex items-center gap-4">
                <TrendingUp className="h-12 w-12 text-emerald-600" />
                Tableau de Bord
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Période : du <strong>{formatDate(data.date_debut)}</strong> au <strong>{formatDate(data.date_fin)}</strong>
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg">
                <AlertCircle className="h-5 w-5 mr-2" />
                Voir les alertes
              </Button>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Nouvelle vente
              </Button>
            </div>
          </div>

          {/* KPI Cards – Super pro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-emerald-100 text-sm">Chiffre d'Affaires TTC</CardTitle>
                <DollarSign className="h-8 w-8 text-emerald-200 mt-2" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-extrabold">{formatCurrency(data?.kpis?.chiffre_affaires_ttc || 0)}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-blue-100 text-sm">Nombre de ventes</CardTitle>
                <Receipt className="h-8 w-8 text-blue-200 mt-2" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-extrabold">{data.kpis.nombre_ventes}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-indigo-100 text-sm">Panier moyen</CardTitle>
                <ShoppingCart className="h-8 w-8 text-indigo-200 mt-2" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-extrabold">{formatCurrency(data.kpis.panier_moyen)}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-100 text-sm">Marge brute</CardTitle>
                <TrendingUp className="h-8 w-8 text-purple-200 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-extrabold">{formatCurrency(data.kpis.marge_brute)}</p>
                  <Badge className="bg-purple-800 text-purple-100 text-lg">
                    {data.kpis.taux_marge.toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-orange-50 shadow-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-orange-800 text-sm flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6" />
                  Alertes critiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Ruptures de stock</span>
                    <Badge variant="destructive" className="text-lg">{data.alertes_stock}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Ventes impayées</span>
                    <Badge className="bg-orange-600 text-white text-lg">{data.ventes_impayees}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Produits + Actions rapides */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top 5 Produits */}
            <Card className="shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-2xl font-bold text-blue-800 flex items-center gap-3">
                  <Package className="h-8 w-8" />
                  Top 5 Produits Vendus
                </CardTitle>
                <CardDescription>Meilleures performances du mois</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  {data.top_produits.slice(0, 5).map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{p.produit__nom}</p>
                          <p className="text-sm text-gray-500">Ref: {p.produit__reference}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">{p.quantite}</p>
                        <p className="text-sm text-gray-500">unités</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card className="shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardTitle className="text-2xl font-bold text-emerald-800">
                  Actions rapides
                </CardTitle>
                <CardDescription>Opérations fréquentes</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <Button size="lg" className="h-24 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700">
                    <ShoppingCart className="h-8 w-8 mb-2" />
                    Nouvelle vente
                  </Button>
                  <Button size="lg" variant="outline" className="h-24 text-lg font-semibold border-2">
                    <Package className="h-8 w-8 mb-2" />
                    Commande achat
                  </Button>
                  <Button size="lg" variant="outline" className="h-24 text-lg font-semibold border-2">
                    <AlertTriangle className="h-8 w-8 mb-2" />
                    Voir ruptures
                  </Button>
                  <Button size="lg" variant="outline" className="h-24 text-lg font-semibold border-2">
                    <DollarSign className="h-8 w-8 mb-2" />
                    Clôture caisse
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message final */}
          <div className="text-center py-8">
            <p className="text-gray-600 text-lg">
              Système POS Retail • Société Commerciale du Burundi
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Dernière mise à jour : {format(new Date(), "dd MMMM yyyy à HH:mm", { locale: fr })}
            </p>
          </div>
        </div>
      </div>
    </POSLayout>
  );
}
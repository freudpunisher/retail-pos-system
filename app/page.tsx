// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { POSLayout } from "@/components/pos-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle, Package } from "lucide-react";
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
  value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " FC";

const formatDate = (date: string) =>
  format(new Date(date), "dd MMMM yyyy", { locale: fr });

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/sales/dashboard/");
        setData(res.data);
      } catch (err) {
        console.error(err);
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-600"></div>
        </div>
      </POSLayout>
    );
  }

  if (!data) {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6 lg:p-10 transition-colors">
        <div className="max-w-screen-2xl mx-auto space-y-10">

          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-4">
                <TrendingUp className="h-12 w-12 text-emerald-500" />
                Tableau de Bord
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                Période : du <strong>{formatDate(data.date_debut)}</strong> au <strong>{formatDate(data.date_fin)}</strong>
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" size="lg" className="border-2">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Alertes ({data.alertes_stock + data.ventes_impayees})
              </Button>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Nouvelle vente
              </Button>
            </div>
          </div>

          {/* KPI Cards – Magnifiques en light & dark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* CA TTC */}
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white shadow-2xl border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-emerald-50 text-sm">Chiffre d'Affaires TTC</CardTitle>
                <DollarSign className="h-9 w-9 text-emerald-200 mt-2" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-extrabold">{formatCurrency(data.kpis.chiffre_affaires_ttc || 0)}</p>
              </CardContent>
            </Card>

            {/* Nombre de ventes */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-2xl border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-blue-50 text-sm">Nombre de ventes</CardTitle>
                <Package className="h-9 w-9 text-blue-200 mt-2" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-extrabold">{data.kpis.nombre_ventes}</p>
              </CardContent>
            </Card>

            {/* Panier moyen */}
            <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white shadow-2xl border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-indigo-50 text-sm">Panier moyen</CardTitle>
                <ShoppingCart className="h-9 w-9 text-indigo-200 mt-2" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-extrabold">{formatCurrency(data.kpis.panier_moyen)}</p>
              </CardContent>
            </Card>

            {/* Marge brute */}
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white shadow-2xl border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-50 text-sm">Marge brute</CardTitle>
                <TrendingUp className="h-9 w-9 text-purple-200 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-extrabold">{formatCurrency(data.kpis.marge_brute)}</p>
                  <Badge className="bg-white/20 text-white text-lg backdrop-blur">
                    {data.kpis.taux_marge.toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Alertes critiques */}
            <Card className="bg-orange-50 dark:bg-orange-900/50 border-2 border-orange-300 dark:border-orange-700 shadow-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-orange-800 dark:text-orange-200 text-sm flex items-center gap-2">
                  <AlertTriangle className="h-7 w-7" />
                  Alertes critiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Ruptures de stock</span>
                  <Badge variant="destructive" className="text-lg">{data.alertes_stock}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Ventes impayées</span>
                  <Badge className="bg-orange-600 dark:bg-orange-500 text-white text-lg">{data.ventes_impayees}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top 5 Produits – Pleine largeur */}
          <Card className="shadow-2xl border-0 bg-white dark:bg-slate-900">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-t-xl">
              <CardTitle className="text-3xl font-bold text-blue-800 dark:text-blue-300 flex items-center gap-4">
                <Package className="h-10 w-10" />
                Top 5 Produits Vendus
              </CardTitle>
              <p className="text-lg text-gray-600 dark:text-gray-400">Meilleures performances du mois</p>
            </CardHeader>
            <CardContent className="pt-8 pb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {data.top_produits.slice(0, 5).map((p, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center text-2xl font-bold shadow-xl">
                        {i + 1}
                      </div>
                      <Badge variant="secondary" className="text-sm">
                        {p.produit__reference}
                      </Badge>
                    </div>
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-100 line-clamp-2">
                      {p.produit__nom}
                    </p>
                    <div className="mt-4">
                      <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        {p.quantite}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">unités vendues</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center py-10 border-t border-slate-200 dark:border-slate-700">
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
              Système POS Retail • Société Commerciale du Burundi
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Dernière mise à jour : {format(new Date(), "dd MMMM yyyy à HH:mm", { locale: fr })}
            </p>
          </div>
        </div>
      </div>
    </POSLayout>
  );
}
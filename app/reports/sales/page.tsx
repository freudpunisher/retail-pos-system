// src/app/(protected)/sales/detail/page.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useSalesDetail } from "@/hooks/useSalesDetail";
import { POSLayout } from "@/components/pos-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Calendar, DollarSign, ShoppingCart, Receipt, TrendingUp, User, Printer, Filter } from "lucide-react";

export default function SalesDetailPage() {
  const { data, loading, error, filters, setFilters, refetch } = useSalesDetail();

  const formatDate = (d: string) => format(new Date(d), "dd MMMM yyyy à HH:mm", { locale: fr });
  const formatCurrency = (v: number) => v.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " FBU";

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin text-blue-600" /></div>;
  if (error || !data) return <div className="p-8 text-red-600 text-center">Erreur : {error}</div>;

  return (
    <POSLayout currentPath="/sales/detail">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 print:bg-white print:text-black">
        <div className="p-8 space-y-8 max-w-screen-2xl mx-auto print:p-4">

          {/* Header + Filtres + Print */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 print:shadow-none print:border-none">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-8">
                <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl shadow-2xl print:hidden">
                  <TrendingUp className="h-20 w-20 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent print:text-black">
                    Rapport de Ventes Détaillé
                  </h1>
                  <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-400 mt-3 print:text-black">
                    Du {formatDate(data.date_debut)} au {formatDate(data.date_fin)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 print:hidden">
                <Button onClick={handlePrint} size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  <Printer className="h-6 w-6 mr-3" />
                  Imprimer / PDF
                </Button>
              </div>
            </div>

            {/* Filtres Avancés */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-10 print:hidden">
              <div>
                <Label>Période</Label>
                <Select value={filters.periode} onValueChange={(v) => setFilters({ periode: v as any, date_debut: "", date_fin: "" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Aujourd'hui</SelectItem>
                    <SelectItem value="week">Cette semaine</SelectItem>
                    <SelectItem value="month">Ce mois</SelectItem>
                    <SelectItem value="year">Cette année</SelectItem>
                    <SelectItem value="custom">Personnalisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filters.periode === "custom" && (
                <>
                  <div>
                    <Label>Date début</Label>
                    <Input type="date" value={filters.date_debut} onChange={e => setFilters({ date_debut: e.target.value })} />
                  </div>
                  <div>
                    <Label>Date fin</Label>
                    <Input type="date" value={filters.date_fin} onChange={e => setFilters({ date_fin: e.target.value })} />
                  </div>
                </>
              )}

              <div>
                <Label>Point de vente</Label>
                <Select value={filters.point_vente} onValueChange={v => setFilters({ point_vente: v || undefined })}>
                  <SelectTrigger><SelectValue placeholder="Tous" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous</SelectItem>
                    {/* Tu peux remplir dynamiquement avec usePointsVente() */}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Vendeur</Label>
                <Select value={filters.vendeur} onValueChange={v => setFilters({ vendeur: v || undefined })}>
                  <SelectTrigger><SelectValue placeholder="Tous" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous</SelectItem>
                    {/* Tu peux remplir dynamiquement avec useUsers() */}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 print:grid-cols-4">
            {/* Même cards que avant */}
            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-2xl print:bg-blue-600">
              <CardContent className="pt-8">
                <p className="text-blue-100 text-lg print:text-white">CA TTC</p>
                <p className="text-4xl lg:text-5xl font-extrabold mt-2 print:text-white">
                  {formatCurrency(data.totals.total_ttc)}
                </p>
              </CardContent>
            </Card>
            {/* ... autres cards */}
          </div>

          {/* Tableau */}
          <Card className="shadow-2xl print:shadow-none">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 print:bg-blue-100">
              <CardTitle className="text-3xl font-bold print:text-black">
                Détail des Ventes ({data.ventes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                {/* Même tableau que avant */}
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Styles d'impression */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:bg-white, .print\\:bg-white * { visibility: visible; }
          .print\\:bg-white { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </POSLayout>
  );
}
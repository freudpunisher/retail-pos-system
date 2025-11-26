// app/reports/inventory/page.tsx
"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useReactToPrint } from "react-to-print";
import { useInventoryReport } from "@/hooks/useInventoryReport";
import { POSLayout } from "@/components/pos-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Package, Printer, AlertTriangle, CheckCircle, TrendingUp, Warehouse } from "lucide-react";

export default function InventoryReportPage() {
  const { data, loading, error, filters, setFilters } = useInventoryReport();
  const printRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const formatDate = (d: string) => format(new Date(d), "dd MMMM yyyy à HH:mm", { locale: fr });
  const formatCurrency = (v: number | string) => {
    const num = typeof v === "string" ? parseFloat(v) : v;
    return isNaN(num) ? "0,00" : num.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " FC";
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Rapport_Stock_${format(new Date(), "yyyy-MM-dd")}`,
    pageStyle: `
      @page { size: A4 portrait; margin: 1.5cm; }
      @media print { 
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .no-print { display: none !important; }
      }
    `,
  });

  if (loading) {
    return (
      <POSLayout currentPath="/reports/inventory">
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mx-auto mb-6" />
            <p className="text-xl text-slate-600 dark:text-slate-400">Chargement du rapport d'inventaire...</p>
          </div>
        </div>
      </POSLayout>
    );
  }

  if (error || !data) {
    return (
      <POSLayout currentPath="/reports/inventory">
        <div className="p-12 text-center">
          <div className="text-red-600 text-3xl font-bold">Erreur de chargement</div>
          <p className="text-slate-600 dark:text-slate-400 mt-4">{error || "Impossible de charger le rapport stock"}</p>
        </div>
      </POSLayout>
    );
  }

  const produits = data.details_produits;
  const paginated = produits.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(produits.length / pageSize);

  return (
    <POSLayout currentPath="/reports/inventory">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="p-6 space-y-8 max-w-screen-2xl mx-auto">

          {/* === HEADER PREMIUM === */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="p-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl">
                  <Warehouse className="h-14 w-14 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">
                    Rapport d'Inventaire & Stock
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 flex items-center">
                    Du {formatDate(data.periode.debut)} au {formatDate(data.periode.fin)}
                  </p>
                </div>
              </div>
              <Button
                onClick={handlePrint}
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl no-print"
              >
                <Printer className="h-6 w-6 mr-3" />
                Imprimer le rapport
              </Button>
            </div>
          </div>

          {/* === KPI CARDS MAGNIFIQUES === */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-xl border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100">Produits total</p>
                    <p className="text-4xl font-extrabold mt-2">{data.totaux.produits_total}</p>
                  </div>
                  <Package className="h-12 w-12 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-xl border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100">En stock</p>
                    <p className="text-4xl font-extrabold mt-2">{data.totaux.en_stock}</p>
                  </div>
                  <CheckCircle className="h-12 w-12 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-xl border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">En alerte</p>
                    <p className="text-4xl font-extrabold mt-2">{data.totaux.alerte}</p>
                  </div>
                  <AlertTriangle className="h-12 w-12 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-xl border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100">En rupture</p>
                    <p className="text-4xl font-extrabold mt-2">{data.totaux.rupture}</p>
                  </div>
                  <Package className="h-12 w-12 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* === VALEURS GLOBALES === */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-xl border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 flex items-center gap-2">
                      <TrendingUp className="h-6 w-6" /> Valeur d'achat totale
                    </p>
                    <p className="text-4xl font-extrabold mt-3">{formatCurrency(data.valeurs.valeur_achat)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-xl border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100">Valeur de vente totale</p>
                    <p className="text-4xl font-extrabold mt-3">{formatCurrency(data.valeurs.valeur_vente)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-xl border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Marge potentielle</p>
                    <p className="text-4xl font-extrabold mt-3">{formatCurrency(data.valeurs.marge_potentielle)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* === FILTRES + TABLEAU === */}
          <Card className="shadow-2xl border-0 overflow-hidden bg-white/95 dark:bg-slate-800/95 backdrop-blur">
            <CardHeader className="bg-blue-to-r from-blue-50 to-cyan-50 dark:from-indigo-900/20">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                <CardTitle className="text-3xl font-bold flex items-center gap-3 text-indigo-700 dark:text-indigo-300">
                  <Package className="h-10 w-10" />
                  État du stock détaillé ({produits.length} produits)
                </CardTitle>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full lg:w-auto">
                  <div>
                    <Label className="text-lg font-semibold">Période</Label>
                    <Select value={filters.periode} onValueChange={(v) => setFilters({ periode: v as any })}>
                      <SelectTrigger className="h-12 text-lg"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Aujourd'hui</SelectItem>
                        <SelectItem value="week">Cette semaine</SelectItem>
                        <SelectItem value="month">Ce mois</SelectItem>
                        <SelectItem value="year">Cette année</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-lg font-semibold">Point de vente</Label>
                    <Select value={filters.point_vente || ""} onValueChange={v => setFilters({ ...filters, point_vente: v || undefined })}>
                      <SelectTrigger className="h-12 text-lg"><SelectValue placeholder="Tous" /></SelectTrigger>
                      <SelectContent><SelectItem value="none">Tous</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-lg font-semibold">État du stock</Label>
                    <Select value={filters.etat ?? "none"} onValueChange={v => setFilters({ ...filters, etat: v === "none" ? undefined : (v as "alerte" | "rupture" | "normal") })}>
                      <SelectTrigger className="h-12 text-lg"><SelectValue placeholder="Tous" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tous</SelectItem>
                        <SelectItem value="alerte">En alerte</SelectItem>
                        <SelectItem value="rupture">En rupture</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-indigo-50 dark:bg-indigo-900/30">
                    <TableHead className="font-bold text-indigo-700 dark:text-indigo-300">Produit</TableHead>
                    <TableHead className="font-bold">Point de vente</TableHead>
                    <TableHead className="font-bold text-center">Stock actuel</TableHead>
                    <TableHead className="font-bold text-center">Stock minimum</TableHead>
                    <TableHead className="font-bold text-right">Valeur achat</TableHead>
                    <TableHead className="font-bold text-right">Valeur vente</TableHead>
                    <TableHead className="font-bold text-center">État</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((p, i) => (
                    <TableRow key={i} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all h-16">
                      <TableCell className="font-medium text-slate-800 dark:text-slate-200">{p.produit}</TableCell>
                      <TableCell>{p.point_vente || "—"}</TableCell>
                      <TableCell className="text-center font-mono text-lg font-bold">{p.quantite}</TableCell>
                      <TableCell className="text-center text-slate-600">{p.stock_minimum}</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.valeur_achat)}</TableCell>
                      <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                        {formatCurrency(p.valeur_vente)}
                      </TableCell>
                      <TableCell className="text-center">
                        {p.rupture ? (
                          <Badge className="bg-red-600 text-white text-lg px-4 py-1">RUPTURE</Badge>
                        ) : p.alerte ? (
                          <Badge className="bg-orange-600 text-white text-lg px-4 py-1">ALERTE</Badge>
                        ) : (
                          <Badge className="bg-emerald-600 text-white text-lg px-4 py-1">OK</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between p-6 border-t bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <span>Lignes par page</span>
                  <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                    <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>{((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, produits.length)} sur {produits.length}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Précédent</Button>
                  <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Suivant</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* === IMPRESSION OFFICIELLE === */}
          <div className="hidden">
            <div ref={printRef} className="bg-white p-10 text-black">
              <div className="text-center border-b-2 border-black pb-6 mb-8">
                <h1 className="text-2xl font-bold">SOCIÉTÉ COMERCIALE DU BURUNDI</h1>
                <h2 className="text-xl font-bold mt-2">RAPPORT D'INVENTAIRE & STOCK</h2>
                <p className="mt-4 text-lg">
                  Période : du <strong>{formatDate(data.periode.debut)}</strong> au <strong>{formatDate(data.periode.fin)}</strong>
                </p>
                <p className="text-sm mt-2">Imprimé le {format(new Date(), "dd MMMM yyyy à HH:mm", { locale: fr })}</p>
              </div>

              {/* Stats récapitulatives */}
              <div className="grid grid-cols-3 gap-6 mb-10">
                <div className="border-4 border-black p-6 text-center bg-gradient-to-br from-blue-100 to-blue-200">
                  <p className="font-bold text-xl">Valeur d'achat totale</p>
                  <p className="text-3xl font-extrabold text-blue-800 mt-2">{formatCurrency(data.valeurs.valeur_achat)}</p>
                </div>
                <div className="border-4 border-black p-6 text-center bg-gradient-to-br from-emerald-100 to-emerald-200">
                  <p className="font-bold text-xl">Valeur de vente totale</p>
                  <p className="text-3xl font-extrabold text-emerald-800 mt-2">{formatCurrency(data.valeurs.valeur_vente)}</p>
                </div>
                <div className="border-4 border-black p-6 text-center bg-gradient-to-br from-purple-100 to-purple-200">
                  <p className="font-bold text-xl">Marge potentielle</p>
                  <p className="text-3xl font-extrabold text-purple-800 mt-2">{formatCurrency(data.valeurs.marge_potentielle)}</p>
                </div>
              </div>

              {/* Tableau complet */}
              <table className="w-full border-2 border-black text-sm">
                <thead>
                  <tr className="bg-gray-300">
                    <th className="border border-black p-3 text-left font-bold">Produit</th>
                    <th className="border border-black p-3 font-bold">Point de vente</th>
                    <th className="border border-black p-3 text-center font-bold">Stock</th>
                    <th className="border border-black p-3 text-center font-bold">Min</th>
                    <th className="border border-black p-3 text-right font-bold">Valeur achat</th>
                    <th className="border border-black p-3 text-right font-bold">Valeur vente</th>
                    <th className="border border-black p-3 text-center font-bold">État</th>
                  </tr>
                </thead>
                <tbody>
                  {produits.map((p, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-black p-3 font-medium">{p.produit}</td>
                      <td className="border border-black p-3">{p.point_vente || "—"}</td>
                      <td className="border border-black p-3 text-center font-mono text-lg">{p.quantite}</td>
                      <td className="border border-black p-3 text-center">{p.stock_minimum}</td>
                      <td className="border border-black p-3 text-right">{formatCurrency(p.valeur_achat)}</td>
                      <td className="border border-black p-3 text-right font-bold text-emerald-700">{formatCurrency(p.valeur_vente)}</td>
                      <td className="border border-black p-3 text-center font-bold">
                        {p.rupture ? "RUPTURE" : p.alerte ? "ALERTE" : "OK"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-12 text-center text-sm border-t-2 border-black pt-6">
                <p className="font-bold">Rapport généré automatiquement par le système POS Retail - Module Stock</p>
                <p className="mt-3 text-lg">© 2025 Société Commerciale du Burundi - Tous droits réservés</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </POSLayout>
  );
}
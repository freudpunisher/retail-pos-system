// app/reports/sales/page.tsx
"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useReactToPrint } from "react-to-print";
import { useSalesDetail } from "@/hooks/useSalesDetail";
import { POSLayout } from "@/components/pos-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, TrendingUp, Receipt, Printer, ChevronDown, ChevronUp, User, DollarSign, FileText, Package, Search } from "lucide-react";
import React from "react";

export default function SalesDetailPage() {
  const { data, loading, error, filters, setFilters } = useSalesDetail();
  const printRef = useRef<HTMLDivElement>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState(""); // ← Nouveau champ recherche

  const formatDate = (d: string) => format(new Date(d), "dd MMMM yyyy à HH:mm", { locale: fr });
  const formatCurrency = (v: number) => v.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " FC";

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Rapport_Ventes_${format(new Date(), "yyyy-MM-dd")}`,
    pageStyle: `
      @page { size: A4; margin: 1.5cm; }
      @media print { 
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .no-print { display: none !important; }
      }
    `,
  });

  if (loading) {
    return (
      <POSLayout currentPath="/reports/sales">
        <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-emerald-600 dark:text-emerald-500 mx-auto mb-6" />
            <p className="text-xl text-gray-600 dark:text-gray-400">Chargement du rapport de ventes...</p>
          </div>
        </div>
      </POSLayout>
    );
  }

  if (error || !data) {
    return (
      <POSLayout currentPath="/reports/sales">
        <div className="p-12 text-center">
          <div className="text-red-600 dark:text-red-500 text-3xl font-bold">Erreur de chargement</div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">{error}</p>
        </div>
      </POSLayout>
    );
  }

  // === RECHERCHE + FILTRES ===
  const filteredVentes = data.ventes.filter(vente => {
    const query = searchQuery.toLowerCase();
    return (
      vente.numero_facture.toLowerCase().includes(query) ||
      (vente.client_nom || "").toLowerCase().includes(query)
    );
  });

  const paginatedVentes = filteredVentes.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredVentes.length / pageSize);

  return (
    <POSLayout currentPath="/reports/sales">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 mx-auto ">

          {/* === HEADER === */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    Rapport de Ventes Détaillé
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Du {formatDate(data.date_debut)} au {formatDate(data.date_fin)}
                  </p>
                </div>
              </div>
              <Button
                onClick={handlePrint}
                size="lg"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 no-print"
              >
                <Printer className="h-5 w-5 mr-2" />
                Imprimer le rapport
              </Button>
            </div>
          </div>

          {/* === KPI CARDS (inchangées) === */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CA TTC</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {formatCurrency(data.totals.total_ttc)}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Les 3 autres cards restent IDENTIQUES */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nombre de ventes</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {data.totals.total_ventes}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <Receipt className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Articles vendus</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {data.totals.total_articles}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">TVA collectée</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {formatCurrency(data.totals.total_tva)}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* === FILTRES AMÉLIORÉS (ton design exact) === */}
          <Card className="shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
            <CardHeader className="bg-green-50 dark:bg-gray-900/50 border-b border-green-200 dark:border-gray-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Search className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  <div className="relative flex-1">
                    <Input
                      placeholder="Rechercher par facture ou client..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                    <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <Label>Du</Label>
                    <Input
                      type="date"
                      value={filters.date_debut || ""}
                      onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label>Au</Label>
                    <Input
                      type="date"
                      value={filters.date_fin || ""}
                      onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label>Point de vente</Label>
                    <Select value={filters.point_vente || ""} onValueChange={(v) => setFilters({ ...filters, point_vente: v || undefined })}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="Tous" /></SelectTrigger>
                      <SelectContent><SelectItem value="none">Tous</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Vendeur</Label>
                    <Select value={filters.vendeur || ""} onValueChange={(v) => setFilters({ ...filters, vendeur: v || undefined })}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="Tous" /></SelectTrigger>
                      <SelectContent><SelectItem value="none">Tous</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* === TABLEAU (inchangé, juste avec filteredVentes) === */}
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                      <TableHead className="w-10"></TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Facture</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Date</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Client</TableHead>
                      <TableHead className="font-semibold text-center text-gray-700 dark:text-gray-300">Articles</TableHead>
                      <TableHead className="font-semibold text-right text-gray-700 dark:text-gray-300">Montant TTC</TableHead>
                      <TableHead className="font-semibold text-center text-gray-700 dark:text-gray-300">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedVentes.map((vente) => (
                      <React.Fragment key={vente.numero_facture}>
                        <TableRow
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                          onClick={() => setExpandedRow(expandedRow === vente.numero_facture ? null : vente.numero_facture)}
                        >
                          <TableCell>
                            {expandedRow === vente.numero_facture ? <ChevronUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> : <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />}
                          </TableCell>
                          <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {vente.numero_facture}
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">
                            {formatDate(vente.date_vente)}
                          </TableCell>
                          <TableCell className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            {vente.client_nom || "Client passage"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              {vente.nombre_articles}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(Number(vente.montant_ttc))}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={vente.payment_status === "Payé" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"}>
                              {vente.payment_status}
                            </Badge>
                          </TableCell>
                        </TableRow>

                        {expandedRow === vente.numero_facture && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-gray-50 dark:bg-gray-900/50 border-t border-b border-gray-200 dark:border-gray-700">
                              <div className="p-6">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Articles vendus</h4>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-white dark:bg-gray-800">
                                      <TableHead className="text-gray-700 dark:text-gray-300">Produit</TableHead>
                                      <TableHead className="text-center text-gray-700 dark:text-gray-300">Qté</TableHead>
                                      <TableHead className="text-right text-gray-700 dark:text-gray-300">Prix HT</TableHead>
                                      <TableHead className="text-right text-gray-700 dark:text-gray-300">TVA %</TableHead>
                                      <TableHead className="text-right text-gray-700 dark:text-gray-300">Remise %</TableHead>
                                      <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">Total TTC</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {vente.produits.map((p, i) => (
                                      <TableRow key={i} className="border-b border-gray-200 dark:border-gray-700">
                                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{p.produit_nom}</TableCell>
                                        <TableCell className="text-center font-semibold text-gray-700 dark:text-gray-300">{p.quantite}</TableCell>
                                        <TableCell className="text-right text-gray-700 dark:text-gray-300">{formatCurrency(Number(p.prix_unitaire_ht))}</TableCell>
                                        <TableCell className="text-right text-gray-700 dark:text-gray-300">{p.taux_tva}</TableCell>
                                        <TableCell className="text-right text-gray-700 dark:text-gray-300">{p.remise_pourcentage}</TableCell>
                                        <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                          {formatCurrency(Number(p.montant_ttc))}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination (inchangée) */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 gap-4">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Lignes par page</span>
                  <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                    <SelectTrigger className="w-20 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>{((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, filteredVentes.length)} sur {filteredVentes.length}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    Précédent
                  </Button>
                  <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    Suivant
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

         
          

          
{/* === BLOC D'IMPRESSION - VERSION TICKET VERTICAL (SANS KPI) === */}

 {/* === BLOC D'IMPRESSION - VERSION TICKET VERTICAL (SANS KPI) === */}
<div className="hidden">
  <div ref={printRef} className="bg-white p-8 text-black font-sans">

    {/* EN-TÊTE RAPPORT */}
    <div className="text-center pb-6 border-b-4 border-gray-900 mb-10">
      <h1 className="text-4xl font-bold uppercase tracking-wider">Rapport de Ventes Détaillé</h1>
      <p className="text-xl mt-5">
        Période du <strong>{format(new Date(data.date_debut), "dd MMMM yyyy", { locale: fr })}</strong> au <strong>{format(new Date(data.date_fin), "dd MMMM yyyy", { locale: fr })}</strong>
      </p>
      <p className="text-lg mt-3 text-gray-600">
        Imprimé le {format(new Date(), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
      </p>
    </div>

    {/* TOUTES LES VENTES - FORMAT VERTICAL TYPE TICKET */}
    <div className="space-y-12">
      {data.ventes.map((vente, index) => (
        <div key={vente.numero_facture} className="border-2 border-gray-900">

          {/* === Ligne principale - Format vertical (comme un vrai ticket) === */}
          <div className="bg-gray-100 p-6 text-center space-y-3">
            <div className="text-3xl font-bold text-emerald-700">
              {vente.numero_facture}
            </div>
            <div className="text-lg font-semibold">
              {formatDate(vente.date_vente)}
            </div>
            <div className="text-lg">
              <span className="font-medium">Client :</span> {vente.client_nom || "Client passage"}
            </div>
            <div className="text-lg font-medium">
              {vente.nombre_articles} article{vente.nombre_articles > 1 ? 's' : ''} vendu{vente.nombre_articles > 1 ? 's' : ''}
            </div>
            <div className="text-4xl font-extrabold text-emerald-600 mt-4">
              {formatCurrency(Number(vente.montant_ttc))}
            </div>
            <div className="mt-3">
              <span className={`
                inline-block px-6 py-2 rounded-full text-white font-bold text-lg
                ${vente.payment_status === "Payé" ? "bg-emerald-600" : "bg-orange-600"}
              `}>
                {vente.payment_status}
              </span>
            </div>
          </div>

          {/* === Détail des articles en tableau === */}
          <div className="p-4 bg-white">
            <table className="w-full text-sm border-t-2 border-gray-900">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-900">
                  <th className="text-left py-3 px-4 font-bold">Produit</th>
                  <th className="text-center py-3 px-4 font-bold w-20">Qté</th>
                  <th className="text-right py-3 px-4 font-bold w-32">Prix HT</th>
                  <th className="text-right py-3 px-4 font-bold w-24">TVA</th>
                  <th className="text-right py-3 px-4 font-bold w-32">Remise</th>
                  <th className="text-right py-3 px-4 font-bold w-36">Total TTC</th>
                </tr>
              </thead>
              <tbody>
                {vente.produits.map((p, i) => (
                  <tr key={i} className="border-b border-gray-300">
                    <td className="py-3 px-4 font-medium">{p.produit_nom}</td>
                    <td className="py-3 px-4 text-center font-bold">{p.quantite}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(Number(p.prix_unitaire_ht))}</td>
                    <td className="py-3 px-4 text-right">{p.taux_tva}%</td>
                    <td className="py-3 px-4 text-right text-red-600">
                      {Number(p.remise_pourcentage) > 0 ? `-${p.remise_pourcentage}%` : "-"}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      {formatCurrency(Number(p.montant_ttc))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Séparateur entre ventes */}
          {index < data.ventes.length - 1 && (
            <div className="my-8 border-t-4 border-dashed border-gray-600"></div>
          )}
        </div>
      ))}
    </div>

    {/* PIED DE PAGE */}
    <div className="mt-16 pt-8 border-t-4 border-gray-900 text-center">
      <p className="text-xl font-bold">Rapport généré automatiquement par le système POS</p>
      <p className="mt-3 text-gray-600 text-lg">
        © 2025 - Société Commerciale du Burundi - Tous droits réservés
      </p>
    </div>

  </div>
</div>
        </div>
      </div>
    </POSLayout>
  );
}
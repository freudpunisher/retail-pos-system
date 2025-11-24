// app/reports/sales/page.tsx
"use client";

import { useRef, useState, useMemo } from "react";
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
import { Loader2, TrendingUp, Receipt, Printer, ChevronDown, ChevronUp, User, DollarSign } from "lucide-react";
import type { SalesDetailResponse } from "@/types/sales-report.types";
import React from "react";

export default function SalesDetailPage() {
  const { data, loading, error, filters, setFilters } = useSalesDetail();
  const printRef = useRef<HTMLDivElement>(null);

  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const formatDate = (d: string) => format(new Date(d), "dd MMMM yyyy à HH:mm", { locale: fr });
  const formatCurrency = (v: number | string) => {
    const num = typeof v === "string" ? parseFloat(v) : v;
    return isNaN(num) ? "0.00" : num.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " FBU";
  };

  // react-to-print – même style que ton exemple adhérents
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Rapport_Ventes_${format(new Date(), "yyyy-MM-dd")}`,
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
      <POSLayout currentPath="/reports/sales">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
        </div>
      </POSLayout>
    );
  }

  if (error || !data) {
    return (
      <POSLayout currentPath="/reports/sales">
        <div className="p-8 text-center text-red-600 text-2xl">Erreur : {error}</div>
      </POSLayout>
    );
  }

  const ventes = data.ventes;
  const paginatedVentes = ventes.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(ventes.length / pageSize);

  return (
    <POSLayout currentPath="/reports/sales">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="p-8 space-y-8 max-w-screen-2xl mx-auto">

          {/* Bouton Imprimer */}
          <div className="flex justify-end no-print">
            <Button onClick={handlePrint} size="lg" className="bg-emerald-600 hover:bg-emerald-700 shadow-xl">
              <Printer className="h-6 w-6 mr-3" />
              Imprimer le rapport
            </Button>
          </div>

          {/* === AFFICHAGE ÉCRAN (avec filtres, expandable, pagination) === */}
          <div className="no-print space-y-8">
            {/* Header + Stats */}
            <Card className="shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-blue-600 rounded-2xl">
                      <TrendingUp className="h-16 w-16 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-extrabold text-blue-700">Rapport de Ventes Détaillé</h1>
                      <p className="text-xl text-slate-600 mt-2">
                        Du {formatDate(data.date_debut)} au {formatDate(data.date_fin)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-xl shadow-lg">
                    <p className="text-blue-100">CA TTC</p>
                    <p className="text-4xl font-extrabold mt-2">{formatCurrency(data.totals.total_ttc)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                    <p className="text-emerald-100">Ventes</p>
                    <p className="text-4xl font-extrabold mt-2">{data.totals.total_ventes}</p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-6 rounded-xl shadow-lg">
                    <p className="text-indigo-100">Articles</p>
                    <p className="text-4xl font-extrabold mt-2">{data.totals.total_articles}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-6 rounded-xl shadow-lg">
                    <p className="text-purple-100">TVA</p>
                    <p className="text-4xl font-extrabold mt-2">{formatCurrency(data.totals.total_tva)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filtres + Tableau */}
            <Card className="shadow-2xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                  <CardTitle className="text-3xl font-bold flex items-center gap-3">
                    <Receipt className="h-10 w-10 text-blue-700" />
                    Détail des Ventes ({ventes.length})
                  </CardTitle>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full lg:w-auto">
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
                        <div><Label>Début</Label><Input type="date" value={filters.date_debut || ""} onChange={e => setFilters({ date_debut: e.target.value })} /></div>
                        <div><Label>Fin</Label><Input type="date" value={filters.date_fin || ""} onChange={e => setFilters({ date_fin: e.target.value })} /></div>
                      </>
                    )}
                    <div>
                      <Label>Point de vente</Label>
                      <Select value={filters.point_vente || ""} onValueChange={v => setFilters({ point_vente: v || undefined })}>
                        <SelectTrigger><SelectValue placeholder="Tous" /></SelectTrigger>
                        <SelectContent><SelectItem value="none">Tous</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Vendeur</Label>
                      <Select value={filters.vendeur || ""} onValueChange={v => setFilters({ vendeur: v || undefined })}>
                        <SelectTrigger><SelectValue placeholder="Tous" /></SelectTrigger>
                        <SelectContent><SelectItem value="none">Tous</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50 dark:bg-blue-900/30">
                      <TableHead className="w-10"></TableHead>
                      <TableHead className="font-bold">Facture</TableHead>
                      <TableHead className="font-bold">Date</TableHead>
                      <TableHead className="font-bold">Client</TableHead>
                      <TableHead className="font-bold text-center">Articles</TableHead>
                      <TableHead className="font-bold text-right">Montant TTC</TableHead>
                      <TableHead className="font-bold text-center">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedVentes.map((vente) => (
                      <>
                        <TableRow
                          key={vente.numero_facture}
                          className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 cursor-pointer h-16"
                          onClick={() => setExpandedRow(expandedRow === vente.numero_facture ? null : vente.numero_facture)}
                        >
                          <TableCell>{expandedRow === vente.numero_facture ? <ChevronUp className="h-5 w-5 text-blue-600" /> : <ChevronDown className="h-5 w-5 text-blue-600" />}</TableCell>
                          <TableCell className="font-bold text-blue-700">{vente.numero_facture}</TableCell>
                          <TableCell>{formatDate(vente.date_vente)}</TableCell>
                          <TableCell className="flex items-center gap-2"><User className="h-4 w-4" /> {vente.client_nom}</TableCell>
                          <TableCell className="text-center"><Badge variant="secondary">{vente.nombre_articles}</Badge></TableCell>
                          <TableCell className="text-right font-bold text-emerald-600 text-lg">{formatCurrency(vente.montant_ttc)}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={vente.payment_status === "Payé" ? "bg-emerald-500 text-white" : "bg-orange-500 text-white"}>
                              {vente.payment_status}
                            </Badge>
                          </TableCell>
                        </TableRow>

                        {expandedRow === vente.numero_facture && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-blue-50/30 dark:bg-blue-900/20">
                              <div className="p-6">
                                <h4 className="font-bold text-lg mb-4 text-blue-700">Articles vendus</h4>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Produit</TableHead>
                                      <TableHead className="text-center">Qté</TableHead>
                                      <TableHead className="text-right">Prix HT</TableHead>
                                      <TableHead className="text-right">TVA</TableHead>
                                      <TableHead className="text-right">Remise</TableHead>
                                      <TableHead className="text-right font-bold">Total TTC</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {vente.produits.map((p, i) => (
                                      <TableRow key={i}>
                                        <TableCell className="font-medium">{p.produit_nom}</TableCell>
                                        <TableCell className="text-center">{p.quantite}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(p.prix_unitaire_ht)}</TableCell>
                                        <TableCell className="text-right">{p.taux_tva}%</TableCell>
                                        <TableCell className="text-right">{p.remise_pourcentage}%</TableCell>
                                        <TableCell className="text-right font-bold text-emerald-600">{formatCurrency(p.montant_ttc)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between p-6 border-t bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>Lignes par page</span>
                    <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                      <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span>{((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, ventes.length)} sur {ventes.length}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Précédent</Button>
                    <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Suivant</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* === VERSION À IMPRIMER – DÉTAIL + RÉCAPITULATIF FINAL === */}
        <div className="hidden">
          <div ref={printRef} className="bg-white p-10 text-black">

            {/* En-tête */}
            <div className="text-center border-b-2 border-black pb-6 mb-8">
              <h1 className="text-2xl font-bold">SOCIÉTÉ COMERCIALE DU BURUNDI</h1>
              <h2 className="text-xl font-bold mt-2">RAPPORT DES VENTES DÉTAILLÉES</h2>
              <p className="mt-4 text-lg">
                Période : du <strong>{formatDate(data.date_debut)}</strong> au <strong>{formatDate(data.date_fin)}</strong>
              </p>
              <p className="text-sm mt-2">Imprimé le {format(new Date(), "dd MMMM yyyy à HH:mm", { locale: fr })}</p>
            </div>

            {/* Chaque vente + son détail juste après */}
            {ventes.map((vente) => (
              <div key={vente.numero_facture} className="mb-8 page-break-avoid">

                {/* Ligne principale de la vente */}
                <table className="w-full border-2 border-black mb-2">
                  <tbody>
                    <tr className="bg-gray-200">
                      <td className="border-r border-black p-3 font-bold w-24">FACTURE</td>
                      <td className="border-r border-black p-3 font-bold text-blue-900">{vente.numero_facture}</td>
                      <td className="border-r border-black p-3 font-bold w-32">DATE</td>
                      <td className="border-r border-black p-3">{formatDate(vente.date_vente)}</td>
                      <td className="border-r border-black p-3 font-bold w-28">CLIENT</td>
                      <td className="p-3">{vente.client_nom || "Client passage"}</td>
                    </tr>
                    <tr className="bg-gray-100">
                      <td className="border-r border-black p-3 font-bold">ARTICLES</td>
                      <td className="border-r border-black p-3 text-center font-mono text-lg">{vente.nombre_articles}</td>
                      <td className="border-r border-black p-3 font-bold">MONTANT TTC</td>
                      <td className="border-r border-black p-3 text-right font-bold text-xl text-emerald-700">
                        {formatCurrency(vente.montant_ttc)}
                      </td>
                      <td className="border-r border-black p-3 font-bold">STATUT</td>
                      <td className="p-3 text-center font-bold">
                        {vente.payment_status === "Payé" ? "PAYÉ" : "CRÉDIT"}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* DÉTAIL PRODUITS – juste après la vente */}
                <table className="w-full border-2 border-black text-xs">
                  <thead>
                    <tr className="bg-gray-300">
                      <th className="border border-black p-2 text-left">DÉSIGNATION</th>
                      <th className="border border-black p-2 text-center w-16">QTÉ</th>
                      <th className="border border-black p-2 text-right w-32">PRIX HT</th>
                      <th className="border border-black p-2 text-right w-20">TVA %</th>
                      <th className="border border-black p-2 text-right w-24">REMISE %</th>
                      <th className="border border-black p-2 text-right w-32 font-bold">TOTAL TTC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vente.produits.map((p, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="border border-black p-2">{p.produit_nom}</td>
                        <td className="border border-black p-2 text-center">{p.quantite}</td>
                        <td className="border border-black p-2 text-right">{formatCurrency(p.prix_unitaire_ht)}</td>
                        <td className="border border-black p-2 text-right">{p.taux_tva}</td>
                        <td className="border border-black p-2 text-right">{p.remise_pourcentage}</td>
                        <td className="border border-black p-2 text-right font-bold">{formatCurrency(p.montant_ttc)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Séparateur entre les ventes */}
                <div className="my-6 border-t-2 border-dashed border-gray-600"></div>
              </div>
            ))}

            {/* RÉCAPITULATIF FINAL */}
            <div className="mt-12 border-4 border-black p-8 bg-gray-100">
              <h3 className="text-2xl font-bold text-center mb-6">RÉCAPITULATIF GÉNÉRAL</h3>
              <table className="w-full text-lg">
                <tbody>
                  <tr className="border-b-2 border-black">
                    <td className="py-3 font-bold">Total des ventes HT</td>
                    <td className="py-3 text-right font-bold">{formatCurrency(data.totals.total_ht || 0)}</td>
                  </tr>
                  <tr className="border-b-2 border-black">
                    <td className="py-3 font-bold">TVA collectée</td>
                    <td className="py-3 text-right font-bold">{formatCurrency(data.totals.total_tva)}</td>
                  </tr>
                  <tr className="bg-black text-white">
                    <td className="py-5 text-2xl font-bold">CHIFFRE D'AFFAIRES TTC</td>
                    <td className="py-5 text-right text-3xl font-bold">{formatCurrency(data.totals.total_ttc)}</td>
                  </tr>
                  <tr>
                    <td className="pt-5">Nombre total de factures</td>
                    <td className="pt-5 text-right font-bold">{data.totals.total_ventes}</td>
                  </tr>
                  <tr>
                    <td>Articles vendus</td>
                    <td className="text-right font-bold">{data.totals.total_articles}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-12 text-center text-sm border-t-2 border-black pt-4">
              <p>Rapport généré automatiquement par le système POS Retail</p>
              <p className="mt-2">© 2025 Société Commerciale du Burundi</p>
            </div>
          </div>
        </div>

        
        
        </div>
      </div>
    </POSLayout>
  );
}
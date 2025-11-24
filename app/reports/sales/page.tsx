// app/reports/sales/page.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useSalesDetail } from "@/hooks/useSalesDetail";
import { POSLayout } from "@/components/pos-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar, DollarSign, ShoppingCart, Receipt, TrendingUp, User, Printer, ChevronDown, ChevronUp } from "lucide-react";
import type { SalesDetailResponse } from "@/types/sales-report.types";

export default function SalesDetailPage() {
  const { data, loading, error } = useSalesDetail();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const formatDate = (d: string) => format(new Date(d), "dd MMMM yyyy à HH:mm", { locale: fr });
  const formatCurrency = (v: number | string) => {
    const num = typeof v === "string" ? parseFloat(v) : v;
    return isNaN(num) ? "0.00" : num.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " FBU";
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin text-blue-600" /></div>;
  if (error || !data) return <div className="p-8 text-center text-red-600">Erreur : {error}</div>;

  const ventes = data.ventes;
  const totalPages = Math.ceil(ventes.length / pageSize);
  const paginatedVentes = ventes.slice((page - 1) * pageSize, page * pageSize);

  return (
    <POSLayout currentPath="/reports/sales">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 print:bg-white">
        <div className="p-8 space-y-8 max-w-screen-2xl mx-auto">

          {/* Header + Print */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 print:shadow-none">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-8">
                <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl print:hidden">
                  <TrendingUp className="h-20 w-20 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent print:text-black">
                    Rapport de Ventes Détaillé
                  </h1>
                  <p className="text-2xl text-slate-600 dark:text-slate-400 print:text-black">
                    Du {formatDate(data.date_debut)} au {formatDate(data.date_fin)}
                  </p>
                </div>
              </div>
              <Button onClick={() => window.print()} size="lg" className="bg-emerald-600 hover:bg-emerald-700 print:hidden">
                <Printer className="h-6 w-6 mr-3" /> Imprimer
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 print:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <CardContent className="pt-8">
                  <p className="text-blue-100">CA TTC</p>
                  <p className="text-4xl font-bold">{formatCurrency(data.totals.total_ttc)}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                <CardContent className="pt-8">
                  <p className="text-emerald-100">Ventes</p>
                  <p className="text-4xl font-bold">{data.totals.total_ventes}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
                <CardContent className="pt-8">
                  <p className="text-indigo-100">Articles</p>
                  <p className="text-4xl font-bold">{data.totals.total_articles}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                <CardContent className="pt-8">
                  <p className="text-purple-100">TVA</p>
                  <p className="text-4xl font-bold">{formatCurrency(data.totals.total_tva)}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tableau avec expandable rows */}
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Détail des Ventes ({ventes.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50 dark:bg-blue-900/30">
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Facture</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Articles</TableHead>
                    <TableHead>Montant TTC</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedVentes.map((vente) => (
                    <>
                      {/* Ligne principale */}
                      <TableRow
                        key={vente.numero_facture}
                        className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 cursor-pointer"
                        onClick={() => setExpandedRow(expandedRow === vente.numero_facture ? null : vente.numero_facture)}
                      >
                        <TableCell>
                          {expandedRow === vente.numero_facture ? (
                            <ChevronUp className="h-5 w-5 text-blue-600" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-blue-600" />
                          )}
                        </TableCell>
                        <TableCell className="font-bold">{vente.numero_facture}</TableCell>
                        <TableCell>{formatDate(vente.date_vente)}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          <User className="h-4 w-4" /> {vente.client_nom}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{vente.nombre_articles}</Badge>
                        </TableCell>
                        <TableCell className="font-bold text-emerald-600">
                          {formatCurrency(vente.montant_ttc)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={vente.payment_status === "Payé" ? "bg-emerald-500 text-white" : "bg-orange-500 text-white"}>
                            {vente.payment_status}
                          </Badge>
                        </TableCell>
                      </TableRow>

                      {/* Ligne expandable – détail produits */}
                      {expandedRow === vente.numero_facture && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-blue-50/30 dark:bg-blue-900/20">
                            <div className="p-6">
                              <h4 className="font-bold text-lg mb-4 text-blue-700">Articles vendus :</h4>
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
                                      <TableCell className="text-right font-bold text-emerald-600">
                                        {formatCurrency(p.montant_ttc)}
                                      </TableCell>
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
              <div className="flex items-center justify-between p-6 border-t print:hidden">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600">Lignes par page :</span>
                  <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-slate-600">
                    {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, ventes.length)} sur {ventes.length}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </POSLayout>
  );
}
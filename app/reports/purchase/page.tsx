// app/reports/purchases/page.tsx
"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useReactToPrint } from "react-to-print";
import { usePurchasesDetail } from "@/hooks/usePurchaseReportDetail";
import { POSLayout } from "@/components/pos-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Package, Printer, ChevronDown, ChevronUp, Truck, Filter, Clock, Users } from "lucide-react";
import React from "react";

export default function PurchasesReportPage() {
  const { data, loading, error, filters, setFilters } = usePurchasesDetail();
  const printRef = useRef<HTMLDivElement>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const formatDate = (d: string) => format(new Date(d), "dd MMMM yyyy à HH:mm", { locale: fr });
  const formatCurrency = (v: number | string) => {
    const num = typeof v === "string" ? parseFloat(v) : v;
    return isNaN(num) ? "0,00" : num.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " FC";
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      Reçue: { label: "REÇUE", color: "bg-emerald-600" },
      Envoyée: { label: "ENVOYÉE", color: "bg-blue-600" },
      Confirmée: { label: "CONFIRMÉE", color: "bg-purple-600" },
      Brouillon: { label: "BROUILLON", color: "bg-slate-500" },
      Annulée: { label: "ANNULÉE", color: "bg-red-600" },
    };
    const cfg = config[status] || { label: status, color: "bg-gray-500" };
    return <Badge className={`${cfg.color} text-white`}>{cfg.label}</Badge>;
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Rapport_Achats_${format(new Date(), "yyyy-MM-dd")}`,
    pageStyle: `
      @page { size: A4 portrait; margin: 1.5cm; }
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display: none !important; } }
    `,
  });

  if (loading) {
    return (
      <POSLayout currentPath="/reports/purchases">
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-purple-600 mx-auto mb-6" />
            <p className="text-xl text-slate-600 dark:text-slate-400">Chargement du rapport des achats...</p>
          </div>
        </div>
      </POSLayout>
    );
  }

  if (error || !data) {
    return (
      <POSLayout currentPath="/reports/purchases">
        <div className="p-12 text-center">
          <div className="text-red-600 text-3xl font-bold">Erreur de chargement</div>
          <p className="text-slate-600 dark:text-slate-400 mt-4">{error || "Données indisponibles"}</p>
        </div>
      </POSLayout>
    );
  }

  const { commandes, totals } = data;
  const totalPages = Math.ceil(commandes.length / pageSize);
  const paginated = commandes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <POSLayout currentPath="/reports/purchases">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="p-6 space-y-8 max-w-screen-2xl mx-auto">

          {/* === HEADER PREMIUM === */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="p-5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-2xl">
                  <Truck className="h-14 w-14 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">
                    Rapport des Achats & Commandes
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 flex items-center">
                    Du {formatDate(data.date_debut)} au {formatDate(data.date_fin)}
                  </p>
                </div>
              </div>
              <Button
                onClick={handlePrint}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl no-print"
              >
                <Printer className="h-6 w-6 mr-3" />
                Imprimer le rapport
              </Button>
            </div>
          </div>

          {/* === KPI CARDS MAGNIFIQUES === */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-xl border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Total commandé</p>
                    <p className="text-4xl font-extrabold mt-2">{formatCurrency(totals.montant_total_commandes)}</p>
                  </div>
                  <Package className="h-12 w-12 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-xl border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100">Commandes</p>
                    <p className="text-4xl font-extrabold mt-2">{totals.nombre_commandes}</p>
                  </div>
                  <Truck className="h-12 w-12 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-xl border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">En attente</p>
                    <p className="text-4xl font-extrabold mt-2">{formatCurrency(data.montant_en_attente || 0)}</p>
                  </div>
                  <Clock className="h-12 w-12 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100">Fournisseurs</p>
                    <p className="text-4xl font-extrabold mt-2">{totals.nombre_fournisseurs}</p>
                  </div>
                  <Users className="h-12 w-12 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* === FILTRES PREMIUM === */}
          <Card className="shadow-lg border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <Filter className="h-6 w-6 text-purple-600" />
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">Filtres</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <Label className="text-lg font-semibold">Période</Label>
                  <Select value={filters.periode} onValueChange={(v) => setFilters({ ...filters, periode: v as any })}>
                    <SelectTrigger className="h-12 text-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Aujourd'hui</SelectItem>
                      <SelectItem value="week">Cette semaine</SelectItem>
                      <SelectItem value="month">Ce mois</SelectItem>
                      <SelectItem value="year">Cette année</SelectItem>
                      <SelectItem value="custom">Personnalisée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-lg font-semibold">Fournisseur</Label>
                  <Input
                    placeholder="Rechercher..."
                    value={filters.fournisseur || ""}
                    onChange={(e) => setFilters({ ...filters, fournisseur: e.target.value || undefined })}
                    className="h-12 text-lg"
                  />
                </div>
                <div>
                  <Label className="text-lg font-semibold">Statut</Label>
                  <Select value={filters.status || ""} onValueChange={(v) => setFilters({ ...filters, status: v || undefined })}>
                    <SelectTrigger className="h-12 text-lg"><SelectValue placeholder="Tous" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tous</SelectItem>
                      <SelectItem value="Brouillon">Brouillon</SelectItem>
                      <SelectItem value="Envoyée">Envoyée</SelectItem>
                      <SelectItem value="Confirmée">Confirmée</SelectItem>
                      <SelectItem value="Reçue">Reçue</SelectItem>
                      <SelectItem value="Annulée">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" size="lg" className="w-full h-12 text-lg" onClick={() => setFilters({ periode: "month" })}>
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* === TABLEAU PREMIUM === */}
          <Card className="shadow-2xl border-0 overflow-hidden bg-white/95 dark:bg-slate-800/95 backdrop-blur">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20">
              <CardTitle className="text-3xl font-bold flex items-center gap-3 text-purple-700 dark:text-purple-300">
                <Package className="h-10 w-10" />
                Détail des Commandes d'Achat ({commandes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-purple-50 dark:bg-purple-900/30">
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="font-bold text-purple-700 dark:text-purple-300">N° Commande</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold">Fournisseur</TableHead>
                    <TableHead className="font-bold text-center">Articles</TableHead>
                    <TableHead className="font-bold text-right">Montant</TableHead>
                    <TableHead className="font-bold text-center">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((cmd) => {
                    const isOpen = expandedRow === cmd.numero_commande;
                    return (
                      <React.Fragment key={cmd.numero_commande}>
                        <TableRow
                          className="hover:bg-purple-50/50 dark:hover:bg-purple-900/20 cursor-pointer transition-all h-16"
                          onClick={() => setExpandedRow(isOpen ? null : cmd.numero_commande)}
                        >
                          <TableCell>
                            {isOpen ? <ChevronUp className="h-5 w-5 text-purple-600" /> : <ChevronDown className="h-5 w-5 text-purple-600" />}
                          </TableCell>
                          <TableCell className="font-bold text-purple-700 dark:text-purple-300 text-lg">{cmd.numero_commande}</TableCell>
                          <TableCell>{formatDate(cmd.date_commande)}</TableCell>
                          <TableCell className="font-medium">{cmd.fournisseur}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="text-lg px-4">{cmd.produits.length}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400 text-xl">
                            {formatCurrency(cmd.montant_total)}
                          </TableCell>
                          <TableCell className="text-center">{getStatusBadge(cmd.status)}</TableCell>
                        </TableRow>

                        {/* Détail expandable */}
                        {isOpen && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-purple-50/30 dark:bg-purple-900/20">
                              <div className="p-8">
                                <h4 className="font-bold text-xl mb-6 text-purple-700 dark:text-purple-300">Articles commandés</h4>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-purple-100 dark:bg-purple-900/40">
                                      <TableHead>Produit</TableHead>
                                      <TableHead className="text-center">Qté</TableHead>
                                      <TableHead className="text-right">Prix unitaire</TableHead>
                                      <TableHead className="text-right font-bold">Sous-total</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {cmd.produits.map((p, i) => (
                                      <TableRow key={i} className={i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-purple-50 dark:bg-purple-900/10"}>
                                        <TableCell className="font-medium">{p.produit_nom}</TableCell>
                                        <TableCell className="text-center font-semibold">{p.quantite}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(p.prix_unitaire)}</TableCell>
                                        <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                                          {formatCurrency(p.montant_total)}
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
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-6 border-t bg-slate-50 dark:bg-slate-800">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Page {currentPage} sur {totalPages} • {commandes.length} commande{commandes.length > 1 ? "s" : ""}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                      Précédent
                    </Button>
                    <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* === IMPRESSION OFFICIELLE === */}
          <div className="hidden">
            <div ref={printRef} className="bg-white p-10 text-black">
              <div className="text-center border-b-2 border-black pb-6 mb-8">
                <h1 className="text-2xl font-bold">SOCIÉTÉ COMERCIALE DU BURUNDI</h1>
                <h2 className="text-xl font-bold mt-2">RAPPORT DES COMMANDES D'ACHAT</h2>
                <p className="mt-4 text-lg">
                  Période : du <strong>{formatDate(data.date_debut)}</strong> au <strong>{formatDate(data.date_fin)}</strong>
                </p>
                <p className="text-sm mt-2">Imprimé le {format(new Date(), "dd MMMM yyyy à HH:mm", { locale: fr })}</p>
              </div>

              {commandes.map((cmd) => (
                <div key={cmd.numero_commande} className="mb-10 page-break-avoid">
                  <table className="w-full border-2 border-black mb-2">
                    <tbody>
                      <tr className="bg-gray-200">
                        <td className="border-r border-black p-3 font-bold">COMMANDE</td>
                        <td className="border-r border-black p-3 font-bold text-purple-900">{cmd.numero_commande}</td>
                        <td className="border-r border-black p-3 font-bold">DATE</td>
                        <td className="border-r border-black p-3">{formatDate(cmd.date_commande)}</td>
                        <td className="border-r border-black p-3 font-bold">FOURNISSEUR</td>
                        <td className="p-3">{cmd.fournisseur}</td>
                      </tr>
                      <tr className="bg-gray-100">
                        <td className="border-r border-black p-3 font-bold">ARTICLES</td>
                        <td className="border-r border-black p-3 text-center font-mono text-lg">{cmd.produits.length}</td>
                        <td className="border-r border-black p-3 font-bold">MONTANT</td>
                        <td className="border-r border-black p-3 text-right font-bold text-xl text-emerald-700">{formatCurrency(cmd.montant_total)}</td>
                        <td className="border-r border-black p-3 font-bold">STATUT</td>
                        <td className="p-3 text-center font-bold">{cmd.status.toUpperCase()}</td>
                      </tr>
                    </tbody>
                  </table>

                  <table className="w-full border-2 border-black text-xs">
                    <thead>
                      <tr className="bg-gray-300">
                        <th className="border border-black p-2 text-left">DÉSIGNATION</th>
                        <th className="border border-black p-2 text-center">QTÉ</th>
                        <th className="border border-black p-2 text-right">PRIX U.</th>
                        <th className="border border-black p-2 text-right font-bold">SOUS-TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cmd.produits.map((p, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="border border-black p-2">{p.produit_nom}</td>
                          <td className="border border-black p-2 text-center">{p.quantite}</td>
                          <td className="border border-black p-2 text-right">{formatCurrency(p.prix_unitaire)}</td>
                          <td className="border border-black p-2 text-right font-bold">{formatCurrency(p.montant_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="my-8 border-t-2 border-dashed border-gray-600"></div>
                </div>
              ))}

              <div className="mt-12 border-4 border-black p-8 bg-gray-100">
                <h3 className="text-2xl font-bold text-center mb-6">RÉCAPITULATIF GÉNÉRAL</h3>
                <table className="w-full text-lg">
                  <tbody>
                    <tr className="border-b-2 border-black">
                      <td className="py-3 font-bold">Total commandé</td>
                      <td className="py-3 text-right font-bold text-2xl text-emerald-700">{formatCurrency(totals.montant_total_commandes)}</td>
                    </tr>
                    <tr><td className="py-3 font-bold">En attente de réception</td><td className="py-3 text-right font-bold text-orange-600">{formatCurrency(data.montant_en_attente || 0)}</td></tr>
                    <tr><td className="py-3">Nombre total de commandes</td><td className="py-3 text-right font-bold">{totals.nombre_commandes}</td></tr>
                    <tr><td className="py-3">Fournisseurs distincts</td><td className="py-3 text-right font-bold">{totals.nombre_fournisseurs}</td></tr>
                    <tr><td className="py-3 text-green-700 font-bold">Commandes reçues</td><td className="py-3 text-right text-green-700 font-bold">{totals.commandes_recues || 0}</td></tr>
                    <tr><td className="py-3 text-red-700">Commandes annulées</td><td className="py-3 text-right text-red-700">{totals.commandes_annulees || 0}</td></tr>
                    <tr><td className="py-3">Délai moyen livraison</td><td className="py-3 text-right font-mono">{data.delai_moyen_livraison || 0} jours</td></tr>
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
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
import { Loader2, Calendar, DollarSign, ShoppingCart, Receipt, TrendingUp, User, Printer, ChevronDown, ChevronUp } from "lucide-react";
import type { SalesDetailResponse } from "@/types/sales-report.types";

export default function SalesDetailPage() {
  const { data, loading, error, filters, setFilters } = useSalesDetail();
  const componentRef = useRef<HTMLDivElement>(null);

  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const formatDate = (d: string) => format(new Date(d), "dd MMMM yyyy à HH:mm", { locale: fr });
  const formatCurrency = (v: number | string) => {
    const num = typeof v === "string" ? parseFloat(v) : v;
    return isNaN(num) ? "0.00" : num.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " FBU";
  };

  // Impression professionnelle avec react-to-print
  const handlePrint = useReactToPrint({
    contentRef: () => componentRef.current,
    documentTitle: `Rapport_Ventes_${format(new Date(), "yyyy-MM-dd")}`,
    pageStyle: `
      @page { size: A4; margin: 1.5cm; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .no-print { display: none !important; }
      }
    `,
  });

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin text-blue-600" /></div>;
  if (error || !data) return <div className="p-8 text-center text-red-600">Erreur : {error}</div>;

  const ventes = data.ventes;
  const totalPages = Math.ceil(ventes.length / pageSize);
  const paginatedVentes = ventes.slice((page - 1) * pageSize, page * pageSize);

  return (
    <POSLayout currentPath="/reports/sales">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="p-8 space-y-8 max-w-screen-2xl mx-auto">

          {/* Bouton d’impression visible */}
          <div className="flex justify-end no-print">
            <Button onClick={handlePrint} size="lg" className="bg-emerald-600 hover:bg-emerald-700 shadow-xl">
              <Printer className="h-6 w-6 mr-3" />
              Imprimer le rapport
            </Button>
          </div>

          {/* Contenu à imprimer – caché à l’écran mais visible à l’impression */}
          <div ref={componentRef} className="bg-white p-10 print:p-0">

            {/* EN-TÊTE DU PDF */}
            <div className="text-center mb-8 border-b-4 border-blue-700 pb-6 print:block hidden">
              <h1 className="text-4xl font-extrabold text-blue-700">SOCIÉTÉ COMERCIALE DU BURUNDI</h1>
              <p className="text-2xl font-bold text-slate-700 mt-2">Rapport de Ventes Détaillé</p>
              <p className="text-lg text-slate-600 mt-4">
                Période : du <strong>{formatDate(data.date_debut)}</strong> au <strong>{formatDate(data.date_fin)}</strong>
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Généré le {format(new Date(), "dd MMMM yyyy à HH:mm", { locale: fr })}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-xl shadow-lg">
                <p className="text-blue-100 text-sm">Chiffre d'Affaires TTC</p>
                <p className="text-4xl font-extrabold mt-2">{formatCurrency(data.totals.total_ttc)}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                <p className="text-emerald-100 text-sm">Nombre de ventes</p>
                <p className="text-4xl font-extrabold mt-2">{data.totals.total_ventes}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-6 rounded-xl shadow-lg">
                <p className="text-indigo-100 text-sm">Articles vendus</p>
                <p className="text-4xl font-extrabold mt-2">{data.totals.total_articles}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-6 rounded-xl shadow-lg">
                <p className="text-purple-100 text-sm">TVA collectée</p>
                <p className="text-4xl font-extrabold mt-2">{formatCurrency(data.totals.total_tva)}</p>
              </div>
            </div>

            {/* Tableau complet */}
            <div className="border-2 border-blue-200 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-700 text-white">
                    <TableHead className="text-white font-bold">Facture</TableHead>
                    <TableHead className="text-white font-bold">Date</TableHead>
                    <TableHead className="text-white font-bold">Client</TableHead>
                    <TableHead className="text-white font-bold text-center">Articles</TableHead>
                    <TableHead className="text-white font-bold text-right">Montant TTC</TableHead>
                    <TableHead className="text-white font-bold text-center">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventes.map((vente) => (
                    <>
                      <TableRow key={vente.numero_facture} className="hover:bg-blue-50 h-14">
                        <TableCell className="font-bold text-blue-700">{vente.numero_facture}</TableCell>
                        <TableCell>{formatDate(vente.date_vente)}</TableCell>
                        <TableCell>{vente.client_nom}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{vente.nombre_articles}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-emerald-600 text-lg">
                          {formatCurrency(vente.montant_ttc)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={vente.payment_status === "Payé" ? "bg-emerald-500 text-white" : "bg-orange-500 text-white"}>
                            {vente.payment_status}
                          </Badge>
                        </TableCell>
                      </TableRow>

                      {/* Détail produits – toujours visible dans le PDF */}
                      <TableRow className="bg-blue-50">
                        <TableCell colSpan={6} className="p-0">
                          <div className="p-4">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-blue-100">
                                  <TableHead className="text-blue-700">Produit</TableHead>
                                  <TableHead className="text-blue-700 text-center">Qté</TableHead>
                                  <TableHead className="text-blue-700 text-right">Prix HT</TableHead>
                                  <TableHead className="text-blue-700 text-right">TVA</TableHead>
                                  <TableHead className="text-blue-700 text-right">Remise</TableHead>
                                  <TableHead className="text-blue-700 text-right font-bold">Total TTC</TableHead>
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
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pied de page */}
            <div className="mt-12 text-center text-sm text-slate-600 border-t pt-6 print:block hidden">
              <p>Rapport généré automatiquement par le système POS Retail</p>
              <p>© 2025 - Tous droits réservés</p>
            </div>
          </div>

          {/* Version écran avec filtres + expandable */}
          <Card className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl no-print">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                <div>
                  <CardTitle className="text-3xl font-bold flex items-center gap-3">
                    <Receipt className="h-10 w-10 text-blue-700" />
                    Détail des Ventes ({ventes.length})
                  </CardTitle>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{ventes.length} vente(s) trouvée(s)</p>
                </div>

                {/* FILTRES – AU-DESSUS DU TABLEAU, PARFAITEMENT ALIGNÉS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 print:hidden">
                  <div>
                    <Label className="text-sm font-medium">Période</Label>
                    <Select value={filters.periode} onValueChange={(v) => setFilters({ periode: v as any, date_debut: "", date_fin: "" })}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
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
                        <Label className="text-sm font-medium">Début</Label>
                        <Input type="date" value={filters.date_debut || ""} onChange={e => setFilters({ date_debut: e.target.value })} className="h-11" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Fin</Label>
                        <Input type="date" value={filters.date_fin || ""} onChange={e => setFilters({ date_fin: e.target.value })} className="h-11" />
                      </div>
                    </>
                  )}

                  <div>
                    <Label className="text-sm font-medium">Point de vente</Label>
                    <Select value={filters.point_vente || ""} onValueChange={v => setFilters({ point_vente: v || undefined })}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Tous" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tous</SelectItem>
                        {/* Dynamique ici */}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Vendeur</Label>
                    <Select value={filters.vendeur || ""} onValueChange={v => setFilters({ vendeur: v || undefined })}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Tous" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tous</SelectItem>
                        {/* Dynamique ici */}
                      </SelectContent>
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
                        <TableCell>
                          {expandedRow === vente.numero_facture ? <ChevronUp className="h-5 w-5 text-blue-600" /> : <ChevronDown className="h-5 w-5 text-blue-600" />}
                        </TableCell>
                        <TableCell className="font-bold text-blue-700">{vente.numero_facture}</TableCell>
                        <TableCell>{formatDate(vente.date_vente)}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          {vente.client_nom}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{vente.nombre_articles}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-emerald-600 text-lg">
                          {formatCurrency(vente.montant_ttc)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={vente.payment_status === "Payé" ? "bg-emerald-500 text-white" : "bg-orange-500 text-white"}>
                            {vente.payment_status}
                          </Badge>
                        </TableCell>
                      </TableRow>

                      {/* Détail produits */}
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
              <div className="flex items-center justify-between p-6 border-t bg-slate-50 dark:bg-slate-800 print:hidden">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600">Lignes par page</span>
                  <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                    <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
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
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Précédent</Button>
                  <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Suivant</Button>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </POSLayout>
  );
}
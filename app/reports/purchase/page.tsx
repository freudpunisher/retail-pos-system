// app/reports/purchases/page.tsx
"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useReactToPrint } from "react-to-print";
import { usePurchasesDetail } from "@/hooks/usePurchaseReportDetail";
import { POSLayout } from "@/components/pos-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Package, Printer, ChevronDown, ChevronUp, Filter } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function PurchasesReportPage() {
  const { data, loading, error, filters, setFilters } = usePurchasesDetail();
  const printRef = useRef<HTMLDivElement>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const formatDate = (d: string) =>
    format(new Date(d), "dd MMMM yyyy à HH:mm", { locale: fr });

  const formatCurrency = (v: string | number) => {
    const num = typeof v === "string" ? parseFloat(v) : v;
    return isNaN(num)
      ? "0,00"
      : num.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " FBU";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Reçue": return <Badge className="bg-emerald-600 text-white">REÇUE</Badge>;
      case "Envoyée": return <Badge className="bg-blue-600 text-white">ENVOYÉE</Badge>;
      case "Confirmée": return <Badge className="bg-purple-600 text-white">CONFIRMÉE</Badge>;
      case "Brouillon": return <Badge variant="secondary">BROUILLON</Badge>;
      case "Annulée": return <Badge className="bg-red-600 text-white">ANNULÉE</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Rapport_Achats_${format(new Date(), "yyyy-MM-dd")}`,
    pageStyle: `@page { size: A4; margin: 1cm; } @media print { body { font-size: 10pt; }`,
  });

  if (loading) return (
    <POSLayout currentPath="/reports/purchases">
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-20 w-20 animate-spin text-blue-600" />
      </div>
    </POSLayout>
  );

  if (error || !data) return (
    <POSLayout currentPath="/reports/purchases">
      <div className="p-8 text-center text-red-600 text-2xl">{error || "Erreur"}</div>
    </POSLayout>
  );

  const { commandes, totals } = data;

  // Pagination
  const totalPages = Math.ceil(commandes.length / ITEMS_PER_PAGE);
  const paginated = commandes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <POSLayout currentPath="/reports/purchases">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800 flex items-center gap-4">
              <Package className="h-12 w-12 text-blue-700" />
              Rapport des Achats
            </h1>
            <p className="text-xl text-gray-600 mt-2">
              Période : du <strong>{formatDate(data.date_debut)}</strong> au <strong>{formatDate(data.date_fin)}</strong>
            </p>
          </div>
          <Button onClick={handlePrint} size="lg" className="bg-black hover:bg-gray-800 text-white">
            <Printer className="h-6 w-6 mr-3" />
            Imprimer le rapport
          </Button>
        </div>

        {/* FILTRES */}
        <Card className="mb-8 p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <span className="font-semibold text-lg">Filtres</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <Label>Période</Label>
              <Select
                value={filters.periode}
                onValueChange={(v) => setFilters({ ...filters, periode: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
              <Label>Fournisseur</Label>
              <Input
                placeholder="Nom fournisseur..."
                value={filters.fournisseur || ""}
                onChange={(e) => setFilters({ ...filters, fournisseur: e.target.value || undefined })}
              />
            </div>

            <div>
              <Label>Statut</Label>
              <Select
                value={filters.status || ""}
                onValueChange={(v) => setFilters({ ...filters, status: v || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Tous</SelectItem>
                  <SelectItem value="Brouillon">Brouillon</SelectItem>
                  <SelectItem value="Envoyée">Envoyée</SelectItem>
                  <SelectItem value="Confirmée">Confirmée</SelectItem>
                  <SelectItem value="Reçue">Reçue</SelectItem>
                  <SelectItem value="Annulée">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ periode: "month" })}
                className="w-full"
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-blue-700 text-white"><CardContent className="pt-6"><p className="text-3xl font-bold">{formatCurrency(totals.montant_total_commandes)}</p><p className="text-sm opacity-90">Total commandé</p></CardContent></Card>
          <Card className="bg-emerald-600 text-white"><CardContent className="pt-6"><p className="text-3xl font-bold">{totals.nombre_commandes}</p><p className="text-sm opacity-90">Commandes</p></CardContent></Card>
          <Card className="bg-orange-600 text-white"><CardContent className="pt-6"><p className="text-3xl font-bold">{formatCurrency(data.montant_en_attente)}</p><p className="text-sm opacity-90">En attente</p></CardContent></Card>
          <Card className="bg-purple-600 text-white"><CardContent className="pt-6"><p className="text-3xl font-bold">{totals.nombre_fournisseurs}</p><p className="text-sm opacity-90">Fournisseurs</p></CardContent></Card>
        </div>

        {/* TABLEAU avec expandable rows */}
        <Card className="shadow-xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-700">
                  <TableHead className="text-white">N° Commande</TableHead>
                  <TableHead className="text-white">Date</TableHead>
                  <TableHead className="text-white">Fournisseur</TableHead>
                  <TableHead className="text-white text-center">Articles</TableHead>
                  <TableHead className="text-white text-right">Montant</TableHead>
                  <TableHead className="text-white text-center">Statut</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((cmd) => {
                  const isOpen = expandedRow === cmd.numero_commande;
                  return (
                    <>
                      <TableRow
                        key={cmd.numero_commande}
                        className="hover:bg-gray-100 cursor-pointer"
                        onClick={() => setExpandedRow(isOpen ? null : cmd.numero_commande)}
                      >
                        <TableCell className="font-bold text-blue-700">{cmd.numero_commande}</TableCell>
                        <TableCell>{formatDate(cmd.date_commande)}</TableCell>
                        <TableCell className="font-medium">{cmd.fournisseur}</TableCell>
                        <TableCell className="text-center"><Badge variant="secondary">{cmd.produits.length}</Badge></TableCell>
                        <TableCell className="text-right font-bold text-emerald-600 text-xl">
                          {formatCurrency(cmd.montant_total)}
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(cmd.status)}</TableCell>
                        <TableCell>{isOpen ? <ChevronUp /> : <ChevronDown />}</TableCell>
                      </TableRow>

                      {isOpen && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-0 bg-blue-50">
                            <div className="p-6">
                              <p className="font-bold text-blue-800 mb-4">Détail des articles :</p>
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-blue-100">
                                    <TableHead>Produit</TableHead>
                                    <TableHead className="text-center">Qté</TableHead>
                                    <TableHead className="text-right">Prix U.</TableHead>
                                    <TableHead className="text-right font-bold">Sous-total</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {cmd.produits.map((p, i) => (
                                    <TableRow key={i}>
                                      <TableCell>{p.produit_nom}</TableCell>
                                      <TableCell className="text-center font-mono">{p.quantite}</TableCell>
                                      <TableCell className="text-right">{formatCurrency(p.prix_unitaire)}</TableCell>
                                      <TableCell className="text-right font-bold text-emerald-600">
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
                    </>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center p-4 border-t">
                <p className="text-sm text-gray-600">
                  Page {currentPage} sur {totalPages} ({commandes.length} commandes)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* IMPRESSION PAPIER OFFICIEL – avec récapitulatif complet */}
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
              <div key={cmd.numero_commande} className="mb-10">
                <table className="w-full border-2 border-black mb-2">
                  <tbody>
                    <tr className="bg-gray-200">
                      <td className="border-r border-black p-3 font-bold">COMMANDE</td>
                      <td className="border-r border-black p-3 font-bold text-blue-900">{cmd.numero_commande}</td>
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
 RÉCAPITULATIF FINAL DANS L'IMPRESSION
            <div className="mt-12 border-4 border-black p-8 bg-gray-100">
              <h3 className="text-2xl font-bold text-center mb-6">RÉCAPITULATIF GÉNÉRAL</h3>
              <table className="w-full text-lg">
                <tbody>
                  <tr className="border-b-2 border-black">
                    <td className="py-3 font-bold">Total commandé</td>
                    <td className="py-3 text-right font-bold text-2xl text-emerald-700">
                      {formatCurrency(totals.montant_total_commandes)}
                    </td>
                  </tr>
                  <tr><td className="py-3 font-bold">En attente de réception</td><td className="py-3 text-right font-bold text-orange-600">{formatCurrency(data.montant_en_attente)}</td></tr>
                  <tr><td className="py-3">Nombre total de commandes</td><td className="py-3 text-right font-bold">{totals.nombre_commandes}</td></tr>
                  <tr><td className="py-3">Fournisseurs distincts</td><td className="py-3 text-right font-bold">{totals.nombre_fournisseurs}</td></tr>
                  <tr><td className="py-3">Commandes envoyées</td><td className="py-3 text-right">{totals.commandes_envoyees}</td></tr>
                  <tr><td className="py-3 text-green-700 font-bold">Commandes reçues</td><td className="py-3 text-right text-green-700 font-bold">{totals.commandes_recues}</td></tr>
                  <tr><td className="py-3 text-red-700">Commandes annulées</td><td className="py-3 text-right text-red-700">{totals.commandes_annulees}</td></tr>
                  <tr><td className="py-3">Délai moyen livraison</td><td className="py-3 text-right font-mono">{data.delai_moyen_livraison} jours</td></tr>
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
    </POSLayout>
  );
}
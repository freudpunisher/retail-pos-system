"use client";
import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { POSLayout } from "@/components/pos-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search, Package, TrendingUp, TrendingDown, ArrowRightLeft,
  Loader2, RefreshCw, Calendar, User, DollarSign, AlertCircle,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight
} from "lucide-react";
import { useStockMovements } from "@/hooks/useStockMovements";

const movementTypes = [
  { value: "all", label: "Tous les types" },
  { value: "entree", label: "Entrée" },
  { value: "sortie", label: "Sortie" },
  { value: "transfert_in", label: "Transfert entrant" },
  { value: "transfert_out", label: "Transfert sortant" },
  { value: "ajustement", label: "Ajustement" },
  { value: "inventaire", label: "Inventaire" },
];

export default function MovementsPage() {
  const { movements, products, pointsVente, users, loading, error, refetch } = useStockMovements();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  // === Helpers ===
  const getProductName = (id: string) => products.find(p => p.id === id)?.nom || "Produit inconnu";
  const getPointVenteName = (id: string) => pointsVente.find(p => p.id === id)?.nom || "Inconnu";
  const getUserName = (id: string) => {
    const user = users.find(u => u.id === id);
    return user ? `${user.prenom || ""} ${user.nom || ""}`.trim() || "Utilisateur" : "Inconnu";
  };

  const getMovementConfig = (type: string) => {
    const config: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
      entree: { icon: <TrendingUp className="h-5 w-5" />, color: "bg-emerald-500", label: "Entrée" },
      sortie: { icon: <TrendingDown className="h-5 w-5" />, color: "bg-red-500", label: "Sortie" },
      transfert_in: { icon: <ArrowRightLeft className="h-5 w-5 rotate-180" />, color: "bg-blue-500", label: "Transf. entrant" },
      transfert_out: { icon: <ArrowRightLeft className="h-5 w-5" />, color: "bg-orange-500", label: "Transf. sortant" },
      ajustement: { icon: <Package className="h-5 w-5" />, color: "bg-purple-500", label: "Ajustement" },
      inventaire: { icon: <Package className="h-5 w-5" />, color: "bg-slate-500", label: "Inventaire" },
    };
    return config[type] || { icon: <Package className="h-5 w-5" />, color: "bg-muted", label: type };
  };

  // === Filtrage & Stats ===
  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const productName = getProductName(m.stock).toLowerCase();
      const motif = (m.motif || "").toLowerCase();
      const searchMatch = productName.includes(searchTerm.toLowerCase()) || motif.includes(searchTerm.toLowerCase());
      const typeMatch = selectedType === "all" || m.type_mouvement === selectedType;
      return searchMatch && typeMatch;
    });
  }, [movements, searchTerm, selectedType]);

  const stats = useMemo(() => {
    const entrees = filteredMovements.filter(m => ["entree", "transfert_in"].includes(m.type_mouvement));
    const sorties = filteredMovements.filter(m => ["sortie", "transfert_out"].includes(m.type_mouvement));
    const totalEntrees = entrees.reduce((s, m) => s + Math.abs(m.quantite), 0);
    const totalSorties = sorties.reduce((s, m) => s + Math.abs(m.quantite), 0);
    const totalValue = filteredMovements.reduce((s, m) => s + (Math.abs(m.quantite) * Number(m.prix_unitaire || 0)), 0);

    return { totalMovements: filteredMovements.length, totalEntrees, totalSorties, totalValue };
  }, [filteredMovements]);

  // === Pagination ===
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
  const paginated = filteredMovements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => setCurrentPage(1), [searchTerm, selectedType]);

  const formatDate = (date: string) => format(new Date(date), "dd MMM yyyy 'à' HH:mm", { locale: fr });

  // === Loading & Error States ===
  if (loading) {
    return (
      <POSLayout currentPath="/stock/mouvements">
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <Loader2 className="h-16 w-16 animate-spin text-purple-600 mb-6" />
          <p className="text-xl text-slate-600 dark:text-slate-400">Chargement des mouvements de stock...</p>
        </div>
      </POSLayout>
    );
  }

  if (error) {
    return (
      <POSLayout currentPath="/stock/mouvements">
        <div className="p-8">
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/30">
            <CardContent className="pt-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Erreur de chargement</p>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={refetch} size="lg" className="bg-red-600 hover:bg-red-700">
                <RefreshCw className="h-5 w-5 mr-2" />
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </POSLayout>
    );
  }

  return (
    <POSLayout currentPath="/stock/mouvements">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="p-6 space-y-8 max-w-screen-2xl mx-auto">

          {/* === Header Premium === */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="p-5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl shadow-2xl">
                  <ArrowRightLeft className="h-16 w-16 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Mouvements de Stock
                  </h1>
                  <p className="text-xl text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-2">
                    <Package className="h-6 w-6 text-purple-600" />
                    Suivi complet et en temps réel des entrées/sorties
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={refetch}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <RefreshCw className="h-6 w-6 mr-3" />}
                Actualiser
              </Button>
            </div>
          </div>

          {/* === Stats Magnifiques === */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-2xl border-0 overflow-hidden">
              <CardContent className="pt-8 pb-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-lg">Total Mouvements</p>
                    <p className="text-5xl font-extrabold mt-2">{stats.totalMovements.toLocaleString()}</p>
                  </div>
                  <ArrowRightLeft className="h-20 w-20 opacity-30" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-2xl border-0">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100">Entrées</p>
                    <p className="text-4xl font-bold mt-2">+{stats.totalEntrees.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-16 w-16 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-2xl border-0">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100">Sorties</p>
                    <p className="text-4xl font-bold mt-2">−{stats.totalSorties.toLocaleString()}</p>
                  </div>
                  <TrendingDown className="h-16 w-16 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-2xl border-0">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100">Valeur Totale</p>
                    <p className="text-3xl font-extrabold mt-2">{stats.totalValue.toLocaleString()} FBU</p>
                  </div>
                  <DollarSign className="h-16 w-16 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* === Filtres === */}
          <Card className="shadow-xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Rechercher par produit, motif..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 text-lg bg-slate-50 dark:bg-slate-700"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full lg:w-64 h-14 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {movementTypes.map(t => (
                      <SelectItem key={t.value} value={t.value} className="text-base">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* === Tableau Ultra Pro === */}
          <Card className="shadow-2xl border-0 overflow-hidden bg-white/95 dark:bg-slate-800/95 backdrop-blur">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20">
              <CardTitle className="text-3xl font-bold flex items-center gap-4">
                <Package className="h-10 w-10 text-purple-600" />
                Historique Complet des Mouvements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {paginated.length === 0 ? (
                <div className="py-24 text-center">
                  <Package className="h-24 w-24 mx-auto mb-6 text-slate-300 dark:text-slate-700" />
                  <p className="text-2xl font-semibold text-slate-500">Aucun mouvement trouvé</p>
                  <p className="text-slate-400 mt-2">Modifiez vos filtres pour voir plus de résultats</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-100 dark:bg-slate-700">
                        <TableHead className="font-bold text-lg">Type</TableHead>
                        <TableHead className="font-bold text-lg">Produit</TableHead>
                        <TableHead className="font-bold text-lg">Point de vente</TableHead>
                        <TableHead className="font-bold text-lg text-center">Qté</TableHead>
                        <TableHead className="font-bold text-lg text-center">Prix unitaire</TableHead>
                        <TableHead className="font-bold text-lg">Motif</TableHead>
                        <TableHead className="font-bold text-lg">Utilisateur</TableHead>
                        <TableHead className="font-bold text-lg">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map((m) => {
                        const config = getMovementConfig(m.type_mouvement);
                        return (
                          <TableRow key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all h-20">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${config.color} text-white`}>
                                  {config.icon}
                                </div>
                                <span className="font-semibold text-lg">{config.label}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-lg">{getProductName(m.stock)}</TableCell>
                            <TableCell className="font-medium">{getPointVenteName(m.point_vente || m.stock)}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={m.quantite > 0 ? "default" : "destructive"} className="text-xl px-5 py-2 font-bold">
                                {m.quantite > 0 ? "+" : ""}{Math.abs(m.quantite)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-mono text-lg">
                              {Number(m.prix_unitaire || 0).toLocaleString()} FBU
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-base px-4 py-2">
                                {m.motif || "—"}
                              </Badge>
                            </TableCell>
                            <TableCell className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                {getUserName(m.utilisateur).charAt(0)}
                              </div>
                              <span className="font-medium">{getUserName(m.utilisateur)}</span>
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                <span className="font-medium">{formatDate(m.created_at)}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {/* Pagination Premium */}
                  <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-t">
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                      Affichage <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> à{" "}
                      <strong>{Math.min(currentPage * itemsPerPage, filteredMovements.length)}</strong> sur{" "}
                      <strong>{filteredMovements.length}</strong> mouvements
                    </p>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                        <ChevronsLeft className="h-5 w-5" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <span className="px-6 py-3 bg-white dark:bg-slate-800 rounded-xl font-bold text-lg border">
                        Page {currentPage} / {totalPages || 1}
                      </span>
                      <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                        <ChevronsRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </POSLayout>
  );
}
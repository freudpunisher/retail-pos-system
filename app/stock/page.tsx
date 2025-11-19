"use client"
import { useState, useMemo, useEffect } from "react"
import { POSLayout } from "@/components/pos-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search, Package, Store, TrendingUp, TrendingDown, Calendar, Filter,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertCircle,
  Box, Warehouse, Layers
} from "lucide-react"
import { useStocks } from "@/hooks/useStock"

export default function StockPage() {
  const { stocks, loading, error , fetchStocks} = useStocks()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedPointVente, setSelectedPointVente] = useState("all")
  const [selectedProduit, setSelectedProduit] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)


  useEffect(() => { fetchStocks() }, [fetchStocks])

  // Extraction des filtres uniques
  const types = useMemo(() => {
    if (!stocks?.length) return []
    return Array.from(new Set(stocks.map((s: any) => s.categorie_nom || "Non défini")))
  }, [stocks])

  const pointsVente = useMemo(() => {
    if (!stocks?.length) return []
    return Array.from(new Set(stocks.map((s: any) => s.point_vente_nom || s.point_vente)))
  }, [stocks])

  const produits = useMemo(() => {
    if (!stocks?.length) return []
    return Array.from(new Set(stocks.map((s: any) => s.produit_nom)))
  }, [stocks])

  // Filtrage
  const filteredStocks = useMemo(() => {
    return (stocks || []).filter((stock: any) => {
      const matchesSearch = 
        (stock.produit_nom || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (stock.point_vente_nom || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (stock.produit_reference || "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = selectedType === "all" || (stock.categorie_nom || "Non défini") === selectedType
      const matchesPV = selectedPointVente === "all" || (stock.point_vente_nom || stock.point_vente) === selectedPointVente
      const matchesProduit = selectedProduit === "all" || stock.produit_nom === selectedProduit

      return matchesSearch && matchesType && matchesPV && matchesProduit
    })
  }, [stocks, searchTerm, selectedType, selectedPointVente, selectedProduit])

  // Pagination
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage)
  const paginatedStocks = filteredStocks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => { setCurrentPage(1) }, [searchTerm, selectedType, selectedPointVente, selectedProduit])

  const getStockStatus = (qty: number) => {
    if (qty === 0) return { label: "Rupture", color: "bg-red-500", text: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" }
    if (qty <= 5) return { label: "Critique", color: "bg-orange-500", text: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" }
    if (qty <= 20) return { label: "Faible", color: "bg-yellow-500", text: "text-yellow-700", bg: "bg-yellow-50 dark:bg-yellow-900/20" }
    return { label: "Bon", color: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" }
  }

  const formatDate = (date?: string | null) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
  }

  if (loading) {
    return (
      <POSLayout currentPath="/stock">
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xl text-slate-600 dark:text-slate-400">Chargement des stocks en cours...</p>
          </div>
        </div>
      </POSLayout>
    )
  }

  if (error) {
    return (
      <POSLayout currentPath="/stock">
        <div className="p-8">
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/30">
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-300">Erreur de chargement</p>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </POSLayout>
    )
  }

  return (
    <POSLayout currentPath="/stock">
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="p-6 space-y-8 max-w-7xl mx-auto">

            {/* Header Magnifique */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl">
                    <Warehouse className="h-12 w-12 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">État des Stocks</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 flex items-center">
                      <Layers className="h-5 w-5 mr-2 text-blue-500" />
                      Suivi en temps réel de tous vos produits
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Premium */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl border-0 overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Produits totaux</p>
                      <p className="text-3xl font-bold mt-1">{filteredStocks.length}</p>
                    </div>
                    <Package className="h-12 w-12 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-xl border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100">Points de vente</p>
                      <p className="text-3xl font-bold mt-1">{pointsVente.length}</p>
                    </div>
                    <Store className="h-12 w-12 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-xl border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Catégories</p>
                      <p className="text-3xl font-bold mt-1">{types.length}</p>
                    </div>
                    <Filter className="h-12 w-12 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-xl border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Stock total</p>
                      <p className="text-3xl font-bold mt-1">
                        {filteredStocks.reduce((acc: number, s: any) => acc + (s.quantite_disponible || 0), 0)}
                      </p>
                    </div>
                    <TrendingUp className="h-12 w-12 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtres Pro */}
            <Card className="shadow-lg border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      placeholder="Rechercher un produit, référence ou point de vente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-14 text-lg bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500"
                    />
                  </div>

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-64 h-14">
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={selectedPointVente} onValueChange={setSelectedPointVente}>
                    <SelectTrigger className="w-64 h-14">
                      <SelectValue placeholder="Tous les points de vente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les points de vente</SelectItem>
                      {pointsVente.map((pv) => <SelectItem key={pv} value={pv}>{pv}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tableau Ultra Pro */}
            <Card className="shadow-2xl border-0 overflow-hidden bg-white/95 dark:bg-slate-800/95 backdrop-blur">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Box className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  Détail des Stocks par Produit
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-700">
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300"><Store className="h-5 w-5 inline mr-2" />Point de vente</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300"><Package className="h-5 w-5 inline mr-2" />Produit</TableHead>
                        <TableHead className="font-bold text-center text-slate-700 dark:text-slate-300">Qté Actuelle</TableHead>
                        <TableHead className="font-bold text-center text-slate-700 dark:text-slate-300">Réservée</TableHead>
                        <TableHead className="font-bold text-center text-slate-700 dark:text-slate-300">Disponible</TableHead>
                        <TableHead className="font-bold text-center text-slate-700 dark:text-slate-300">Statut</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300"><TrendingUp className="h-5 w-5 inline mr-2" />Dernière entrée</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300"><TrendingDown className="h-5 w-5 inline mr-2" />Dernière sortie</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedStocks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-16">
                            <Package className="h-20 w-20 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                            <p className="text-xl font-medium text-slate-500 dark:text-slate-400">Aucun stock trouvé</p>
                            <p className="text-slate-400">Modifiez vos filtres pour voir les résultats</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedStocks.map((stock: any) => {
                          const status = getStockStatus(stock.quantite_disponible || 0)
                          return (
                            <TableRow key={stock.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200">
                              <TableCell className="font-semibold text-blue-600 dark:text-blue-400">
                                <div className="flex items-center gap-2">
                                  <Store className="h-4 w-4" />
                                  {stock.point_vente_nom || stock.point_vente}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{stock.produit_nom}</p>
                                  <p className="text-sm text-slate-500">Ref: {stock.produit_reference || "—"}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="text-lg px-3 py-1 font-mono">
                                  {stock.quantite_actuelle || 0}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary" className="font-mono">
                                  {stock.quantite_reservee || 0}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className={`text-lg font-bold font-mono ${status.text} ${status.bg}`}>
                                  {stock.quantite_disponible || 0}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="flex items-center justify-center gap-2">
                                      <div className={`w-3 h-3 rounded-full ${status.color} animate-pulse`}></div>
                                      <span className="font-semibold">{status.label}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>{status.label} stock</TooltipContent>
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-emerald-600">
                                  <Calendar className="h-4 w-4" />
                                  <span className="text-sm font-medium">{formatDate(stock.date_derniere_entree)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-red-600">
                                  <Calendar className="h-4 w-4" />
                                  <span className="text-sm font-medium">{formatDate(stock.date_derniere_sortie)}</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Premium */}
                {filteredStocks.length > 0 && (
                  <div className="border-t bg-slate-50/80 dark:bg-slate-800/80 px-6 py-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span>Lignes par page :</span>
                        <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1) }}>
                          <SelectTrigger className="w-20 h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[10, 20, 50, 100].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <span className="font-medium">
                          {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredStocks.length)} sur {filteredStocks.length}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg font-semibold text-blue-700 dark:text-blue-300">
                          Page {currentPage} / {totalPages}
                        </div>
                        <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </TooltipProvider>
    </POSLayout>
  )
}
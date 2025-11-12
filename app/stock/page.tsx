"use client"

import { useState, useMemo, useEffect } from "react"
import { POSLayout } from "@/components/pos-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Search, Package, Store, TrendingUp, TrendingDown, Calendar, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useStocks } from "@/hooks/useStock"

export default function StockPage() {
    const { stocks, loading, error, fetchStocks } = useStocks()
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedType, setSelectedType] = useState<string>("")
    const [selectedPointVente, setSelectedPointVente] = useState<string>("")
    const [selectedProduit, setSelectedProduit] = useState<string>("")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    useEffect(() => {
        fetchStocks();
    }, [fetchStocks]);

    // Extraction des valeurs uniques pour les filtres
    const types = useMemo(() => {
        if (!stocks?.length) return []
        return Array.from(new Set(stocks.map((s) => s.categorie_nom || "Non défini")))
    }, [stocks])

    const pointsVente = useMemo(() => {
        if (!stocks?.length) return []
        return Array.from(new Set(stocks.map((s) => s.point_vente)))
    }, [stocks])

    const produits = useMemo(() => {
        if (!stocks?.length) return []
        return Array.from(new Set(stocks.map((s) => s.produit_nom)))
    }, [stocks])

    // Application des filtres
    const filteredStocks = useMemo(() => {
        return (stocks || []).filter((stock) => {
            const stockPointVente = stock.point_vente || ''
            const stockType = stock.categorie_nom || ''
            const matchesSearch =
                (stock.produit_nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                stockPointVente.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesType = selectedType && selectedType !== "all" ? stockType === selectedType : true
            const matchesPointVente = selectedPointVente && selectedPointVente !== "all"
                ? stockPointVente === selectedPointVente
                : true
            const matchesProduit = selectedProduit && selectedProduit !== "all"
                ? stock.produit_nom === selectedProduit
                : true

            return matchesSearch && matchesType && matchesPointVente && matchesProduit
        })
    }, [stocks, searchTerm, selectedType, selectedPointVente, selectedProduit])

    // Pagination
    const totalPages = Math.ceil(filteredStocks.length / itemsPerPage)
    const paginatedStocks = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        return filteredStocks.slice(startIndex, startIndex + itemsPerPage)
    }, [filteredStocks, currentPage, itemsPerPage])

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, selectedType, selectedPointVente, selectedProduit, itemsPerPage])

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "—"
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const getStockStatus = (disponible: number) => {
        if (disponible === 0) return { label: "Rupture", color: "bg-red-500" }
        if (disponible < 10) return { label: "Faible", color: "bg-orange-500" }
        if (disponible < 50) return { label: "Moyen", color: "bg-yellow-500" }
        return { label: "Bon", color: "bg-green-500" }
    }

    if (loading) {
        return (
            <POSLayout currentPath="/stock">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-muted-foreground">Chargement des stocks...</p>
                    </div>
                </div>
            </POSLayout>
        )
    }

    if (error) {
        return (
            <POSLayout currentPath="/stock">
                <div className="p-4">
                    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <Package className="h-5 w-5" />
                                <span className="font-medium">Erreur: {error}</span>
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
                <div className="space-y-6">
                    {/* Header with Stats */}
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">État des Stocks</h1>
                                <p className="text-muted-foreground mt-1">Gestion et suivi de vos inventaires</p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="border-l-4 border-l-blue-500 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Produits</p>
                                            <p className="text-2xl font-bold">{filteredStocks.length}</p>
                                        </div>
                                        <Package className="h-8 w-8 text-blue-500" />
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card className="border-l-4 border-l-green-500 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Points de Vente</p>
                                            <p className="text-2xl font-bold">{pointsVente.length}</p>
                                        </div>
                                        <Store className="h-8 w-8 text-green-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-purple-500 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Catégories</p>
                                            <p className="text-2xl font-bold">{types.length}</p>
                                        </div>
                                        <Filter className="h-8 w-8 text-purple-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-orange-500 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Stock Total</p>
                                            <p className="text-2xl font-bold">
                                                {filteredStocks.reduce((acc, s) => acc + (s.quantite_actuelle || 0), 0)}
                                            </p>
                                        </div>
                                        <TrendingUp className="h-8 w-8 text-orange-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Filtres */}
                    <Card className="bg-white dark:bg-slate-800 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex flex-wrap gap-4">
                                {/* Recherche globale */}
                                <div className="relative flex-1 min-w-[250px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher produit ou point de vente..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 h-11"
                                    />
                                </div>

                                {/* Filtre par type (catégorie) */}
                                <Select value={selectedType} onValueChange={setSelectedType}>
                                    <SelectTrigger className="w-48 h-11">
                                        <SelectValue placeholder="Catégorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes les catégories</SelectItem>
                                        {types.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Filtre par point de vente */}
                                <Select value={selectedPointVente} onValueChange={setSelectedPointVente}>
                                    <SelectTrigger className="w-48 h-11">
                                        <SelectValue placeholder="Point de vente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les points</SelectItem>
                                        {pointsVente.map((pv) => (
                                            <SelectItem key={pv} value={pv}>
                                                {pv}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Filtre par produit */}
                                <Select value={selectedProduit} onValueChange={setSelectedProduit}>
                                    <SelectTrigger className="w-48 h-11">
                                        <SelectValue placeholder="Produit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les produits</SelectItem>
                                        {produits.map((p) => (
                                            <SelectItem key={p} value={p}>
                                                {p}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tableau des stocks */}
                    <Card className="bg-white dark:bg-slate-800 shadow-sm">
                        <CardContent className="p-8">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="font-semibold">
                                                <div className="flex items-center gap-2">
                                                    <Store className="h-4 w-4" />
                                                    Point de vente
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4" />
                                                    Produit
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-semibold text-center">Qté actuelle</TableHead>
                                            <TableHead className="font-semibold text-center">Qté réservée</TableHead>
                                            <TableHead className="font-semibold text-center">Disponible</TableHead>
                                            <TableHead className="font-semibold">Statut</TableHead>
                                            <TableHead className="font-semibold">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4" />
                                                    Dernière entrée
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                <div className="flex items-center gap-2">
                                                    <TrendingDown className="h-4 w-4" />
                                                    Dernière sortie
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedStocks.length > 0 ? (
                                            paginatedStocks.map((stock) => {
                                                const status = getStockStatus(stock.quantite_disponible || 0)
                                                return (
                                                    <TableRow key={stock.id} className="hover:bg-muted/30 transition-colors">
                                                        <TableCell className="font-medium">{stock.point_vente_nom}</TableCell>
                                                        <TableCell>{stock.produit_nom}</TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="outline" className="font-mono">
                                                                {stock.quantite_actuelle}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="outline" className="font-mono">
                                                                {stock.quantite_reservee}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="secondary" className="font-mono font-semibold">
                                                                {stock.quantite_disponible}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                                                                <span className="text-sm">{status.label}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Calendar className="h-3 w-3" />
                                                                <span className="text-sm">{formatDate(stock.date_derniere_entree)}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Calendar className="h-3 w-3" />
                                                                <span className="text-sm">{formatDate(stock.date_derniere_sortie)}</span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-12">
                                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                        <Package className="h-12 w-12 opacity-20" />
                                                        <p className="font-medium">Aucun stock trouvé</p>
                                                        <p className="text-sm">Essayez de modifier vos filtres</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination Controls */}
                            {filteredStocks.length > 0 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Lignes par page:</span>
                                        <Select
                                            value={itemsPerPage.toString()}
                                            onValueChange={(value) => setItemsPerPage(Number(value))}
                                        >
                                            <SelectTrigger className="w-20 h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5">5</SelectItem>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="20">20</SelectItem>
                                                <SelectItem value="50">50</SelectItem>
                                                <SelectItem value="100">100</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <span className="text-sm text-muted-foreground ml-4">
                                            Affichage {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredStocks.length)} sur {filteredStocks.length} résultats
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                            className="h-9 w-9"
                                        >
                                            <ChevronsLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="h-9 w-9"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        
                                        <div className="flex items-center gap-1 px-3">
                                            <span className="text-sm font-medium">Page {currentPage}</span>
                                            <span className="text-sm text-muted-foreground">sur {totalPages}</span>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="h-9 w-9"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className="h-9 w-9"
                                        >
                                            <ChevronsRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </TooltipProvider>
        </POSLayout>
    )
}
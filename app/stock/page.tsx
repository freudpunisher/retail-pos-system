"use client"

import {useState, useMemo, useEffect} from "react"
import { POSLayout } from "@/components/pos-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Search } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { useStocks } from "@/hooks/useStock"

export default function StockPage() {
    const { stocks, isLoading, error,fetchStocks } = useStocks()
    // console.log(stocks)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedType, setSelectedType] = useState<string>("")
    const [selectedPointVente, setSelectedPointVente] = useState<string>("")
    const [selectedProduit, setSelectedProduit] = useState<string>("")
    // const [selectedStockId, setSelectedStockId] = useState<string | null>(null);

    useEffect(() => {
        fetchStocks();
    }, [fetchStocks]);

    // Extraction des valeurs uniques pour les filtres
    const types = useMemo(() => {
        if (!stocks) return []
        return Array.from(new Set(stocks.map((s) => s.type_stock || "Non défini")))
    }, [stocks])

    const pointsVente = useMemo(() => {
        if (!stocks) return []
        return Array.from(new Set(stocks.map((s) => s.point_vente_nom)))
    }, [stocks])

    const produits = useMemo(() => {
        if (!stocks) return []
        return Array.from(new Set(stocks.map((s) => s.produit_nom)))
    }, [stocks])


    // Application des filtres
    const filteredStocks = useMemo(() => {
        return (stocks || []).filter((stock) => {
            const matchesSearch =
                stock.produit_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                stock.point_vente_nom.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesType = selectedType && selectedType !== "all" ? stock.type_stock === selectedType : true
            const matchesPointVente = selectedPointVente && selectedPointVente !== "all"
                ? stock.point_vente_nom === selectedPointVente
                : true
            const matchesProduit = selectedProduit && selectedProduit !== "all"
                ? stock.produit_nom === selectedProduit
                : true

            return matchesSearch && matchesType && matchesPointVente && matchesProduit
        })
    }, [stocks, searchTerm, selectedType, selectedPointVente, selectedProduit])


    const formatDate = (dateString?: string) => {
        if (!dateString) return "Non défini"
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    if (isLoading) return <div className="p-4">Chargement...</div>
    if (error) return <div className="p-4 text-red-500">Erreur: {(error as Error).message}</div>

    return (
        <POSLayout currentPath="/stock">
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">État des Stocks</h1>
                    </div>

                    {/* Filtres */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-wrap gap-4">
                                {/* Recherche globale */}
                                <div className="relative flex-1 min-w-[250px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher produit ou point de vente..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                {/* Filtre par type */}
                                <Select value={selectedType} onValueChange={setSelectedType}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filtrer par type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous</SelectItem>
                                        {types.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Filtre par point de vente */}
                                <Select value={selectedPointVente} onValueChange={setSelectedPointVente}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filtrer par point de vente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous</SelectItem>
                                        {pointsVente.map((pv) => (
                                            <SelectItem key={pv} value={pv}>
                                                {pv}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Filtre par produit */}
                                <Select value={selectedProduit} onValueChange={setSelectedProduit}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filtrer par produit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous</SelectItem>
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
                    <Card>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Point de vente</TableHead>
                                        <TableHead>Produit</TableHead>
                                        <TableHead>Quantité actuelle</TableHead>
                                        <TableHead>Quantité réservée</TableHead>
                                        <TableHead>Disponible</TableHead>
                                        <TableHead>Dernière entrée</TableHead>
                                        <TableHead>Dernière sortie</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStocks.length > 0 ? (
                                        filteredStocks.map((stock) => (
                                            <TableRow key={stock.id}>
                                                <TableCell>{stock.point_vente_nom}</TableCell>
                                                <TableCell>{stock.produit_nom}</TableCell>
                                                <TableCell>{stock.quantite_actuelle}</TableCell>
                                                <TableCell>{stock.quantite_reservee}</TableCell>
                                                <TableCell>
                                                    {stock.quantite_actuelle - stock.quantite_reservee}
                                                </TableCell>
                                                <TableCell>{formatDate(stock.date_derniere_entree)}</TableCell>
                                                <TableCell>{formatDate(stock.date_derniere_sortie)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                                                Aucun stock trouvé
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </TooltipProvider>
        </POSLayout>
    )
}

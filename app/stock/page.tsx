"use client"

import React, {useState, useMemo, useEffect} from "react"
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
import {bgMagenta} from "next/dist/lib/picocolors";
import {Badge} from "@/components/ui/badge";

export default function StockPage() {
    const { stocks, loading, error, fetchStocks } = useStocks()
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedType, setSelectedType] = useState<string>("")
    const [selectedPointVente, setSelectedPointVente] = useState<string>("")
    const [selectedProduit, setSelectedProduit] = useState<string>("")

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
        const map = new Map<string, string>()

        stocks.forEach((s) => {
            if (s.point_vente && s.point_vente_nom) {
                map.set(s.point_vente, s.point_vente_nom)
            }
        })
        return Array.from(map, ([id, nom]) => ({ id, nom }))
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

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "Non défini"
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    if (loading) return <div className="p-4">Chargement...</div>
    // @ts-ignore
    if (error) {
        return <div className="p-4 text-red-500">Erreur: {error}</div>
    }

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

                                {/* Filtre par type (catégorie) */}
                                <Select value={selectedType} onValueChange={setSelectedType}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filtrer par catégorie" />
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
                                            <SelectItem key={pv.id} value={pv.id}>
                                                {pv.nom}
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
                                                <TableCell>{stock.point_vente_nom}</TableCell>  {/* Utilise l'ID */}
                                                <TableCell>
                                                    <Badge variant="secondary"
                                                           className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800 mr-3">
                                                        {stock.produit_reference}
                                                    </Badge>
                                                    {stock.produit_nom}
                                                </TableCell>
                                                <TableCell>{stock.quantite_actuelle}</TableCell>
                                                <TableCell>{stock.quantite_reservee}</TableCell>
                                                <TableCell>{stock.quantite_disponible}</TableCell>  {/* Utilise le champ pré-calculé */}
                                                <TableCell>{formatDate(stock.date_derniere_entree)}</TableCell>
                                                <TableCell>{formatDate(stock.date_derniere_sortie)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-muted-foreground py-6">  {/* Corrigé en 7 */}
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
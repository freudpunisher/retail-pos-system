"use client";

import React, {useState, useEffect, useMemo, JSX} from "react";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { POSLayout } from "@/components/pos-layout";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Search,
    TrendingUp,
    TrendingDown,
    ArrowRightLeft,
    Edit,
    Package,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import { useStockMovement, useStockMovements } from "@/hooks/useStockMovements";
import { useQuery } from "@tanstack/react-query";
import { StockService } from "@/services/stockService";
import { Stock } from "@/types/stock.types";
import { MouvementStock, TypeMouvement } from "@/types/StockMovement";

const movementTypes = [
    { value: "all", label: "Tous les Types" },
    { value: "entree", label: "Entrée" },
    { value: "sortie", label: "Sortie" },
    { value: "transfert_in", label: "Transfert Entrant" },
    { value: "transfert_out", label: "Transfert Sortant" },
    { value: "ajustement", label: "Ajustement" },
    { value: "inventaire", label: "Inventaire" },
];

export default function MovementsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("all");

    // 🧠 Les filtres sont mémorisés pour éviter des refetchs inutiles
    const filters = useMemo(
        () => ({
            type_mouvement: selectedType !== "all" ? selectedType : undefined,
            search: searchTerm || undefined,
        }),
        [searchTerm, selectedType]
    );

    const {
        data: movements = [],
        isLoading: movementsLoading,
        error: movementsError,
        refetch: refetchMovements,
    } = useStockMovements(filters);

    const { data: stocks = [] } = useQuery({
        queryKey: ["stocks"],
        queryFn: () => StockService.getStocks(),
    });

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleString("fr-FR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });

    const getMovementIcon = (type: TypeMouvement) => {
        const icons: Record<TypeMouvement, JSX.Element> = {
            entree: <TrendingUp className="h-4 w-4 text-green-600" />,
            sortie: <TrendingDown className="h-4 w-4 text-red-600" />,
            transfert_in: <ArrowRightLeft className="h-4 w-4 text-blue-600" />,
            transfert_out: <ArrowRightLeft className="h-4 w-4 text-orange-600" />,
            ajustement: <Edit className="h-4 w-4 text-purple-600" />,
            inventaire: <Package className="h-4 w-4 text-gray-600" />,
        };
        return icons[type] || <Package className="h-4 w-4 text-gray-600" />;
    };

    const getMovementBadge = (type: TypeMouvement) => {
        const badges: Record<TypeMouvement, JSX.Element> = {
            entree: <Badge className="bg-green-500 text-white">Entrée</Badge>,
            sortie: <Badge className="bg-red-500 text-white">Sortie</Badge>,
            transfert_in: <Badge className="bg-blue-500 text-white">Transfert Entrant</Badge>,
            transfert_out: <Badge className="bg-orange-500 text-white">Transfert Sortant</Badge>,
            ajustement: <Badge className="bg-purple-500 text-white">Ajustement</Badge>,
            inventaire: <Badge className="bg-gray-500 text-white">Inventaire</Badge>,
        };
        return badges[type] || <Badge variant="outline">{type}</Badge>;
    };

    if (movementsLoading) {
        return (
            <POSLayout currentPath="/stock/movements">
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-lg">Chargement...</span>
                </div>
            </POSLayout>
        );
    }

    if (movementsError) {
        return (
            <POSLayout currentPath="/stock/movements">
                <div className="flex items-center justify-center h-96 text-center">
                    <p className="text-destructive flex items-center justify-center mb-4">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Erreur lors du chargement des mouvements.
                    </p>
                    <Button onClick={() => refetchMovements()}>Réessayer</Button>
                </div>
            </POSLayout>
        );
    }

    return (
        <POSLayout currentPath="/stock/movements">
            <div className="space-y-8 p-6">
                {/* 🧾 En-tête */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Mouvements de Stock</h1>
                        <p className="text-muted-foreground">
                            Suivi et historique des entrées/sorties d’inventaire
                        </p>
                    </div>
                </div>

                {/* Filtres */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-4">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher par produit ou référence..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Type de mouvement" />
                                </SelectTrigger>
                                <SelectContent>
                                    {movementTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* 📦 Tableau */}
                <Card>
                    <CardHeader>
                        <CardTitle>Historique des Mouvements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Produit</TableHead>
                                    <TableHead>Point de Vente</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Quantité</TableHead>
                                    <TableHead>Prix</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Motif</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {movements.length > 0 ? (
                                    movements.map((mvt) => (
                                        <TableRow key={mvt.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    {getMovementIcon(mvt.type_mouvement)}
                                                    {getMovementBadge(mvt.type_mouvement)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-green-100 text-green-800 border-green-200 mr-3"
                                                >
                                                    {mvt.produit_reference}
                                                </Badge>
                                                {mvt.produit_nom}
                                            </TableCell>
                                            <TableCell>{mvt.point_vente_nom}</TableCell>
                                            <TableCell>{formatDate(mvt.created_at)}</TableCell>
                                            <TableCell>{mvt.quantite}</TableCell>
                                            <TableCell>{mvt.prix_unitaire}</TableCell>
                                            <TableCell>
                                                {(mvt.quantite * mvt.prix_unitaire).toLocaleString('fr-FR', {
                                                    style: 'currency',
                                                    currency: 'BIF', // ou EUR, USD selon ton cas
                                                })}
                                            </TableCell>
                                            <TableCell>{mvt.motif}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Aucun mouvement trouvé pour les filtres appliqués.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </POSLayout>
    );
}

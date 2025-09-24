"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { POSLayout } from "@/components/pos-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    TrendingUp,
    TrendingDown,
    ArrowRightLeft,
    Package,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import { useStockMovements } from "@/hooks/useStockMovements";
import { StockMovementService } from "@/services/stockMovementService";
import {
    StockMovementResponse,
    StockMovementFormData,
    Stock,
    Produit,
    PointVente,
    User,
    StockMovementLigne,
} from "@/types/StockMovement";

const movementTypes = [
    { value: "all", label: "Tous les Types" },
    { value: "entree", label: "Entrée" },
    { value: "sortie", label: "Sortie" },
    { value: "transfert_in", label: "Transfert Entrant" },
    { value: "transfert_out", label: "Transfert Sortant" },
    { value: "ajustement", label: "Ajustement" },
    { value: "inventaire", label: "Inventaire" },
];

const unite_produit = [
    { value: "piece", label: "Pièce" },
    { value: "kg", label: "Kilogramme" },
    { value: "litre", label: "Litre" },
    { value: "metre", label: "Mètre" },
    { value: "paquet", label: "Paquet" },
    { value: "boite", label: "Boite" },
    { value: "sac", label: "Sac" },
];

export default function MovementsPage() {
    const {
        movements,
        stocks,
        produits,
        pointsVente,
        users,
        loading,
        error,
        fetchStockMovements,
        fetchStocks,
        fetchProduits,
        fetchPointsVente,
        fetchUsers,
        createStockMovement,
        updateStockMovement,
        deleteStockMovement,
    } = useStockMovements();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("all");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedMovementId, setSelectedMovementId] = useState<string | null>(null);
    const [editingMovementId, setEditingMovementId] = useState<string | null>(null);
    const [detailedMovement, setDetailedMovement] = useState<StockMovementResponse | null>(null);

    const { register, control, handleSubmit, reset, formState: { errors }, setValue } = useForm<StockMovementFormData>({
        defaultValues: {
            type_mouvement: "entree",
            stock: "",
            reference_document: "",
            reference: "",
            utilisateur: "",
            lignes: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "lignes",
    });

    useEffect(() => {
        fetchStockMovements();
        fetchStocks();
        fetchProduits();
        fetchPointsVente();
        fetchUsers();
    }, [fetchStockMovements, fetchStocks, fetchProduits, fetchPointsVente, fetchUsers]);

    useEffect(() => {
        if (selectedMovementId || editingMovementId) {
            const fetchMovementDetails = async () => {
                try {
                    const movement = await StockMovementService.getStockMovementById(selectedMovementId || editingMovementId!);
                    setDetailedMovement(movement);
                    if (editingMovementId) {
                        setValue("type_mouvement", movement.type_mouvement);
                        setValue("stock", movement.stock);
                        setValue("reference_document", movement.reference_document || "");
                        setValue("reference", movement.reference || "");
                        setValue("utilisateur", movement.utilisateur || "");
                        setValue("lignes", movement.lignes?.map(ligne => ({
                            produit: ligne.produit,
                            unite: ligne.unite,
                            quantite_mouvement: ligne.quantite_mouvement,
                            prix_unitaire: parseFloat(ligne.prix_unitaire) || 0,
                        })) || []);
                    }
                } catch (err) {
                    console.error("Error fetching movement details:", err);
                }
            };
            fetchMovementDetails();
        }
    }, [selectedMovementId, editingMovementId, setValue]);

    const filteredMovements = movements.filter((movement) => {
        const stock = stocks.find((s) => s.id === movement.stock);
        const produit = produits.find((p) => p.id === stock?.produit);
        const matchesSearch =
            (produit?.nom.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            movement.reference_document.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === "all" || movement.type_mouvement === selectedType;
        return matchesSearch && matchesType;
    });

    const getMovementIcon = (type: string) => {
        const icons = {
            entree: <TrendingUp className="h-4 w-4 text-green-600" />,
            sortie: <TrendingDown className="h-4 w-4 text-red-600" />,
            transfert_in: <ArrowRightLeft className="h-4 w-4 text-blue-600" />,
            transfert_out: <ArrowRightLeft className="h-4 w-4 text-orange-600" />,
            ajustement: <Edit className="h-4 w-4 text-purple-600" />,
            inventaire: <Package className="h-4 w-4 text-gray-600" />,
        };
        return icons[type as keyof typeof icons] || <Package className="h-4 w-4 text-gray-600" />;
    };

    const getMovementBadge = (type: string) => {
        const badges = {
            entree: <Badge className="bg-green-500 text-white">Entrée</Badge>,
            sortie: <Badge className="bg-red-500 text-white">Sortie</Badge>,
            transfert_in: <Badge className="bg-blue-500 text-white">Transfert Entrant</Badge>,
            transfert_out: <Badge className="bg-orange-500 text-white">Transfert Sortant</Badge>,
            ajustement: <Badge className="bg-purple-500 text-white">Ajustement</Badge>,
            inventaire: <Badge className="bg-gray-500 text-white">Inventaire</Badge>,
        };
        return badges[type as keyof typeof badges] || <Badge variant="outline">{type}</Badge>;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("fr-FR", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleCreateOrUpdateMovement = async (data: StockMovementFormData) => {
        try {
            // Convert prix_unitaire to string for API compatibility
            const formattedData = {
                ...data,
                lignes: data.lignes.map(ligne => ({
                    ...ligne,
                    prix_unitaire: ligne.prix_unitaire.toString(),
                })),
            };
            if (editingMovementId) {
                await updateStockMovement(editingMovementId, formattedData);
                setIsEditModalOpen(false);
            } else {
                await createStockMovement(formattedData);
                setIsAddModalOpen(false);
            }
            reset();
            setEditingMovementId(null);
            setDetailedMovement(null);
        } catch (err) {
            console.error("Error saving movement:", err);
        }
    };

    const handleEditMovement = (movement: StockMovementResponse) => {
        setEditingMovementId(movement.id);
        setIsEditModalOpen(true);
    };

    const handleDeleteMovement = async (id: string) => {
        try {
            await deleteStockMovement(id);
        } catch (err) {
            console.error("Error deleting movement:", err);
        }
    };

    // @ts-ignore
    const renderForm = (isEdit = false) => (
        <form onSubmit={handleSubmit(handleCreateOrUpdateMovement)} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type_mouvement">Type de Mouvement</Label>
                    <Controller
                        name="type_mouvement"
                        control={control}
                        rules={{ required: "Type de mouvement est requis" }}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {movementTypes.slice(1).map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.type_mouvement && <p className="text-sm text-destructive">{errors.type_mouvement.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stock">Stock (Produit & Point de Vente)</Label>
                    <Controller
                        name="stock"
                        control={control}
                        rules={{ required: "Stock est requis" }}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un stock" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stocks.map((stock) => {
                                        const produit = produits.find((p) => p.id === stock.produit);
                                        const pointVente = pointsVente.find((pv) => pv.id === stock.point_vente);
                                        return (
                                            <SelectItem key={stock.id} value={stock.id}>
                                                {produit?.nom || "Inconnu"} - {pointVente?.nom || "Inconnu"}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reference_document">Référence Document</Label>
                    <Input
                        id="reference_document"
                        {...register("reference_document")}
                        placeholder="Numéro de référence ou document"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reference">Référence</Label>
                    <Input
                        id="reference"
                        {...register("reference")}
                        placeholder="Référence du mouvement"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="utilisateur">Utilisateur</Label>
                    <Controller
                        name="utilisateur"
                        control={control}
                        rules={{ required: "Utilisateur est requis" }}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un utilisateur" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.nom}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.utilisateur && <p className="text-sm text-destructive">{errors.utilisateur.message}</p>}
                </div>
            </div>
            <div className="space-y-2">
                <Label>Articles du mouvement</Label>
                <div className="border rounded-lg bg-background/95">
                    {fields.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Aucun article ajouté</p>
                    ) : (
                        <Table className="w-full">
                            <TableHeader>
                                <TableRow className="hover:bg-muted/50">
                                    <TableHead className="text-foreground font-semibold w-2/5">Produit</TableHead>
                                    <TableHead className="text-foreground font-semibold w-2/5">Unité Mesure</TableHead>
                                    <TableHead className="text-foreground font-semibold text-center w-1/5">Qté Mouvement</TableHead>
                                    <TableHead className="text-foreground font-semibold text-center w-1/5">Prix Unitaire</TableHead>
                                    <TableHead className="text-foreground font-semibold text-center w-1/5">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field, index) => (
                                    <TableRow key={field.id} className="hover:bg-muted/20">
                                        <TableCell className="py-2">
                                            <Controller
                                                name={`lignes.${index}.produit`}
                                                control={control}
                                                rules={{ required: "Produit est requis" }}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="border-muted h-9">
                                                            <SelectValue placeholder="Sélectionner un produit" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {produits.map((produit) => (
                                                                <SelectItem key={produit.id} value={produit.id}>
                                                                    {produit.nom}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.lignes?.[index]?.produit && (
                                                <p className="text-xs text-destructive mt-1">{errors.lignes?.[index]?.produit?.message}</p>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <Controller
                                                name={`lignes.${index}.unite`}
                                                control={control}
                                                rules={{ required: "Unité est requise" }}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="border-muted h-9">
                                                            <SelectValue placeholder="Sélectionner une unité" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {unite_produit.slice(1).map((type) => (
                                                                <SelectItem key={type.value} value={type.value}>
                                                                    {type.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.lignes?.[index]?.unite && (
                                                <p className="text-xs text-destructive mt-1">{errors.lignes?.[index]?.unite?.message}</p>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-2 text-center">
                                            <Input
                                                type="number"
                                                {...register(`lignes.${index}.quantite_mouvement`, {
                                                    required: "Quantité demandée est requise",
                                                    min: { value: 1, message: "Quantité doit être positive" },
                                                    valueAsNumber: true,
                                                })}
                                                className="border-muted focus:ring-primary h-9 text-center"
                                            />
                                            {errors.lignes?.[index]?.quantite_mouvement && (
                                                <p className="text-xs text-destructive mt-1">{errors.lignes?.[index]?.quantite_mouvement?.message}</p>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-2 text-center">
                                            <Input
                                                type="number"
                                                {...register(`lignes.${index}.prix_unitaire`, {
                                                    required: "Prix unitaire est requis",
                                                    min: { value: 0, message: "Le prix doit être positif" },
                                                    valueAsNumber: true,
                                                })}
                                                className="border-muted focus:ring-primary h-9 text-center"
                                            />
                                            {errors.lignes?.[index]?.prix_unitaire && (
                                                <p className="text-xs text-destructive mt-1">{errors.lignes?.[index]?.prix_unitaire?.message}</p>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-2 text-center">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => remove(index)}
                                            >
                                                <Trash2 className="h-3 w-3 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            // @ts-ignore
                            append({produit: "", quantite_mouvement: 1, unite: "", prix_unitaire: 0});
                        }}
                        className="mt-4 ml-4"
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        Ajouter Article
                    </Button>
                </div>
            </div>
            <div className="flex justify-end space-x-2">
                <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                        setIsAddModalOpen(false);
                        setIsEditModalOpen(false);
                        reset();
                        setEditingMovementId(null);
                    }}
                    className="border-muted hover:bg-muted"
                >
                    Annuler
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            {isEdit ? "Mise à jour..." : "Création..."}
                        </>
                    ) : (
                        <>
                            <Plus className="h-4 w-4 mr-2" />
                            {isEdit ? "Mettre à jour" : "Créer"} Mouvement
                        </>
                    )}
                </Button>
            </div>
        </form>
    );

    if (loading && !movements.length) {
        return (
            <POSLayout currentPath="/stock/movements">
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-lg">Chargement...</span>
                </div>
            </POSLayout>
        );
    }

    if (error && !movements.length) {
        return (
            <POSLayout currentPath="/stock/movements">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center space-y-4">
                        <p className="text-destructive flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            Erreur: {error}
                        </p>
                        <Button
                            onClick={() => {
                                fetchStockMovements();
                                fetchStocks();
                                fetchProduits();
                                fetchPointsVente();
                                fetchUsers();
                            }}
                        >
                            Réessayer
                        </Button>
                    </div>
                </div>
            </POSLayout>
        );
    }

    return (
        <POSLayout currentPath="/stock/movements">
            <TooltipProvider>
                <div className="space-y-8 p-6">
                    {/* Page Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Mouvements de Stock</h1>
                            <p className="text-muted-foreground">Suivi des mouvements d'inventaire</p>
                        </div>
                        <div className="flex space-x-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    fetchStockMovements();
                                    fetchStocks();
                                    fetchProduits();
                                    fetchPointsVente();
                                    fetchUsers();
                                }}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                Rafraîchir
                            </Button>
                            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Ajouter Mouvement
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[95vh] overflow-y-auto p-8" style={{ width: '70vw', maxWidth: '70vw', minWidth: '70vw' }}>
                                    <DialogHeader>
                                        <DialogTitle>Ajouter un Mouvement</DialogTitle>
                                        <DialogDescription>Créer un nouveau mouvement de stock.</DialogDescription>
                                    </DialogHeader>
                                    {renderForm()}
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-wrap gap-4">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher produits ou références..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={selectedType} onValueChange={setSelectedType}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue />
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

                    {/* Movements Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Historique des Mouvements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <p className="text-sm text-destructive mb-4 flex items-center">
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    {error}
                                </p>
                            )}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Référence</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Réf reçus</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Utilisateur</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredMovements.map((movement) => {
                                        const stock = stocks.find((s) => s.id === movement.stock);
                                        const produit = produits.find((p) => p.id === stock?.produit);
                                        const pointVente = pointsVente.find((pv) => pv.id === stock?.point_vente);
                                        const user = users.find((u) => u.id === movement.utilisateur);
                                        return (
                                            <TableRow key={movement.id}>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        {getMovementIcon(movement.type_mouvement)}
                                                        {getMovementBadge(movement.type_mouvement)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{movement.reference}</TableCell>
                                                <TableCell>{pointVente?.nom || "Inconnu"}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{movement.reference_document}</Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(movement.created_at)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-1">
                                                        <span>{user?.nom || "Inconnu"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        setSelectedMovementId(movement.id);
                                                                        setIsDetailModalOpen(true);
                                                                    }}
                                                                >
                                                                    <Eye className="h-3 w-3 text-primary" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Voir les détails</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleEditMovement(movement)}
                                                                >
                                                                    <Edit className="h-3 w-3 text-primary" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Modifier</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDeleteMovement(movement.id)}
                                                                >
                                                                    <Trash2 className="h-3 w-3 text-destructive" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Supprimer</TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Edit Modal */}
                    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                        <DialogContent className="max-h-[95vh] overflow-y-auto p-8" style={{ width: '70vw', maxWidth: '70vw', minWidth: '70vw' }}>
                            <DialogHeader>
                                <DialogTitle>Modifier Mouvement</DialogTitle>
                                <DialogDescription>Mettre à jour les détails du mouvement.</DialogDescription>
                            </DialogHeader>
                            {renderForm(true)}
                        </DialogContent>
                    </Dialog>

                    {/* Detail Modal */}
                    <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                        <DialogContent className="max-h-[95vh] overflow-y-auto p-8" style={{ width: '70vw', maxWidth: '70vw', minWidth: '70vw' }}>
                            <DialogHeader>
                                <DialogTitle>Détails du Mouvement</DialogTitle>
                                <DialogDescription>Voir les informations détaillées.</DialogDescription>
                            </DialogHeader>
                            {detailedMovement ? (
                                <div>
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="space-y-2">
                                            <Label>Référence</Label>
                                            <p>{detailedMovement.reference || "Inconnu"}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Type de Mouvement</Label>
                                            <p>{movementTypes.find((t) => t.value === detailedMovement.type_mouvement)?.label || "Inconnu"}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Stock</Label>
                                            <p>
                                                {(() => {
                                                    const stock = stocks.find((s) => s.id === detailedMovement.stock);
                                                    const pointVente = pointsVente.find((pv) => pv.id === stock?.point_vente);
                                                    return pointVente?.nom || "Inconnu";
                                                })()}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Référence Document</Label>
                                            <p>{detailedMovement.reference_document || "Aucune"}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Utilisateur</Label>
                                            <p>{users.find((u) => u.id === detailedMovement.utilisateur)?.nom || "Inconnu"}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date de Création</Label>
                                            <p>{detailedMovement.created_at ? formatDate(detailedMovement.created_at) : "Inconnu"}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Articles du mouvement</Label>
                                        <div className="border rounded-lg bg-background/95">
                                            {detailedMovement.lignes && detailedMovement.lignes.length > 0 ? (
                                                <Table className="w-full">
                                                    <TableHeader>
                                                        <TableRow className="hover:bg-muted/50">
                                                            <TableHead className="text-foreground font-semibold w-2/5">Produit</TableHead>
                                                            <TableHead className="text-foreground font-semibold w-2/5">Unité Mesure</TableHead>
                                                            <TableHead className="text-foreground font-semibold text-center w-1/5">Qté Mouvement</TableHead>
                                                            <TableHead className="text-foreground font-semibold text-center w-1/5">Prix Unitaire</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {detailedMovement.lignes.map((ligne, index) => (
                                                            <TableRow key={index} className="hover:bg-muted/20">
                                                                <TableCell className="py-2">
                                                                    {produits.find((p) => p.id === ligne.produit)?.nom || "Inconnu"}
                                                                </TableCell>
                                                                <TableCell className="py-2">
                                                                    {unite_produit.find((u) => u.value === ligne.unite)?.label || "Inconnu"}
                                                                </TableCell>
                                                                <TableCell className="py-2 text-center">
                                                                    {ligne.quantite_mouvement}
                                                                </TableCell>
                                                                <TableCell className="py-2 text-center">
                                                                    {ligne.prix_unitaire}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center py-4">Aucun article ajouté</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-40">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    <span className="ml-2">Chargement des détails...</span>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </TooltipProvider>
        </POSLayout>
    );
}
"use client"

import { useState, useEffect } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { POSLayout } from "@/components/pos-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Package,
    Store,
    AlertTriangle,
    Loader2,
    Truck,
    CheckCircle,
} from "lucide-react"

import { useProducts } from "@/hooks/useProducts"
import { usePointsVente } from "@/hooks/usePointsVente"
import { useUsers } from "@/hooks/useUsers"
import { useTransferts } from "@/hooks/useTransfertsStock"
import {
    TransfertStock,
    CreateTransfertStock,
    UpdateTransfertStock,
    TransfertStockLigne,
    PointVente,
    Utilisateur,
    Produit,
} from "@/types/transfertsStock"

interface TransfertFormData {
    numero_transfert: string;
    point_vente_source: string;
    point_vente_destination: string;
    status: 'pending' | 'validated' | 'shipped' | 'received' | 'cancelled';
    demandeur: string;
    validateur?: string;
    date_validation?: string;
    date_expedition?: string;
    date_reception?: string;
    commentaire?: string;
    lignes: {
        produit: string;
        quantite_demandee: number;
        quantite_expediee: number;
        quantite_recue: number;
    }[];
}

function StockTransfersPage() {
    const { products, productsLoading, productsError, fetchProducts } = useProducts();
    const { pointsVente, pointsVenteLoading, pointsVenteError, fetchPointsVente } = usePointsVente();
    const { users, userLoading, userError, fetchUsers } = useUsers();
    const { transferts, transfertsloading, transfertsError, loadTransferts, addTransfert, editTransfert } = useTransferts();

    // Chargement global (optionnel, pour un loading unifié)
    const globalLoading = productsLoading || pointsVenteLoading || userLoading || transfertsloading;
    const globalError = productsError || pointsVenteError || userError || transfertsError;

    useEffect(() => {
        fetchProducts();
        fetchPointsVente();
        fetchUsers();
        loadTransferts();
    }, [fetchProducts, fetchPointsVente, fetchUsers, loadTransferts]);


    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedTransfertId, setSelectedTransfertId] = useState<string | null>(null)
    const [editingTransfertId, setEditingTransfertId] = useState<string | null>(null)

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<TransfertFormData>({
        defaultValues: {
            numero_transfert: "",
            point_vente_source: "",
            point_vente_destination: "",
            status: "pending",
            demandeur: "",
            validateur: "",
            date_validation: "",
            date_expedition: "",
            date_reception: "",
            commentaire: "",
            lignes: [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "lignes",
    })

    const filteredTransferts = transferts.filter((transfert) => {
        const matchesSearch = transfert.numero_transfert.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = selectedStatus === "all" || transfert.status === selectedStatus
        return matchesSearch && matchesStatus
    })

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: <Badge className="bg-gray-500 text-white">En Attente</Badge>,
            validated: <Badge className="bg-blue-500 text-white">Validé</Badge>,
            shipped: <Badge className="bg-yellow-500 text-white">Expédié</Badge>,
            received: <Badge className="bg-green-500 text-white">Reçu</Badge>,
            cancelled: <Badge className="bg-red-500 text-white">Annulé</Badge>,
        }
        return badges[status as keyof typeof badges] || <Badge variant="outline">{status}</Badge>
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending":
                return <Package className="h-4 w-4 text-gray-600"/>
            case "validated":
                return <CheckCircle className="h-4 w-4 text-blue-600"/>
            case "shipped":
                return <Truck className="h-4 w-4 text-yellow-600"/>
            case "received":
                return <CheckCircle className="h-4 w-4 text-green-600"/>
            case "cancelled":
                return <AlertTriangle className="h-4 w-4 text-red-600"/>
            default:
                return <Package className="h-4 w-4 text-gray-600"/>
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Non défini"
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const handleCreateOrUpdateTransfert = async (data: TransfertFormData) => {
        try {
            const lignesData = data.lignes.map(l => ({
                produit: l.produit,
                quantite_demandee: l.quantite_demandee,
                quantite_expediee: l.quantite_expediee,
                quantite_recue: l.quantite_recue,
            }))

            const mainData = {
                numero_transfert: data.numero_transfert,
                point_vente_source: data.point_vente_source,
                point_vente_destination: data.point_vente_destination,
                status: data.status,
                demandeur: data.demandeur,
                validateur: data.validateur || undefined,
                date_validation: data.date_validation || undefined,
                date_expedition: data.date_expedition || undefined,
                date_reception: data.date_reception || undefined,
                commentaire: data.commentaire || undefined,
            }

            if (editingTransfertId) {
                // Pour la mise à jour, on envoie les champs principaux + lignes (l'API devrait accepter les lignes en PATCH)
                const updatePayload = {
                    ...mainData,
                    lignes: lignesData,
                } as any // Bypass type pour inclure lignes
                await editTransfert(editingTransfertId, updatePayload)
                setEditingTransfertId(null)
                setIsEditModalOpen(false)
            } else {
                const createPayload: CreateTransfertStock = {
                    ...mainData,
                    lignes: lignesData,
                }
                await addTransfert(createPayload)
                setIsAddModalOpen(false)
            }
            reset()
            loadTransferts() // Refresh list
        } catch (err) {
            console.error(err)
            // Add toast/error handling here
        }
    }

    const handleEditTransfert = (transfert: TransfertStock) => {
        setEditingTransfertId(transfert.id || '')
        reset({
            numero_transfert: transfert.numero_transfert,
            point_vente_source: transfert.point_vente_source,
            point_vente_destination: transfert.point_vente_destination,
            status: transfert.status,
            demandeur: transfert.demandeur,
            validateur: transfert.validateur || "",
            date_validation: transfert.date_validation ? transfert.date_validation.split('T')[0] : "",
            date_expedition: transfert.date_expedition ? transfert.date_expedition.split('T')[0] : "",
            date_reception: transfert.date_reception ? transfert.date_reception.split('T')[0] : "",
            commentaire: transfert.commentaire || "",
            lignes: (transfert.lignes || []).map((ligne: TransfertStockLigne) => ({
                produit: ligne.produit,
                quantite_demandee: ligne.quantite_demandee,
                quantite_expediee: ligne.quantite_expediee,
                quantite_recue: ligne.quantite_recue,
            })),
        })
        setIsEditModalOpen(true)
    }

    const handleValidateTransfert = async (id: string) => {
        try {
            await editTransfert(id, {
                status: 'validated' as const,
                date_validation: new Date().toISOString().split('T')[0],
                // Ajoutez validateur si disponible depuis le contexte utilisateur
            })
            loadTransferts()
        } catch (err) {
            console.error(err)
        }
    }

    const handleShipTransfert = async (id: string) => {
        try {
            await editTransfert(id, {
                status: 'shipped' as const,
                date_expedition: new Date().toISOString().split('T')[0],
            })
            loadTransferts()
        } catch (err) {
            console.error(err)
        }
    }

    const handleReceiveTransfert = async (id: string) => {
        try {
            await editTransfert(id, {
                status: 'received' as const,
                date_reception: new Date().toISOString().split('T')[0],
            })
            loadTransferts()
        } catch (err) {
            console.error(err)
        }
    }

    if (globalLoading && transferts.length === 0) {
        return (
            <POSLayout currentPath="/stock/transfers">
                <div className="flex items-center justify-center h-96 bg-background/95 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    <span className="ml-3 text-lg text-foreground">Chargement des transferts...</span>
                </div>
            </POSLayout>
        )
    }

    if (globalError && transferts.length === 0) {
        return (
            <POSLayout currentPath="/stock/transfers">
                <div className="flex items-center justify-center h-96 bg-background/95 backdrop-blur-sm">
                    <div className="text-center space-y-4">
                        <p className="text-destructive flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            Erreur: {globalError}
                        </p>
                        <Button
                            onClick={() => {
                                fetchProducts();
                                fetchPointsVente();
                                fetchUsers();
                                loadTransferts();
                            }}
                            className="bg-primary hover:bg-primary/90"
                        >
                            Réessayer
                        </Button>
                    </div>
                </div>
            </POSLayout>
        )
    }

    return (
        <POSLayout currentPath="/stock/transfers">
            <TooltipProvider>
                <div className="space-y-8 p-6 bg-gradient-to-b from-background to-background/90 min-h-screen">
                    {/* Page Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
                                Transferts de Stock
                            </h1>
                            <p className="text-lg text-muted-foreground mt-1">
                                Gérer les transferts de stock entre points de vente
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            <Button
                                variant="outline"
                                className="border-primary/20 hover:bg-primary/10 transition-all duration-200"
                                onClick={loadTransferts}
                                disabled={transfertsloading}
                            >
                                {transfertsloading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2"/>
                                ) : (
                                    <Store className="h-4 w-4 mr-2"/>
                                )}
                                Rafraîchir
                            </Button>
                            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-primary hover:bg-primary/90 transition-colors">
                                        <Plus className="h-4 w-4 mr-2"/>
                                        Nouveau Transfert
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[95vh] overflow-y-auto p-8"
                                               style={{width: '70vw', maxWidth: '70vw', minWidth: '70vw'}}>
                                    <DialogHeader>
                                        <DialogTitle>Créer un Transfert de Stock</DialogTitle>
                                        <DialogDescription>Créer un nouveau transfert de stock avec ses
                                            articles.</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit(handleCreateOrUpdateTransfert)} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="numero_transfert" className="text-sm font-medium">Numéro de Transfert</Label>
                                                <Input
                                                    id="numero_transfert"
                                                    {...register("numero_transfert", { required: "Numéro de transfert est requis" })}
                                                    className="border-muted"
                                                />
                                                {errors.numero_transfert && (
                                                    <p className="text-sm text-destructive">{errors.numero_transfert.message}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="point_vente_source" className="text-sm font-medium">Point de Vente Source</Label>
                                                <Controller
                                                    name="point_vente_source"
                                                    control={control}
                                                    rules={{ required: "Point de vente source est requis" }}
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger className="border-muted">
                                                                <SelectValue placeholder="Sélectionner un point de vente" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {pointsVente.map((pv) => (
                                                                    <SelectItem key={pv.id} value={pv.id}>
                                                                        {pv.nom}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.point_vente_source && (
                                                    <p className="text-sm text-destructive">{errors.point_vente_source.message}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="point_vente_destination" className="text-sm font-medium">Point de Vente Destination</Label>
                                                <Controller
                                                    name="point_vente_destination"
                                                    control={control}
                                                    rules={{ required: "Point de vente destination est requis" }}
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger className="border-muted">
                                                                <SelectValue placeholder="Sélectionner un point de vente" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {pointsVente.map((pv) => (
                                                                    <SelectItem key={pv.id} value={pv.id}>
                                                                        {pv.nom}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.point_vente_destination && (
                                                    <p className="text-sm text-destructive">{errors.point_vente_destination.message}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="demandeur" className="text-sm font-medium">Demandeur</Label>
                                                <Controller
                                                    name="demandeur"
                                                    control={control}
                                                    rules={{ required: "Demandeur est requis" }}
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger className="border-muted">
                                                                <SelectValue placeholder="Sélectionner un utilisateur" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {users.map((u) => (
                                                                    <SelectItem key={u.id} value={u.id}>
                                                                        {u.nom}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.demandeur && (
                                                    <p className="text-sm text-destructive">{errors.demandeur.message}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="status" className="text-sm font-medium">Statut</Label>
                                                <Controller
                                                    name="status"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger className="border-muted">
                                                                <SelectValue placeholder="Sélectionner un statut" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {[
                                                                    { value: "pending", label: "En Attente" },
                                                                    { value: "validated", label: "Validé" },
                                                                    { value: "shipped", label: "Expédié" },
                                                                    { value: "received", label: "Reçu" },
                                                                    { value: "cancelled", label: "Annulé" },
                                                                ].map((option) => (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="validateur" className="text-sm font-medium">Validateur</Label>
                                                <Controller
                                                    name="validateur"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                                            <SelectTrigger className="border-muted">
                                                                <SelectValue placeholder="Sélectionner un validateur (optionnel)" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {users.map((u) => (
                                                                    <SelectItem key={u.id} value={u.id}>
                                                                        {u.nom}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="date_validation" className="text-sm font-medium">Date de Validation</Label>
                                                <Input
                                                    id="date_validation"
                                                    type="date"
                                                    {...register("date_validation")}
                                                    className="border-muted"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="date_expedition" className="text-sm font-medium">Date d'Expédition</Label>
                                                <Input
                                                    id="date_expedition"
                                                    type="date"
                                                    {...register("date_expedition")}
                                                    className="border-muted"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="date_reception" className="text-sm font-medium">Date de Réception</Label>
                                                <Input
                                                    id="date_reception"
                                                    type="date"
                                                    {...register("date_reception")}
                                                    className="border-muted"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="commentaire" className="text-sm font-medium">Commentaire</Label>
                                            <Input
                                                id="commentaire"
                                                {...register("commentaire")}
                                                className="border-muted"
                                                placeholder="Commentaires optionnels..."
                                            />
                                        </div>
                                        {/* Table des lignes */}
                                        <div className="space-y-2">
                                            <Label>Articles du Transfert</Label>
                                            <div className="border rounded-lg bg-background/95">
                                                {fields.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground text-center py-4">Aucun article ajouté</p>
                                                ) : (
                                                    <Table className="w-full">
                                                        <TableHeader>
                                                            <TableRow className="hover:bg-muted/50">
                                                                <TableHead className="text-foreground font-semibold w-2/5">Produit</TableHead>
                                                                <TableHead className="text-foreground font-semibold text-center w-1/5">Qté Demandée</TableHead>
                                                                <TableHead className="text-foreground font-semibold text-center w-1/5">Qté Expédiée</TableHead>
                                                                <TableHead className="text-foreground font-semibold text-center w-1/5">Qté Reçue</TableHead>
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
                                                                                        {products.map((produit) => (
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
                                                                    <TableCell className="py-2 text-center">
                                                                        <Input
                                                                            type="number"
                                                                            {...register(`lignes.${index}.quantite_demandee`, {
                                                                                required: "Quantité demandée est requise",
                                                                                min: { value: 1, message: "Quantité doit être positive" },
                                                                                valueAsNumber: true,
                                                                            })}
                                                                            className="border-muted focus:ring-primary h-9 text-center"
                                                                        />
                                                                        {errors.lignes?.[index]?.quantite_demandee && (
                                                                            <p className="text-xs text-destructive mt-1">{errors.lignes?.[index]?.quantite_demandee?.message}</p>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="py-2 text-center">
                                                                        <Input
                                                                            type="number"
                                                                            {...register(`lignes.${index}.quantite_expediee`, {
                                                                                min: { value: 0, message: "Quantité expédiée ne peut pas être négative" },
                                                                                valueAsNumber: true,
                                                                            })}
                                                                            className="border-muted focus:ring-primary h-9 text-center"
                                                                        />
                                                                        {errors.lignes?.[index]?.quantite_expediee && (
                                                                            <p className="text-xs text-destructive mt-1">{errors.lignes?.[index]?.quantite_expediee?.message}</p>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="py-2 text-center">
                                                                        <Input
                                                                            type="number"
                                                                            {...register(`lignes.${index}.quantite_recue`, {
                                                                                min: { value: 0, message: "Quantité reçue ne peut pas être négative" },
                                                                                valueAsNumber: true,
                                                                            })}
                                                                            className="border-muted focus:ring-primary h-9 text-center"
                                                                        />
                                                                        {errors.lignes?.[index]?.quantite_recue && (
                                                                            <p className="text-xs text-destructive mt-1">{errors.lignes?.[index]?.quantite_recue?.message}</p>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="py-2 text-right">
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => remove(index)}
                                                                            className="text-destructive hover:bg-destructive/10"
                                                                        >
                                                                            Supprimer
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
                                                    onClick={() => append({ produit: "", quantite_demandee: 1, quantite_expediee: 0, quantite_recue: 0 })}
                                                    className="mt-4 ml-2 mb-4"
                                                >
                                                    <Plus className="h-3 w-3 mr-1"/>
                                                    Ajouter Article
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                variant="outline"
                                                type="button"
                                                onClick={() => setIsAddModalOpen(false)}
                                                className="border-muted hover:bg-muted"
                                            >
                                                Annuler
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={transfertsloading}
                                                className="bg-primary hover:bg-primary/90"
                                            >
                                                {transfertsloading ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2"/>
                                                        Création...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="h-4 w-4 mr-2"/>
                                                        Créer Transfert
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center justify-between bg-background/95 rounded-lg p-4 border">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher par numéro de transfert..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-64 border-muted"
                                />
                            </div>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="w-48 border-muted">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[
                                        { value: "all", label: "Tous les Statuts" },
                                        { value: "pending", label: "En Attente" },
                                        { value: "validated", label: "Validé" },
                                        { value: "shipped", label: "Expédié" },
                                        { value: "received", label: "Reçu" },
                                        { value: "cancelled", label: "Annulé" },
                                    ].map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {filteredTransferts.length} transfert{filteredTransferts.length !== 1 ? 's' : ''} affiché(s)
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <Card className="bg-background/95 backdrop-blur-sm">
                            <CardContent className="p-6 text-center">
                                <div className="text-3xl font-bold text-primary">{transferts.filter(t => t.status === 'pending').length}</div>
                                <p className="text-sm text-muted-foreground mt-1">En Attente</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background/95 backdrop-blur-sm">
                            <CardContent className="p-6 text-center">
                                <div className="text-3xl font-bold text-blue-600">{transferts.filter(t => t.status === 'validated').length}</div>
                                <p className="text-sm text-muted-foreground mt-1">Validés</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background/95 backdrop-blur-sm">
                            <CardContent className="p-6 text-center">
                                <div className="text-3xl font-bold text-yellow-600">{transferts.filter(t => t.status === 'shipped').length}</div>
                                <p className="text-sm text-muted-foreground mt-1">Expédiés</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background/95 backdrop-blur-sm">
                            <CardContent className="p-6 text-center">
                                <div className="text-3xl font-bold text-green-600">{transferts.filter(t => t.status === 'received').length}</div>
                                <p className="text-sm text-muted-foreground mt-1">Reçus</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background/95 backdrop-blur-sm">
                            <CardContent className="p-6 text-center">
                                <div className="text-3xl font-bold text-red-600">{transferts.filter(t => t.status === 'cancelled').length}</div>
                                <p className="text-sm text-muted-foreground mt-1">Annulés</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Transferts Table */}
                    <Card className="bg-background/95 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl font-semibold text-foreground">Transferts de
                                Stock</CardTitle>
                            <p className="text-sm text-muted-foreground">Gérer les transferts entre points de vente</p>
                        </CardHeader>
                        <CardContent>
                            {globalError && (
                                <p className="text-sm text-destructive mb-4 flex items-center">
                                    <AlertTriangle className="h-4 w-4 mr-2"/>
                                    {globalError}
                                </p>
                            )}
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-muted/50">
                                        <TableHead className="text-foreground font-semibold">Numéro
                                            Transfert</TableHead>
                                        <TableHead className="text-foreground font-semibold">Source</TableHead>
                                        <TableHead className="text-foreground font-semibold">Destination</TableHead>
                                        <TableHead className="text-foreground font-semibold">Statut</TableHead>
                                        <TableHead className="text-foreground font-semibold">Articles</TableHead>
                                        <TableHead className="text-foreground font-semibold">Demandeur</TableHead>
                                        <TableHead className="text-foreground font-semibold">Date Demande</TableHead>
                                        <TableHead className="text-foreground font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transfertsloading && transferts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-4">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto"/>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredTransferts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                Aucun transfert trouvé.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredTransferts.map((transfert) => {
                                            const source = pointsVente.find((pv) => pv.id === transfert.point_vente_source)
                                            const destination = pointsVente.find((pv) => pv.id === transfert.point_vente_destination)
                                            const demandeur = users.find((u) => u.id === transfert.demandeur)
                                            const numArticles = transfert.lignes?.length || 0
                                            return (
                                                <TableRow key={transfert.id}
                                                          className="hover:bg-muted/20 transition-colors">
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <Package className="h-4 w-4 text-muted-foreground"/>
                                                            <span
                                                                className="font-medium">{transfert.numero_transfert}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{source?.nom || transfert.point_vente_source_nom || 'Inconnu'}</TableCell>
                                                    <TableCell>{destination?.nom || transfert.point_vente_destination_nom || 'Inconnu'}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            {getStatusIcon(transfert.status)}
                                                            {getStatusBadge(transfert.status)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{numArticles} article{numArticles !== 1 ? 's' : ''}</TableCell>
                                                    <TableCell>{demandeur?.nom || transfert.demandeur_username || 'Inconnu'}</TableCell>
                                                    <TableCell>{formatDate(transfert.date_demande)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex space-x-2">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => {
                                                                            setSelectedTransfertId(transfert.id || '')
                                                                            setIsDetailModalOpen(true)
                                                                        }}
                                                                        className="hover:bg-primary/10"
                                                                    >
                                                                        <Eye className="h-3 w-3 text-primary"/>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Voir les détails</TooltipContent>
                                                            </Tooltip>
                                                            {transfert.status === 'pending' && (
                                                                <>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                onClick={() => handleEditTransfert(transfert)}
                                                                                className="hover:bg-primary/10"
                                                                            >
                                                                                <Edit className="h-3 w-3 text-primary"/>
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Modifier
                                                                            Transfert</TooltipContent>
                                                                    </Tooltip>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={() => handleValidateTransfert(transfert.id || '')}
                                                                                className="bg-blue-500 hover:bg-blue-600 text-white"
                                                                            >
                                                                                Valider
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Valider
                                                                            Transfert</TooltipContent>
                                                                    </Tooltip>
                                                                </>
                                                            )}
                                                            {transfert.status === 'validated' && (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleShipTransfert(transfert.id || '')}
                                                                            className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                                                        >
                                                                            Expédier
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Marquer comme
                                                                        Expédié</TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {transfert.status === 'shipped' && (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleReceiveTransfert(transfert.id || '')}
                                                                            className="bg-green-500 hover:bg-green-600 text-white"
                                                                        >
                                                                            Recevoir
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Marquer comme Reçu</TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Edit Modal */}
                    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                        <DialogContent className="max-h-[95vh] overflow-y-auto p-8" style={{ width: '70vw', maxWidth: '70vw', minWidth: '70vw' }}>
                            <DialogHeader>
                                <DialogTitle>Modifier un Transfert de Stock</DialogTitle>
                                <DialogDescription>Modifier les détails du transfert sélectionné.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(handleCreateOrUpdateTransfert)} className="space-y-6">
                                {/* Même formulaire que pour la création, avec les valeurs pré-remplies via reset */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="numero_transfert" className="text-sm font-medium">Numéro de Transfert</Label>
                                        <Input
                                            id="numero_transfert"
                                            {...register("numero_transfert", { required: "Numéro de transfert est requis" })}
                                            className="border-muted"
                                        />
                                        {errors.numero_transfert && (
                                            <p className="text-sm text-destructive">{errors.numero_transfert.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="point_vente_source" className="text-sm font-medium">Point de Vente Source</Label>
                                        <Controller
                                            name="point_vente_source"
                                            control={control}
                                            rules={{ required: "Point de vente source est requis" }}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="border-muted">
                                                        <SelectValue placeholder="Sélectionner un point de vente" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {pointsVente.map((pv) => (
                                                            <SelectItem key={pv.id} value={pv.id}>
                                                                {pv.nom}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.point_vente_source && (
                                            <p className="text-sm text-destructive">{errors.point_vente_source.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="point_vente_destination" className="text-sm font-medium">Point de Vente Destination</Label>
                                        <Controller
                                            name="point_vente_destination"
                                            control={control}
                                            rules={{ required: "Point de vente destination est requis" }}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="border-muted">
                                                        <SelectValue placeholder="Sélectionner un point de vente" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {pointsVente.map((pv) => (
                                                            <SelectItem key={pv.id} value={pv.id}>
                                                                {pv.nom}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.point_vente_destination && (
                                            <p className="text-sm text-destructive">{errors.point_vente_destination.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="demandeur" className="text-sm font-medium">Demandeur</Label>
                                        <Controller
                                            name="demandeur"
                                            control={control}
                                            rules={{ required: "Demandeur est requis" }}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="border-muted">
                                                        <SelectValue placeholder="Sélectionner un utilisateur" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {users.map((u) => (
                                                            <SelectItem key={u.id} value={u.id}>
                                                                {u.nom}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.demandeur && (
                                            <p className="text-sm text-destructive">{errors.demandeur.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status" className="text-sm font-medium">Statut</Label>
                                        <Controller
                                            name="status"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="border-muted">
                                                        <SelectValue placeholder="Sélectionner un statut" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[
                                                            { value: "pending", label: "En Attente" },
                                                            { value: "validated", label: "Validé" },
                                                            { value: "shipped", label: "Expédié" },
                                                            { value: "received", label: "Reçu" },
                                                            { value: "cancelled", label: "Annulé" },
                                                        ].map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="validateur" className="text-sm font-medium">Validateur</Label>
                                        <Controller
                                            name="validateur"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                                    <SelectTrigger className="border-muted">
                                                        <SelectValue placeholder="Sélectionner un validateur (optionnel)" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {users.map((u) => (
                                                            <SelectItem key={u.id} value={u.id}>
                                                                {u.nom}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date_validation" className="text-sm font-medium">Date de Validation</Label>
                                        <Input
                                            id="date_validation"
                                            type="date"
                                            {...register("date_validation")}
                                            className="border-muted"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="date_expedition" className="text-sm font-medium">Date d'Expédition</Label>
                                        <Input
                                            id="date_expedition"
                                            type="date"
                                            {...register("date_expedition")}
                                            className="border-muted"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="date_reception" className="text-sm font-medium">Date de Réception</Label>
                                        <Input
                                            id="date_reception"
                                            type="date"
                                            {...register("date_reception")}
                                            className="border-muted"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="commentaire" className="text-sm font-medium">Commentaire</Label>
                                    <Input
                                        id="commentaire"
                                        {...register("commentaire")}
                                        className="border-muted"
                                        placeholder="Commentaires optionnels..."
                                    />
                                </div>
                                {/* Table des lignes - même que pour add */}
                                <div className="space-y-2">
                                    <Label>Articles du Transfert</Label>
                                    <div className="border rounded-lg bg-background/95">
                                        {fields.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">Aucun article ajouté</p>
                                        ) : (
                                            <Table className="w-full">
                                                <TableHeader>
                                                    <TableRow className="hover:bg-muted/50">
                                                        <TableHead className="text-foreground font-semibold w-2/5">Produit</TableHead>
                                                        <TableHead className="text-foreground font-semibold text-center w-1/5">Qté Demandée</TableHead>
                                                        <TableHead className="text-foreground font-semibold text-center w-1/5">Qté Expédiée</TableHead>
                                                        <TableHead className="text-foreground font-semibold text-center w-1/5">Qté Reçue</TableHead>
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
                                                                                {products.map((produit) => (
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
                                                            <TableCell className="py-2 text-center">
                                                                <Input
                                                                    type="number"
                                                                    {...register(`lignes.${index}.quantite_demandee`, {
                                                                        required: "Quantité demandée est requise",
                                                                        min: { value: 1, message: "Quantité doit être positive" },
                                                                        valueAsNumber: true,
                                                                    })}
                                                                    className="border-muted focus:ring-primary h-9 text-center"
                                                                />
                                                                {errors.lignes?.[index]?.quantite_demandee && (
                                                                    <p className="text-xs text-destructive mt-1">{errors.lignes?.[index]?.quantite_demandee?.message}</p>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="py-2 text-center">
                                                                <Input
                                                                    type="number"
                                                                    {...register(`lignes.${index}.quantite_expediee`, {
                                                                        min: { value: 0, message: "Quantité expédiée ne peut pas être négative" },
                                                                        valueAsNumber: true,
                                                                    })}
                                                                    className="border-muted focus:ring-primary h-9 text-center"
                                                                />
                                                                {errors.lignes?.[index]?.quantite_expediee && (
                                                                    <p className="text-xs text-destructive mt-1">{errors.lignes?.[index]?.quantite_expediee?.message}</p>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="py-2 text-center">
                                                                <Input
                                                                    type="number"
                                                                    {...register(`lignes.${index}.quantite_recue`, {
                                                                        min: { value: 0, message: "Quantité reçue ne peut pas être négative" },
                                                                        valueAsNumber: true,
                                                                    })}
                                                                    className="border-muted focus:ring-primary h-9 text-center"
                                                                />
                                                                {errors.lignes?.[index]?.quantite_recue && (
                                                                    <p className="text-xs text-destructive mt-1">{errors.lignes?.[index]?.quantite_recue?.message}</p>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="py-2 text-right">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => remove(index)}
                                                                    className="text-destructive hover:bg-destructive/10"
                                                                >
                                                                    Supprimer
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
                                            onClick={() => append({ produit: "", quantite_demandee: 1, quantite_expediee: 0, quantite_recue: 0 })}
                                            className="mt-4 ml-2 mb-4"
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
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="border-muted hover:bg-muted"
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={transfertsloading}
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        {transfertsloading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2"/>
                                                Mise à jour...
                                            </>
                                        ) : (
                                            <>
                                                <Edit className="h-4 w-4 mr-2"/>
                                                Mettre à jour Transfert
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Detail Modal */}
                    <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                        <DialogContent className="max-h-[95vh] overflow-y-auto p-8"
                                       style={{width: '70vw', maxWidth: '70vw', minWidth: '70vw'}}>
                            <DialogHeader>
                                <DialogTitle>Détails du Transfert de Stock</DialogTitle>
                                <DialogDescription>Visualiser les détails du transfert sélectionné.</DialogDescription>
                            </DialogHeader>
                            {selectedTransfertId && (
                                <div className="space-y-6">
                                    {(() => {
                                        const transfert = transferts.find((t) => t.id === selectedTransfertId)
                                        if (!transfert) return <p>Transfert non trouvé</p>
                                        const source = pointsVente.find((pv) => pv.id === transfert.point_vente_source)
                                        const destination = pointsVente.find((pv) => pv.id === transfert.point_vente_destination)
                                        const demandeur = users.find((u) => u.id === transfert.demandeur)
                                        const validateur = users.find((u) => u.id === transfert.validateur)
                                        return (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Numéro de Transfert</Label>
                                                        <p className="text-lg font-semibold">{transfert.numero_transfert}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Statut</Label>
                                                        <div className="flex items-center space-x-2">
                                                            {getStatusIcon(transfert.status)}
                                                            {getStatusBadge(transfert.status)}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Point de Vente Source</Label>
                                                        <p>{source?.nom || transfert.point_vente_source_nom || 'Inconnu'}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Point de Vente Destination</Label>
                                                        <p>{destination?.nom || transfert.point_vente_destination_nom || 'Inconnu'}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Demandeur</Label>
                                                        <p>{demandeur?.nom || transfert.demandeur_username || 'Inconnu'}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Validateur</Label>
                                                        <p>{validateur ? validateur.nom : 'Non défini'}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Date de Demande</Label>
                                                        <p>{formatDate(transfert.date_demande)}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Date de Validation</Label>
                                                        <p>{formatDate(transfert.date_validation)}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Date d'Expédition</Label>
                                                        <p>{formatDate(transfert.date_expedition)}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Date de Réception</Label>
                                                        <p>{formatDate(transfert.date_reception)}</p>
                                                    </div>
                                                </div>
                                                {transfert.commentaire && (
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Commentaire</Label>
                                                        <p className="bg-muted p-3 rounded-md">{transfert.commentaire}</p>
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Articles du Transfert</Label>
                                                    {!transfert.lignes || transfert.lignes.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground text-center py-4">Aucun article</p>
                                                    ) : (
                                                        <Table className="w-full">
                                                            <TableHeader>
                                                                <TableRow className="hover:bg-muted/50">
                                                                    <TableHead className="text-foreground font-semibold">Produit</TableHead>
                                                                    <TableHead className="text-foreground font-semibold text-center">Qté Demandée</TableHead>
                                                                    <TableHead className="text-foreground font-semibold text-center">Qté Expédiée</TableHead>
                                                                    <TableHead className="text-foreground font-semibold text-center">Qté Reçue</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {transfert.lignes.map((ligne: TransfertStockLigne) => {
                                                                    const produit = products.find((p) => p.id === ligne.produit)
                                                                    return (
                                                                        <TableRow key={ligne.id || ligne.produit}
                                                                                  className="hover:bg-muted/20">
                                                                            <TableCell>{produit?.nom || ligne.produit_nom || 'Inconnu'}</TableCell>
                                                                            <TableCell
                                                                                className="text-center">{ligne.quantite_demandee}</TableCell>
                                                                            <TableCell
                                                                                className="text-center">{ligne.quantite_expediee}</TableCell>
                                                                            <TableCell
                                                                                className="text-center">{ligne.quantite_recue}</TableCell>
                                                                        </TableRow>
                                                                    )
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                    )}
                                                </div>
                                                <div className="flex justify-end">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsDetailModalOpen(false)}
                                                        className="border-muted hover:bg-muted"
                                                    >
                                                        Fermer
                                                    </Button>
                                                </div>
                                            </>
                                        )
                                    })()}
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </TooltipProvider>
        </POSLayout>
    )
}

export default StockTransfersPage
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
import { Textarea } from "@/components/ui/textarea"
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
import { useStocks } from "@/hooks/useStock"
import { useTransfertsStock} from "@/hooks/useTransfertsStock";
import {TransfertFormData} from "@/types/stock";
import {CreateTransfertStock, TransfertStock, TransfertStockLigne} from "@/types/transfertsStock";

const statusOptions = [
    { value: "all", label: "Tous les Statuts" },
    { value: "pending", label: "En Attente" },
    { value: "validated", label: "Validé" },
    { value: "shipped", label: "Expédié" },
    { value: "received", label: "Reçu" },
    { value: "cancelled", label: "Annulé" },
]

export default function StockPage() {
    const {
        transferts,
        isLoading: loadingTransferts,
        error: transfertsError,
        fetchLignes,
        createTransfert,
        updateTransfert,
        deleteTransfert,
        createLigne,
        updateLigne,
        deleteLigne,
        fetchTransferts,
    } = useTransfertsStock()

    const {
        stocks,
        produits,
        pointsVente,
        loading: loadingStock,
        error: stockError,
        fetchStocks,
        fetchProduits,
        fetchPointsVente,
    } = useStocks()

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedTransfertId, setSelectedTransfertId] = useState<string | null>(null)
    const [editingTransfertId, setEditingTransfertId] = useState<string | null>(null)

    // Mock utilisateurs - replace with real API if available
    const [utilisateurs] = useState([
        { id: "user1", nom: "Sarah Wilson", username: "sarahw" },
        { id: "user2", nom: "Mike Johnson", username: "mikej" },
        { id: "user3", nom: "Jane Smith", username: "janes" },
    ])

    // Use fetchLignes from hook
    const lignesQuery = fetchLignes(selectedTransfertId)
    const editingLignesQuery = fetchLignes(editingTransfertId)

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

    useEffect(() => {
        fetchStocks()
        fetchTransferts()
        fetchProduits()
        fetchPointsVente()
    }, [fetchStocks,fetchTransferts, fetchProduits, fetchPointsVente])

    const filteredTransferts = transferts.filter((transfert) => {
        const matchesSearch = transfert.numero_transfert.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = selectedStatus === "all" || transfert.status === selectedStatus
        return matchesSearch && matchesStatus
    })

    const filteredStocks = stocks.filter((stock) => {
        const matchesSearch = stock.point_vente_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stock.produit_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stock.produit_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stock.produit_categorie.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stock.produit_unite_mesure.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
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
                return <Package className="h-4 w-4 text-gray-600" />
            case "validated":
                return <CheckCircle className="h-4 w-4 text-blue-600" />
            case "shipped":
                return <Truck className="h-4 w-4 text-yellow-600" />
            case "received":
                return <CheckCircle className="h-4 w-4 text-green-600" />
            case "cancelled":
                return <AlertTriangle className="h-4 w-4 text-red-600" />
            default:
                return <Package className="h-4 w-4 text-gray-600" />
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
            const transfertData: CreateTransfertStock = {
                numero_transfert: data.numero_transfert,
                point_vente_source: data.point_vente_source,
                point_vente_destination: data.point_vente_destination,
                status: data.status,
                demandeur: data.demandeur,
                validateur: data.validateur || undefined,
                date_validation: data.date_validation || undefined,
                date_expedition: data.date_expedition || undefined,
                date_reception: data.date_reception || undefined,
                commentaire: data.commentaire || "",
                lignes: data.lignes.map(l => ({
                    produit: l.produit,
                    quantite_demandee: l.quantite_demandee,
                    quantite_expediee: l.quantite_expediee,
                    quantite_recue: l.quantite_recue,
                })),
            }

            let transfert: TransfertStock
            if (editingTransfertId) {
                // Update main transfert (without lignes, as per type)
                await updateTransfert({
                    id: editingTransfertId,
                    data: {
                        numero_transfert: data.numero_transfert,
                        point_vente_source: data.point_vente_source,
                        point_vente_destination: data.point_vente_destination,
                        status: data.status,
                        demandeur: data.demandeur,
                        validateur: data.validateur,
                        date_validation: data.date_validation,
                        date_expedition: data.date_expedition,
                        date_reception: data.date_reception,
                        commentaire: data.commentaire,
                    },
                })
                // Sync lignes
                const existingLines = editingLignesQuery.data || []
                // Delete removed lines
                for (const existingLine of existingLines) {
                    if (!data.lignes.some(l => l.produit === existingLine.produit)) {
                        if (existingLine.id) {
                            await deleteLigne({ transfertId: editingTransfertId, ligneId: existingLine.id })
                        }
                    }
                }
                // Update or create lines
                for (const ligne of data.lignes) {
                    const existingLine = existingLines.find(l => l.produit === ligne.produit)
                    if (existingLine && existingLine.id) {
                        await updateLigne({
                            transfertId: editingTransfertId,
                            ligneId: existingLine.id,
                            data: {
                                ...ligne,
                                produit_nom: produits.find(p => p.id === ligne.produit)?.nom || '',
                            },
                        })
                    } else {
                        await createLigne({
                            transfertId: editingTransfertId,
                            data: {
                                produit: ligne.produit,
                                quantite_demandee: ligne.quantite_demandee,
                                quantite_expediee: ligne.quantite_expediee,
                                quantite_recue: ligne.quantite_recue,
                                produit_nom: produits.find(p => p.id === ligne.produit)?.nom || '',
                            },
                        })
                    }
                }
                setEditingTransfertId(null)
                setIsEditModalOpen(false)
            } else {
                transfert = await createTransfert(transfertData)
                // Create lines separately
                for (const ligne of data.lignes) {
                    await createLigne({
                        transfertId: transfert.id!,
                        data: {
                            produit: ligne.produit,
                            quantite_demandee: ligne.quantite_demandee,
                            quantite_expediee: ligne.quantite_expediee,
                            quantite_recue: ligne.quantite_recue,
                            produit_nom: produits.find(p => p.id === ligne.produit)?.nom || '',
                        },
                    })
                }
                setIsAddModalOpen(false)
            }
            reset()
            fetchTransferts() // Refresh list
        } catch (err) {
            console.error(err)
            // Add toast/error handling here
        }
    }

    const handleEditTransfert = async (transfert: TransfertStock) => {
        setEditingTransfertId(transfert.id || '')
        // Wait for editingLignesQuery to load if needed, but for now reset with available data
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
            lignes: (editingLignesQuery.data || transfert.lignes || []).map((ligne: TransfertStockLigne) => ({
                produit: ligne.produit,
                quantite_demandee: ligne.quantite_demandee,
                quantite_expediee: ligne.quantite_expediee,
                quantite_recue: ligne.quantite_recue,
            })),
        })
        setIsEditModalOpen(true)
    }

    const handleDeleteTransfert = async (id: string) => {
        if (confirm("Confirmer la suppression ?")) {
            try {
                await deleteTransfert(id)
            } catch (err) {
                console.error(err)
            }
        }
    }

    const handleValidateTransfert = async (id: string) => {
        try {
            await updateTransfert({
                id,
                data: {
                    status: 'validated' as const,
                    date_validation: new Date().toISOString().split('T')[0],
                    // Add validateur if available from context
                },
            })
        } catch (err) {
            console.error(err)
        }
    }

    const handleShipTransfert = async (id: string) => {
        try {
            await updateTransfert({
                id,
                data: {
                    status: 'shipped' as const,
                    date_expedition: new Date().toISOString().split('T')[0],
                },
            })
        } catch (err) {
            console.error(err)
        }
    }

    const handleReceiveTransfert = async (id: string) => {
        try {
            await updateTransfert({
                id,
                data: {
                    status: 'received' as const,
                    date_reception: new Date().toISOString().split('T')[0],
                },
            })
        } catch (err) {
            console.error(err)
        }
    }

    const loading = loadingTransferts || loadingStock
    const error = transfertsError || stockError

    if (loading && transferts.length === 0) {
        return (
            <POSLayout currentPath="/stock/transfers">
                <div className="flex items-center justify-center h-96 bg-background/95 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-lg text-foreground">Chargement des transferts...</span>
                </div>
            </POSLayout>
        )
    }

    if (error && transferts.length === 0) {
        return (
            <POSLayout currentPath="/stock/transfers">
                <div className="flex items-center justify-center h-96 bg-background/95 backdrop-blur-sm">
                    <div className="text-center space-y-4">
                        <p className="text-destructive flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            Erreur: {"message" in error && error.message || "Erreur lors du chargement"}
                        </p>

                        <Button
                            onClick={() => {
                                fetchTransferts()
                                fetchProduits()
                                fetchPointsVente()
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
        <POSLayout currentPath="/stock">
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
                                onClick={() => {
                                    fetchTransferts()
                                    fetchProduits()
                                    fetchPointsVente()
                                }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Store className="h-4 w-4 mr-2" />
                                )}
                                Rafraîchir
                            </Button>
                            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-primary hover:bg-primary/90 transition-colors">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Nouveau Transfert
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[95vh] overflow-y-auto p-8" style={{ width: '70vw', maxWidth: '70vw', minWidth: '70vw' }}>
                                    <DialogHeader>
                                        <DialogTitle>Créer un Transfert de Stock</DialogTitle>
                                        <DialogDescription>Créer un nouveau transfert de stock avec ses articles.</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit(handleCreateOrUpdateTransfert)} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="numero_transfert" className="text-sm font-medium">Numéro de Transfert</Label>
                                                <Input
                                                    id="numero_transfert"
                                                    {...register("numero_transfert", { required: "Numéro de transfert est requis" })}
                                                    placeholder="Entrez le numéro de transfert"
                                                    className="border-muted focus:ring-primary"
                                                />
                                                {errors.numero_transfert && (
                                                    <p className="text-sm text-destructive">{errors.numero_transfert.message}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="status" className="text-sm font-medium">Statut</Label>
                                                <Controller
                                                    name="status"
                                                    control={control}
                                                    rules={{ required: "Statut est requis" }}
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger className="border-muted">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {statusOptions.slice(1).map((status) => (
                                                                    <SelectItem key={status.value} value={status.value}>
                                                                        {status.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.status && (
                                                    <p className="text-sm text-destructive">{errors.status.message}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
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
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="demandeur" className="text-sm font-medium">Demandeur</Label>
                                                <Controller
                                                    name="demandeur"
                                                    control={control}
                                                    rules={{ required: "Demandeur est requis" }}
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger className="border-muted">
                                                                <SelectValue placeholder="Sélectionner un demandeur" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {utilisateurs.map((user) => (
                                                                    <SelectItem key={user.id} value={user.id}>
                                                                        {user.username}
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
                                                <Label htmlFor="validateur" className="text-sm font-medium">Validateur</Label>
                                                <Controller
                                                    name="validateur"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger className="border-muted">
                                                                <SelectValue placeholder="Sélectionner un validateur" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {utilisateurs.map((user) => (
                                                                    <SelectItem key={user.id} value={user.id}>
                                                                        {user.username}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>
                                        </div>
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
                                                                    <TableCell className="py-2">
                                                                        <div className="flex items-center space-x-2">
                                                                            <Input
                                                                                type="number"
                                                                                {...register(`lignes.${index}.quantite_recue`, {
                                                                                    min: { value: 0, message: "Quantité reçue ne peut pas être négative" },
                                                                                    valueAsNumber: true,
                                                                                })}
                                                                                className="border-muted focus:ring-primary h-9"
                                                                            />
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => remove(index)}
                                                                                className="hover:bg-destructive/10 h-9 w-9"
                                                                            >
                                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                                            </Button>
                                                                        </div>
                                                                        {errors.lignes?.[index]?.quantite_recue && (
                                                                            <p className="text-xs text-destructive mt-1">{errors.lignes?.[index]?.quantite_recue?.message}</p>
                                                                        )}
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
                                                onClick={() => setIsAddModalOpen(false)}
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
                                                        Création...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="h-4 w-4 mr-2" />
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
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Rechercher par numéro de transfert..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 border-muted focus:ring-primary"
                            />
                        </div>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-[180px] border-muted">
                                <SelectValue placeholder="Filtrer par statut" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-[180px] border-muted">
                                <SelectValue placeholder="Filtrer par statut" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <Card className="bg-background/95 backdrop-blur-sm shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-foreground">Total Transferts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">{transferts.length}</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-background/95 backdrop-blur-sm shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-foreground">En Attente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    {transferts.filter(t => t.status === 'pending').length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-background/95 backdrop-blur-sm shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-foreground">Validés</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    {transferts.filter(t => t.status === 'validated').length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-background/95 backdrop-blur-sm shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-foreground">Expédiés</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    {transferts.filter(t => t.status === 'shipped').length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-background/95 backdrop-blur-sm shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-foreground">Reçus</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    {transferts.filter(t => t.status === 'received').length}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Eta stock Table */}
                    <Card className="bg-background/95 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl font-semibold text-foreground">Stock</CardTitle>
                            <p className="text-sm text-muted-foreground">Etat de stock</p>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <p className="text-sm text-destructive mb-4 flex items-center">
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    {"message" in error && error.message || "Erreur lors du chargement"}
                                </p>
                            )}
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-muted/50">
                                        <TableHead className="text-foreground font-semibold">Point de vente</TableHead>
                                        <TableHead className="text-foreground font-semibold">Type stock</TableHead>
                                        <TableHead className="text-foreground font-semibold">Reference</TableHead>
                                        <TableHead className="text-foreground font-semibold">Categorie</TableHead>
                                        <TableHead className="text-foreground font-semibold">Nom</TableHead>
                                        <TableHead className="text-foreground font-semibold">Unite Mesure</TableHead>
                                        <TableHead className="text-foreground font-semibold">Qte Actuele</TableHead>
                                        <TableHead className="text-foreground font-semibold">Qte Entre</TableHead>
                                        <TableHead className="text-foreground font-semibold">Qte Sortie</TableHead>
                                        <TableHead className="text-foreground font-semibold">Dernier Entre</TableHead>
                                        <TableHead className="text-foreground font-semibold">Dernier Sortie</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading && stocks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-4">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredStocks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                                Aucun stock trouvé.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredStocks.map((stock) => {
                                            return (
                                                <TableRow key={stock.id} className="hover:bg-muted/20 transition-colors">
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <Package className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">{stock.point_vente_nom}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{stock.type_stock}</TableCell>
                                                    <TableCell>{stock.produit_reference}</TableCell>
                                                    <TableCell>{stock.produit_categorie}</TableCell>
                                                    <TableCell>{stock.produit_nom}</TableCell>
                                                    <TableCell>{stock.produit_unite_mesure}</TableCell>
                                                    <TableCell>{stock.quantite_actuelle}</TableCell>
                                                    <TableCell>{stock.quantite_actuelle}</TableCell>
                                                    <TableCell>{stock.quantite_actuelle}</TableCell>
                                                    <TableCell>{formatDate(stock.date_derniere_entree)}</TableCell>
                                                    <TableCell>{formatDate(stock.date_derniere_sortie)}</TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Detail Modal */}
                    <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                        <DialogContent className="max-h-[95vh] overflow-y-auto p-8" style={{ width: '70vw', maxWidth: '70vw', minWidth: '70vw' }}>
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
                                        const demandeur = utilisateurs.find((u) => u.id === transfert.demandeur)
                                        const validateur = utilisateurs.find((u) => u.id === transfert.validateur)
                                        return (
                                            <>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <Label className="text-sm font-medium">Informations Générales</Label>
                                                            <div className="mt-2 space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Numéro:</span>
                                                                    <span className="font-medium">{transfert.numero_transfert}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Statut:</span>
                                                                    {getStatusBadge(transfert.status)}
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Demandeur:</span>
                                                                    <span className="font-medium">{demandeur?.username || transfert.demandeur_username || 'Inconnu'}</span>
                                                                </div>
                                                                {transfert.validateur && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-muted-foreground">Validateur:</span>
                                                                        <span className="font-medium">{validateur?.username || transfert.validateur_username || 'Inconnu'}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <Label className="text-sm font-medium">Points de Vente</Label>
                                                            <div className="mt-2 space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Source:</span>
                                                                    <span className="font-medium">{source?.nom || transfert.point_vente_source_nom || 'Inconnu'}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Destination:</span>
                                                                    <span className="font-medium">{destination?.nom || transfert.point_vente_destination_nom || 'Inconnu'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium">Dates</Label>
                                                            <div className="mt-2 space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Demande:</span>
                                                                    <span className="font-medium">{formatDate(transfert.date_demande)}</span>
                                                                </div>
                                                                {transfert.date_validation && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-muted-foreground">Validation:</span>
                                                                        <span className="font-medium">{formatDate(transfert.date_validation)}</span>
                                                                    </div>
                                                                )}
                                                                {transfert.date_expedition && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-muted-foreground">Expédition:</span>
                                                                        <span className="font-medium">{formatDate(transfert.date_expedition)}</span>
                                                                    </div>
                                                                )}
                                                                {transfert.date_reception && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-muted-foreground">Réception:</span>
                                                                        <span className="font-medium">{formatDate(transfert.date_reception)}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {transfert.commentaire && (
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Commentaire</Label>
                                                        <Textarea
                                                            value={transfert.commentaire}
                                                            readOnly
                                                            className="border-muted bg-muted/20"
                                                        />
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Articles du Transfert</Label>
                                                    {lignesQuery.isLoading ? (
                                                        <p className="text-sm text-center">Chargement des articles...</p>
                                                    ) : !lignesQuery.data || lignesQuery.data.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground text-center">Aucun article</p>
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
                                                                {lignesQuery.data.map((ligne: TransfertStockLigne) => {
                                                                    const produit = produits.find((p) => p.id === ligne.produit)
                                                                    return (
                                                                        <TableRow key={ligne.id || ligne.produit} className="hover:bg-muted/20">
                                                                            <TableCell>{produit?.nom || ligne.produit_nom || 'Inconnu'}</TableCell>
                                                                            <TableCell className="text-center">{ligne.quantite_demandee}</TableCell>
                                                                            <TableCell className="text-center">{ligne.quantite_expediee}</TableCell>
                                                                            <TableCell className="text-center">{ligne.quantite_recue}</TableCell>
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


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
import { useTransfertsStock } from "@/hooks/useTransfertsStock"
import {
    TransfertStock,
    CreateTransfertStock,
    UpdateTransfertStock,
    TransfertStockLigne,
    PointVente,
    Utilisateur,
    Produit,
} from "@/types/transfertsStock"

// Mock data for pointsVente, utilisateurs, produits - replace with real hooks/API if available
const mockPointsVente: PointVente[] = [
    { id: "1", nom: "Main Store - Downtown" },
    { id: "2", nom: "Branch Store - Mall" },
    { id: "3", nom: "Outlet Store - Airport" },
]

const mockUtilisateurs: Utilisateur[] = [
    { id: "user1", nom: "Sarah Wilson", username: "sarahw" },
    { id: "user2", nom: "Mike Johnson", username: "mikej" },
    { id: "user3", nom: "Jane Smith", username: "janes" },
]

const mockProduits: Produit[] = [
    { id: "prod1", nom: "Premium Coffee Beans" },
    { id: "prod2", nom: "Organic Tea Set" },
    { id: "prod3", nom: "Cotton T-Shirt" },
]

interface TransfertFormData extends CreateTransfertStock {}

const statusOptions = [
    { value: "all", label: "Tous les Statuts" },
    { value: "pending", label: "En Attente" },
    { value: "validated", label: "Validé" },
    { value: "shipped", label: "Expédié" },
    { value: "received", label: "Reçu" },
    { value: "cancelled", label: "Annulé" },
]

export default function StockTransfersPage() {
    const {
        transferts,
        isLoading: loading,
        error,
        fetchLignes,
        createTransfert,
        updateTransfert,
        deleteTransfert,
        createLigne,
        updateLigne,
        deleteLigne,
        fetchTransferts,
    } = useTransfertsStock()

    // Mock fetches - replace with real hooks if available
    const [pointsVente] = useState(mockPointsVente)
    const [utilisateurs] = useState(mockUtilisateurs)
    const [produits] = useState(mockProduits)
    const fetchPointsVente = () => {} // Mock
    const fetchUtilisateurs = () => {} // Mock
    const fetchProduits = () => {} // Mock

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedTransfertId, setSelectedTransfertId] = useState<string | null>(null)
    const [editingTransfertId, setEditingTransfertId] = useState<string | null>(null)

    // Use fetchLignes from hook
    const lignesQuery = fetchLignes(selectedTransfertId)
    const editingLignesQuery = fetchLignes(editingTransfertId)

    const { register, control, handleSubmit, reset, formState: { errors }, setValue } = useForm<TransfertFormData>({
        defaultValues: {
            numero_transfert: "",
            point_vente_source: "",
            point_vente_destination: "",
            status: "pending",
            demandeur: "",
            validateur: undefined,
            date_validation: undefined,
            date_expedition: undefined,
            date_reception: undefined,
            commentaire: undefined,
            lignes: [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "lignes",
    })

    useEffect(() => {
        fetchTransferts()
        // Mock fetches
        // fetchPointsVente()
        // fetchUtilisateurs()
        // fetchProduits()
    }, [fetchTransferts])

    useEffect(() => {
        if (editingTransfertId) {
            const transfert = transferts.find(t => t.id === editingTransfertId)
            if (transfert) {
                setValue("numero_transfert", transfert.numero_transfert)
                setValue("point_vente_source", transfert.point_vente_source)
                setValue("point_vente_destination", transfert.point_vente_destination)
                setValue("status", transfert.status)
                setValue("demandeur", transfert.demandeur)
                setValue("validateur", transfert.validateur || undefined)
                setValue("date_validation", transfert.date_validation || undefined)
                setValue("date_expedition", transfert.date_expedition || undefined)
                setValue("date_reception", transfert.date_reception || undefined)
                setValue("commentaire", transfert.commentaire || undefined)
            }
        }
    }, [editingTransfertId, transferts, setValue])

    useEffect(() => {
        if (editingTransfertId && editingLignesQuery.data) {
            reset({
                ...getValues(),
                lignes: editingLignesQuery.data.map(ligne => ({
                    produit: ligne.produit,
                    quantite_demandee: ligne.quantite_demandee,
                    quantite_expediee: ligne.quantite_expediee,
                    quantite_recue: ligne.quantite_recue,
                }))
            })
        }
    }, [editingLignesQuery.data, editingTransfertId, reset])

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
            if (editingTransfertId) {
                // Update main transfert
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
                            data: ligne,
                        })
                    } else {
                        await createLigne({
                            transfertId: editingTransfertId,
                            data: ligne,
                        })
                    }
                }
                setIsEditModalOpen(false)
            } else {
                // Create transfert with lignes included
                await createTransfert(data)
                setIsAddModalOpen(false)
            }
            reset()
            setEditingTransfertId(null)
        } catch (err) {
            console.error("Error saving transfert:", err)
        }
    }

    const handleEditTransfert = (id: string) => {
        setEditingTransfertId(id)
        setIsEditModalOpen(true)
    }

    const handleViewTransfert = (id: string) => {
        setSelectedTransfertId(id)
        setIsDetailModalOpen(true)
    }

    const handleDeleteTransfert = async (id: string) => {
        try {
            await deleteTransfert(id)
        } catch (err) {
            console.error("Error deleting transfert:", err)
        }
    }

    const handleValidateTransfert = async (id: string) => {
        try {
            await updateTransfert({
                id,
                data: { status: 'validated', date_validation: new Date().toISOString() } // Assume validateur is set backend or add if needed
            })
        } catch (err) {
            console.error("Error validating transfert:", err)
        }
    }

    const handleShipTransfert = async (id: string) => {
        try {
            await updateTransfert({
                id,
                data: { status: 'shipped', date_expedition: new Date().toISOString() }
            })
        } catch (err) {
            console.error("Error shipping transfert:", err)
        }
    }

    const handleReceiveTransfert = async (id: string) => {
        try {
            await updateTransfert({
                id,
                data: { status: 'received', date_reception: new Date().toISOString() }
            })
        } catch (err) {
            console.error("Error receiving transfert:", err)
        }
    }

    const renderForm = () => (
        <form onSubmit={handleSubmit(handleCreateOrUpdateTransfert)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="numero_transfert">Numéro de Transfert</Label>
                    <Input
                        id="numero_transfert"
                        {...register("numero_transfert", { required: true })}
                        placeholder="Numéro de transfert"
                    />
                    {errors.numero_transfert && <p className="text-sm text-destructive">Requis</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.slice(1).map((option) => (
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
                    <Label htmlFor="point_vente_source">Point de Vente Source</Label>
                    <Controller
                        name="point_vente_source"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner source" />
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
                    {errors.point_vente_source && <p className="text-sm text-destructive">Requis</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="point_vente_destination">Point de Vente Destination</Label>
                    <Controller
                        name="point_vente_destination"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner destination" />
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
                    {errors.point_vente_destination && <p className="text-sm text-destructive">Requis</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="demandeur">Demandeur</Label>
                    <Controller
                        name="demandeur"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner demandeur" />
                                </SelectTrigger>
                                <SelectContent>
                                    {utilisateurs.map((u) => (
                                        <SelectItem key={u.id} value={u.id}>
                                            {u.nom}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.demandeur && <p className="text-sm text-destructive">Requis</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="validateur">Validateur</Label>
                    <Controller
                        name="validateur"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner validateur" />
                                </SelectTrigger>
                                <SelectContent>
                                    {utilisateurs.map((u) => (
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
            <div className="space-y-2">
                <Label htmlFor="commentaire">Commentaire</Label>
                <Textarea
                    id="commentaire"
                    {...register("commentaire")}
                    placeholder="Commentaire optionnel"
                />
            </div>
            <div className="space-y-2">
                <Label>Lignes de Transfert</Label>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Produit</TableHead>
                            <TableHead>Qté Demandée</TableHead>
                            <TableHead>Qté Expédiée</TableHead>
                            <TableHead>Qté Reçue</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.map((field, index) => (
                            <TableRow key={field.id}>
                                <TableCell>
                                    <Controller
                                        name={`lignes.${index}.produit`}
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner produit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {produits.map((p) => (
                                                        <SelectItem key={p.id} value={p.id}>
                                                            {p.nom}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.lignes?.[index]?.produit && <p className="text-sm text-destructive">Requis</p>}
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        {...register(`lignes.${index}.quantite_demandee`, { required: true, min: 0 })}
                                    />
                                    {errors.lignes?.[index]?.quantite_demandee && <p className="text-sm text-destructive">Valide requis</p>}
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        {...register(`lignes.${index}.quantite_expediee`, { min: 0 })}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        {...register(`lignes.${index}.quantite_recue`, { min: 0 })}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button type="button" variant="destructive" onClick={() => remove(index)}>
                                        Supprimer
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Button type="button" onClick={() => append({ produit: "", quantite_demandee: 0, quantite_expediee: 0, quantite_recue: 0 })}>
                    Ajouter Ligne
                </Button>
            </div>
            <Button type="submit">Soumettre</Button>
        </form>
    )

    if (loading) {
        return <div>Chargement...</div>
    }

    return (
        <POSLayout currentPath="/stock/transfers">
            <TooltipProvider>
                <div className="space-y-6">
                    <div className="flex justify-between">
                        <h1 className="text-2xl font-bold">Transferts de Stock</h1>
                        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                            <DialogTrigger asChild>
                                <Button>Ajouter Transfert</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Créer Transfert</DialogTitle>
                                </DialogHeader>
                                {renderForm()}
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Card>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Numéro</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Date Demande</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTransferts.map(transfert => (
                                        <TableRow key={transfert.id}>
                                            <TableCell>{transfert.numero_transfert}</TableCell>
                                            <TableCell>{transfert.point_vente_source_nom}</TableCell>
                                            <TableCell>{transfert.point_vente_destination_nom}</TableCell>
                                            <TableCell>{getStatusBadge(transfert.status)}</TableCell>
                                            <TableCell>{formatDate(transfert.date_demande)}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" onClick={() => handleViewTransfert(transfert.id!)}><Eye /></Button>
                                                <Button variant="ghost" onClick={() => handleEditTransfert(transfert.id!)}><Edit /></Button>
                                                <Button variant="ghost" onClick={() => handleDeleteTransfert(transfert.id!)}><Trash2 /></Button>
                                                {transfert.status === 'pending' && (
                                                    <Button onClick={() => handleValidateTransfert(transfert.id!)}>Valider</Button>
                                                )}
                                                {transfert.status === 'validated' && (
                                                    <Button onClick={() => handleShipTransfert(transfert.id!)}>Expédier</Button>
                                                )}
                                                {transfert.status === 'shipped' && (
                                                    <Button onClick={() => handleReceiveTransfert(transfert.id!)}>Recevoir</Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Modifier Transfert</DialogTitle>
                            </DialogHeader>
                            {renderForm()}
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Détails Transfert</DialogTitle>
                            </DialogHeader>
                            {selectedTransfertId && (
                                <div>
                                    {lignesQuery.isLoading ? (
                                        <Loader2 />
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Produit</TableHead>
                                                    <TableHead>Qté Demandée</TableHead>
                                                    <TableHead>Qté Expédiée</TableHead>
                                                    <TableHead>Qté Reçue</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {lignesQuery.data?.map(ligne => (
                                                    <TableRow key={ligne.id}>
                                                        <TableCell>{ligne.produit_nom}</TableCell>
                                                        <TableCell>{ligne.quantite_demandee}</TableCell>
                                                        <TableCell>{ligne.quantite_expediee}</TableCell>
                                                        <TableCell>{ligne.quantite_recue}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </TooltipProvider>
        </POSLayout>
    )
}
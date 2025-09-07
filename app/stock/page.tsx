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
import { useStockTransfers } from "@/hooks/useStockTransfers"
import {
  TransfertStock,
  PointVente,
  Utilisateur,
  Produit,
  CreateTransfertStock,
  UpdateTransfertStock,
  CreateTransfertStockLigne,
} from "@/types/stockTransfers"

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
    pointsVente,
    utilisateurs,
    produits,
    loading,
    error,
    fetchTransfertLignes,
    createTransfert,
    updateTransfert,
    deleteTransfert,
    createLigne,
    updateLigne,
    deleteLigne,
    fetchTransferts,
    fetchPointsVente,
    fetchUtilisateurs,
    fetchProduits,
  } = useStockTransfers()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedTransfertId, setSelectedTransfertId] = useState<string | null>(null)
  const [editingTransfertId, setEditingTransfertId] = useState<string | null>(null)

  const { data: transfertDetails, isLoading: loadingTransfertDetails } = fetchTransfertLignes(selectedTransfertId)
  const { data: editingTransfertDetails, isLoading: loadingEditingTransfertDetails } = fetchTransfertLignes(editingTransfertId)

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
    fetchTransferts()
    fetchPointsVente()
    fetchUtilisateurs()
    fetchProduits()
  }, [fetchTransferts, fetchPointsVente, fetchUtilisateurs, fetchProduits])

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
        lignes: data.lignes,
      }

      let transfert: TransfertStock
      if (editingTransfertId) {
        transfert = await updateTransfert.mutateAsync({
          id: editingTransfertId,
          data: transfertData,
        })
        const existingLines = editingTransfertDetails?.lignes || []
        for (const ligne of data.lignes) {
          const existingLine = existingLines.find((l) => l.produit === ligne.produit)
          const ligneData: UpdateTransfertStockLigne = {
            quantite_demandee: ligne.quantite_demandee,
            quantite_expediee: ligne.quantite_expediee,
            quantite_recue: ligne.quantite_recue,
          }
          if (existingLine) {
            await updateLigne.mutateAsync({ id: existingLine.id!, data: ligneData })
          } else {
            await createLigne.mutateAsync({
              produit: ligne.produit,
              quantite_demandee: ligne.quantite_demandee,
              quantite_expediee: ligne.quantite_expediee,
              quantite_recue: ligne.quantite_recue,
              transfert: editingTransfertId,
            })
          }
        }
        for (const existingLine of existingLines) {
          if (!data.lignes.some((l) => l.produit === existingLine.produit)) {
            await deleteLigne.mutateAsync(existingLine.id!)
          }
        }
        setEditingTransfertId(null)
        setIsEditModalOpen(false)
      } else {
        transfert = await createTransfert.mutateAsync(transfertData)
        for (const ligne of data.lignes) {
          await createLigne.mutateAsync({
            produit: ligne.produit,
            quantite_demandee: ligne.quantite_demandee,
            quantite_expediee: ligne.quantite_expediee,
            quantite_recue: ligne.quantite_recue,
            transfert: transfert.id!,
          })
        }
        setIsAddModalOpen(false)
      }
      reset()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditTransfert = (transfert: TransfertStock) => {
    setEditingTransfertId(transfert.id)
    reset({
      numero_transfert: transfert.numero_transfert,
      point_vente_source: transfert.point_vente_source,
      point_vente_destination: transfert.point_vente_destination,
      status: transfert.status,
      demandeur: transfert.demandeur,
      validateur: transfert.validateur || "",
      date_validation: transfert.date_validation?.split('T')[0] || "",
      date_expedition: transfert.date_expedition?.split('T')[0] || "",
      date_reception: transfert.date_reception?.split('T')[0] || "",
      commentaire: transfert.commentaire || "",
      lignes: (editingTransfertDetails?.lignes || []).map((ligne) => ({
        produit: ligne.produit,
        quantite_demandee: ligne.quantite_demandee,
        quantite_expediee: ligne.quantite_expediee,
        quantite_recue: ligne.quantite_recue,
      })),
    })
    setIsEditModalOpen(true)
  }

  const handleDeleteTransfert = async (id: string) => {
    try {
      await deleteTransfert.mutateAsync(id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleValidateTransfert = async (id: string) => {
    try {
      await updateTransfert.mutateAsync({ id, data: { status: 'validated' } })
    } catch (err) {
      console.error(err)
    }
  }

  const handleShipTransfert = async (id: string) => {
    try {
      await updateTransfert.mutateAsync({ id, data: { status: 'shipped' } })
    } catch (err) {
      console.error(err)
    }
  }

  const handleReceiveTransfert = async (id: string) => {
    try {
      await updateTransfert.mutateAsync({ id, data: { status: 'received' } })
    } catch (err) {
      console.error(err)
    }
  }

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
              Erreur: {error.message}
            </p>
            <Button
              onClick={() => {
                fetchTransferts()
                fetchPointsVente()
                fetchUtilisateurs()
                fetchProduits()
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
                onClick={() => {
                  fetchTransferts()
                  fetchPointsVente()
                  fetchUtilisateurs()
                  fetchProduits()
                }}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date_validation" className="text-sm font-medium">Date de Validation</Label>
                        <Input
                          id="date_validation"
                          type="date"
                          {...register("date_validation")}
                          className="border-muted focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date_expedition" className="text-sm font-medium">Date d'Expédition</Label>
                        <Input
                          id="date_expedition"
                          type="date"
                          {...register("date_expedition")}
                          className="border-muted focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_reception" className="text-sm font-medium">Date de Réception</Label>
                      <Input
                        id="date_reception"
                        type="date"
                        {...register("date_reception")}
                        className="border-muted focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="commentaire" className="text-sm font-medium">Commentaire</Label>
                      <Textarea
                        id="commentaire"
                        {...register("commentaire")}
                        placeholder="Commentaires sur le transfert"
                        className="border-muted focus:ring-primary"
                      />
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
                                      <p className="text-xs text-destructive mt-1">{errors.lignes[index]?.produit?.message}</p>
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
                                      <p className="text-xs text-destructive mt-1">{errors.lignes[index]?.quantite_demandee?.message}</p>
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
                                      <p className="text-xs text-destructive mt-1">{errors.lignes[index]?.quantite_expediee?.message}</p>
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
                                      <p className="text-xs text-destructive mt-1">{errors.lignes[index]?.quantite_recue?.message}</p>
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
                        disabled={loading || createTransfert.isLoading}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {loading || createTransfert.isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        {loading || createTransfert.isLoading ? "Création..." : "Créer Transfert"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters */}
          <Card className="bg-background/95 backdrop-blur-sm shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher des transferts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-muted focus:ring-primary rounded-lg"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-48 border-muted">
                    <SelectValue />
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
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Transferts Totaux</CardTitle>
                <Package className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-800 dark:text-blue-200 animate-pulse">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : transferts.length}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">À travers tous les points de vente</p>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-900/10 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">Transferts en Attente</CardTitle>
                <Package className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-800 dark:text-yellow-200 animate-pulse">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : transferts.filter(t => t.status === 'pending').length}
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">En attente de validation</p>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/10 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">Transferts Reçus</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800 dark:text-green-200 animate-pulse">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : transferts.filter(t => t.status === 'received').length}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Transferts complétés</p>
              </CardContent>
            </Card>
          </div>

          {/* Transferts Table */}
          <Card className="bg-background/95 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-foreground">Transferts de Stock</CardTitle>
              <p className="text-sm text-muted-foreground">Gérer les transferts entre points de vente</p>
            </CardHeader>
            <CardContent>
              {error && (
                <p className="text-sm text-destructive mb-4 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {error.message}
                </p>
              )}
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="text-foreground font-semibold">Numéro Transfert</TableHead>
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
                  {loading && transferts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransferts.map((transfert) => {
                      const source = pointsVente.find((pv) => pv.id === transfert.point_vente_source)
                      const destination = pointsVente.find((pv) => pv.id === transfert.point_vente_destination)
                      const demandeur = utilisateurs.find((u) => u.id === transfert.demandeur)
                      return (
                        <TableRow key={transfert.id} className="hover:bg-muted/20 transition-colors">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{transfert.numero_transfert}</span>
                            </div>
                          </TableCell>
                          <TableCell>{source?.nom || 'Inconnu'}</TableCell>
                          <TableCell>{destination?.nom || 'Inconnu'}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(transfert.status)}
                              {getStatusBadge(transfert.status)}
                            </div>
                          </TableCell>
                          <TableCell>{transfert.lignes?.length || 0} article{transfert.lignes?.length !== 1 ? 's' : ''}</TableCell>
                          <TableCell>{demandeur?.username || 'Inconnu'}</TableCell>
                          <TableCell>{formatDate(transfert.date_demande)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedTransfertId(transfert.id!)
                                      setIsDetailModalOpen(true)
                                    }}
                                    className="hover:bg-primary/10"
                                  >
                                    <Eye className="h-3 w-3 text-primary" />
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
                                        <Edit className="h-3 w-3 text-primary" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Modifier Transfert</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        onClick={() => handleValidateTransfert(transfert.id!)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white"
                                      >
                                        Valider
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Valider Transfert</TooltipContent>
                                  </Tooltip>
                                </>
                              )}
                              {transfert.status === 'validated' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      onClick={() => handleShipTransfert(transfert.id!)}
                                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                    >
                                      Expédier
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Marquer comme Expédié</TooltipContent>
                                </Tooltip>
                              )}
                              {transfert.status === 'shipped' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      onClick={() => handleReceiveTransfert(transfert.id!)}
                                      className="bg-green-500 hover:bg-green-600 text-white"
                                    >
                                      Recevoir
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Marquer comme Reçu</TooltipContent>
                                </Tooltip>
                              )}
                              {transfert.status === 'pending' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteTransfert(transfert.id!)}
                                      className="hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Supprimer Transfert</TooltipContent>
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

          {/* Edit Transfert Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-h-[95vh] overflow-y-auto p-8" style={{ width: '70vw', maxWidth: '70vw', minWidth: '70vw' }}>
              <DialogHeader>
                <DialogTitle>Modifier Transfert de Stock</DialogTitle>
                <DialogDescription>Mettre à jour les détails du transfert et ses articles.</DialogDescription>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_validation" className="text-sm font-medium">Date de Validation</Label>
                    <Input
                      id="date_validation"
                      type="date"
                      {...register("date_validation")}
                      className="border-muted focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_expedition" className="text-sm font-medium">Date d'Expédition</Label>
                    <Input
                      id="date_expedition"
                      type="date"
                      {...register("date_expedition")}
                      className="border-muted focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_reception" className="text-sm font-medium">Date de Réception</Label>
                  <Input
                    id="date_reception"
                    type="date"
                    {...register("date_reception")}
                    className="border-muted focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commentaire" className="text-sm font-medium">Commentaire</Label>
                  <Textarea
                    id="commentaire"
                    {...register("commentaire")}
                    placeholder="Commentaires sur le transfert"
                    className="border-muted focus:ring-primary"
                  />
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
                                  <p className="text-xs text-destructive mt-1">{errors.lignes[index]?.produit?.message}</p>
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
                                  <p className="text-xs text-destructive mt-1">{errors.lignes[index]?.quantite_demandee?.message}</p>
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
                                  <p className="text-xs text-destructive mt-1">{errors.lignes[index]?.quantite_expediee?.message}</p>
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
                                  <p className="text-xs text-destructive mt-1">{errors.lignes[index]?.quantite_recue?.message}</p>
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
                    onClick={() => setIsEditModalOpen(false)}
                    className="border-muted hover:bg-muted"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || updateTransfert.isLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {loading || updateTransfert.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Edit className="h-4 w-4 mr-2" />
                    )}
                    {loading || updateTransfert.isLoading ? "Mise à jour..." : "Mettre à jour Transfert"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Detail Transfert Modal */}
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
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Numéro de Transfert</Label>
                            <p className="text-sm">{transfert.numero_transfert}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Statut</Label>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(transfert.status)}
                              {getStatusBadge(transfert.status)}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Point de Vente Source</Label>
                            <p className="text-sm">{source?.nom || 'Inconnu'}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Point de Vente Destination</Label>
                            <p className="text-sm">{destination?.nom || 'Inconnu'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Demandeur</Label>
                            <p className="text-sm">{demandeur?.username || 'Inconnu'}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Validateur</Label>
                            <p className="text-sm">{validateur?.username || 'Non défini'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Date de Demande</Label>
                            <p className="text-sm">{formatDate(transfert.date_demande)}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Date de Validation</Label>
                            <p className="text-sm">{formatDate(transfert.date_validation)}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Date d'Expédition</Label>
                            <p className="text-sm">{formatDate(transfert.date_expedition)}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Date de Réception</Label>
                            <p className="text-sm">{formatDate(transfert.date_reception)}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Commentaire</Label>
                          <p className="text-sm">{transfert.commentaire || 'Aucun commentaire'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Articles du Transfert</Label>
                          {loadingTransfertDetails ? (
                            <p className="text-sm text-center">Chargement des articles...</p>
                          ) : !transfertDetails?.lignes || transfertDetails.lignes.length === 0 ? (
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
                                {transfertDetails.lignes.map((ligne) => {
                                  const produit = produits.find((p) => p.id === ligne.produit)
                                  return (
                                    <TableRow key={ligne.id} className="hover:bg-muted/20">
                                      <TableCell>{produit?.nom || 'Inconnu'}</TableCell>
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
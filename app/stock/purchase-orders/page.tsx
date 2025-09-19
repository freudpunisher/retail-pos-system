
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
  FileText,
  Truck,
  CheckCircle,
  CheckSquare,
  Package,
  User,
  Loader2,
  AlertTriangle,
  Save,
} from "lucide-react"
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders"
import {
  PurchaseOrderResponse,
  CreatePurchaseOrderRequest,
  OrderLine,
  CreateOrderLineRequest,
  Fournisseur,
  PointVente,
  Produit,
} from "@/types/PurchaseOrder"

interface PurchaseOrderFormData {
  numero_commande: string;
  status: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';
  date_livraison_prevue: string;
  commentaire?: string;
  fournisseur: string;
  point_vente: string;
  utilisateur: string;
  items: Array<{
    id?: string; // Optional for new items
    produit: string;
    quantite_commandee: number;
    quantite_recue: number;
    prix_unitaire: number;
  }>;
}

const statusOptions = [
  { value: "all", label: "Tous les Statuts" },
  { value: "draft", label: "Brouillon" },
  { value: "sent", label: "Envoyé" },
  { value: "confirmed", label: "Confirmé" },
  { value: "partially_received", label: "Partiellement Reçu" },
  { value: "received", label: "Reçu" },
  { value: "cancelled", label: "Annulé" },
]

export default function PurchaseOrdersPage() {
  const {
    purchaseOrders,
    fournisseurs,
    pointsVente,
    users,
    produits,
    loading,
    error,
    fetchPurchaseOrders,
    fetchFournisseurs,
    fetchPointsVente,
    fetchUsers,
    fetchProduits,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
  } = usePurchaseOrders()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)

  const { register, control, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<PurchaseOrderFormData>({
    defaultValues: {
      numero_commande: "",
      status: "draft",
      date_livraison_prevue: "",
      commentaire: "",
      fournisseur: "",
      point_vente: "",
      utilisateur: "",
      items: [],
    },
  })

  const watchedItems = watch("items")

  // Utility functions for calculations
  const calculateLineTotal = (quantite: number, prix: number): number => {
    return (quantite || 0) * (prix || 0)
  }

  const calculateOrderTotal = (items: Array<{ quantite_commandee?: number; prix_unitaire?: number }>): number => {
    return items?.reduce((total, item) => total + calculateLineTotal(item?.quantite_commandee || 0, item?.prix_unitaire || 0), 0) || 0
  }

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "items",
  })

  useEffect(() => {
    fetchPurchaseOrders()
    fetchFournisseurs()
    fetchPointsVente()
    fetchUsers()
    fetchProduits()
  }, [fetchPurchaseOrders, fetchFournisseurs, fetchPointsVente, fetchUsers, fetchProduits])

  useEffect(() => {
    if (selectedOrderId) {
      const order = purchaseOrders.find((po) => po.id === selectedOrderId)
      if (order) {
        reset({
          numero_commande: order.numero_commande,
          status: order.status,
          date_livraison_prevue: order.date_livraison_prevue.split('T')[0],
          commentaire: order.commentaire || "",
          fournisseur: order.fournisseur,
          point_vente: order.point_vente,
          utilisateur: order.utilisateur,
          items: (order.lignes || []).map((line) => ({
            id: line.id,
            produit: line.produit,
            quantite_commandee: line.quantite_commandee,
            quantite_recue: line.quantite_recue,
            prix_unitaire: line.prix_unitaire,
          })),
        })
      }
    }
  }, [selectedOrderId, purchaseOrders, reset])

  useEffect(() => {
    if (editingOrderId) {
      const order = purchaseOrders.find((po) => po.id === editingOrderId)
      if (order) {
        reset({
          numero_commande: order.numero_commande,
          status: order.status,
          date_livraison_prevue: order.date_livraison_prevue.split('T')[0],
          commentaire: order.commentaire || "",
          fournisseur: order.fournisseur,
          point_vente: order.point_vente,
          utilisateur: order.utilisateur,
          items: (order.lignes || []).map((line) => ({
            id: line.id,
            produit: line.produit,
            quantite_commandee: line.quantite_commandee,
            quantite_recue: line.quantite_recue,
            prix_unitaire: line.prix_unitaire,
          })),
        })
      }
    }
  }, [editingOrderId, purchaseOrders, reset])

  const filteredPOs = purchaseOrders.filter((po) => {
    const fournisseur = fournisseurs.find((f) => f.id === po.fournisseur)
    const matchesSearch =
      po.numero_commande.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fournisseur?.nom.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesStatus = selectedStatus === "all" || po.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: <Badge className="bg-gray-500 text-white">Brouillon</Badge>,
      sent: <Badge className="bg-blue-500 text-white">Envoyé</Badge>,
      confirmed: <Badge className="bg-purple-500 text-white">Confirmé</Badge>,
      partially_received: <Badge className="bg-yellow-500 text-white">Partiellement Reçu</Badge>,
      received: <Badge className="bg-green-500 text-white">Reçu</Badge>,
      cancelled: <Badge className="bg-red-500 text-white">Annulé</Badge>,
    }
    return badges[status as keyof typeof badges] || <Badge variant="outline">{status}</Badge>
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <FileText className="h-4 w-4 text-gray-600" />
      case "sent":
        return <Package className="h-4 w-4 text-blue-600" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-purple-600" />
      case "partially_received":
        return <Truck className="h-4 w-4 text-yellow-600" />
      case "received":
        return <Truck className="h-4 w-4 text-green-600" />
      case "cancelled":
        return <FileText className="h-4 w-4 text-red-600" />
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleCreateOrUpdateOrder = async (data: PurchaseOrderFormData, orderId?: string) => {
    try {
      const orderData: CreatePurchaseOrderRequest = {
      
        status: data.status,
        date_livraison_prevue: data.date_livraison_prevue,
        commentaire: data.commentaire,
        fournisseur: data.fournisseur,
        point_vente: data.point_vente,
        utilisateur: data.utilisateur || "3a9d9fd3-5b7f-48b4-af7f-8eed0387d30f",
        lignes: data.items.map((item) => ({
          id: item.id, // Include ID for updates
          quantite_commandee: item.quantite_commandee,
          quantite_recue: item.quantite_recue || 0,
          prix_unitaire: item.prix_unitaire,
          produit: item.produit,
        })),
      }
      
      const targetOrderId = orderId || editingOrderId
      if (targetOrderId) {
        await updatePurchaseOrder(targetOrderId, orderData)
        setEditingOrderId(null)
        setIsEditModalOpen(false)
        setIsDetailModalOpen(false)
      } else {
        await createPurchaseOrder(orderData)
        setIsAddModalOpen(false)
      }
      
      reset()
      await fetchPurchaseOrders() // This will refresh the data with embedded lignes
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditOrder = (order: PurchaseOrderResponse) => {
    setEditingOrderId(order.id)
    setIsEditModalOpen(true)
  }

  const handleDeleteOrder = async (id: string) => {
    try {
      await deletePurchaseOrder(id)
      await fetchPurchaseOrders()
    } catch (err) {
      console.error(err)
    }
  }

  const handleConfirmOrder = async (id: string) => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir confirmer cette commande ? Cette action rendra la commande non modifiable."
    )
    if (!confirmed) return
    
    try {
      await updatePurchaseOrder(id, { status: 'confirmed' })
      await fetchPurchaseOrders()
    } catch (err) {
      console.error(err)
    }
  }

  const handleReceiveOrder = async (id: string) => {
    try {
      await updatePurchaseOrder(id, { status: 'received' })
      await fetchPurchaseOrders()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditItem = (index: number) => {
    setEditingItemIndex(index)
  }

  // handleSaveItem and handleDeleteItem removed - using full form submission approach
  // Individual item changes are handled through the main form submission

  if (loading && purchaseOrders.length === 0) {
    return (
      <POSLayout currentPath="/stock/purchase-orders">
        <div className="flex items-center justify-center h-96 bg-background/95 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg text-foreground">Chargement des commandes...</span>
        </div>
      </POSLayout>
    )
  }

  if (error && purchaseOrders.length === 0) {
    return (
      <POSLayout currentPath="/stock/purchase-orders">
        <div className="flex items-center justify-center h-96 bg-background/95 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <p className="text-destructive flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Erreur: {error}
            </p>
            <Button
              onClick={() => {
                fetchPurchaseOrders()
                fetchFournisseurs()
                fetchPointsVente()
                fetchUsers()
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
    <POSLayout currentPath="/stock/purchase-orders">
      <TooltipProvider>
        <div className="space-y-8 p-6 bg-gradient-to-b from-background to-background/90 min-h-screen">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
                Commandes Fournisseurs
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                Gérer les commandes fournisseurs et l'approvisionnement d'inventaire
              </p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="border-primary/20 hover:bg-primary/10 transition-all duration-200"
                onClick={() => {
                  fetchPurchaseOrders()
                  fetchFournisseurs()
                  fetchPointsVente()
                  fetchUsers()
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
                    Nouvelle Commande
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="max-h-[95vh] overflow-y-auto p-8"
                  style={{
                    width: '70vw',
                    maxWidth: '70vw',
                    minWidth: '70vw',
                  }}
                >
                  <DialogHeader>
                    <DialogTitle>Créer une Commande Fournisseur</DialogTitle>
                    <DialogDescription>Ajouter une nouvelle commande avec ses articles.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit((data) => handleCreateOrUpdateOrder(data))} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                     
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
                        <Label htmlFor="fournisseur" className="text-sm font-medium">Fournisseur</Label>
                        <Controller
                          name="fournisseur"
                          control={control}
                          rules={{ required: "Fournisseur est requis" }}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="border-muted">
                                <SelectValue placeholder="Sélectionner un fournisseur" />
                              </SelectTrigger>
                              <SelectContent>
                                {fournisseurs.map((fournisseur) => (
                                  <SelectItem key={fournisseur.id} value={fournisseur.id}>
                                    {fournisseur.nom}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.fournisseur && (
                          <p className="text-sm text-destructive">{errors.fournisseur.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="point_vente" className="text-sm font-medium">Point de Vente</Label>
                        <Controller
                          name="point_vente"
                          control={control}
                          rules={{ required: "Point de vente est requis" }}
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
                        {errors.point_vente && (
                          <p className="text-sm text-destructive">{errors.point_vente.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_livraison_prevue" className="text-sm font-medium">Date de Livraison Prévue</Label>
                      <Input
                        id="date_livraison_prevue"
                        type="date"
                        {...register("date_livraison_prevue", { required: "Date de livraison prévue est requise" })}
                        className="border-muted focus:ring-primary"
                      />
                      {errors.date_livraison_prevue && (
                        <p className="text-sm text-destructive">{errors.date_livraison_prevue.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="utilisateur" className="text-sm font-medium">Utilisateur</Label>
                      <Controller
                        name="utilisateur"
                        control={control}
                        rules={{ required: "Utilisateur est requis" }}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="border-muted">
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
                      {errors.utilisateur && (
                        <p className="text-sm text-destructive">{errors.utilisateur.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="commentaire" className="text-sm font-medium">Commentaire</Label>
                      <Textarea
                        id="commentaire"
                        {...register("commentaire")}
                        placeholder="Commentaires sur la commande"
                        className="border-muted focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Articles de la Commande</Label>
                      <div className="border rounded-lg bg-background/95">
                        {fields.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">Aucun article ajouté</p>
                        ) : (
                          <Table className="w-full">
                            <TableHeader>
                              <TableRow className="hover:bg-muted/50">
                                <TableHead className="text-foreground font-semibold w-1/4">Produit</TableHead>
                                <TableHead className="text-foreground font-semibold text-center w-1/6">Qté Commandée</TableHead>
                                <TableHead className="text-foreground font-semibold text-center w-1/6">Qté Reçue</TableHead>
                                <TableHead className="text-foreground font-semibold text-center w-1/6">Prix Unit. (FBU)</TableHead>
                                <TableHead className="text-foreground font-semibold text-center w-1/6">Total Ligne (FBU)</TableHead>
                                <TableHead className="text-foreground font-semibold text-center w-[100px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {fields.map((field, index) => (
                                <TableRow key={field.id} className="hover:bg-muted/20">
                                  <TableCell className="py-2">
                                    <Controller
                                      name={`items.${index}.produit`}
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
                                    {errors.items?.[index]?.produit && (
                                      <p className="text-xs text-destructive mt-1">{errors.items[index]?.produit?.message}</p>
                                    )}
                                  </TableCell>
                                  <TableCell className="py-2 text-center">
                                    <Input
                                      type="number"
                                      placeholder="Qté"
                                      {...register(`items.${index}.quantite_commandee`, {
                                        required: "Quantité est requise",
                                        min: { value: 1, message: "Quantité doit être positive" },
                                        valueAsNumber: true,
                                      })}
                                      className="border-muted focus:ring-primary h-9 text-center"
                                    />
                                    {errors.items?.[index]?.quantite_commandee && (
                                      <p className="text-xs text-destructive mt-1">{errors.items[index]?.quantite_commandee?.message}</p>
                                    )}
                                  </TableCell>
                                  <TableCell className="py-2 text-center">
                                    <Input
                                      type="number"
                                      placeholder="Qté Reçue"
                                      {...register(`items.${index}.quantite_recue`, {
                                        min: { value: 0, message: "Quantité reçue ne peut pas être négative" },
                                        valueAsNumber: true,
                                      })}
                                      className="border-muted focus:ring-primary h-9 text-center"
                                    />
                                    {errors.items?.[index]?.quantite_recue && (
                                      <p className="text-xs text-destructive mt-1">{errors.items[index]?.quantite_recue?.message}</p>
                                    )}
                                  </TableCell>
                                  <TableCell className="py-2 text-center">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="Prix"
                                      {...register(`items.${index}.prix_unitaire`, {
                                        required: "Prix unitaire est requis",
                                        min: { value: 0, message: "Prix ne peut pas être négatif" },
                                        valueAsNumber: true,
                                      })}
                                      className="border-muted focus:ring-primary h-9 text-center"
                                    />
                                    {errors.items?.[index]?.prix_unitaire && (
                                      <p className="text-xs text-destructive mt-1">{errors.items[index]?.prix_unitaire?.message}</p>
                                    )}
                                  </TableCell>
                                  <TableCell className="py-2 text-center">
                                    <span className="font-medium text-primary">
                                      {calculateLineTotal(watchedItems?.[index]?.quantite_commandee || 0, watchedItems?.[index]?.prix_unitaire || 0).toLocaleString()} FBU
                                    </span>
                                  </TableCell>
                                  <TableCell className="py-2 text-center">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => remove(index)}
                                      className="hover:bg-destructive/10 h-9 w-9"
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                        <div className="border-t pt-4 mt-4">
                          <div className="flex items-center justify-between mb-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => append({ produit: "", quantite_commandee: 1, quantite_recue: 0, prix_unitaire: 0 })}
                              className="ml-4"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Ajouter Article
                            </Button>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Total de la commande</p>
                              <p className="text-lg font-bold text-primary">
                                {calculateOrderTotal(watchedItems || []).toLocaleString()} FBU
                              </p>
                            </div>
                          </div>
                        </div>
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
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        {loading ? "Ajout..." : "Créer Commande"}
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
                    placeholder="Rechercher commandes ou fournisseurs..."
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

          {/* Purchase Orders Table */}
          <Card className="bg-background/95 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-foreground">Commandes Fournisseurs</CardTitle>
              <p className="text-sm text-muted-foreground">Liste des commandes fournisseurs</p>
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
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="text-foreground font-semibold">Commande #</TableHead>
                    <TableHead className="text-foreground font-semibold">Fournisseur</TableHead>
                    <TableHead className="text-foreground font-semibold">Point de Vente</TableHead>
                    <TableHead className="text-foreground font-semibold">Statut</TableHead>
                    <TableHead className="text-foreground font-semibold">Articles</TableHead>
                    <TableHead className="text-foreground font-semibold">Total (FBU)</TableHead>
                    <TableHead className="text-foreground font-semibold">Date Prévue</TableHead>
                    <TableHead className="text-foreground font-semibold">Demandeur</TableHead>
                    <TableHead className="text-foreground font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && purchaseOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan= {9} className="text-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPOs.map((po) => {
                      const fournisseur = fournisseurs.find((f) => f.id === po.fournisseur)
                      const pointVente = pointsVente.find((pv) => pv.id === po.point_vente)
                      const user = users.find((u) => u.id === po.utilisateur)
                      const itemsCount = (po.lignes || []).length
                      return (
                        <TableRow key={po.id} className="hover:bg-muted/20 transition-colors">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{po.numero_commande}</span>
                            </div>
                          </TableCell>
                          <TableCell>{fournisseur?.nom || 'Inconnu'}</TableCell>
                          <TableCell>{pointVente?.nom || 'Inconnu'}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(po.status)}
                              {getStatusBadge(po.status)}
                            </div>
                          </TableCell>
                          <TableCell>{itemsCount} article{itemsCount !== 1 ? 's' : ''}</TableCell>
                          <TableCell className="font-medium">{po.montant_total} FBU</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <span className="text-sm">{formatDate(po.date_livraison_prevue)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{user?.nom || 'Inconnu'}</span>
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
                                      setSelectedOrderId(po.id)
                                      setIsDetailModalOpen(true)
                                    }}
                                    className="hover:bg-primary/10"
                                  >
                                    <Eye className="h-3 w-3 text-primary" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Voir les détails</TooltipContent>
                              </Tooltip>
                              {(po.status === 'draft' || po.status === 'sent') && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditOrder(po)}
                                      className="hover:bg-primary/10"
                                    >
                                      <Edit className="h-3 w-3 text-primary" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Modifier Commande</TooltipContent>
                                </Tooltip>
                              )}
                              {(po.status === 'draft' || po.status === 'sent') && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      onClick={() => handleConfirmOrder(po.id)}
                                      className="bg-blue-500 hover:bg-blue-600 text-white"
                                    >
                                      <CheckSquare className="h-3 w-3 mr-1" />
                                      Confirmer
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Confirmer la Commande</TooltipContent>
                                </Tooltip>
                              )}
                              {po.status === 'confirmed' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      onClick={() => handleReceiveOrder(po.id)}
                                      className="bg-green-500 hover:bg-green-600 text-white"
                                    >
                                      Recevoir
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Marquer comme Reçu</TooltipContent>
                                </Tooltip>
                              )}
                              {po.status === 'draft' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteOrder(po.id)}
                                      className="hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Supprimer Commande</TooltipContent>
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

          {/* Detail Order Modal */}
          <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
            <DialogContent
              className="max-h-[95vh] overflow-y-auto p-8"
              style={{
                width: '70vw',
                maxWidth: '70vw',
                minWidth: '70vw',
              }}
            >
              <DialogHeader>
                <DialogTitle>Détails de la Commande Fournisseur</DialogTitle>
                <DialogDescription>
                  Voir et modifier les détails de la commande et ses articles.
                  {(() => {
                    const currentOrder = purchaseOrders.find((po) => po.id === selectedOrderId)
                    return currentOrder?.status === 'confirmed' || currentOrder?.status === 'received' || currentOrder?.status === 'cancelled' ? (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                        <AlertTriangle className="h-4 w-4 inline mr-2" />
                        Cette commande est confirmée et ne peut plus être modifiée.
                      </div>
                    ) : null
                  })()}
                </DialogDescription>
              </DialogHeader>
              {(() => {
                const currentOrder = purchaseOrders.find((po) => po.id === selectedOrderId)
                const isConfirmed = currentOrder?.status === 'confirmed' || currentOrder?.status === 'received' || currentOrder?.status === 'cancelled'
                return (
              <form onSubmit={handleSubmit((data) => handleCreateOrUpdateOrder(data, selectedOrderId || undefined))} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero_commande" className="text-sm font-medium">Numéro de Commande</Label>
                    <Input
                      id="numero_commande"
                      {...register("numero_commande", { required: "Numéro de commande est requis" })}
                      placeholder="Entrez le numéro de commande"
                      className="border-muted focus:ring-primary"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">Statut</Label>
                    <Controller
                      name="status"
                      control={control}
                      rules={{ required: "Statut est requis" }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled>
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
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fournisseur" className="text-sm font-medium">Fournisseur</Label>
                    <Controller
                      name="fournisseur"
                      control={control}
                      rules={{ required: "Fournisseur est requis" }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled>
                          <SelectTrigger className="border-muted">
                            <SelectValue placeholder="Sélectionner un fournisseur" />
                          </SelectTrigger>
                          <SelectContent>
                            {fournisseurs.map((fournisseur) => (
                              <SelectItem key={fournisseur.id} value={fournisseur.id}>
                                {fournisseur.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="point_vente" className="text-sm font-medium">Point de Vente</Label>
                    <Controller
                      name="point_vente"
                      control={control}
                      rules={{ required: "Point de vente est requis" }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled>
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
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_livraison_prevue" className="text-sm font-medium">Date de Livraison Prévue</Label>
                  <Input
                    id="date_livraison_prevue"
                    type="date"
                    {...register("date_livraison_prevue", { required: "Date de livraison prévue est requise" })}
                    className="border-muted focus:ring-primary"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="utilisateur" className="text-sm font-medium">Utilisateur</Label>
                  <Controller
                    name="utilisateur"
                    control={control}
                    rules={{ required: "Utilisateur est requis" }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled>
                        <SelectTrigger className="border-muted">
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commentaire" className="text-sm font-medium">Commentaire</Label>
                  <Textarea
                    id="commentaire"
                    {...register("commentaire")}
                    placeholder="Commentaires sur la commande"
                    className="border-muted focus:ring-primary"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Articles de la Commande</Label>
                  <div className="border rounded-lg bg-background/95">
                    {fields.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Aucun article ajouté</p>
                    ) : (
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow className="hover:bg-muted/50">
                            <TableHead className="text-foreground font-semibold w-1/4">Produit</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-1/6">Qté Commandée</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-1/6">Qté Reçue</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-1/6">Prix Unit. (FBU)</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-1/6">Total Ligne (FBU)</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fields.map((field, index) => (
                            <TableRow key={field.id} className="hover:bg-muted/20">
                              <TableCell className="py-2">
                                {editingItemIndex === index ? (
                                  <>
                                    <Controller
                                      name={`items.${index}.produit`}
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
                                    {errors.items?.[index]?.produit && (
                                      <p className="text-xs text-destructive mt-1">{errors.items[index]?.produit?.message}</p>
                                    )}
                                  </>
                                ) : (
                                  <span>{produits.find((p) => p.id === field.produit)?.nom || 'Inconnu'}</span>
                                )}
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                {editingItemIndex === index ? (
                                  <>
                                    <Input
                                      type="number"
                                      placeholder="Qté"
                                      {...register(`items.${index}.quantite_commandee`, {
                                        required: "Quantité est requise",
                                        min: { value: 1, message: "Quantité doit être positive" },
                                        valueAsNumber: true,
                                      })}
                                      className="border-muted focus:ring-primary h-9 text-center"
                                    />
                                    {errors.items?.[index]?.quantite_commandee && (
                                      <p className="text-xs text-destructive mt-1">{errors.items[index]?.quantite_commandee?.message}</p>
                                    )}
                                  </>
                                ) : (
                                  <span>{field.quantite_commandee}</span>
                                )}
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                {editingItemIndex === index ? (
                                  <>
                                    <Input
                                      type="number"
                                      placeholder="Qté Reçue"
                                      {...register(`items.${index}.quantite_recue`, {
                                        min: { value: 0, message: "Quantité reçue ne peut pas être négative" },
                                        valueAsNumber: true,
                                      })}
                                      className="border-muted focus:ring-primary h-9 text-center"
                                    />
                                    {errors.items?.[index]?.quantite_recue && (
                                      <p className="text-xs text-destructive mt-1">{errors.items[index]?.quantite_recue?.message}</p>
                                    )}
                                  </>
                                ) : (
                                  <span>{field.quantite_recue}</span>
                                )}
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                {editingItemIndex === index ? (
                                  <>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="Prix"
                                      {...register(`items.${index}.prix_unitaire`, {
                                        required: "Prix unitaire est requis",
                                        min: { value: 0, message: "Prix ne peut pas être négatif" },
                                        valueAsNumber: true,
                                      })}
                                      className="border-muted focus:ring-primary h-9 text-center"
                                    />
                                    {errors.items?.[index]?.prix_unitaire && (
                                      <p className="text-xs text-destructive mt-1">{errors.items[index]?.prix_unitaire?.message}</p>
                                    )}
                                  </>
                                ) : (
                                  <span>{field.prix_unitaire} FBU</span>
                                )}
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                <span className="font-medium text-primary">
                                  {calculateLineTotal(field.quantite_commandee, field.prix_unitaire).toLocaleString()} FBU
                                </span>
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                <div className="flex justify-center space-x-2">
                                  {!isConfirmed && (
                                    editingItemIndex === index ? (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingItemIndex(null)}
                                        className="hover:bg-primary/10 h-9 w-9"
                                      >
                                        <Save className="h-4 w-4 text-primary" />
                                      </Button>
                                    ) : (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditItem(index)}
                                        className="hover:bg-primary/10 h-9 w-9"
                                      >
                                        <Edit className="h-4 w-4 text-primary" />
                                      </Button>
                                    )
                                  )}
                                  {!isConfirmed && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => remove(index)}
                                      className="hover:bg-destructive/10 h-9 w-9"
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center justify-between mb-4">
                        {!isConfirmed && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ produit: "", quantite_commandee: 1, quantite_recue: 0, prix_unitaire: 0 })}
                            className="ml-4"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Ajouter Article
                          </Button>
                        )}
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total de la commande</p>
                          <p className="text-lg font-bold text-primary">
                            {calculateOrderTotal(watchedItems || []).toLocaleString()} FBU
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setIsDetailModalOpen(false)
                      setEditingItemIndex(null)
                    }}
                    className="border-muted hover:bg-muted"
                  >
                    Fermer
                  </Button>
                  {!isConfirmed && (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                    </Button>
                  )}
                </div>
              </form>
                )
              })()}
            </DialogContent>
          </Dialog>

          {/* Edit Order Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent
              className="max-h-[95vh] overflow-y-auto p-8"
              style={{
                width: '70vw',
                maxWidth: '70vw',
                minWidth: '70vw',
              }}
            >
              <DialogHeader>
                <DialogTitle>Modifier Commande Fournisseur</DialogTitle>
                <DialogDescription>Mettre à jour les détails de la commande et ses articles.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit((data) => handleCreateOrUpdateOrder(data))} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero_commande" className="text-sm font-medium">Numéro de Commande</Label>
                    <Input
                      id="numero_commande"
                      {...register("numero_commande", { required: "Numéro de commande est requis" })}
                      placeholder="Entrez le numéro de commande"
                      className="border-muted focus:ring-primary"
                    />
                    {errors.numero_commande && (
                      <p className="text-sm text-destructive">{errors.numero_commande.message}</p>
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
                    <Label htmlFor="fournisseur" className="text-sm font-medium">Fournisseur</Label>
                    <Controller
                      name="fournisseur"
                      control={control}
                      rules={{ required: "Fournisseur est requis" }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="border-muted">
                            <SelectValue placeholder="Sélectionner un fournisseur" />
                          </SelectTrigger>
                          <SelectContent>
                            {fournisseurs.map((fournisseur) => (
                              <SelectItem key={fournisseur.id} value={fournisseur.id}>
                                {fournisseur.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.fournisseur && (
                      <p className="text-sm text-destructive">{errors.fournisseur.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="point_vente" className="text-sm font-medium">Point de Vente</Label>
                    <Controller
                      name="point_vente"
                      control={control}
                      rules={{ required: "Point de vente est requis" }}
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
                    {errors.point_vente && (
                      <p className="text-sm text-destructive">{errors.point_vente.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_livraison_prevue" className="text-sm font-medium">Date de Livraison Prévue</Label>
                  <Input
                    id="date_livraison_prevue"
                    type="date"
                    {...register("date_livraison_prevue", { required: "Date de livraison prévue est requise" })}
                    className="border-muted focus:ring-primary"
                  />
                  {errors.date_livraison_prevue && (
                    <p className="text-sm text-destructive">{errors.date_livraison_prevue.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="utilisateur" className="text-sm font-medium">Utilisateur</Label>
                  <Controller
                    name="utilisateur"
                    control={control}
                    rules={{ required: "Utilisateur est requis" }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="border-muted">
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
                  {errors.utilisateur && (
                    <p className="text-sm text-destructive">{errors.utilisateur.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commentaire" className="text-sm font-medium">Commentaire</Label>
                  <Textarea
                    id="commentaire"
                    {...register("commentaire")}
                    placeholder="Commentaires sur la commande"
                    className="border-muted focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Articles de la Commande</Label>
                  <div className="border rounded-lg bg-background/95">
                    {fields.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Aucun article ajouté</p>
                    ) : (
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow className="hover:bg-muted/50">
                            <TableHead className="text-foreground font-semibold w-1/4">Produit</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-1/6">Qté Commandée</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-1/6">Qté Reçue</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-1/6">Prix Unit. (FBU)</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-1/6">Total Ligne (FBU)</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fields.map((field, index) => (
                            <TableRow key={field.id} className="hover:bg-muted/20">
                              <TableCell className="py-2">
                                <Controller
                                  name={`items.${index}.produit`}
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
                                {errors.items?.[index]?.produit && (
                                  <p className="text-xs text-destructive mt-1">{errors.items[index]?.produit?.message}</p>
                                )}
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                <Input
                                  type="number"
                                  placeholder="Qté"
                                  {...register(`items.${index}.quantite_commandee`, {
                                    required: "Quantité est requise",
                                    min: { value: 1, message: "Quantité doit être positive" },
                                    valueAsNumber: true,
                                  })}
                                  className="border-muted focus:ring-primary h-9 text-center"
                                />
                                {errors.items?.[index]?.quantite_commandee && (
                                  <p className="text-xs text-destructive mt-1">{errors.items[index]?.quantite_commandee?.message}</p>
                                )}
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                <Input
                                  type="number"
                                  placeholder="Qté Reçue"
                                  {...register(`items.${index}.quantite_recue`, {
                                    min: { value: 0, message: "Quantité reçue ne peut pas être négative" },
                                    valueAsNumber: true,
                                  })}
                                  className="border-muted focus:ring-primary h-9 text-center"
                                />
                                {errors.items?.[index]?.quantite_recue && (
                                  <p className="text-xs text-destructive mt-1">{errors.items[index]?.quantite_recue?.message}</p>
                                )}
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Prix"
                                  {...register(`items.${index}.prix_unitaire`, {
                                    required: "Prix unitaire est requis",
                                    min: { value: 0, message: "Prix ne peut pas être négatif" },
                                    valueAsNumber: true,
                                  })}
                                  className="border-muted focus:ring-primary h-9 text-center"
                                />
                                {errors.items?.[index]?.prix_unitaire && (
                                  <p className="text-xs text-destructive mt-1">{errors.items[index]?.prix_unitaire?.message}</p>
                                )}
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                <span className="font-medium text-primary">
                                  {calculateLineTotal(watchedItems?.[index]?.quantite_commandee || 0, watchedItems?.[index]?.prix_unitaire || 0).toLocaleString()} FBU
                                </span>
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => remove(index)}
                                  className="hover:bg-destructive/10 h-9 w-9"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => append({ produit: "", quantite_commandee: 1, quantite_recue: 0, prix_unitaire: 0 })}
                          className="ml-4"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Ajouter Article
                        </Button>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total de la commande</p>
                          <p className="text-lg font-bold text-primary">
                            {calculateOrderTotal(watchedItems || []).toLocaleString()} FBU
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false)
                      setEditingOrderId(null)
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
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Edit className="h-4 w-4 mr-2" />
                    )}
                    {loading ? "Mise à jour..." : "Mettre à jour Commande"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </POSLayout>
  )
}
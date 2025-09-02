"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
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
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Package,
  User,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { useStockMovements } from "@/hooks/useStockMovements"
import {
  StockMovementResponse,
  CreateStockMovementRequest,
  Stock,
  Produit,
  PointVente,
  // User,
} from "@/types/StockMovement"
// import { User } from "@/types/user"

interface StockMovementFormData {
  type_mouvement: 'entree' | 'sortie' | 'transfert_in' | 'transfert_out' | 'ajustement' | 'inventaire';
  stock: string;
  quantite: number;
  prix_unitaire: number;
  reference_document: string;
  motif: string;
  date_expiration?: string;
  utilisateur: string;
}

const movementTypes = [
  { value: "all", label: "Tous les Types" },
  { value: "entree", label: "Entrée" },
  { value: "sortie", label: "Sortie" },
  { value: "transfert_in", label: "Transfert Entrant" },
  { value: "transfert_out", label: "Transfert Sortant" },
  { value: "ajustement", label: "Ajustement" },
  { value: "inventaire", label: "Inventaire" },
]

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
  } = useStockMovements()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(null)
  const [editingMovementId, setEditingMovementId] = useState<string | null>(null)

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<StockMovementFormData>({
    defaultValues: {
      type_mouvement: "entree",
      stock: "",
      quantite: 0,
      prix_unitaire: 0,
      reference_document: "",
      motif: "",
      date_expiration: "",
      utilisateur: "",
    },
  })


  console.log("Rendered MovementsPage with states:", {
    movements,
    // stocks,
    // produits,
    // pointsVente,
    // users,
    // loading,
    // error,
  })

  useEffect(() => {
    fetchStockMovements()
    fetchStocks()
    fetchProduits()
    fetchPointsVente()
    fetchUsers()
  }, [fetchStockMovements, fetchStocks, fetchProduits, fetchPointsVente, fetchUsers])

  const filteredMovements = movements.filter((movement) => {
    const stock = stocks.find((s) => s.id === movement.stock)
    const produit = produits.find((p) => p.id === stock?.produit)
    const matchesSearch =
      (produit?.nom.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      movement.reference_document.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || movement.type_mouvement === selectedType
    return matchesSearch && matchesType
  })

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "entree":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "sortie":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "transfert_in":
        return <ArrowRightLeft className="h-4 w-4 text-blue-600" />
      case "transfert_out":
        return <ArrowRightLeft className="h-4 w-4 text-orange-600" />
      case "ajustement":
        return <Edit className="h-4 w-4 text-purple-600" />
      case "inventaire":
        return <Package className="h-4 w-4 text-gray-600" />
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  const getMovementBadge = (type: string) => {
    const badges = {
      entree: <Badge className="bg-green-500 text-white">Entrée</Badge>,
      sortie: <Badge className="bg-red-500 text-white">Sortie</Badge>,
      transfert_in: <Badge className="bg-blue-500 text-white">Transfert Entrant</Badge>,
      transfert_out: <Badge className="bg-orange-500 text-white">Transfert Sortant</Badge>,
      ajustement: <Badge className="bg-purple-500 text-white">Ajustement</Badge>,
      inventaire: <Badge className="bg-gray-500 text-white">Inventaire</Badge>,
    }
    return badges[type as keyof typeof badges] || <Badge variant="outline">{type}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleCreateOrUpdateMovement = async (data: StockMovementFormData) => {
    try {
      if (editingMovementId) {
        await updateStockMovement(editingMovementId, data)
        setEditingMovementId(null)
        setIsEditModalOpen(false)
      } else {
        await createStockMovement(data)
        setIsAddModalOpen(false)
      }
      reset()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditMovement = (movement: StockMovementResponse) => {
    setEditingMovementId(movement.id)
    reset({
      type_mouvement: movement.type_mouvement,
      stock: movement.stock,
      quantite: movement.quantite,
      prix_unitaire: movement.prix_unitaire,
      reference_document: movement.reference_document,
      motif: movement.motif,
      date_expiration: movement.date_expiration || "",
      utilisateur: movement.utilisateur,
    })
    setIsEditModalOpen(true)
  }

  const handleDeleteMovement = async (id: string) => {
    try {
      await deleteStockMovement(id)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading && movements.length === 0) {
    return (
      <POSLayout currentPath="/stock/movements">
        <div className="flex items-center justify-center h-96 bg-background/95 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg text-foreground">Chargement des mouvements...</span>
        </div>
      </POSLayout>
    )
  }

  if (error && movements.length === 0) {
    return (
      <POSLayout currentPath="/stock/movements">
        <div className="flex items-center justify-center h-96 bg-background/95 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <p className="text-destructive flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Erreur: {error}
            </p>
            <Button
              onClick={() => {
                fetchStockMovements()
                fetchStocks()
                fetchProduits()
                fetchPointsVente()
                fetchUsers()
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
    <POSLayout currentPath="/stock/movements">
      <TooltipProvider>
        <div className="space-y-8 p-6 bg-gradient-to-b from-background to-background/90 min-h-screen">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
                Mouvements de Stock
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                Suivre tous les mouvements et transactions d'inventaire
              </p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="border-primary/20 hover:bg-primary/10 transition-all duration-200"
                onClick={() => {
                  fetchStockMovements()
                  fetchStocks()
                  fetchProduits()
                  fetchPointsVente()
                  fetchUsers()
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
                    Ajouter Mouvement
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm rounded-lg shadow-xl">
                  <DialogHeader>
                    <DialogTitle>Ajouter un Mouvement de Stock</DialogTitle>
                    <DialogDescription>Créer un nouvel enregistrement de mouvement.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(handleCreateOrUpdateMovement)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="type_mouvement" className="text-sm font-medium">Type de Mouvement</Label>
                      <Controller
                        name="type_mouvement"
                        control={control}
                        rules={{ required: "Type de mouvement est requis" }}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="border-muted">
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
                      {errors.type_mouvement && (
                        <p className="text-sm text-destructive">{errors.type_mouvement.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock" className="text-sm font-medium">Stock (Produit & Point de Vente)</Label>
                      <Controller
                        name="stock"
                        control={control}
                        rules={{ required: "Stock est requis" }}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="border-muted">
                              <SelectValue placeholder="Sélectionner un stock" />
                            </SelectTrigger>
                            <SelectContent>
                              {stocks.map((stock) => {
                                const produit = produits.find((p) => p.id === stock.produit)
                                const pointVente = pointsVente.find((pv) => pv.id === stock.point_vente)
                                return (
                                  <SelectItem key={stock.id} value={stock.id}>
                                    {produit?.nom || 'Inconnu'} - {pointVente?.nom || 'Inconnu'}
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.stock && (
                        <p className="text-sm text-destructive">{errors.stock.message}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantite" className="text-sm font-medium">Quantité</Label>
                        <Input
                          id="quantite"
                          type="number"
                          {...register("quantite", {
                            required: "Quantité est requise",
                            validate: (value) => value !== 0 || "Quantité ne peut pas être zéro",
                          })}
                          placeholder="Entrez la quantité"
                          className="border-muted focus:ring-primary"
                        />
                        {errors.quantite && (
                          <p className="text-sm text-destructive">{errors.quantite.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prix_unitaire" className="text-sm font-medium">Prix Unitaire (FBU)</Label>
                        <Input
                          id="prix_unitaire"
                          type="number"
                          step="0.01"
                          {...register("prix_unitaire", {
                            required: "Prix unitaire est requis",
                            min: { value: 0, message: "Prix ne peut pas être négatif" },
                          })}
                          placeholder="0.00"
                          className="border-muted focus:ring-primary"
                        />
                        {errors.prix_unitaire && (
                          <p className="text-sm text-destructive">{errors.prix_unitaire.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reference_document" className="text-sm font-medium">Référence Document</Label>
                      <Input
                        id="reference_document"
                        {...register("reference_document")}
                        placeholder="Numéro de référence ou document"
                        className="border-muted focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motif" className="text-sm font-medium">Motif</Label>
                      <Textarea
                        id="motif"
                        {...register("motif", { required: "Motif est requis" })}
                        placeholder="Raison du mouvement"
                        className="border-muted focus:ring-primary"
                      />
                      {errors.motif && (
                        <p className="text-sm text-destructive">{errors.motif.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_expiration" className="text-sm font-medium">Date d'Expiration (optionnel)</Label>
                      <Input
                        id="date_expiration"
                        type="date"
                        {...register("date_expiration")}
                        className="border-muted focus:ring-primary"
                      />
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
                        {loading ? "Ajout..." : "Ajouter Mouvement"}
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
                    placeholder="Rechercher produits ou références..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-muted focus:ring-primary rounded-lg"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-48 border-muted">
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
          <Card className="bg-background/95 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-foreground">Historique des Mouvements</CardTitle>
              <p className="text-sm text-muted-foreground">Suivi des mouvements d'inventaire</p>
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
                    <TableHead className="text-foreground font-semibold">Type</TableHead>
                    <TableHead className="text-foreground font-semibold">Produit</TableHead>
                    <TableHead className="text-foreground font-semibold">Point de Vente</TableHead>
                    <TableHead className="text-foreground font-semibold">Quantité</TableHead>
                    <TableHead className="text-foreground font-semibold">Prix Unitaire (FBU)</TableHead>
                    <TableHead className="text-foreground font-semibold">Valeur Totale (FBU)</TableHead>
                    <TableHead className="text-foreground font-semibold">Référence</TableHead>
                    <TableHead className="text-foreground font-semibold">Utilisateur</TableHead>
                    <TableHead className="text-foreground font-semibold">Date</TableHead>
                    <TableHead className="text-foreground font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && movements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMovements.map((movement) => {
                      const stock = stocks.find((s) => s.id === movement.stock)
                      const produit = produits.find((p) => p.id === stock?.produit)
                      const pointVente = pointsVente.find((pv) => pv.id === stock?.point_vente)
                      const user = users.find((u) => u.id === movement.utilisateur)
                      return (
                        <TableRow key={movement.id} className="hover:bg-muted/20 transition-colors">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getMovementIcon(movement.type_mouvement)}
                              {getMovementBadge(movement.type_mouvement)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{produit?.nom || 'Inconnu'}</p>
                              <p className="text-sm text-muted-foreground">{movement.motif}</p>
                            </div>
                          </TableCell>
                          <TableCell>{pointVente?.nom || 'Inconnu'}</TableCell>
                          <TableCell>
                            <span className={movement.quantite > 0 ? "text-green-600" : "text-red-600"}>
                              {movement.quantite > 0 ? "+" : ""}
                              {movement.quantite}
                            </span>
                          </TableCell>
                          <TableCell>{movement.prix_unitaire} FBU</TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {(Math.abs(movement.quantite) * movement.prix_unitaire)} FBU
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{movement.reference_document}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{user?.nom || 'Inconnu'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <span className="text-sm">{formatDate(movement.created_at)}</span>
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
                                      setSelectedMovementId(movement.id)
                                      setIsDetailModalOpen(true)
                                    }}
                                    className="hover:bg-primary/10"
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
                                    className="hover:bg-primary/10"
                                  >
                                    <Edit className="h-3 w-3 text-primary" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Modifier Mouvement</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteMovement(movement.id)}
                                    className="hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Supprimer Mouvement</TooltipContent>
                              </Tooltip>
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

          {/* Edit Movement Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm rounded-lg shadow-xl">
              <DialogHeader>
                <DialogTitle>Modifier Mouvement de Stock</DialogTitle>
                <DialogDescription>Mettre à jour les détails du mouvement.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleCreateOrUpdateMovement)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type_mouvement" className="text-sm font-medium">Type de Mouvement</Label>
                  <Controller
                    name="type_mouvement"
                    control={control}
                    rules={{ required: "Type de mouvement est requis" }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="border-muted">
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
                  {errors.type_mouvement && (
                    <p className="text-sm text-destructive">{errors.type_mouvement.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-sm font-medium">Stock (Produit & Point de Vente)</Label>
                  <Controller
                    name="stock"
                    control={control}
                    rules={{ required: "Stock est requis" }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="border-muted">
                          <SelectValue placeholder="Sélectionner un stock" />
                        </SelectTrigger>
                        <SelectContent>
                          {stocks.map((stock) => {
                            const produit = produits.find((p) => p.id === stock.produit)
                            const pointVente = pointsVente.find((pv) => pv.id === stock.point_vente)
                            return (
                              <SelectItem key={stock.id} value={stock.id}>
                                {produit?.nom || 'Inconnu'} - {pointVente?.nom || 'Inconnu'}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.stock && (
                    <p className="text-sm text-destructive">{errors.stock.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantite" className="text-sm font-medium">Quantité</Label>
                    <Input
                      id="quantite"
                      type="number"
                      {...register("quantite", {
                        required: "Quantité est requise",
                        validate: (value) => value !== 0 || "Quantité ne peut pas être zéro",
                      })}
                      placeholder="Entrez la quantité"
                      className="border-muted focus:ring-primary"
                    />
                    {errors.quantite && (
                      <p className="text-sm text-destructive">{errors.quantite.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prix_unitaire" className="text-sm font-medium">Prix Unitaire (FBU)</Label>
                    <Input
                      id="prix_unitaire"
                      type="number"
                      step="0.01"
                      {...register("prix_unitaire", {
                        required: "Prix unitaire est requis",
                        min: { value: 0, message: "Prix ne peut pas être négatif" },
                      })}
                      placeholder="0.00"
                      className="border-muted focus:ring-primary"
                    />
                    {errors.prix_unitaire && (
                      <p className="text-sm text-destructive">{errors.prix_unitaire.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference_document" className="text-sm font-medium">Référence Document</Label>
                  <Input
                    id="reference_document"
                    {...register("reference_document")}
                    placeholder="Numéro de référence ou document"
                    className="border-muted focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motif" className="text-sm font-medium">Motif</Label>
                  <Textarea
                    id="motif"
                    {...register("motif", { required: "Motif est requis" })}
                    placeholder="Raison du mouvement"
                    className="border-muted focus:ring-primary"
                  />
                  {errors.motif && (
                    <p className="text-sm text-destructive">{errors.motif.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_expiration" className="text-sm font-medium">Date d'Expiration (optionnel)</Label>
                  <Input
                    id="date_expiration"
                    type="date"
                    {...register("date_expiration")}
                    className="border-muted focus:ring-primary"
                  />
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
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Edit className="h-4 w-4 mr-2" />
                    )}
                    {loading ? "Mise à jour..." : "Mettre à jour Mouvement"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Detail Movement Modal */}
          <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm rounded-lg shadow-xl">
              <DialogHeader>
                <DialogTitle>Détails du Mouvement</DialogTitle>
                <DialogDescription>Voir les informations détaillées du mouvement.</DialogDescription>
              </DialogHeader>
              {selectedMovementId && (
                (() => {
                  const movement = movements.find((m) => m.id === selectedMovementId)
                  const stock = stocks.find((s) => s.id === movement?.stock)
                  const produit = produits.find((p) => p.id === stock?.produit)
                  const pointVente = pointsVente.find((pv) => pv.id === stock?.point_vente)
                  const user = users.find((u) => u.id === movement?.utilisateur)
                  return (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Type de Mouvement</Label>
                        <p className="text-sm text-foreground">{movementTypes.find((t) => t.value === movement?.type_mouvement)?.label || 'Inconnu'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Produit</Label>
                        <p className="text-sm text-foreground">{produit?.nom || 'Inconnu'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Point de Vente</Label>
                        <p className="text-sm text-foreground">{pointVente?.nom || 'Inconnu'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Quantité</Label>
                          <p className="text-sm text-foreground">{movement?.quantite}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Prix Unitaire (FBU)</Label>
                          <p className="text-sm text-foreground">{movement?.prix_unitaire}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Valeur Totale (FBU)</Label>
                        <p className="text-sm text-foreground">{(Math.abs(movement?.quantite || 0) * (movement?.prix_unitaire || 0))}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Référence Document</Label>
                        <p className="text-sm text-foreground">{movement?.reference_document || 'Aucune'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Motif</Label>
                        <p className="text-sm text-foreground">{movement?.motif}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Date d'Expiration</Label>
                        <p className="text-sm text-foreground">{movement?.date_expiration ? formatDate(movement.date_expiration) : 'Aucune'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Utilisateur</Label>
                        <p className="text-sm text-foreground">{user?.nom || 'Inconnu'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Date de Création</Label>
                        <p className="text-sm text-foreground">{formatDate(movement?.created_at || '')}</p>
                      </div>
                    </div>
                  )
                })()
              )}
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </POSLayout>
  )
}
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
  Package,
  Store,
  AlertTriangle,
  Loader2,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { useStocks } from "@/hooks/useStock"
import { StockResponse, Produit, PointVente, StockAdjustmentRequest } from "@/types/stock"

interface StockAdjustmentFormData {
  type: 'adjustment' | 'damage' | 'found' | 'expired';
  quantity: number;
  reason: string;
  reference: string;
}

interface StockFormData {
  quantite_actuelle: number;
  quantite_reservee: number;
  produit: string;
  point_vente: string;
  minimum: number;
  maximum: number;
}

export default function StockPage() {
  const {
    stocks,
    produits,
    pointsVente,
    loading,
    error,
    fetchStocks,
    fetchProduits,
    fetchPointsVente,
    createStock,
    updateStock,
    deleteStock,
    adjustStock,
  } = useStocks()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStore, setSelectedStore] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null)
  const [editingStockId, setEditingStockId] = useState<string | null>(null)

  const adjustForm = useForm<StockAdjustmentFormData>({
    defaultValues: {
      type: "adjustment",
      quantity: 0,
      reason: "",
      reference: "",
    },
  })

  const stockForm = useForm<StockFormData>({
    defaultValues: {
      quantite_actuelle: 0,
      quantite_reservee: 0,
      produit: "",
      point_vente: "",
      minimum: 10,
      maximum: 100,
    },
  })

  useEffect(() => {
    fetchStocks()
    fetchProduits()
    fetchPointsVente()
  }, [fetchStocks, fetchProduits, fetchPointsVente])

  const filteredStocks = stocks.filter((stock) => {
    const produit = produits.find((p) => p.id === stock.produit)
    const pointVente = pointsVente.find((pv) => pv.id === stock.point_vente)
    const matchesSearch = produit?.nom.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const matchesStore =
      selectedStore === "all" || (pointVente && pointVente.nom === selectedStore)
    const matchesCategory =
      selectedCategory === "all" || (produit && produit.categorie === selectedCategory)
    return matchesSearch && matchesStore && matchesCategory
  })

  const getStatusBadge = (available: number, minimum: number = 10) => {
    if (available < minimum * 0.5) {
      return <Badge variant="destructive" className="bg-red-500 text-white">Critique</Badge>
    }
    if (available < minimum) {
      return <Badge className="bg-yellow-500 text-white">Faible</Badge>
    }
    return <Badge className="bg-green-500 text-white">Normal</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleAdjustment = async (data: StockAdjustmentFormData) => {
    if (!selectedStockId) return
    try {
      await adjustStock(selectedStockId, data)
      adjustForm.reset()
      setIsAdjustModalOpen(false)
      setSelectedStockId(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateOrUpdateStock = async (data: StockFormData) => {
    try {
      if (editingStockId) {
        await updateStock(editingStockId, data)
        setEditingStockId(null)
        setIsEditModalOpen(false)
      } else {
        await createStock(data)
        setIsAddModalOpen(false)
      }
      stockForm.reset()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditStock = (stock: StockResponse) => {
    setEditingStockId(stock.id)
    stockForm.reset({
      quantite_actuelle: stock.quantite_actuelle,
      quantite_reservee: stock.quantite_reservee,
      produit: stock.produit,
      point_vente: stock.point_vente,
      minimum: stock.minimum || 10,
      maximum: stock.maximum || 100,
    })
    setIsEditModalOpen(true)
  }

  const handleDeleteStock = async (id: string) => {
    try {
      await deleteStock(id)
    } catch (err) {
      console.error(err)
    }
  }

  const totalProducts = stocks.length
  const lowStockItems = stocks.filter((stock) => stock.quantite_actuelle < (stock.minimum || 10)).length
  const reservedItems = stocks.reduce((sum, stock) => sum + stock.quantite_reservee, 0)

  if (loading && stocks.length === 0) {
    return (
      <POSLayout currentPath="/stock">
        <div className="flex items-center justify-center h-96 bg-background/95 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg text-foreground">Chargement des stocks...</span>
        </div>
      </POSLayout>
    )
  }

  if (error && stocks.length === 0) {
    return (
      <POSLayout currentPath="/stock">
        <div className="flex items-center justify-center h-96 bg-background/95 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <p className="text-destructive flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Erreur: {error}
            </p>
            <Button
              onClick={() => {
                fetchStocks()
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
                Gestion des Stocks
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                Suivre et gérer l'inventaire à travers tous les points de vente
              </p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="border-primary/20 hover:bg-primary/10 transition-all duration-200"
                onClick={() => {
                  fetchStocks()
                  fetchProduits()
                  fetchPointsVente()
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
                    Nouveau Stock
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm rounded-lg shadow-xl">
                  <DialogHeader>
                    <DialogTitle>Ajouter un Nouveau Stock</DialogTitle>
                    <DialogDescription>Créer un nouvel enregistrement de stock.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={stockForm.handleSubmit(handleCreateOrUpdateStock)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="produit" className="text-sm font-medium">Produit</Label>
                      <Controller
                        name="produit"
                        control={stockForm.control}
                        rules={{ required: "Produit est requis" }}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="border-muted">
                              <SelectValue placeholder="Sélectionner un produit" />
                            </SelectTrigger>
                            <SelectContent>
                              {produits.map((produit) => (
                                <SelectItem key={produit.id} value={produit.id}>
                                  {produit.nom} ({produit.categorie})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {stockForm.formState.errors.produit && (
                        <p className="text-sm text-destructive">{stockForm.formState.errors.produit.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="point_vente" className="text-sm font-medium">Point de vente</Label>
                      <Controller
                        name="point_vente"
                        control={stockForm.control}
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
                      {stockForm.formState.errors.point_vente && (
                        <p className="text-sm text-destructive">{stockForm.formState.errors.point_vente.message}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantite_actuelle" className="text-sm font-medium">Quantité Actuelle</Label>
                        <Input
                          id="quantite_actuelle"
                          type="number"
                          {...stockForm.register("quantite_actuelle", {
                            required: "Quantité actuelle est requise",
                            min: { value: 0, message: "Quantité ne peut pas être négative" },
                          })}
                          placeholder="0"
                          className="border-muted focus:ring-primary"
                        />
                        {stockForm.formState.errors.quantite_actuelle && (
                          <p className="text-sm text-destructive">{stockForm.formState.errors.quantite_actuelle.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantite_reservee" className="text-sm font-medium">Quantité Réservée</Label>
                        <Input
                          id="quantite_reservee"
                          type="number"
                          {...stockForm.register("quantite_reservee", {
                            required: "Quantité réservée est requise",
                            min: { value: 0, message: "Quantité ne peut pas être négative" },
                          })}
                          placeholder="0"
                          className="border-muted focus:ring-primary"
                        />
                        {stockForm.formState.errors.quantite_reservee && (
                          <p className="text-sm text-destructive">{stockForm.formState.errors.quantite_reservee.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minimum" className="text-sm font-medium">Quantité Minimum</Label>
                        <Input
                          id="minimum"
                          type="number"
                          {...stockForm.register("minimum", {
                            required: "Quantité minimum est requise",
                            min: { value: 1, message: "Minimum doit être au moins 1" },
                          })}
                          placeholder="10"
                          className="border-muted focus:ring-primary"
                        />
                        {stockForm.formState.errors.minimum && (
                          <p className="text-sm text-destructive">{stockForm.formState.errors.minimum.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maximum" className="text-sm font-medium">Quantité Maximum</Label>
                        <Input
                          id="maximum"
                          type="number"
                          {...stockForm.register("maximum", {
                            required: "Quantité maximum est requise",
                            min: { value: 1, message: "Maximum doit être au moins 1" },
                          })}
                          placeholder="100"
                          className="border-muted focus:ring-primary"
                        />
                        {stockForm.formState.errors.maximum && (
                          <p className="text-sm text-destructive">{stockForm.formState.errors.maximum.message}</p>
                        )}
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
                        {loading ? "Création..." : "Ajouter Stock"}
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
                    placeholder="Rechercher des produits..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-muted focus:ring-primary rounded-lg"
                  />
                </div>
                <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger className="w-48 border-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les Points de Vente</SelectItem>
                    {pointsVente.map((pv) => (
                      <SelectItem key={pv.id} value={pv.nom}>
                        {pv.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48 border-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les Catégories</SelectItem>
                    {[...new Set(produits.map((p) => p.categorie))].map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
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
                <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Produits Totaux</CardTitle>
                <Package className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-800 dark:text-blue-200 animate-pulse">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalProducts}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">À travers tous les points de vente</p>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/10 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-red-700 dark:text-red-300">Articles en Faible Stock</CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-800 dark:text-red-200 animate-pulse">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : lowStockItems}
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">Nécessitent une attention</p>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-900/10 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">Articles Réservés</CardTitle>
                <Package className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-800 dark:text-yellow-200 animate-pulse">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : reservedItems}
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Commandes en attente</p>
              </CardContent>
            </Card>
          </div>

          {/* Stock Table */}
          <Card className="bg-background/95 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-foreground">Niveaux de Stock Actuels</CardTitle>
              <p className="text-sm text-muted-foreground">Gérer l'inventaire des produits</p>
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
                    <TableHead className="text-foreground font-semibold">Produit</TableHead>
                    <TableHead className="text-foreground font-semibold">Catégorie</TableHead>
                    <TableHead className="text-foreground font-semibold">Point de Vente</TableHead>
                    <TableHead className="text-foreground font-semibold">Disponible</TableHead>
                    <TableHead className="text-foreground font-semibold">Réservé</TableHead>
                    <TableHead className="text-foreground font-semibold">Min/Max</TableHead>
                    <TableHead className="text-foreground font-semibold">Dernier Mouvement</TableHead>
                    <TableHead className="text-foreground font-semibold">Statut</TableHead>
                    <TableHead className="text-foreground font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && stocks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStocks.map((stock) => {
                      const produit = produits.find((p) => p.id === stock.produit)
                      const pointVente = pointsVente.find((pv) => pv.id === stock.point_vente)
                      return (
                        <TableRow key={stock.id} className="hover:bg-muted/20 transition-colors">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{produit?.nom || 'Inconnu'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{produit?.categorie || 'Inconnu'}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Store className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{pointVente?.nom || 'Inconnu'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{stock.quantite_actuelle}</span>
                              {stock.quantite_actuelle < (stock.minimum || 10) && (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{stock.quantite_reservee}</TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {stock.minimum || 10} / {stock.maximum || 100}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1 text-xs">
                                <TrendingUp className="h-3 w-3 text-green-600" />
                                <span>Entrée: {formatDate(stock.date_derniere_entree)}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-xs">
                                <TrendingDown className="h-3 w-3 text-red-600" />
                                <span>Sortie: {formatDate(stock.date_derniere_sortie)}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(stock.quantite_actuelle, stock.minimum || 10)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedStockId(stock.id)
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
                                    onClick={() => handleEditStock(stock)}
                                    className="hover:bg-primary/10"
                                  >
                                    <Edit className="h-3 w-3 text-primary" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Modifier Stock</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedStockId(stock.id)
                                      setIsAdjustModalOpen(true)
                                    }}
                                    className="hover:bg-primary/10"
                                  >
                                    <Package className="h-3 w-3 text-primary" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Ajuster Stock</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteStock(stock.id)}
                                    className="hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Supprimer Stock</TooltipContent>
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

          {/* Edit Stock Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm rounded-lg shadow-xl">
              <DialogHeader>
                <DialogTitle>Modifier Stock</DialogTitle>
                <DialogDescription>Mettre à jour les détails du stock.</DialogDescription>
              </DialogHeader>
              <form onSubmit={stockForm.handleSubmit(handleCreateOrUpdateStock)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="produit" className="text-sm font-medium">Produit</Label>
                  <Controller
                    name="produit"
                    control={stockForm.control}
                    rules={{ required: "Produit est requis" }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="border-muted">
                          <SelectValue placeholder="Sélectionner un produit" />
                        </SelectTrigger>
                        <SelectContent>
                          {produits.map((produit) => (
                            <SelectItem key={produit.id} value={produit.id}>
                              {produit.nom} ({produit.categorie})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {stockForm.formState.errors.produit && (
                    <p className="text-sm text-destructive">{stockForm.formState.errors.produit.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="point_vente" className="text-sm font-medium">Point de vente</Label>
                  <Controller
                    name="point_vente"
                    control={stockForm.control}
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
                  {stockForm.formState.errors.point_vente && (
                    <p className="text-sm text-destructive">{stockForm.formState.errors.point_vente.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantite_actuelle" className="text-sm font-medium">Quantité Actuelle</Label>
                    <Input
                      id="quantite_actuelle"
                      type="number"
                      {...stockForm.register("quantite_actuelle", {
                        required: "Quantité actuelle est requise",
                        min: { value: 0, message: "Quantité ne peut pas être négative" },
                      })}
                      placeholder="0"
                      className="border-muted focus:ring-primary"
                    />
                    {stockForm.formState.errors.quantite_actuelle && (
                      <p className="text-sm text-destructive">{stockForm.formState.errors.quantite_actuelle.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantite_reservee" className="text-sm font-medium">Quantité Réservée</Label>
                    <Input
                      id="quantite_reservee"
                      type="number"
                      {...stockForm.register("quantite_reservee", {
                        required: "Quantité réservée est requise",
                        min: { value: 0, message: "Quantité ne peut pas être négative" },
                      })}
                      placeholder="0"
                      className="border-muted focus:ring-primary"
                    />
                    {stockForm.formState.errors.quantite_reservee && (
                      <p className="text-sm text-destructive">{stockForm.formState.errors.quantite_reservee.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minimum" className="text-sm font-medium">Quantité Minimum</Label>
                    <Input
                      id="minimum"
                      type="number"
                      {...stockForm.register("minimum", {
                        required: "Quantité minimum est requise",
                        min: { value: 1, message: "Minimum doit être au moins 1" },
                      })}
                      placeholder="10"
                      className="border-muted focus:ring-primary"
                    />
                    {stockForm.formState.errors.minimum && (
                      <p className="text-sm text-destructive">{stockForm.formState.errors.minimum.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maximum" className="text-sm font-medium">Quantité Maximum</Label>
                    <Input
                      id="maximum"
                      type="number"
                      {...stockForm.register("maximum", {
                        required: "Quantité maximum est requise",
                        min: { value: 1, message: "Maximum doit être au moins 1" },
                      })}
                      placeholder="100"
                      className="border-muted focus:ring-primary"
                    />
                    {stockForm.formState.errors.maximum && (
                      <p className="text-sm text-destructive">{stockForm.formState.errors.maximum.message}</p>
                    )}
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
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Edit className="h-4 w-4 mr-2" />
                    )}
                    {loading ? "Mise à jour..." : "Mettre à jour Stock"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Adjust Stock Modal */}
          <Dialog open={isAdjustModalOpen} onOpenChange={setIsAdjustModalOpen}>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm rounded-lg shadow-xl">
              <DialogHeader>
                <DialogTitle>Ajustement de Stock</DialogTitle>
                <DialogDescription>Ajuster la quantité de stock pour le produit sélectionné.</DialogDescription>
              </DialogHeader>
              <form onSubmit={adjustForm.handleSubmit(handleAdjustment)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium">Type d'Ajustement</Label>
                  <Controller
                    name="type"
                    control={adjustForm.control}
                    rules={{ required: "Type d'ajustement est requis" }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="border-muted">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adjustment">Ajustement Manuel</SelectItem>
                          <SelectItem value="damage">Dommage/Perte</SelectItem>
                          <SelectItem value="found">Stock Trouvé</SelectItem>
                          <SelectItem value="expired">Articles Expirés</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {adjustForm.formState.errors.type && (
                    <p className="text-sm text-destructive">{adjustForm.formState.errors.type.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-medium">Changement de Quantité</Label>
                  <Input
                    id="quantity"
                    type="number"
                    {...adjustForm.register("quantity", {
                      required: "Quantité est requise",
                      validate: (value) => value !== 0 || "Quantité ne peut pas être zéro",
                    })}
                    placeholder="Entrez un nombre positif ou négatif"
                    className="border-muted focus:ring-primary"
                  />
                  {adjustForm.formState.errors.quantity && (
                    <p className="text-sm text-destructive">{adjustForm.formState.errors.quantity.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-sm font-medium">Raison</Label>
                  <Textarea
                    id="reason"
                    {...adjustForm.register("reason", { required: "Raison est requise" })}
                    placeholder="Expliquez la raison de l'ajustement"
                    className="border-muted focus:ring-primary"
                  />
                  {adjustForm.formState.errors.reason && (
                    <p className="text-sm text-destructive">{adjustForm.formState.errors.reason.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference" className="text-sm font-medium">Référence</Label>
                  <Input
                    id="reference"
                    {...adjustForm.register("reference")}
                    placeholder="Numéro de référence ou document"
                    className="border-muted focus:ring-primary"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsAdjustModalOpen(false)}
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
                      <Package className="h-4 w-4 mr-2" />
                    )}
                    {loading ? "Ajustement..." : "Appliquer l'Ajustement"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Detail Stock Modal */}
          <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm rounded-lg shadow-xl">
              <DialogHeader>
                <DialogTitle>Détails du Stock</DialogTitle>
                <DialogDescription>Voir les informations détaillées du stock.</DialogDescription>
              </DialogHeader>
              {selectedStockId && (
                (() => {
                  const stock = stocks.find((s) => s.id === selectedStockId)
                  const produit = produits.find((p) => p.id === stock?.produit)
                  const pointVente = pointsVente.find((pv) => pv.id === stock?.point_vente)
                  return (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Produit</Label>
                        <p className="text-sm text-foreground">{produit?.nom || 'Inconnu'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Catégorie</Label>
                        <p className="text-sm text-foreground">{produit?.categorie || 'Inconnu'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Point de Vente</Label>
                        <p className="text-sm text-foreground">{pointVente?.nom || 'Inconnu'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Quantité Actuelle</Label>
                          <p className="text-sm text-foreground">{stock?.quantite_actuelle}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Quantité Réservée</Label>
                          <p className="text-sm text-foreground">{stock?.quantite_reservee}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Quantité Minimum</Label>
                          <p className="text-sm text-foreground">{stock?.minimum || 10}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Quantité Maximum</Label>
                          <p className="text-sm text-foreground">{stock?.maximum || 100}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Dernière Entrée</Label>
                          <p className="text-sm text-foreground">{formatDate(stock?.date_derniere_entree || '')}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Dernière Sortie</Label>
                          <p className="text-sm text-foreground">{formatDate(stock?.date_derniere_sortie || '')}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Statut</Label>
                        <p className="text-sm text-foreground">{getStatusBadge(stock?.quantite_actuelle || 0, stock?.minimum || 10)}</p>
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
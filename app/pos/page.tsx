
"use client"

import React, { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { POSLayout } from "@/components/pos-layout"
import { BillPrinter } from "@/components/bill-printer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  DollarSign,
  Receipt,
  User,
  RotateCcw,
  Package,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  Store,
  UserPlus,
  RefreshCw,
  Tag,
  Percent,
  Calculator,
  FileText,
  Settings,
  Zap,
  ChevronDown,
  ChevronRight,
  X
} from "lucide-react"

// Import hooks and types
import { useActiveClients } from "@/hooks/useClients"
import { useCreateVente } from "@/hooks/useVentes"
import { useAllVentes, useUpdateVenteStatus, useRemoveItemFromSale } from "@/hooks/useAllVentes"
import { useStocksByPointVente } from "@/hooks/usePOSStocks"
import { useCategories } from "@/hooks/useCategories"
import { Client } from "@/types/client.types"
import { Vente, CreateVentePayload } from "@/types/vente.types"
import { Stock } from "@/types/stock.types"
import { toast } from "sonner"
import { posStockQueryKeys } from "@/hooks/usePOSStocks"



// Constants
const POINT_VENTE_ID = "07cf7485-4075-4809-a6a6-a7ddbcc6f426"
const VENDEUR_ID = "default-vendeur"
const DEVICE_ID = "pos-terminal-001"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  discount: number
  tax: number
  unite: "piece" | "kg" | "litre" | "metre"
}

export default function POSPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("sale")
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [globalDiscount, setGlobalDiscount] = useState(0)
  const [billPrinterOpen, setBillPrinterOpen] = useState(false)
  const [currentVente, setCurrentVente] = useState<Vente | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Returns tab state
  const [searchInvoice, setSearchInvoice] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const itemsPerPage = 10

  // Hooks
  const { data: clients = [], isLoading: clientsLoading } = useActiveClients()
  const { data: stocks = [], isLoading: stocksLoading } = useStocksByPointVente(POINT_VENTE_ID)
  const { categories = [], loading: categoriesLoading } = useCategories()
  const { data: allVentes = [], isLoading: allVentesLoading } = useAllVentes()
  const createVenteMutation = useCreateVente()
  const updateVenteStatusMutation = useUpdateVenteStatus()
  const removeItemMutation = useRemoveItemFromSale()
console.log("Stocks in POSPage:", stocks);


  // Get selected client data
  const selectedClient = clients.find(client => client.id === selectedCustomer)
  
  // Helper functions for returns tab
  const toggleRowExpansion = (rowId: string) => {
    const newExpandedRows = new Set(expandedRows)
    if (expandedRows.has(rowId)) {
      newExpandedRows.delete(rowId)
    } else {
      newExpandedRows.add(rowId)
    }
    setExpandedRows(newExpandedRows)
  }
  
  const handleRemoveItem = (vente: Vente, itemId: string) => {
    if (!vente.id || !itemId) return
    removeItemMutation.mutate({
      saleId: vente.id,
      itemId: itemId,
      originalVente: vente
    })
  }
  
  // Filter and paginate sales
  const filteredVentes = allVentes.filter(vente => {
    if (!searchInvoice) return true
    return (vente.numero_facture || '').toLowerCase().includes(searchInvoice.toLowerCase()) ||
           (vente.id || '').toLowerCase().includes(searchInvoice.toLowerCase())
  })
  
  const totalPages = Math.ceil(filteredVentes.length / itemsPerPage)
  const paginatedVentes = filteredVentes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.produit_nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
      stock.produit.includes(searchTerm)
    const hasStock = Number(stock.quantite_disponible) > 0
    console.log("Stock:", stock.produit_nom, "Matches Search:", matchesSearch, "Has Stock:", hasStock);
    return matchesSearch && hasStock
  })

  console.log("Filtered stocks in POSPage:", filteredStocks);

  const addToCart = (stock: Stock) => {
    const existingItem = cart.find((item) => item.id === stock.produit)
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1
      const availableQuantity = Number(stock.quantite_disponible)
      
      if (newQuantity <= availableQuantity) {
        setCart(cart.map((item) => 
          (item.id === stock.produit ? { ...item, quantity: newQuantity } : item)
        ))
      } else {
        toast.error(`Stock insuffisant. Quantité disponible: ${availableQuantity}`)
      }
    } else {
      const availableQuantity = Number(stock.quantite_disponible)
      
      if (availableQuantity > 0) {
        setCart([
          ...cart,
          {
            id: stock.produit,
            name: stock.produit_nom,
            price: 10.00,
            quantity: 1,
            discount: 0,
            tax: 0.20,
            unite: "piece",
          },
        ])
      } else {
        toast.error("Produit en rupture de stock")
      }
    }
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.id !== id))
    } else {
      const stock = stocks.find(s => s.produit === id)
      const availableQuantity = stock ? Number(stock.quantite_disponible) : 0
      
      if (quantity <= availableQuantity) {
        setCart(cart.map((item) => (item.id === id ? { ...item, quantity } : item)))
      } else {
        toast.error(`Stock insuffisant. Quantité disponible: ${availableQuantity}`)
      }
    }
  }

  const updateDiscount = (id: string, discount: number) => {
    setCart(cart.map((item) => (item.id === id ? { ...item, discount } : item)))
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => {
      const lineTotal = item.price * item.quantity
      const discountAmount = lineTotal * (item.discount / 100)
      return sum + (lineTotal - discountAmount)
    }, 0)
  }

  const calculateTax = () => {
    return cart.reduce((sum, item) => {
      const lineTotal = item.price * item.quantity
      const discountAmount = lineTotal * (item.discount / 100)
      const taxableAmount = lineTotal - discountAmount
      return sum + taxableAmount * item.tax
    }, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTax()
    const globalDiscountAmount = subtotal * (globalDiscount / 100)
    return subtotal + tax - globalDiscountAmount
  }

  const createVentePayload = (status: 'draft' | 'completed' | 'cancelled' | 'returned', paymentStatus: 'pending' | 'paid'): CreateVentePayload => {
    const user= localStorage.getItem("user");
const poinrDeVenteId = user ? JSON.parse(user).point_vente.id : null;

    const payload: CreateVentePayload = {
      point_vente: poinrDeVenteId,
      status,
      payment_status: paymentStatus,
      remise_globale: globalDiscount.toString(),
      date_echeance: new Date().toISOString(),
      is_synced: false,
      device_id: DEVICE_ID,
      offline_created: false,
      commentaire: "",
      lignes: cart.map(item => ({
        produit: item.id,
        unite: item.unite,
        quantite: item.quantity,
        prix_unitaire_ht: (item.price / (1 + item.tax)).toFixed(2),
        taux_tva: (item.tax * 100).toFixed(2),
        remise_pourcentage: item.discount.toString()
      }))
    }

    if (selectedCustomer) {
      payload.client = selectedCustomer
    }

    return payload
  }

  const handleCreateSale = async () => {
    if (cart.length === 0) {
      toast.error("Le panier est vide")
      return
    }

    setIsProcessing(true)
    
    try {
      const ventePayload = createVentePayload('completed', 'paid')
      const createdVente = await createVenteMutation.mutateAsync(ventePayload)
      
      setCurrentVente(createdVente)
      
      setCart([])
      setGlobalDiscount(0)
      setSelectedCustomer(null)
      
      // Invalidate stock query to trigger refetch
      await queryClient.invalidateQueries({
        queryKey: posStockQueryKeys.byPointVente(POINT_VENTE_ID),
      })
      
      toast.success(`Vente créée avec succès! Total: ${calculateTotal().toFixed(2)} FBU`)
      setBillPrinterOpen(true)
      
    } catch (error) {
      console.error('Error creating sale:', error)
      toast.error("Erreur lors de la création de la vente")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <POSLayout currentPath="/pos">
      <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Enhanced Header */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500 dark:bg-blue-600 rounded-lg">
                <Store className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Point de Vente</h1>
                <p className="text-slate-600 dark:text-slate-400 flex items-center mt-1">
                  <Zap className="h-4 w-4 mr-1" />
                  Traiter les ventes, gérer les commandes et retours
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 px-3 py-1">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Caisse #1 - Ouverte
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <Store className="h-4 w-4 mr-1" />
                Magasin Principal - Centre-ville
              </Badge>
              <Button variant="outline" size="sm" className="bg-transparent">
                <Settings className="h-4 w-4 mr-1" />
                Paramètres
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-slate-800 shadow-sm">
            <TabsTrigger value="sale" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Vente</span>
            </TabsTrigger>
            <TabsTrigger value="returns" className="flex items-center space-x-2">
              <RotateCcw className="h-4 w-4" />
              <span>Retours</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sale" className="flex-1 mt-6">
            <div className="grid grid-cols-12 gap-6 h-full">
              {/* Enhanced Left Panel - Product Search */}
              <div className="col-span-3 space-y-6">
                <Card className="shadow-sm border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center text-slate-800 dark:text-slate-200">
                      <Search className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
                      Recherche de Produits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <Input
                        placeholder="Rechercher des produits ou scanner un code-barres..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-600 transition-colors"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center text-slate-800 dark:text-slate-200">
                      <Package className="h-5 w-5 mr-2 text-purple-500 dark:text-purple-400" />
                      Produits Disponibles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {stocksLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">Chargement des produits...</span>
                        </div>
                      ) : filteredStocks.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                          <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">Aucun produit trouvé</p>
                        </div>
                      ) : (
                        filteredStocks.map((stock) => {
                          const cartItem = cart.find(item => item.id === stock.produit)
                          const cartQuantity = cartItem ? cartItem.quantity : 0
                          const availableQuantity = Number(stock.quantite_actuelle) - cartQuantity
                          console.log("Available quantity for stock", stock.produit, "is", availableQuantity)
                          
                          return (
                            <div
                              key={stock.id}
                              className={`flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-all cursor-pointer ${
                                availableQuantity <= 0 
                                  ? 'opacity-50 bg-slate-50 dark:bg-slate-700' 
                                  : 'hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-700 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                              }`}
                              onClick={() => availableQuantity > 0 && addToCart(stock)}
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{stock.produit_nom}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {stock.produit}
                                </p>
                                {cartQuantity > 0 && (
                                  <div className="flex items-center mt-1">
                                    <ShoppingCart className="h-3 w-3 text-blue-500 mr-1" />
                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                      {cartQuantity} dans le panier
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <Badge 
                                  variant={availableQuantity > 5 ? "outline" : availableQuantity > 0 ? "secondary" : "destructive"} 
                                  className="text-xs mb-1"
                                >
                                  {availableQuantity}
                                </Badge>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Total: {stock.quantite_disponible}
                                </p>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Center Panel - Cart */}
              <div className="col-span-6">
                <Card className="h-full shadow-sm border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between text-slate-800 dark:text-slate-200">
                      <div className="flex items-center">
                        <ShoppingCart className="h-5 w-5 mr-2 text-orange-500 dark:text-orange-400" />
                        Panier d'Achat
                      </div>
                      {cart.length > 0 && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-800/50 dark:text-orange-200">
                          {cart.length} articles
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-96 text-slate-500 dark:text-slate-400">
                        <div className="p-6 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
                          <ShoppingCart className="h-16 w-16 text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="text-lg font-medium mb-2 text-slate-600 dark:text-slate-300">Le panier est vide</p>
                        <p className="text-sm text-center max-w-sm text-slate-500 dark:text-slate-400">
                          Ajoutez des produits depuis le panneau de gauche pour commencer une vente. Vous pouvez rechercher ou scanner des codes-barres pour trouver rapidement des articles.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-1">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-none">
                                <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Produit</TableHead>
                                <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Qté</TableHead>
                                <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Prix</TableHead>
                                <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Total</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {cart.map((item, index) => {
                                const lineTotal = item.price * item.quantity
                                const discountAmount = lineTotal * (item.discount / 100)
                                const finalTotal = lineTotal - discountAmount

                                return (
                                  <TableRow key={item.id} className="border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700">
                                    <TableCell>
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                          {index + 1}
                                        </div>
                                        <div>
                                          <p className="font-medium text-slate-800 dark:text-slate-200">{item.name}</p>
                                          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                                            <DollarSign className="h-3 w-3 mr-1" />
                                            {item.price.toFixed(2)} FBU each
                                          </p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-600 rounded-lg p-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                          className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
                                        >
                                          <Minus className="h-3 w-3 text-red-600 dark:text-red-400" />
                                        </Button>
                                        <span className="w-8 text-center font-semibold text-slate-800 dark:text-slate-200">{item.quantity}</span>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                          className="h-7 w-7 p-0 hover:bg-green-100 dark:hover:bg-green-900/30"
                                        >
                                          <Plus className="h-3 w-3 text-green-600 dark:text-green-400" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-800 dark:text-slate-200">{item.price.toFixed(2)} FBU</TableCell>
                                    <TableCell className="font-bold text-slate-800 dark:text-slate-200">
                                      {finalTotal.toFixed(2)} FBU
                                    </TableCell>
                                    <TableCell>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => removeFromCart(item.id)}
                                        className="hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Right Panel - Customer & Payment */}
              <div className="col-span-3 space-y-4">
                <Card className="shadow-sm border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center text-slate-800 dark:text-slate-200">
                      <Calculator className="h-5 w-5 mr-2 text-green-500 dark:text-green-400" />
                      Résumé de Commande
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <span className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                          <FileText className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                          Sous-total:
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{calculateSubtotal().toFixed(2)} FBU</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <span className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                          <Receipt className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                          Taxe (TVA):
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{calculateTax().toFixed(2)} FBU</span>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
                      <span className="flex items-center text-lg font-bold text-emerald-800 dark:text-emerald-200">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Total:
                      </span>
                      <span className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                        {calculateTotal().toFixed(2)} FBU
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <Button 
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold shadow-lg" 
                    size="lg" 
                    disabled={cart.length === 0 || isProcessing}
                    onClick={handleCreateSale}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Création de la vente...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Créer la Vente
                      </>
                    )}
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full h-10 bg-gradient-to-r from-red-50 to-pink-100 hover:from-red-100 hover:to-pink-200 border-red-200 text-red-800 dark:from-red-900/50 dark:to-pink-900/50 dark:hover:from-red-800/50 dark:hover:to-pink-800/50 dark:border-red-700 dark:text-red-300" 
                    onClick={() => setCart([])}
                    disabled={isProcessing}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Vider le Panier
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="returns" className="flex-1 mt-6">
            <Card className="shadow-sm border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-slate-800 dark:text-slate-200">
                  <RotateCcw className="h-6 w-6 mr-2 text-orange-500 dark:text-orange-400" />
                  Gestion des Ventes et Retours
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-400 flex items-center mt-1">
                  <Receipt className="h-4 w-4 mr-1" />
                  Voir toutes les ventes et traiter les retours
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and pagination controls */}
                <div className="flex items-center justify-between">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <Input
                        placeholder="Rechercher par numéro de facture..."
                        value={searchInvoice}
                        onChange={(e) => {
                          setSearchInvoice(e.target.value)
                          setCurrentPage(1) // Reset to first page when searching
                        }}
                        className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-600 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {filteredVentes.length} ventes au total
                    </span>
                  </div>
                </div>

                {allVentesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                    <span className="text-slate-600 dark:text-slate-400">Chargement des ventes...</span>
                  </div>
                ) : filteredVentes.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">
                      {searchInvoice ? 'Aucune vente trouvée correspondant à votre recherche' : 'Aucune vente trouvée'}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {searchInvoice ? 'Essayez un autre terme de recherche' : 'Les ventes apparaîtront ici une fois créées'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-1">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-none">
                            <TableHead className="font-semibold w-8 text-slate-700 dark:text-slate-300"></TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">N° Facture</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Date</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Statut</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Paiement</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Total HT</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Total TTC</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Articles</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedVentes.map((vente) => {
                          const getStatusBadgeColor = (status: string) => {
                            switch (status) {
                              case 'completed': return 'bg-green-100 text-green-800'
                              case 'draft': return 'bg-yellow-100 text-yellow-800'
                              case 'cancelled': return 'bg-red-100 text-red-800'
                              case 'returned': return 'bg-orange-100 text-orange-800'
                              default: return 'bg-gray-100 text-gray-800'
                            }
                          }
                          
                          const getPaymentBadgeColor = (status: string) => {
                            switch (status) {
                              case 'paid': return 'bg-green-100 text-green-800'
                              case 'pending': return 'bg-yellow-100 text-yellow-800'
                              default: return 'bg-gray-100 text-gray-800'
                            }
                          }
                          
                          return (
                            <React.Fragment key={vente.id}>
                              <TableRow className="border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 cursor-pointer" onClick={() => vente.id && toggleRowExpansion(vente.id)}>
                                <TableCell>
                                  {vente.id && expandedRows.has(vente.id) ? (
                                    <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                  )}
                                </TableCell>
                                <TableCell className="font-medium text-blue-600 dark:text-blue-400">
                                  {vente.numero_facture || (vente.id ? vente.id.slice(0, 8) : 'N/A')}
                                </TableCell>
                              <TableCell className="text-slate-600 dark:text-slate-300">
                                {new Date(vente.date_vente).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={getStatusBadgeColor(vente.status)}>
                                  {vente.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={getPaymentBadgeColor(vente.payment_status)}>
                                  {vente.payment_status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                                {parseFloat(vente.montant_ht || '0').toFixed(2)} FBU
                              </TableCell>
                              <TableCell className="font-bold text-slate-800 dark:text-slate-200">
                                {parseFloat(vente.montant_ttc || '0').toFixed(2)} FBU
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {vente.lignes?.length || 0} articles
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  {(vente.status === 'completed' || vente.status === 'confirmed') && (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        vente.id && updateVenteStatusMutation.mutate({ id: vente.id, status: 'returned', originalVente: vente })
                                      }}
                                      disabled={updateVenteStatusMutation.isPending}
                                    >
                                      <RotateCcw className="h-4 w-4 mr-1" />
                                      Retour
                                    </Button>
                                  )}
                                  {vente.status === 'draft' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        vente.id && updateVenteStatusMutation.mutate({ id: vente.id, status: 'completed', originalVente: vente })
                                      }}
                                      disabled={updateVenteStatusMutation.isPending}
                                    >
                                      <CheckCircle2 className="h-4 w-4 mr-1" />
                                      Terminer
                                    </Button>
                                  )}
                                  {(vente.status === 'draft' || vente.status === 'completed' || vente.status === 'confirmed') && (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        vente.id && updateVenteStatusMutation.mutate({ id: vente.id, status: 'cancelled', originalVente: vente })
                                      }}
                                      disabled={updateVenteStatusMutation.isPending}
                                    >
                                      <AlertCircle className="h-4 w-4 mr-1" />
                                      Annuler
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                              </TableRow>
                              
                              {/* Expandable row content */}
                              {vente.id && expandedRows.has(vente.id) && (
                                <TableRow>
                                  <TableCell colSpan={9} className="p-0">
                                    <div className="bg-slate-100 dark:bg-slate-700 p-4">
                                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
                                        <Package className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
                                        Articles de la Vente ({vente.lignes?.length || 0})
                                      </h4>
                                      {vente.lignes && vente.lignes.length > 0 ? (
                                        <div className="grid gap-2">
                                          {vente.lignes.map((ligne) => (
                                            <div key={ligne.id} className="flex items-center justify-between bg-white dark:bg-slate-600 p-3 rounded border border-slate-200 dark:border-slate-500">
                                              <div className="flex-1">
                                                <p className="font-medium text-slate-800 dark:text-slate-200">{ligne.produit_nom}</p>
                                                <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-300 mt-1">
                                                  <span>Qté: {ligne.quantite}</span>
                                                  <span>Unitaire: {parseFloat(ligne.prix_unitaire_ht || '0').toFixed(2)} FBU</span>
                                                  <span>TVA: {ligne.taux_tva}%</span>
                                                  {ligne.remise_pourcentage !== '0' && <span>Remise: {ligne.remise_pourcentage}%</span>}
                                                  <span className="font-medium text-slate-800 dark:text-slate-200">Total: {parseFloat(ligne.montant_ttc || '0').toFixed(2)} FBU</span>
                                                </div>
                                              </div>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-800/50 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 ml-4"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  ligne.id && handleRemoveItem(vente, ligne.id)
                                                }}
                                                disabled={removeItemMutation.isPending || vente.status === 'cancelled' || vente.status === 'returned'}
                                              >
                                                <X className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-slate-500 dark:text-slate-400 text-center py-4">Aucun article dans cette vente</p>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 px-4 py-3 rounded-b-lg">
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                        Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredVentes.length)} sur {filteredVentes.length} ventes
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          Précédent
                        </Button>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                              pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                              pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNumber = totalPages - 4 + i;
                            } else {
                              pageNumber = currentPage - 2 + i;
                            }
                            
                            return (
                              <Button
                                key={pageNumber}
                                variant={currentPage === pageNumber ? "default" : "outline"}
                                size="sm"
                                className={`w-8 h-8 p-0 ${
                                  currentPage === pageNumber 
                                    ? "bg-blue-600 dark:bg-blue-700 text-white" 
                                    : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                }`}
                                onClick={() => setCurrentPage(pageNumber)}
                              >
                                {pageNumber}
                              </Button>
                            );
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Suivant
                        </Button>
                      </div>
                    </div>
                  )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Bill Printer Modal */}
        <BillPrinter
          vente={currentVente}
          client={selectedClient || null}
          isOpen={billPrinterOpen}
          onClose={() => {
            setBillPrinterOpen(false)
            setCurrentVente(null)
          }}
        />
      </div>
    </POSLayout>
  )
}

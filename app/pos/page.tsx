"use client"

import { useState } from "react"
import { POSLayout } from "@/components/pos-layout"
import { BillPrinter } from "@/components/bill-printer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Scan,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Smartphone,
  Receipt,
  User,
  Pause,
  RotateCcw,
  Printer,
} from "lucide-react"

// Import hooks and types
import { useActiveClients } from "@/hooks/useClients"
import { useCreateVente, useConfirmVente } from "@/hooks/useVentes"
import { useStocksByPointVente } from "@/hooks/usePOSStocks"
import { useCategories } from "@/hooks/useCategories"
import { Client } from "@/types/client.types"
import { Vente, CreateVentePayload } from "@/types/vente.types"
import { Stock } from "@/types/stock.types"
import { toast } from "sonner"

// Constants
const POINT_VENTE_ID = "460c730f-7c08-45ee-9a71-6dea36241819"
const VENDEUR_ID = "default-vendeur"
const DEVICE_ID = "pos-terminal-001"

const heldOrders = [
  {
    id: "HOLD-001",
    items: 3,
    total: 145.97,
    createdAt: "2024-01-10 14:30",
    cashier: "John Doe",
  },
  {
    id: "HOLD-002",
    items: 1,
    total: 99.99,
    createdAt: "2024-01-10 15:45",
    cashier: "Jane Smith",
  },
]

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
  const [activeTab, setActiveTab] = useState("sale")
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [globalDiscount, setGlobalDiscount] = useState(0)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [billPrinterOpen, setBillPrinterOpen] = useState(false)
  const [currentVente, setCurrentVente] = useState<Vente | null>(null)
  const [comments, setComments] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Hooks
  const { data: clients = [], isLoading: clientsLoading } = useActiveClients()
  const { data: stocks = [], isLoading: stocksLoading } = useStocksByPointVente(POINT_VENTE_ID)
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const createVenteMutation = useCreateVente()
  const confirmVenteMutation = useConfirmVente()

  // Get selected client data
  const selectedClient = clients.find(client => client.id === selectedCustomer)

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.produit_nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
      stock.produit.includes(searchTerm) // Search by product ID as well
    // Note: We'll skip category filtering for now since stocks don't include category info
    // const matchesCategory = !selectedCategory || stock.categorie === selectedCategory
    const hasStock = Number(stock.quantite_disponible) > 0 // Only show items with available stock
    return matchesSearch && hasStock
  })

  const addToCart = (stock: Stock) => {
    // Check if item already in cart
    const existingItem = cart.find((item) => item.id === stock.produit)
    
    if (existingItem) {
      // Check if we have enough stock
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
      // Add new item to cart
      const availableQuantity = Number(stock.quantite_disponible)
      
      if (availableQuantity > 0) {
        setCart([
          ...cart,
          {
            id: stock.produit,
            name: stock.produit_nom,
            price: 10.00, // Default price - you might want to get this from product details
            quantity: 1,
            discount: 0,
            tax: 0.20, // Default 20% tax - you might want to get this from product details
            unite: "piece", // Default to piece
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
      // Check stock availability
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

  // Create vente payload
  const createVentePayload = (status: 'draft' | 'confirmed', paymentStatus: 'pending' | 'paid'): CreateVentePayload => {
    const payload: CreateVentePayload = {
      point_vente: POINT_VENTE_ID,
      vendeur: VENDEUR_ID,
      status,
      payment_status: paymentStatus,
      remise_globale: globalDiscount.toString(),
      date_echeance: new Date().toISOString(),
      is_synced: false,
      device_id: DEVICE_ID,
      offline_created: false,
      commentaire: comments,
      lignes: cart.map(item => ({
        produit: item.id,
        unite: item.unite,
        quantite: item.quantity,
        prix_unitaire_ht: (item.price / (1 + item.tax)).toFixed(2),
        taux_tva: (item.tax * 100).toFixed(2),
        remise_pourcentage: item.discount.toString()
      }))
    }

    // Only include client field if a client is selected
    if (selectedCustomer) {
      payload.client = selectedCustomer
    }

    return payload
  }

  // Process payment and create sale
  const handlePayment = async (paymentMethod: 'cash' | 'card' | 'mobile' | 'mixed') => {
    if (cart.length === 0) {
      toast.error("Le panier est vide")
      return
    }

    setIsProcessing(true)
    
    try {
      // Create vente as confirmed and paid
      const ventePayload = createVentePayload('confirmed', 'paid')
      const createdVente = await createVenteMutation.mutateAsync(ventePayload)
      
      // Set current vente for printing
      setCurrentVente(createdVente)
      
      // Clear cart and reset form
      setCart([])
      setGlobalDiscount(0)
      setComments("")
      setSelectedCustomer(null)
      setPaymentModalOpen(false)
      
      // Show success message
      toast.success(`Vente créée avec succès! Total: ${calculateTotal().toFixed(2)} FBU`)
      
      // Open bill printer
      setBillPrinterOpen(true)
      
    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error("Erreur lors du traitement du paiement")
    } finally {
      setIsProcessing(false)
    }
  }

  // Hold order (save as draft)
  const handleHoldOrder = async () => {
    if (cart.length === 0) {
      toast.error("Le panier est vide")
      return
    }

    setIsProcessing(true)
    
    try {
      const ventePayload = createVentePayload('draft', 'pending')
      await createVenteMutation.mutateAsync(ventePayload)
      
      // Clear cart and reset form
      setCart([])
      setGlobalDiscount(0)
      setComments("")
      setSelectedCustomer(null)
      
      toast.success("Commande mise en attente avec succès")
      
    } catch (error) {
      console.error('Error holding order:', error)
      toast.error("Erreur lors de la mise en attente")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <POSLayout currentPath="/pos">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Point of Sale</h1>
            <p className="text-muted-foreground">Process sales, manage orders, and handle returns</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Register #1 - Open
            </Badge>
            <Badge variant="outline">Main Store - Downtown</Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sale">Sale</TabsTrigger>
            <TabsTrigger value="hold-orders">Hold Orders</TabsTrigger>
            <TabsTrigger value="returns">Returns</TabsTrigger>
          </TabsList>

          <TabsContent value="sale" className="flex-1 mt-6">
            <div className="grid grid-cols-12 gap-6 h-full">
              {/* Left Panel - Product Search */}
              <div className="col-span-3 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Product Search</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products or scan barcode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Scan className="h-4 w-4 mr-2" />
                      Scan Barcode
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Filtres de Stock</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setSearchTerm("")}
                        className="justify-start"
                      >
                        Tous les produits
                      </Button>
                      <div className="text-sm text-muted-foreground mt-2">
                        Total des produits en stock: {stocks.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Produits disponibles: {stocks.filter(s => Number(s.quantite_disponible) > 0).length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Ruptures de stock: {stocks.filter(s => Number(s.quantite_disponible) <= 0).length}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Produits en Stock</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {stocksLoading ? (
                        <div className="text-center py-4">Chargement des stocks...</div>
                      ) : filteredStocks.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                          Aucun produit en stock trouvé
                        </div>
                      ) : (
                        filteredStocks.map((stock) => {
                          const cartItem = cart.find(item => item.id === stock.produit)
                          const cartQuantity = cartItem ? cartItem.quantity : 0
                          const availableQuantity = Number(stock.quantite_disponible) - cartQuantity
                          
                          return (
                            <div
                              key={stock.id}
                              className={`flex items-center justify-between p-2 border rounded-lg hover:bg-muted cursor-pointer ${
                                availableQuantity <= 0 ? 'opacity-50' : ''
                              }`}
                              onClick={() => availableQuantity > 0 && addToCart(stock)}
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium">{stock.produit_nom}</p>
                                <p className="text-xs text-muted-foreground">
                                  ID: {stock.produit}
                                </p>
                                {cartQuantity > 0 && (
                                  <p className="text-xs text-blue-600">
                                    {cartQuantity} dans le panier
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <Badge 
                                  variant={availableQuantity > 5 ? "outline" : availableQuantity > 0 ? "secondary" : "destructive"} 
                                  className="text-xs"
                                >
                                  {availableQuantity}
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-1">
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

              {/* Center Panel - Cart */}
              <div className="col-span-6">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Shopping Cart</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <ShoppingCart className="h-12 w-12 mb-4" />
                        <p>Cart is empty</p>
                        <p className="text-sm">Add products to start a sale</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Qty</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Discount %</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cart.map((item) => {
                              const lineTotal = item.price * item.quantity
                              const discountAmount = lineTotal * (item.discount / 100)
                              const finalTotal = lineTotal - discountAmount

                              return (
                                <TableRow key={item.id}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{item.name}</p>
                                      <p className="text-sm text-muted-foreground">{item.price.toFixed(2)} FBU each</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="w-8 text-center">{item.quantity}</span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                  <TableCell>{item.price.toFixed(2)} FBU</TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      value={item.discount}
                                      onChange={(e) => updateDiscount(item.id, Number(e.target.value))}
                                      className="w-16"
                                      min="0"
                                      max="100"
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">{finalTotal.toFixed(2)} FBU</TableCell>
                                  <TableCell>
                                    <Button size="sm" variant="ghost" onClick={() => removeFromCart(item.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Customer & Payment */}
              <div className="col-span-3 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Client</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedCustomer || ""} onValueChange={setSelectedCustomer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client (optionnel)" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientsLoading ? (
                          <div className="p-2 text-center">Chargement...</div>
                        ) : (
                          clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.nom} {client.prenom} ({client.type_client})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="w-full mt-2 bg-transparent">
                      <User className="h-4 w-4 mr-2" />
                      Nouveau Client
                    </Button>
                    {selectedClient && (
                      <div className="mt-2 p-2 bg-muted rounded text-sm">
                        <p><strong>{selectedClient.nom} {selectedClient.prenom}</strong></p>
                        <p>{selectedClient.email}</p>
                        <p>{selectedClient.telephone}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Résumé de la Commande</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Sous-total:</span>
                      <span>{calculateSubtotal().toFixed(2)} FBU</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Remise globale:</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={globalDiscount}
                          onChange={(e) => setGlobalDiscount(Number(e.target.value))}
                          className="w-16"
                          min="0"
                          max="100"
                        />
                        <span>%</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>TVA:</span>
                      <span>{calculateTax().toFixed(2)} FBU</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>{calculateTotal().toFixed(2)} FBU</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Commentaires</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Commentaires sur la vente (optionnel)..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="min-h-16"
                    />
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg" disabled={cart.length === 0 || isProcessing}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        {isProcessing ? "Traitement..." : "Traiter le Paiement"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Traiter le Paiement</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{calculateTotal().toFixed(2)} FBU</p>
                          <p className="text-muted-foreground">Montant Total</p>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <Button 
                            variant="outline" 
                            className="h-20 flex-col bg-transparent" 
                            onClick={() => handlePayment('cash')}
                            disabled={isProcessing}
                          >
                            <DollarSign className="h-6 w-6 mb-2" />
                            Espèces
                          </Button>
                          <Button 
                            variant="outline" 
                            className="h-20 flex-col bg-transparent"
                            onClick={() => handlePayment('card')}
                            disabled={isProcessing}
                          >
                            <CreditCard className="h-6 w-6 mb-2" />
                            Carte
                          </Button>
                          <Button 
                            variant="outline" 
                            className="h-20 flex-col bg-transparent"
                            onClick={() => handlePayment('mobile')}
                            disabled={isProcessing}
                          >
                            <Smartphone className="h-6 w-6 mb-2" />
                            Mobile
                          </Button>
                          <Button 
                            variant="outline" 
                            className="h-20 flex-col bg-transparent"
                            onClick={() => handlePayment('mixed')}
                            disabled={isProcessing}
                          >
                            <Receipt className="h-6 w-6 mb-2" />
                            Mixte
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="outline" 
                    className="w-full bg-transparent" 
                    disabled={cart.length === 0 || isProcessing}
                    onClick={handleHoldOrder}
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Mettre en Attente
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full bg-transparent" 
                    onClick={() => setCart([])}
                    disabled={isProcessing}
                  >
                    Vider le Panier
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hold-orders" className="flex-1 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Hold Orders</CardTitle>
                <p className="text-muted-foreground">Manage temporarily held orders</p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Cashier</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {heldOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.items} items</TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>{order.createdAt}</TableCell>
                        <TableCell>{order.cashier}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              Resume
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="returns" className="flex-1 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Process Returns</CardTitle>
                <p className="text-muted-foreground">Search and process customer returns</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="invoice-search">Invoice Number</Label>
                    <Input id="invoice-search" placeholder="Enter invoice number..." className="mt-1" />
                  </div>
                  <div className="flex items-end">
                    <Button>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>

                <div className="text-center py-12 text-muted-foreground">
                  <RotateCcw className="h-12 w-12 mx-auto mb-4" />
                  <p>Enter an invoice number to process returns</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Bill Printer Modal */}
        <BillPrinter
          vente={currentVente}
          client={selectedClient}
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

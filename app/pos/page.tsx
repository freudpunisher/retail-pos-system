"use client"

import { useState } from "react"
import { POSLayout } from "@/components/pos-layout"
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
} from "lucide-react"

// Mock data
const categories = [
  { id: "electronics", name: "Electronics", color: "bg-blue-100 text-blue-800" },
  { id: "food", name: "Food & Beverages", color: "bg-green-100 text-green-800" },
  { id: "clothing", name: "Clothing", color: "bg-purple-100 text-purple-800" },
  { id: "home", name: "Home & Garden", color: "bg-orange-100 text-orange-800" },
  { id: "books", name: "Books & Media", color: "bg-indigo-100 text-indigo-800" },
]

const products = [
  {
    id: "1",
    name: "Premium Coffee Beans",
    barcode: "1234567890123",
    category: "food",
    price: 15.99,
    tax: 0.08,
    stock: 45,
  },
  {
    id: "2",
    name: "Wireless Headphones",
    barcode: "2345678901234",
    category: "electronics",
    price: 99.99,
    tax: 0.08,
    stock: 23,
  },
  {
    id: "3",
    name: "Organic Tea Set",
    barcode: "3456789012345",
    category: "food",
    price: 24.99,
    tax: 0.08,
    stock: 18,
  },
  {
    id: "4",
    name: "Cotton T-Shirt",
    barcode: "4567890123456",
    category: "clothing",
    price: 19.99,
    tax: 0.08,
    stock: 67,
  },
]

const customers = [
  { id: "1", name: "John Smith", email: "john@example.com", phone: "+1234567890" },
  { id: "2", name: "Sarah Johnson", email: "sarah@example.com", phone: "+1234567891" },
  { id: "3", name: "Mike Davis", email: "mike@example.com", phone: "+1234567892" },
]

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
}

export default function POSPage() {
  const [activeTab, setActiveTab] = useState("sale")
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [globalDiscount, setGlobalDiscount] = useState(0)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.barcode.includes(searchTerm)
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (product: (typeof products)[0]) => {
    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          discount: 0,
          tax: product.tax,
        },
      ])
    }
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.id !== id))
    } else {
      setCart(cart.map((item) => (item.id === id ? { ...item, quantity } : item)))
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
                    <CardTitle className="text-lg">Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        variant={selectedCategory === null ? "default" : "outline"}
                        onClick={() => setSelectedCategory(null)}
                        className="justify-start"
                      >
                        All Categories
                      </Button>
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "outline"}
                          onClick={() => setSelectedCategory(category.id)}
                          className="justify-start"
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted cursor-pointer"
                          onClick={() => addToCart(product)}
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">${product.price}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {product.stock}
                          </Badge>
                        </div>
                      ))}
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
                                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
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
                                  <TableCell>${item.price.toFixed(2)}</TableCell>
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
                                  <TableCell className="font-medium">${finalTotal.toFixed(2)}</TableCell>
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
                    <CardTitle className="text-lg">Customer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedCustomer || ""} onValueChange={setSelectedCustomer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="w-full mt-2 bg-transparent">
                      <User className="h-4 w-4 mr-2" />
                      New Customer
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Global Discount:</span>
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
                      <span>Tax:</span>
                      <span>${calculateTax().toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg" disabled={cart.length === 0}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Process Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Process Payment</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">${calculateTotal().toFixed(2)}</p>
                          <p className="text-muted-foreground">Total Amount</p>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <Button variant="outline" className="h-20 flex-col bg-transparent">
                            <DollarSign className="h-6 w-6 mb-2" />
                            Cash
                          </Button>
                          <Button variant="outline" className="h-20 flex-col bg-transparent">
                            <CreditCard className="h-6 w-6 mb-2" />
                            Card
                          </Button>
                          <Button variant="outline" className="h-20 flex-col bg-transparent">
                            <Smartphone className="h-6 w-6 mb-2" />
                            Mobile
                          </Button>
                          <Button variant="outline" className="h-20 flex-col bg-transparent">
                            <Receipt className="h-6 w-6 mb-2" />
                            Mixed
                          </Button>
                        </div>
                        <Button className="w-full" onClick={() => setPaymentModalOpen(false)}>
                          Complete Sale
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="w-full bg-transparent" disabled={cart.length === 0}>
                    <Pause className="h-4 w-4 mr-2" />
                    Hold Order
                  </Button>

                  <Button variant="outline" className="w-full bg-transparent" onClick={() => setCart([])}>
                    Clear Cart
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
      </div>
    </POSLayout>
  )
}

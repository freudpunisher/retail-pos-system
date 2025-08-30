"use client"

import { useState } from "react"
import { POSLayout } from "@/components/pos-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Filter,
  Plus,
  Edit,
  AlertTriangle,
  Package,
  Calendar,
  Store,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

// Mock data
const stores = [
  { id: "store-1", name: "Main Store - Downtown" },
  { id: "store-2", name: "Branch Store - Mall" },
  { id: "store-3", name: "Outlet Store - Airport" },
]

const categories = [
  { id: "electronics", name: "Electronics" },
  { id: "food", name: "Food & Beverages" },
  { id: "clothing", name: "Clothing" },
  { id: "home", name: "Home & Garden" },
  { id: "books", name: "Books & Media" },
]

const stockData = [
  {
    id: "1",
    product: "Premium Coffee Beans",
    category: "Food & Beverages",
    store: "Main Store - Downtown",
    available: 45,
    reserved: 5,
    minimum: 20,
    maximum: 100,
    lastIn: "2024-01-08",
    lastOut: "2024-01-10",
    status: "normal",
  },
  {
    id: "2",
    product: "Wireless Headphones",
    category: "Electronics",
    store: "Main Store - Downtown",
    available: 8,
    reserved: 2,
    minimum: 15,
    maximum: 50,
    lastIn: "2024-01-05",
    lastOut: "2024-01-09",
    status: "low",
  },
  {
    id: "3",
    product: "Organic Tea Set",
    category: "Food & Beverages",
    store: "Branch Store - Mall",
    available: 23,
    reserved: 0,
    minimum: 10,
    maximum: 40,
    lastIn: "2024-01-07",
    lastOut: "2024-01-10",
    status: "normal",
  },
  {
    id: "4",
    product: "Cotton T-Shirt",
    category: "Clothing",
    store: "Main Store - Downtown",
    available: 2,
    reserved: 1,
    minimum: 25,
    maximum: 100,
    lastIn: "2024-01-03",
    lastOut: "2024-01-10",
    status: "critical",
  },
]

export default function StockPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStore, setSelectedStore] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [adjustmentData, setAdjustmentData] = useState({
    type: "adjustment",
    quantity: 0,
    reason: "",
    reference: "",
  })

  const filteredStock = stockData.filter((item) => {
    const matchesSearch = item.product.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStore = selectedStore === "all" || item.store === selectedStore
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesStore && matchesCategory
  })

  const getStatusBadge = (status: string, available: number, minimum: number) => {
    if (status === "critical" || available < minimum * 0.5) {
      return <Badge variant="destructive">Critical</Badge>
    }
    if (status === "low" || available < minimum) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Low Stock
        </Badge>
      )
    }
    return <Badge variant="outline">Normal</Badge>
  }

  const handleAdjustment = () => {
    // Handle stock adjustment logic here
    console.log("Stock adjustment:", { selectedProduct, ...adjustmentData })
    setAdjustmentModalOpen(false)
    setAdjustmentData({ type: "adjustment", quantity: 0, reason: "", reference: "" })
  }

  return (
    <POSLayout currentPath="/stock">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Stock Management</h1>
            <p className="text-muted-foreground">Monitor and manage inventory across all stores</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Export Stock Report
            </Button>
            <Dialog open={adjustmentModalOpen} onOpenChange={setAdjustmentModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Stock Adjustment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Stock Adjustment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="product-select">Product</Label>
                    <Select value={selectedProduct || ""} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {stockData.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.product} - {item.store}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="adjustment-type">Adjustment Type</Label>
                    <Select
                      value={adjustmentData.type}
                      onValueChange={(value) => setAdjustmentData({ ...adjustmentData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adjustment">Manual Adjustment</SelectItem>
                        <SelectItem value="damage">Damage/Loss</SelectItem>
                        <SelectItem value="found">Found Stock</SelectItem>
                        <SelectItem value="expired">Expired Items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity Change</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={adjustmentData.quantity}
                      onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity: Number(e.target.value) })}
                      placeholder="Enter positive or negative number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      value={adjustmentData.reason}
                      onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                      placeholder="Explain the reason for adjustment"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reference">Reference</Label>
                    <Input
                      id="reference"
                      value={adjustmentData.reference}
                      onChange={(e) => setAdjustmentData({ ...adjustmentData, reference: e.target.value })}
                      placeholder="Reference number or document"
                    />
                  </div>
                  <Button onClick={handleAdjustment} className="w-full">
                    Apply Adjustment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.name}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stock Table */}
        <Card>
          <CardHeader>
            <CardTitle>Current Stock Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Reserved</TableHead>
                  <TableHead>Min/Max</TableHead>
                  <TableHead>Last Movement</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStock.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{item.product}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Store className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{item.store}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{item.available}</span>
                        {item.available < item.minimum && <AlertTriangle className="h-4 w-4 text-destructive" />}
                      </div>
                    </TableCell>
                    <TableCell>{item.reserved}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {item.minimum} / {item.maximum}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-xs">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span>In: {item.lastIn}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs">
                          <TrendingDown className="h-3 w-3 text-red-600" />
                          <span>Out: {item.lastOut}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status, item.available, item.minimum)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProduct(item.id)
                            setAdjustmentModalOpen(true)
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockData.length}</div>
              <p className="text-xs text-muted-foreground">Across all stores</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stockData.filter((item) => item.available < item.minimum).length}
              </div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$245,680</div>
              <p className="text-xs text-muted-foreground">At purchase price</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reserved Items</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockData.reduce((sum, item) => sum + item.reserved, 0)}</div>
              <p className="text-xs text-muted-foreground">Pending orders</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </POSLayout>
  )
}

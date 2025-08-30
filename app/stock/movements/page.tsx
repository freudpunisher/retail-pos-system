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
import { Search, Plus, TrendingUp, TrendingDown, ArrowRightLeft, Edit, Package, Calendar, User } from "lucide-react"

// Mock data for stock movements
const movementData = [
  {
    id: "MOV-001",
    type: "entree",
    product: "Premium Coffee Beans",
    store: "Main Store - Downtown",
    quantity: 50,
    unitPrice: 12.5,
    reference: "PO-2024-001",
    user: "John Doe",
    createdAt: "2024-01-10 09:30",
    reason: "Purchase order received",
  },
  {
    id: "MOV-002",
    type: "sortie",
    product: "Wireless Headphones",
    store: "Main Store - Downtown",
    quantity: -2,
    unitPrice: 75.0,
    reference: "SALE-2024-156",
    user: "Jane Smith",
    createdAt: "2024-01-10 14:15",
    reason: "Sale transaction",
  },
  {
    id: "MOV-003",
    type: "transfert_out",
    product: "Organic Tea Set",
    store: "Main Store - Downtown",
    quantity: -10,
    unitPrice: 18.0,
    reference: "TRF-2024-003",
    user: "Mike Johnson",
    createdAt: "2024-01-09 16:45",
    reason: "Transfer to Branch Store",
  },
  {
    id: "MOV-004",
    type: "transfert_in",
    product: "Organic Tea Set",
    store: "Branch Store - Mall",
    quantity: 10,
    unitPrice: 18.0,
    reference: "TRF-2024-003",
    user: "Sarah Wilson",
    createdAt: "2024-01-09 17:30",
    reason: "Transfer from Main Store",
  },
  {
    id: "MOV-005",
    type: "ajustement",
    product: "Cotton T-Shirt",
    store: "Main Store - Downtown",
    quantity: -3,
    unitPrice: 15.0,
    reference: "ADJ-2024-001",
    user: "John Doe",
    createdAt: "2024-01-08 11:20",
    reason: "Damaged items removed",
  },
]

const movementTypes = [
  { value: "all", label: "All Types" },
  { value: "entree", label: "Stock In" },
  { value: "sortie", label: "Stock Out" },
  { value: "transfert_in", label: "Transfer In" },
  { value: "transfert_out", label: "Transfer Out" },
  { value: "ajustement", label: "Adjustment" },
  { value: "inventaire", label: "Inventory" },
]

export default function MovementsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [movementModalOpen, setMovementModalOpen] = useState(false)
  const [newMovement, setNewMovement] = useState({
    type: "entree",
    product: "",
    store: "",
    quantity: 0,
    unitPrice: 0,
    reference: "",
    reason: "",
  })

  const filteredMovements = movementData.filter((movement) => {
    const matchesSearch =
      movement.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reference.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || movement.type === selectedType
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
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  const getMovementBadge = (type: string) => {
    const badges = {
      entree: <Badge className="bg-green-100 text-green-800">Stock In</Badge>,
      sortie: <Badge className="bg-red-100 text-red-800">Stock Out</Badge>,
      transfert_in: <Badge className="bg-blue-100 text-blue-800">Transfer In</Badge>,
      transfert_out: <Badge className="bg-orange-100 text-orange-800">Transfer Out</Badge>,
      ajustement: <Badge className="bg-purple-100 text-purple-800">Adjustment</Badge>,
      inventaire: <Badge className="bg-gray-100 text-gray-800">Inventory</Badge>,
    }
    return badges[type as keyof typeof badges] || <Badge variant="outline">{type}</Badge>
  }

  return (
    <POSLayout currentPath="/stock/movements">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Stock Movements</h1>
            <p className="text-muted-foreground">Track all inventory movements and transactions</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Export Movements
            </Button>
            <Dialog open={movementModalOpen} onOpenChange={setMovementModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Movement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Stock Movement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="movement-type">Movement Type</Label>
                    <Select
                      value={newMovement.type}
                      onValueChange={(value) => setNewMovement({ ...newMovement, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entree">Stock In</SelectItem>
                        <SelectItem value="sortie">Stock Out</SelectItem>
                        <SelectItem value="ajustement">Adjustment</SelectItem>
                        <SelectItem value="inventaire">Inventory Count</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="product">Product</Label>
                    <Input
                      id="product"
                      value={newMovement.product}
                      onChange={(e) => setNewMovement({ ...newMovement, product: e.target.value })}
                      placeholder="Select or search product"
                    />
                  </div>
                  <div>
                    <Label htmlFor="store">Store</Label>
                    <Select
                      value={newMovement.store}
                      onValueChange={(value) => setNewMovement({ ...newMovement, store: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select store" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Main Store - Downtown</SelectItem>
                        <SelectItem value="branch">Branch Store - Mall</SelectItem>
                        <SelectItem value="outlet">Outlet Store - Airport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={newMovement.quantity}
                        onChange={(e) => setNewMovement({ ...newMovement, quantity: Number(e.target.value) })}
                        placeholder="Enter quantity"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit-price">Unit Price</Label>
                      <Input
                        id="unit-price"
                        type="number"
                        step="0.01"
                        value={newMovement.unitPrice}
                        onChange={(e) => setNewMovement({ ...newMovement, unitPrice: Number(e.target.value) })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reference">Reference</Label>
                    <Input
                      id="reference"
                      value={newMovement.reference}
                      onChange={(e) => setNewMovement({ ...newMovement, reference: e.target.value })}
                      placeholder="Reference number or document"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      value={newMovement.reason}
                      onChange={(e) => setNewMovement({ ...newMovement, reason: e.target.value })}
                      placeholder="Reason for this movement"
                    />
                  </div>
                  <Button onClick={() => setMovementModalOpen(false)} className="w-full">
                    Add Movement
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
                    placeholder="Search products or references..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-48">
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
        <Card>
          <CardHeader>
            <CardTitle>Movement History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getMovementIcon(movement.type)}
                        {getMovementBadge(movement.type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{movement.product}</p>
                        <p className="text-sm text-muted-foreground">{movement.reason}</p>
                      </div>
                    </TableCell>
                    <TableCell>{movement.store}</TableCell>
                    <TableCell>
                      <span className={movement.quantity > 0 ? "text-green-600" : "text-red-600"}>
                        {movement.quantity > 0 ? "+" : ""}
                        {movement.quantity}
                      </span>
                    </TableCell>
                    <TableCell>${movement.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className="font-medium">
                        ${(Math.abs(movement.quantity) * movement.unitPrice).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{movement.reference}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{movement.user}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{movement.createdAt}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </POSLayout>
  )
}

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
import { Search, Plus, Package, Calendar, User, Eye, Edit, FileText, Truck, CheckCircle } from "lucide-react"

// Mock data for purchase orders
const purchaseOrderData = [
  {
    id: "PO-2024-001",
    supplier: "Coffee Suppliers Inc.",
    store: "Main Store - Downtown",
    status: "received",
    expectedDate: "2024-01-10",
    createdDate: "2024-01-05",
    total: 2450.0,
    items: 3,
    requester: "John Doe",
  },
  {
    id: "PO-2024-002",
    supplier: "Tech Distributors",
    store: "Branch Store - Mall",
    status: "confirmed",
    expectedDate: "2024-01-15",
    createdDate: "2024-01-08",
    total: 5670.0,
    items: 5,
    requester: "Jane Smith",
  },
  {
    id: "PO-2024-003",
    supplier: "Office Supplies Co.",
    store: "Main Store - Downtown",
    status: "draft",
    expectedDate: "2024-01-20",
    createdDate: "2024-01-10",
    total: 890.0,
    items: 2,
    requester: "Mike Johnson",
  },
]

export default function PurchaseOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [poModalOpen, setPOModalOpen] = useState(false)

  const filteredPOs = purchaseOrderData.filter((po) => {
    const matchesSearch =
      po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || po.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: <Badge variant="outline">Draft</Badge>,
      sent: <Badge className="bg-blue-100 text-blue-800">Sent</Badge>,
      confirmed: <Badge className="bg-purple-100 text-purple-800">Confirmed</Badge>,
      partially_received: <Badge className="bg-yellow-100 text-yellow-800">Partially Received</Badge>,
      received: <Badge className="bg-green-100 text-green-800">Received</Badge>,
      cancelled: <Badge className="bg-red-100 text-red-800">Cancelled</Badge>,
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
      case "received":
        return <Truck className="h-4 w-4 text-green-600" />
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <POSLayout currentPath="/stock/purchase-orders">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
            <p className="text-muted-foreground">Manage supplier orders and inventory procurement</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Export Orders
            </Button>
            <Dialog open={poModalOpen} onOpenChange={setPOModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Purchase Order
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Purchase Order</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="supplier">Supplier</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="coffee">Coffee Suppliers Inc.</SelectItem>
                          <SelectItem value="tech">Tech Distributors</SelectItem>
                          <SelectItem value="office">Office Supplies Co.</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="store">Delivery Store</Label>
                      <Select>
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
                  </div>
                  <div>
                    <Label htmlFor="expected-date">Expected Delivery Date</Label>
                    <Input id="expected-date" type="date" />
                  </div>
                  <div>
                    <Label>Order Items</Label>
                    <div className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">No items added yet</span>
                        <Button size="sm" variant="outline">
                          <Plus className="h-3 w-3 mr-1" />
                          Add Item
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setPOModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setPOModalOpen(false)}>Create Order</Button>
                  </div>
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
                    placeholder="Search orders or suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="partially_received">Partially Received</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Expected Date</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPOs.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{po.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>{po.supplier}</TableCell>
                    <TableCell>{po.store}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(po.status)}
                        {getStatusBadge(po.status)}
                      </div>
                    </TableCell>
                    <TableCell>{po.items} items</TableCell>
                    <TableCell className="font-medium">${po.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{po.expectedDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{po.requester}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                        {po.status === "draft" && (
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                        {po.status === "confirmed" && <Button size="sm">Receive</Button>}
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

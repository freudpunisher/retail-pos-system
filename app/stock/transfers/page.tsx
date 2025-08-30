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
import { Search, Plus, ArrowRightLeft, Package, Calendar, User, Eye, Edit, Truck, CheckCircle } from "lucide-react"

// Mock data for transfers
const transferData = [
  {
    id: "TRF-2024-001",
    sourceStore: "Main Store - Downtown",
    destinationStore: "Branch Store - Mall",
    status: "completed",
    requestedDate: "2024-01-08",
    shippedDate: "2024-01-09",
    receivedDate: "2024-01-10",
    requester: "Sarah Wilson",
    approver: "John Doe",
    items: 3,
    totalValue: 450.0,
  },
  {
    id: "TRF-2024-002",
    sourceStore: "Branch Store - Mall",
    destinationStore: "Outlet Store - Airport",
    status: "in_transit",
    requestedDate: "2024-01-09",
    shippedDate: "2024-01-10",
    receivedDate: null,
    requester: "Mike Johnson",
    approver: "Jane Smith",
    items: 2,
    totalValue: 280.0,
  },
  {
    id: "TRF-2024-003",
    sourceStore: "Main Store - Downtown",
    destinationStore: "Branch Store - Mall",
    status: "pending",
    requestedDate: "2024-01-10",
    shippedDate: null,
    receivedDate: null,
    requester: "Sarah Wilson",
    approver: null,
    items: 5,
    totalValue: 720.0,
  },
]

const transferItems = [
  { id: "1", transferId: "TRF-2024-001", product: "Premium Coffee Beans", requested: 20, shipped: 20, received: 20 },
  { id: "2", transferId: "TRF-2024-001", product: "Organic Tea Set", requested: 15, shipped: 15, received: 15 },
  { id: "3", transferId: "TRF-2024-001", product: "Cotton T-Shirt", requested: 10, shipped: 10, received: 8 },
]

export default function TransfersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<string | null>(null)

  const filteredTransfers = transferData.filter((transfer) => {
    const matchesSearch =
      transfer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.sourceStore.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.destinationStore.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || transfer.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>,
      approved: <Badge className="bg-blue-100 text-blue-800">Approved</Badge>,
      in_transit: <Badge className="bg-purple-100 text-purple-800">In Transit</Badge>,
      completed: <Badge className="bg-green-100 text-green-800">Completed</Badge>,
      cancelled: <Badge className="bg-red-100 text-red-800">Cancelled</Badge>,
    }
    return badges[status as keyof typeof badges] || <Badge variant="outline">{status}</Badge>
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Calendar className="h-4 w-4 text-yellow-600" />
      case "in_transit":
        return <Truck className="h-4 w-4 text-purple-600" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <POSLayout currentPath="/stock/transfers">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Stock Transfers</h1>
            <p className="text-muted-foreground">Manage inter-store inventory transfers</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Export Transfers
            </Button>
            <Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Transfer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Stock Transfer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="source-store">Source Store</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source store" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main">Main Store - Downtown</SelectItem>
                          <SelectItem value="branch">Branch Store - Mall</SelectItem>
                          <SelectItem value="outlet">Outlet Store - Airport</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="destination-store">Destination Store</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination store" />
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
                    <Label>Transfer Items</Label>
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
                    <Button variant="outline" onClick={() => setTransferModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setTransferModalOpen(false)}>Create Transfer</Button>
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
                    placeholder="Search transfers..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transfers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transfer Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transfer #</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{transfer.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">From:</span> {transfer.sourceStore}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">To:</span> {transfer.destinationStore}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(transfer.status)}
                        {getStatusBadge(transfer.status)}
                      </div>
                    </TableCell>
                    <TableCell>{transfer.items} items</TableCell>
                    <TableCell className="font-medium">${transfer.totalValue.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div>Requested: {transfer.requestedDate}</div>
                        {transfer.shippedDate && <div>Shipped: {transfer.shippedDate}</div>}
                        {transfer.receivedDate && <div>Received: {transfer.receivedDate}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{transfer.requester}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTransfer(transfer.id)
                            setViewModalOpen(true)
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {transfer.status === "pending" && (
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View Transfer Modal */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Transfer Details - {selectedTransfer}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Transfer Info */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Transfer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      {getStatusBadge("completed")}
                    </div>
                    <div className="flex justify-between">
                      <span>Requested:</span>
                      <span>2024-01-08</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipped:</span>
                      <span>2024-01-09</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Received:</span>
                      <span>2024-01-10</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">People</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Requester:</span>
                      <span>Sarah Wilson</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approver:</span>
                      <span>John Doe</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipper:</span>
                      <span>Mike Johnson</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Receiver:</span>
                      <span>Sarah Wilson</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Transfer Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transfer Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Shipped</TableHead>
                        <TableHead>Received</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transferItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.product}</TableCell>
                          <TableCell>{item.requested}</TableCell>
                          <TableCell>{item.shipped}</TableCell>
                          <TableCell>{item.received}</TableCell>
                          <TableCell>
                            {item.received === item.requested ? (
                              <Badge className="bg-green-100 text-green-800">Complete</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </POSLayout>
  )
}

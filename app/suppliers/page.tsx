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
import { Search, Plus, Factory, Phone, Mail, Eye, Edit, DollarSign, Truck, TrendingUp, Clock } from "lucide-react"

// Mock data for suppliers
const supplierData = [
  {
    id: "1",
    name: "Coffee Suppliers Inc.",
    contact: "Maria Rodriguez",
    phone: "+1 (555) 987-6543",
    email: "orders@coffeesuppliers.com",
    paymentTerms: "Net 30",
    deliveryDelay: 5,
    status: "active",
    totalOrders: 15,
    totalAmount: 45680.0,
    lastOrder: "2024-01-08",
    onTimeDelivery: 95,
    address: "789 Coffee Lane, Bean City",
  },
  {
    id: "2",
    name: "Tech Distributors",
    contact: "James Wilson",
    phone: "+1 (555) 876-5432",
    email: "sales@techdist.com",
    paymentTerms: "Net 15",
    deliveryDelay: 3,
    status: "active",
    totalOrders: 8,
    totalAmount: 28450.0,
    lastOrder: "2024-01-09",
    onTimeDelivery: 88,
    address: "456 Tech Blvd, Silicon Valley",
  },
  {
    id: "3",
    name: "Office Supplies Co.",
    contact: "Linda Chen",
    phone: "+1 (555) 765-4321",
    email: "info@officesupplies.com",
    paymentTerms: "Net 45",
    deliveryDelay: 7,
    status: "active",
    totalOrders: 22,
    totalAmount: 12890.0,
    lastOrder: "2024-01-05",
    onTimeDelivery: 92,
    address: "123 Office Park, Business District",
  },
  {
    id: "4",
    name: "Fashion Wholesale",
    contact: "Robert Kim",
    phone: "+1 (555) 654-3210",
    email: "orders@fashionwholesale.com",
    paymentTerms: "Net 60",
    deliveryDelay: 10,
    status: "inactive",
    totalOrders: 5,
    totalAmount: 8750.0,
    lastOrder: "2023-11-20",
    onTimeDelivery: 75,
    address: "321 Fashion Ave, Style District",
  },
]

const purchaseOrderHistory = [
  { id: "PO-2024-001", date: "2024-01-08", amount: 2450.0, items: 3, status: "received" },
  { id: "PO-2024-002", date: "2024-01-05", amount: 1890.0, items: 2, status: "received" },
  { id: "PO-2023-045", date: "2023-12-20", amount: 3200.0, items: 5, status: "received" },
  { id: "PO-2023-044", date: "2023-12-15", amount: 1650.0, items: 2, status: "cancelled" },
]

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [supplierModalOpen, setSupplierModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null)
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    paymentTerms: "Net 30",
    deliveryDelay: 7,
    address: "",
    notes: "",
  })

  const filteredSuppliers = supplierData.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || supplier.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const badges = {
      active: <Badge className="bg-green-100 text-green-800">Active</Badge>,
      inactive: <Badge variant="outline">Inactive</Badge>,
      suspended: <Badge className="bg-red-100 text-red-800">Suspended</Badge>,
    }
    return badges[status as keyof typeof badges] || <Badge variant="outline">{status}</Badge>
  }

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 95) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (percentage >= 85) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
    if (percentage >= 75) return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>
  }

  const selectedSupplierData = supplierData.find((supplier) => supplier.id === selectedSupplier)

  return (
    <POSLayout currentPath="/suppliers">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Supplier Management</h1>
            <p className="text-muted-foreground">Manage supplier relationships and track purchase performance</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Factory className="h-4 w-4 mr-2" />
              Export Suppliers
            </Button>
            <Dialog open={supplierModalOpen} onOpenChange={setSupplierModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Supplier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Supplier</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="supplier-name">Company Name</Label>
                    <Input
                      id="supplier-name"
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                      placeholder="Supplier company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier-contact">Contact Person</Label>
                    <Input
                      id="supplier-contact"
                      value={newSupplier.contact}
                      onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                      placeholder="Contact person name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="supplier-phone">Phone</Label>
                      <Input
                        id="supplier-phone"
                        value={newSupplier.phone}
                        onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplier-email">Email</Label>
                      <Input
                        id="supplier-email"
                        type="email"
                        value={newSupplier.email}
                        onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                        placeholder="supplier@email.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payment-terms">Payment Terms</Label>
                      <Select
                        value={newSupplier.paymentTerms}
                        onValueChange={(value) => setNewSupplier({ ...newSupplier, paymentTerms: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Net 15">Net 15</SelectItem>
                          <SelectItem value="Net 30">Net 30</SelectItem>
                          <SelectItem value="Net 45">Net 45</SelectItem>
                          <SelectItem value="Net 60">Net 60</SelectItem>
                          <SelectItem value="COD">Cash on Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="delivery-delay">Delivery Delay (days)</Label>
                      <Input
                        id="delivery-delay"
                        type="number"
                        value={newSupplier.deliveryDelay}
                        onChange={(e) => setNewSupplier({ ...newSupplier, deliveryDelay: Number(e.target.value) })}
                        placeholder="7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="supplier-address">Address</Label>
                    <Textarea
                      id="supplier-address"
                      value={newSupplier.address}
                      onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                      placeholder="Supplier address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier-notes">Notes</Label>
                    <Textarea
                      id="supplier-notes"
                      value={newSupplier.notes}
                      onChange={(e) => setNewSupplier({ ...newSupplier, notes: e.target.value })}
                      placeholder="Additional notes"
                    />
                  </div>
                  <Button onClick={() => setSupplierModalOpen(false)} className="w-full">
                    Add Supplier
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
                    placeholder="Search suppliers..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Supplier Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Factory className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <p className="text-sm text-muted-foreground">Last order: {supplier.lastOrder}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplier.contact}</p>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{supplier.phone}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{supplier.email}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{supplier.paymentTerms}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{supplier.deliveryDelay} days</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{supplier.onTimeDelivery}% on-time</div>
                        {getPerformanceBadge(supplier.onTimeDelivery)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplier.totalOrders} orders</p>
                        <p className="text-sm text-muted-foreground">${supplier.totalAmount.toLocaleString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSupplier(supplier.id)
                            setDetailModalOpen(true)
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
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

        {/* Supplier Detail Modal */}
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Supplier Details - {selectedSupplierData?.name}</DialogTitle>
            </DialogHeader>
            {selectedSupplierData && (
              <div className="space-y-6">
                {/* Supplier Info */}
                <div className="grid grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="font-medium">{selectedSupplierData.contact}</p>
                        <p className="text-sm text-muted-foreground">Contact Person</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedSupplierData.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedSupplierData.email}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">{selectedSupplierData.address}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Terms & Delivery</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Payment Terms:</span>
                        <Badge variant="outline">{selectedSupplierData.paymentTerms}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Delay:</span>
                        <span>{selectedSupplierData.deliveryDelay} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        {getStatusBadge(selectedSupplierData.status)}
                      </div>
                      <div className="flex justify-between">
                        <span>Performance:</span>
                        {getPerformanceBadge(selectedSupplierData.onTimeDelivery)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Orders:</span>
                        <span className="font-medium">{selectedSupplierData.totalOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-medium">${selectedSupplierData.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Order:</span>
                        <span>{selectedSupplierData.lastOrder}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>On-Time Delivery:</span>
                        <span className="font-medium">{selectedSupplierData.onTimeDelivery}%</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Purchase Order History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Purchase Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchaseOrderHistory.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <Badge variant="outline">{order.id}</Badge>
                            </TableCell>
                            <TableCell>{order.date}</TableCell>
                            <TableCell>{order.items} items</TableCell>
                            <TableCell className="font-medium">${order.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              {order.status === "received" ? (
                                <Badge className="bg-green-100 text-green-800">Received</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{supplierData.length}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {supplierData.filter((supplier) => supplier.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">Currently active relationships</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Purchase Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${supplierData.reduce((sum, supplier) => sum + supplier.totalAmount, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Lifetime purchase value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Delivery Performance</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  supplierData.reduce((sum, supplier) => sum + supplier.onTimeDelivery, 0) / supplierData.length,
                )}
                %
              </div>
              <p className="text-xs text-muted-foreground">On-time delivery rate</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </POSLayout>
  )
}

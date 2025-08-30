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
import { Search, Plus, User, Phone, Mail, Eye, Edit, DollarSign, ShoppingBag, TrendingUp } from "lucide-react"

// Mock data for clients
const clientData = [
  {
    id: "1",
    name: "John Smith",
    type: "individual",
    phone: "+1 (555) 123-4567",
    email: "john.smith@email.com",
    accountNumber: "ACC-001",
    creditLimit: 1000.0,
    currentBalance: 250.0,
    status: "active",
    totalPurchases: 5420.0,
    lastPurchase: "2024-01-10",
    joinDate: "2023-06-15",
    address: "123 Main St, Downtown",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    type: "individual",
    phone: "+1 (555) 234-5678",
    email: "sarah.johnson@email.com",
    accountNumber: "ACC-002",
    creditLimit: 500.0,
    currentBalance: 0.0,
    status: "active",
    totalPurchases: 2180.0,
    lastPurchase: "2024-01-08",
    joinDate: "2023-08-22",
    address: "456 Oak Ave, Midtown",
  },
  {
    id: "3",
    name: "TechCorp Solutions",
    type: "business",
    phone: "+1 (555) 345-6789",
    email: "orders@techcorp.com",
    accountNumber: "ACC-003",
    creditLimit: 5000.0,
    currentBalance: 1200.0,
    status: "active",
    totalPurchases: 15680.0,
    lastPurchase: "2024-01-09",
    joinDate: "2023-03-10",
    address: "789 Business Blvd, Corporate District",
  },
  {
    id: "4",
    name: "Mike Davis",
    type: "individual",
    phone: "+1 (555) 456-7890",
    email: "mike.davis@email.com",
    accountNumber: "ACC-004",
    creditLimit: 750.0,
    currentBalance: 75.0,
    status: "suspended",
    totalPurchases: 890.0,
    lastPurchase: "2023-12-15",
    joinDate: "2023-11-05",
    address: "321 Pine St, Suburbs",
  },
]

const salesHistory = [
  { id: "SALE-001", date: "2024-01-10", amount: 145.99, items: 3, status: "completed" },
  { id: "SALE-002", date: "2024-01-08", amount: 89.5, items: 2, status: "completed" },
  { id: "SALE-003", date: "2024-01-05", amount: 234.75, items: 5, status: "completed" },
  { id: "SALE-004", date: "2024-01-02", amount: 67.25, items: 1, status: "refunded" },
]

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [clientModalOpen, setClientModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [newClient, setNewClient] = useState({
    name: "",
    type: "individual",
    phone: "",
    email: "",
    creditLimit: 0,
    address: "",
    notes: "",
  })

  const filteredClients = clientData.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || client.type === selectedType
    const matchesStatus = selectedStatus === "all" || client.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const badges = {
      active: <Badge className="bg-green-100 text-green-800">Active</Badge>,
      suspended: <Badge className="bg-red-100 text-red-800">Suspended</Badge>,
      inactive: <Badge variant="outline">Inactive</Badge>,
    }
    return badges[status as keyof typeof badges] || <Badge variant="outline">{status}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const badges = {
      individual: <Badge variant="outline">Individual</Badge>,
      business: <Badge className="bg-blue-100 text-blue-800">Business</Badge>,
    }
    return badges[type as keyof typeof badges] || <Badge variant="outline">{type}</Badge>
  }

  const selectedClientData = clientData.find((client) => client.id === selectedClient)

  return (
    <POSLayout currentPath="/clients">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Client Management</h1>
            <p className="text-muted-foreground">Manage customer information and track purchase history</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <User className="h-4 w-4 mr-2" />
              Export Clients
            </Button>
            <Dialog open={clientModalOpen} onOpenChange={setClientModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Client
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="client-name">Name</Label>
                    <Input
                      id="client-name"
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      placeholder="Client name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-type">Type</Label>
                    <Select
                      value={newClient.type}
                      onValueChange={(value) => setNewClient({ ...newClient, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client-phone">Phone</Label>
                      <Input
                        id="client-phone"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="client-email">Email</Label>
                      <Input
                        id="client-email"
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                        placeholder="client@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="credit-limit">Credit Limit</Label>
                    <Input
                      id="credit-limit"
                      type="number"
                      value={newClient.creditLimit}
                      onChange={(e) => setNewClient({ ...newClient, creditLimit: Number(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-address">Address</Label>
                    <Textarea
                      id="client-address"
                      value={newClient.address}
                      onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                      placeholder="Client address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-notes">Notes</Label>
                    <Textarea
                      id="client-notes"
                      value={newClient.notes}
                      onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                      placeholder="Additional notes"
                    />
                  </div>
                  <Button onClick={() => setClientModalOpen(false)} className="w-full">
                    Add Client
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
                    placeholder="Search clients..."
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
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Client Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Credit Limit</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Joined {new Date(client.joinDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(client.type)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{client.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{client.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{client.accountNumber}</Badge>
                    </TableCell>
                    <TableCell>${client.creditLimit.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={client.currentBalance > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                        ${client.currentBalance.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedClient(client.id)
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

        {/* Client Detail Modal */}
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Client Details - {selectedClientData?.name}</DialogTitle>
            </DialogHeader>
            {selectedClientData && (
              <div className="space-y-6">
                {/* Client Info */}
                <div className="grid grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedClientData.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedClientData.email}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">{selectedClientData.address}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Account Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Account:</span>
                        <Badge variant="outline">{selectedClientData.accountNumber}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Type:</span>
                        {getTypeBadge(selectedClientData.type)}
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        {getStatusBadge(selectedClientData.status)}
                      </div>
                      <div className="flex justify-between">
                        <span>Credit Limit:</span>
                        <span>${selectedClientData.creditLimit.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Purchase Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Purchases:</span>
                        <span className="font-medium">${selectedClientData.totalPurchases.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Balance:</span>
                        <span
                          className={
                            selectedClientData.currentBalance > 0 ? "text-red-600 font-medium" : "text-green-600"
                          }
                        >
                          ${selectedClientData.currentBalance.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Purchase:</span>
                        <span>{selectedClientData.lastPurchase}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sales History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Sales History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sale ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesHistory.map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell>
                              <Badge variant="outline">{sale.id}</Badge>
                            </TableCell>
                            <TableCell>{sale.date}</TableCell>
                            <TableCell>{sale.items} items</TableCell>
                            <TableCell className="font-medium">${sale.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              {sale.status === "completed" ? (
                                <Badge className="bg-green-100 text-green-800">Completed</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">Refunded</Badge>
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
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientData.length}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clientData.filter((client) => client.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">Currently active accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${clientData.reduce((sum, client) => sum + client.currentBalance, 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Total receivables</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${clientData.reduce((sum, client) => sum + client.totalPurchases, 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Lifetime client value</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </POSLayout>
  )
}

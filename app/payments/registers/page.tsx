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
import { Separator } from "@/components/ui/separator"
import {
  Search,
  DollarSign,
  User,
  Store,
  Play,
  Square,
  Pause,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react"

// Mock data for cash registers
const registerData = [
  {
    id: "REG-001",
    name: "Register #1",
    store: "Main Store - Downtown",
    cashier: "Jane Doe",
    status: "open",
    openingAmount: 200.0,
    currentAmount: 1450.75,
    openDate: "2024-01-10 08:00",
    closeDate: null,
    totalSales: 1250.75,
    cashSales: 650.25,
    cardSales: 400.5,
    mobileSales: 200.0,
    transactions: 28,
  },
  {
    id: "REG-002",
    name: "Register #2",
    store: "Main Store - Downtown",
    cashier: "Mike Wilson",
    status: "open",
    openingAmount: 150.0,
    currentAmount: 890.25,
    openDate: "2024-01-10 09:30",
    closeDate: null,
    totalSales: 740.25,
    cashSales: 320.75,
    cardSales: 289.5,
    mobileSales: 130.0,
    transactions: 18,
  },
  {
    id: "REG-003",
    name: "Register #3",
    store: "Branch Store - Mall",
    cashier: "Sarah Johnson",
    status: "closed",
    openingAmount: 100.0,
    currentAmount: 0.0,
    openDate: "2024-01-09 10:00",
    closeDate: "2024-01-09 22:00",
    totalSales: 2180.5,
    cashSales: 890.25,
    cardSales: 890.25,
    mobileSales: 400.0,
    transactions: 45,
  },
  {
    id: "REG-004",
    name: "Register #4",
    store: "Outlet Store - Airport",
    cashier: null,
    status: "suspended",
    openingAmount: 0.0,
    currentAmount: 0.0,
    openDate: null,
    closeDate: null,
    totalSales: 0.0,
    cashSales: 0.0,
    cardSales: 0.0,
    mobileSales: 0.0,
    transactions: 0,
  },
]

export default function RegistersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [openModalOpen, setOpenModalOpen] = useState(false)
  const [closeModalOpen, setCloseModalOpen] = useState(false)
  const [selectedRegister, setSelectedRegister] = useState<string | null>(null)
  const [openingAmount, setOpeningAmount] = useState(200)
  const [countedCash, setCountedCash] = useState(0)

  const filteredRegisters = registerData.filter((register) => {
    const matchesSearch =
      register.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      register.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (register.cashier && register.cashier.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = selectedStatus === "all" || register.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const badges = {
      open: <Badge className="bg-green-100 text-green-800">Open</Badge>,
      closed: <Badge className="bg-gray-100 text-gray-800">Closed</Badge>,
      suspended: <Badge className="bg-red-100 text-red-800">Suspended</Badge>,
    }
    return badges[status as keyof typeof badges] || <Badge variant="outline">{status}</Badge>
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "closed":
        return <Square className="h-4 w-4 text-gray-600" />
      case "suspended":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const selectedRegisterData = registerData.find((register) => register.id === selectedRegister)
  const variance = selectedRegisterData ? countedCash - selectedRegisterData.currentAmount : 0

  const openRegisters = registerData.filter((r) => r.status === "open")
  const totalSalesToday = registerData.reduce((sum, r) => sum + r.totalSales, 0)
  const totalCashToday = registerData.reduce((sum, r) => sum + r.cashSales, 0)

  return (
    <POSLayout currentPath="/payments/registers">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cash Registers</h1>
            <p className="text-muted-foreground">Manage cash register operations and track daily closures</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Daily Report
            </Button>
            <Dialog open={openModalOpen} onOpenChange={setOpenModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Open Register
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Open Cash Register</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="register-select">Select Register</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose register to open" />
                      </SelectTrigger>
                      <SelectContent>
                        {registerData
                          .filter((r) => r.status === "closed" || r.status === "suspended")
                          .map((register) => (
                            <SelectItem key={register.id} value={register.id}>
                              {register.name} - {register.store}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="opening-amount">Opening Cash Amount</Label>
                    <Input
                      id="opening-amount"
                      type="number"
                      step="0.01"
                      value={openingAmount}
                      onChange={(e) => setOpeningAmount(Number(e.target.value))}
                      placeholder="200.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cashier">Cashier</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cashier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jane">Jane Doe</SelectItem>
                        <SelectItem value="mike">Mike Wilson</SelectItem>
                        <SelectItem value="sarah">Sarah Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => setOpenModalOpen(false)} className="w-full">
                    Open Register
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Registers</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{openRegisters.length}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSalesToday.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Across all registers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCashToday.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Cash transactions only</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registerData.reduce((sum, r) => sum + r.transactions, 0)}</div>
              <p className="text-xs text-muted-foreground">Today's transaction count</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search registers..."
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
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Registers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Register Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Register</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Cashier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Opening Amount</TableHead>
                  <TableHead>Current Amount</TableHead>
                  <TableHead>Sales Today</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegisters.map((register) => (
                  <TableRow key={register.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(register.status)}
                        <span className="font-medium">{register.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Store className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{register.store}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {register.cashier ? (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{register.cashier}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(register.status)}</TableCell>
                    <TableCell>${register.openingAmount.toFixed(2)}</TableCell>
                    <TableCell className="font-medium">${register.currentAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">${register.totalSales.toFixed(2)}</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Cash: ${register.cashSales.toFixed(2)}</div>
                          <div>Card: ${register.cardSales.toFixed(2)}</div>
                          <div>Mobile: ${register.mobileSales.toFixed(2)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{register.transactions}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {register.status === "open" && (
                          <Dialog open={closeModalOpen} onOpenChange={setCloseModalOpen}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => setSelectedRegister(register.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <Square className="h-3 w-3 mr-1" />
                                Close
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Close Register - {register.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg">System Totals</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <div className="flex justify-between">
                                        <span>Opening Amount:</span>
                                        <span>${register.openingAmount.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Cash Sales:</span>
                                        <span>${register.cashSales.toFixed(2)}</span>
                                      </div>
                                      <Separator />
                                      <div className="flex justify-between font-medium">
                                        <span>Expected Cash:</span>
                                        <span>${register.currentAmount.toFixed(2)}</span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg">Cash Count</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <div>
                                        <Label htmlFor="counted-cash">Counted Cash</Label>
                                        <Input
                                          id="counted-cash"
                                          type="number"
                                          step="0.01"
                                          value={countedCash}
                                          onChange={(e) => setCountedCash(Number(e.target.value))}
                                          placeholder="0.00"
                                        />
                                      </div>
                                      <Separator />
                                      <div className="flex justify-between">
                                        <span>Variance:</span>
                                        <span
                                          className={
                                            variance === 0
                                              ? "text-green-600"
                                              : variance > 0
                                                ? "text-blue-600"
                                                : "text-red-600"
                                          }
                                        >
                                          {variance > 0 ? "+" : ""}${variance.toFixed(2)}
                                        </span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Total Sales</p>
                                    <p className="text-lg font-medium">${register.totalSales.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Transactions</p>
                                    <p className="text-lg font-medium">{register.transactions}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Card/Mobile</p>
                                    <p className="text-lg font-medium">
                                      ${(register.cardSales + register.mobileSales).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button variant="outline" onClick={() => setCloseModalOpen(false)} className="flex-1">
                                    Cancel
                                  </Button>
                                  <Button onClick={() => setCloseModalOpen(false)} className="flex-1">
                                    Close Register
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        {register.status === "open" && (
                          <Button size="sm" variant="outline">
                            <Pause className="h-3 w-3" />
                          </Button>
                        )}
                        {register.status === "closed" && (
                          <Button size="sm" variant="outline">
                            <FileText className="h-3 w-3" />
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
      </div>
    </POSLayout>
  )
}

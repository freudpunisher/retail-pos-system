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
  Plus,
  CreditCard,
  DollarSign,
  Smartphone,
  Calendar,
  User,
  Receipt,
  Filter,
  Download,
  TrendingUp,
} from "lucide-react"

// Mock data for payments
const paymentData = [
  {
    id: "PAY-001",
    invoiceNumber: "SALE-2024-156",
    customer: "John Smith",
    mode: "cash",
    amount: 145.99,
    status: "completed",
    date: "2024-01-10 14:30",
    reference: "CASH-001",
    cashier: "Jane Doe",
    register: "Register #1",
  },
  {
    id: "PAY-002",
    invoiceNumber: "SALE-2024-157",
    customer: "Sarah Johnson",
    mode: "card",
    amount: 89.5,
    status: "completed",
    date: "2024-01-10 15:45",
    reference: "CARD-4532",
    cashier: "Mike Wilson",
    register: "Register #2",
  },
  {
    id: "PAY-003",
    invoiceNumber: "SALE-2024-158",
    customer: "TechCorp Solutions",
    mode: "mobile",
    amount: 234.75,
    status: "pending",
    date: "2024-01-10 16:20",
    reference: "MOBILE-789",
    cashier: "Jane Doe",
    register: "Register #1",
  },
  {
    id: "PAY-004",
    invoiceNumber: "SALE-2024-159",
    customer: "Mike Davis",
    mode: "cash",
    amount: 67.25,
    status: "failed",
    date: "2024-01-10 17:10",
    reference: "CASH-002",
    cashier: "Mike Wilson",
    register: "Register #2",
  },
  {
    id: "PAY-005",
    invoiceNumber: "SALE-2024-160",
    customer: "Lisa Brown",
    mode: "mixed",
    amount: 312.0,
    status: "completed",
    date: "2024-01-10 18:00",
    reference: "MIX-001",
    cashier: "Jane Doe",
    register: "Register #1",
  },
]

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMode, setSelectedMode] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [newPayment, setNewPayment] = useState({
    invoiceNumber: "",
    customer: "",
    mode: "cash",
    amount: 0,
    reference: "",
    notes: "",
  })

  const filteredPayments = paymentData.filter((payment) => {
    const matchesSearch =
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMode = selectedMode === "all" || payment.mode === selectedMode
    const matchesStatus = selectedStatus === "all" || payment.status === selectedStatus
    return matchesSearch && matchesMode && matchesStatus
  })

  const getPaymentIcon = (mode: string) => {
    switch (mode) {
      case "cash":
        return <DollarSign className="h-4 w-4 text-green-600" />
      case "card":
        return <CreditCard className="h-4 w-4 text-blue-600" />
      case "mobile":
        return <Smartphone className="h-4 w-4 text-purple-600" />
      case "mixed":
        return <Receipt className="h-4 w-4 text-orange-600" />
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: <Badge className="bg-green-100 text-green-800">Completed</Badge>,
      pending: <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>,
      failed: <Badge className="bg-red-100 text-red-800">Failed</Badge>,
      refunded: <Badge className="bg-gray-100 text-gray-800">Refunded</Badge>,
    }
    return badges[status as keyof typeof badges] || <Badge variant="outline">{status}</Badge>
  }

  const getModeBadge = (mode: string) => {
    const badges = {
      cash: <Badge className="bg-green-100 text-green-800">Cash</Badge>,
      card: <Badge className="bg-blue-100 text-blue-800">Card</Badge>,
      mobile: <Badge className="bg-purple-100 text-purple-800">Mobile</Badge>,
      mixed: <Badge className="bg-orange-100 text-orange-800">Mixed</Badge>,
    }
    return badges[mode as keyof typeof badges] || <Badge variant="outline">{mode}</Badge>
  }

  const totalPayments = paymentData.reduce((sum, payment) => sum + payment.amount, 0)
  const completedPayments = paymentData.filter((payment) => payment.status === "completed")
  const pendingPayments = paymentData.filter((payment) => payment.status === "pending")

  return (
    <POSLayout currentPath="/payments">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payment Management</h1>
            <p className="text-muted-foreground">Track and manage all payment transactions</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Payments
            </Button>
            <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="invoice-number">Invoice Number</Label>
                    <Input
                      id="invoice-number"
                      value={newPayment.invoiceNumber}
                      onChange={(e) => setNewPayment({ ...newPayment, invoiceNumber: e.target.value })}
                      placeholder="SALE-2024-XXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer">Customer</Label>
                    <Input
                      id="customer"
                      value={newPayment.customer}
                      onChange={(e) => setNewPayment({ ...newPayment, customer: e.target.value })}
                      placeholder="Customer name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payment-mode">Payment Mode</Label>
                      <Select
                        value={newPayment.mode}
                        onValueChange={(value) => setNewPayment({ ...newPayment, mode: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="mobile">Mobile</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reference">Reference</Label>
                    <Input
                      id="reference"
                      value={newPayment.reference}
                      onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
                      placeholder="Payment reference"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newPayment.notes}
                      onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                      placeholder="Additional notes"
                    />
                  </div>
                  <Button onClick={() => setPaymentModalOpen(false)} className="w-full">
                    Add Payment
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
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPayments.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +15% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedPayments.length}</div>
              <p className="text-xs text-muted-foreground">
                ${completedPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingPayments.length}</div>
              <p className="text-xs text-muted-foreground">
                ${pendingPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {paymentData.filter((p) => p.mode === "cash" && p.status === "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">
                $
                {paymentData
                  .filter((p) => p.mode === "cash" && p.status === "completed")
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toFixed(2)}{" "}
                total
              </p>
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
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedMode} onValueChange={setSelectedMode}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Modes</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Date Range
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Cashier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{payment.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.invoiceNumber}</Badge>
                    </TableCell>
                    <TableCell>{payment.customer}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getPaymentIcon(payment.mode)}
                        {getModeBadge(payment.mode)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{payment.date}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{payment.cashier}</span>
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

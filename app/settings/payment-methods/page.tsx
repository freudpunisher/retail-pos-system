"use client"

import { useState } from "react"
import { POSLayout } from "@/components/pos-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Plus, Search, Edit, Trash2, CreditCard, Banknote, Smartphone } from "lucide-react"

const mockPaymentMethods = [
  {
    id: 1,
    name: "Cash",
    type: "Cash",
    enabled: true,
    processingFee: 0,
    description: "Physical cash payments",
  },
  {
    id: 2,
    name: "Credit Card",
    type: "Card",
    enabled: true,
    processingFee: 2.9,
    description: "Visa, MasterCard, American Express",
  },
  {
    id: 3,
    name: "Debit Card",
    type: "Card",
    enabled: true,
    processingFee: 1.5,
    description: "Bank debit cards",
  },
  {
    id: 4,
    name: "Mobile Payment",
    type: "Digital",
    enabled: false,
    processingFee: 2.5,
    description: "Apple Pay, Google Pay, Samsung Pay",
  },
]

export default function PaymentMethodsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddMethodOpen, setIsAddMethodOpen] = useState(false)

  const filteredMethods = mockPaymentMethods.filter(
    (method) =>
      method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      method.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <POSLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payment Methods</h1>
            <p className="text-muted-foreground">Configure accepted payment methods and processing fees</p>
          </div>
          <Dialog open={isAddMethodOpen} onOpenChange={setIsAddMethodOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
                <DialogDescription>Configure a new payment method.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="methodName">Method Name</Label>
                  <Input id="methodName" placeholder="Enter payment method name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="processingFee">Processing Fee (%)</Label>
                  <Input id="processingFee" type="number" step="0.1" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder="Enter description" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddMethodOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddMethodOpen(false)}>Add Method</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">Available methods</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Methods</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Currently enabled</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing Fee</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.6%</div>
              <p className="text-xs text-muted-foreground">Across all methods</p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods Management */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Configuration</CardTitle>
            <CardDescription>Manage accepted payment methods and their settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payment methods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Processing Fee</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium">{method.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{method.type}</Badge>
                    </TableCell>
                    <TableCell>{method.processingFee}%</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{method.description}</TableCell>
                    <TableCell>
                      <Switch checked={method.enabled} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
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
      </div>
    </POSLayout>
  )
}

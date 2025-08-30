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
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Trash2, Store, MapPin, Users } from "lucide-react"

const mockStores = [
  {
    id: 1,
    name: "Main Store - Downtown",
    address: "123 Main St, Downtown, NY 10001",
    manager: "John Doe",
    phone: "+1 (555) 123-4567",
    status: "Active",
    employees: 8,
  },
  {
    id: 2,
    name: "Branch Store - Mall",
    address: "456 Mall Ave, Shopping Center, NY 10002",
    manager: "Jane Smith",
    phone: "+1 (555) 234-5678",
    status: "Active",
    employees: 6,
  },
  {
    id: 3,
    name: "Outlet Store - Airport",
    address: "789 Airport Rd, Terminal 2, NY 10003",
    manager: "Mike Johnson",
    phone: "+1 (555) 345-6789",
    status: "Inactive",
    employees: 4,
  },
]

export default function StoresPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false)

  const filteredStores = mockStores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.manager.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <POSLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Store Management</h1>
            <p className="text-muted-foreground">Manage store locations and details</p>
          </div>
          <Dialog open={isAddStoreOpen} onOpenChange={setIsAddStoreOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Store
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Store</DialogTitle>
                <DialogDescription>Create a new store location.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input id="storeName" placeholder="Enter store name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" placeholder="Enter full address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager">Manager</Label>
                  <Input id="manager" placeholder="Enter manager name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="Enter phone number" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddStoreOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddStoreOpen(false)}>Create Store</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Across 2 cities</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">67% operational</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">Across all stores</p>
            </CardContent>
          </Card>
        </div>

        {/* Store Management */}
        <Card>
          <CardHeader>
            <CardTitle>Store Locations</CardTitle>
            <CardDescription>View and manage all store locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{store.address}</TableCell>
                    <TableCell>{store.manager}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{store.phone}</TableCell>
                    <TableCell>{store.employees}</TableCell>
                    <TableCell>
                      <Badge variant={store.status === "Active" ? "default" : "secondary"}>{store.status}</Badge>
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

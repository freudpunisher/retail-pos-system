
"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { POSLayout } from "@/components/pos-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Search, Edit, Trash2, Store, MapPin, Loader2, AlertTriangle } from "lucide-react"
import { usePointsVente } from "@/hooks/usePointsVente"
import { useUsers } from "@/hooks/useUsers"
import { PointVenteResponse, CreatePointVenteRequest } from "@/types/pointVenteType"
import { User } from "@/types/user"

interface PointVenteFormData {
  nom: string
  adresse: string
  telephone: string
  is_active: boolean
  responsable: string
}

export default function StoresPage() {
  const {
    pointsVente,
    loading: pointsVenteLoading,
    error: pointsVenteError,
    fetchPointsVente,
    createPointVente,
    updatePointVente,
    deletePointVente,
    togglePointVenteActive,
  } = usePointsVente()
  const { users, loading: usersLoading, error: usersError, fetchUsers } = useUsers()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false)
  const [isEditStoreOpen, setIsEditStoreOpen] = useState(false)
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null)

  const form = useForm<PointVenteFormData>({
    defaultValues: {
      nom: "",
      adresse: "",
      telephone: "",
      is_active: true,
      responsable: "",
    },
  })

  useEffect(() => {
    fetchPointsVente()
    fetchUsers()
  }, [fetchPointsVente, fetchUsers])

  const filteredStores = pointsVente.filter((store) => {
    const responsableUser = users?.find((user) => user.id === store.responsable)
    const responsableName = responsableUser ? responsableUser.username : "Unknown"
    return (
      store.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
      responsableName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const onSubmit = async (data: PointVenteFormData) => {
    try {
      if (editingStoreId) {
        await updatePointVente(editingStoreId, data)
        setEditingStoreId(null)
        setIsEditStoreOpen(false)
      } else {
        await createPointVente(data)
        setIsAddStoreOpen(false)
      }
      form.reset()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditStore = (store: PointVenteResponse) => {
    setEditingStoreId(store.id)
    form.reset({
      nom: store.nom,
      adresse: store.adresse,
      telephone: store.telephone,
      is_active: store.is_active,
      responsable: store.responsable,
    })
    setIsEditStoreOpen(true)
  }

  const handleDeleteStore = async (id: string) => {
    try {
      await deletePointVente(id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await togglePointVenteActive(id, !isActive)
    } catch (err) {
      console.error(err)
    }
  }

  const totalStores = pointsVente.length
  const activeStores = pointsVente.filter((store) => store.is_active).length

  return (
    <POSLayout>
      <TooltipProvider>
        <div className="space-y-8 p-6 bg-gradient-to-b from-background to-background/90 min-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Store Management</h1>
              <p className="text-lg text-muted-foreground mt-1">Manage store locations and details</p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="border-primary/20 hover:bg-primary/10 transition-all duration-200"
                onClick={() => {
                  fetchPointsVente()
                  fetchUsers()
                }}
                disabled={pointsVenteLoading || usersLoading}
              >
                {pointsVenteLoading || usersLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Refresh Data
              </Button>
              <Dialog open={isAddStoreOpen} onOpenChange={setIsAddStoreOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 transition-colors">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Store
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm rounded-lg shadow-xl">
                  <DialogHeader>
                    <DialogTitle>Add New Store</DialogTitle>
                    <DialogDescription>Create a new store location.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nom" className="text-sm font-medium">Store Name</Label>
                      <Input
                        id="nom"
                        {...form.register("nom", { required: "Store name is required" })}
                        placeholder="Enter store name"
                        className="border-muted focus:ring-primary"
                      />
                      {form.formState.errors.nom && (
                        <p className="text-sm text-destructive">{form.formState.errors.nom.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adresse" className="text-sm font-medium">Address</Label>
                      <Textarea
                        id="adresse"
                        {...form.register("adresse", { required: "Address is required" })}
                        placeholder="Enter full address"
                        className="border-muted focus:ring-primary"
                      />
                      {form.formState.errors.adresse && (
                        <p className="text-sm text-destructive">{form.formState.errors.adresse.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telephone" className="text-sm font-medium">Phone</Label>
                      <Input
                        id="telephone"
                        {...form.register("telephone", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^\+?[\d\s()-]{7,15}$/,
                            message: "Invalid phone number format",
                          },
                        })}
                        placeholder="Enter phone number"
                        className="border-muted focus:ring-primary"
                      />
                      {form.formState.errors.telephone && (
                        <p className="text-sm text-destructive">{form.formState.errors.telephone.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="responsable" className="text-sm font-medium">Manager</Label>
                      <Controller
                        name="responsable"
                        control={form.control}
                        rules={{ required: "Manager is required" }}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="border-muted">
                              <SelectValue placeholder="Select manager" />
                            </SelectTrigger>
                            <SelectContent>
                              {users?.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.username} ({user.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {form.formState.errors.responsable && (
                        <p className="text-sm text-destructive">{form.formState.errors.responsable.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="is_active" className="text-sm font-medium">Status</Label>
                      <Controller
                        name="is_active"
                        control={form.control}
                        render={({ field }) => (
                          <Select
                            onValueChange={(value) => field.onChange(value === "true")}
                            value={field.value.toString()}
                          >
                            <SelectTrigger className="border-muted">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Active</SelectItem>
                              <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setIsAddStoreOpen(false)}
                        className="border-muted hover:bg-muted"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={pointsVenteLoading} className="bg-primary hover:bg-primary/90">
                        {pointsVenteLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        {pointsVenteLoading ? "Creating..." : "Create Store"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Total Stores</CardTitle>
                <Store className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-800 dark:text-blue-200 animate-pulse">
                  {pointsVenteLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalStores}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Across all locations</p>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/10 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">Active Stores</CardTitle>
                <MapPin className="h-5 w-5 text-green-500 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800 dark:text-green-200 animate-pulse">
                  {pointsVenteLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : activeStores}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {totalStores > 0 ? `${((activeStores / totalStores) * 100).toFixed(0)}% operational` : "0% operational"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Store Management */}
          <Card className="bg-background/95 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-foreground">Store Locations</CardTitle>
              <p className="text-sm text-muted-foreground">View and manage all store locations</p>
            </CardHeader>
            <CardContent>
              {(pointsVenteError || usersError) && (
                <p className="text-sm text-destructive mb-4 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {pointsVenteError || usersError}
                </p>
              )}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search stores by name, address, or manager..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-muted focus:ring-primary rounded-lg"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="text-foreground font-semibold">Store Name</TableHead>
                    <TableHead className="text-foreground font-semibold">Address</TableHead>
                    <TableHead className="text-foreground font-semibold">Manager</TableHead>
                    <TableHead className="text-foreground font-semibold">Phone</TableHead>
                    <TableHead className="text-foreground font-semibold">Status</TableHead>
                    <TableHead className="text-foreground font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pointsVenteLoading || usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStores.map((store) => {
                      const responsableUser = users?.find((user) => user.id === store.responsable)
                      return (
                        <TableRow key={store.id} className="hover:bg-muted/20 transition-colors">
                          <TableCell className="font-medium text-foreground">{store.nom}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{store.adresse}</TableCell>
                          <TableCell>{responsableUser ? responsableUser.username : "Unknown"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{store.telephone}</TableCell>
                          <TableCell>
                            <Badge
                              variant={store.is_active ? "default" : "secondary"}
                              className={store.is_active ? "bg-green-500" : "bg-gray-500"}
                            >
                              {store.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditStore(store)}
                                    className="hover:bg-primary/10"
                                  >
                                    <Edit className="h-4 w-4 text-primary" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit Store</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteStore(store.id)}
                                    className="hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete Store</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleActive(store.id, store.is_active)}
                                    className="hover:bg-primary/10"
                                  >
                                    <Store className="h-4 w-4 text-primary" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{store.is_active ? "Deactivate" : "Activate"} Store</TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={isEditStoreOpen} onOpenChange={setIsEditStoreOpen}>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm rounded-lg shadow-xl">
              <DialogHeader>
                <DialogTitle>Edit Store</DialogTitle>
                <DialogDescription>Update store location details.</DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-sm font-medium">Store Name</Label>
                  <Input
                    id="nom"
                    {...form.register("nom", { required: "Store name is required" })}
                    placeholder="Enter store name"
                    className="border-muted focus:ring-primary"
                  />
                  {form.formState.errors.nom && (
                    <p className="text-sm text-destructive">{form.formState.errors.nom.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adresse" className="text-sm font-medium">Address</Label>
                  <Textarea
                    id="adresse"
                    {...form.register("adresse", { required: "Address is required" })}
                    placeholder="Enter full address"
                    className="border-muted focus:ring-primary"
                  />
                  {form.formState.errors.adresse && (
                    <p className="text-sm text-destructive">{form.formState.errors.adresse.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone" className="text-sm font-medium">Phone</Label>
                  <Input
                    id="telephone"
                    {...form.register("telephone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^\+?[\d\s()-]{7,15}$/,
                        message: "Invalid phone number format",
                      },
                    })}
                    placeholder="Enter phone number"
                    className="border-muted focus:ring-primary"
                  />
                  {form.formState.errors.telephone && (
                    <p className="text-sm text-destructive">{form.formState.errors.telephone.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsable" className="text-sm font-medium">Manager</Label>
                  <Controller
                    name="responsable"
                    control={form.control}
                    rules={{ required: "Manager is required" }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="border-muted">
                          <SelectValue placeholder="Select manager" />
                        </SelectTrigger>
                        <SelectContent>
                          {users?.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.username} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.responsable && (
                    <p className="text-sm text-destructive">{form.formState.errors.responsable.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="is_active" className="text-sm font-medium">Status</Label>
                  <Controller
                    name="is_active"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => field.onChange(value === "true")}
                        value={field.value.toString()}
                      >
                        <SelectTrigger className="border-muted">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsEditStoreOpen(false)}
                    className="border-muted hover:bg-muted"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={pointsVenteLoading} className="bg-primary hover:bg-primary/90">
                    {pointsVenteLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Edit className="h-4 w-4 mr-2" />
                    )}
                    {pointsVenteLoading ? "Updating..." : "Update Store"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </POSLayout>
  )
}

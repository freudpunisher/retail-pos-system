"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { POSLayout } from "@/components/pos-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Search,
  Plus,
  Factory,
  Phone,
  Mail,
  Eye,
  Edit,
  Trash2,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { useFournisseurs } from "@/hooks/use-fournisseur"
import { FournisseurResponse, CreateFournisseurRequest } from "@/types/fournisseur"

interface FournisseurFormData {
  nom: string
  contact_nom: string
  telephone: string
  email: string
  conditions_paiement: string
  delai_livraison: number
  adresse: string
  is_active: boolean
}

export default function SuppliersPage() {
  const {
    fournisseurs,
    loading,
    error,
    fetchFournisseurs,
    createFournisseur,
    updateFournisseur,
    deleteFournisseur,
    toggleFournisseurActive,
  } = useFournisseurs()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null)

  const form = useForm<FournisseurFormData>({
    defaultValues: {
      nom: "",
      contact_nom: "",
      telephone: "",
      email: "",
      conditions_paiement: "Net 30",
      delai_livraison: 7,
      adresse: "",
      is_active: true,
    },
  })

  useEffect(() => {
    fetchFournisseurs()
  }, [fetchFournisseurs])

  const filteredSuppliers = fournisseurs.filter((supplier: FournisseurResponse) => {
    const matchesSearch =
      supplier.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && supplier.is_active) ||
      (selectedStatus === "inactive" && !supplier.is_active)
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (isActive: boolean) => (
    <Badge
      variant={isActive ? "default" : "secondary"}
      className={isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"}
    >
      {isActive ? "Actif" : "Inactif"}
    </Badge>
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const selectedSupplierData = fournisseurs.find((supplier) => supplier.id === selectedSupplierId)

  const onSubmit = async (data: FournisseurFormData) => {
    try {
      if (editingSupplierId) {
        await updateFournisseur(editingSupplierId, data)
        setEditingSupplierId(null)
        setIsEditModalOpen(false)
      } else {
        await createFournisseur(data)
        setIsAddModalOpen(false)
      }
      form.reset()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditSupplier = (supplier: FournisseurResponse) => {
    setEditingSupplierId(supplier.id)
    form.reset({
      nom: supplier.nom,
      contact_nom: supplier.contact_nom,
      telephone: supplier.telephone,
      email: supplier.email,
      conditions_paiement: supplier.conditions_paiement,
      delai_livraison: supplier.delai_livraison,
      adresse: supplier.adresse,
      is_active: supplier.is_active,
    })
    setIsEditModalOpen(true)
  }

  const handleDeleteSupplier = async (id: string) => {
    try {
      await deleteFournisseur(id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await toggleFournisseurActive(id, !isActive)
    } catch (err) {
      console.error(err)
    }
  }

  const totalSuppliers = fournisseurs.length
  const activeSuppliers = fournisseurs.filter((supplier) => supplier.is_active).length
  const averageDeliveryTime =
    fournisseurs.length > 0
      ? Math.round(
          fournisseurs.reduce((sum, supplier) => sum + supplier.delai_livraison, 0) / fournisseurs.length
        )
      : 0

  if (loading) {
    return (
      <POSLayout currentPath="/suppliers">
        <div className="flex items-center justify-center h-96 bg-background/95 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg text-foreground">Chargement des fournisseurs...</span>
        </div>
      </POSLayout>
    )
  }

  if (error) {
    return (
      <POSLayout currentPath="/suppliers">
        <div className="flex items-center justify-center h-96 bg-background/95 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <p className="text-destructive flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Erreur: {error}
            </p>
            <Button
              onClick={() => fetchFournisseurs()}
              className="bg-primary hover:bg-primary/90"
            >
              Réessayer
            </Button>
          </div>
          </div>
        </POSLayout>
      )
    
  }

  return (
    <POSLayout currentPath="/suppliers">
      <TooltipProvider>
        <div className="space-y-8 p-6 bg-gradient-to-b from-background to-background/90 min-h-screen">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
                Gestion des Fournisseurs
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                Gérer les relations fournisseurs et suivre les performances
              </p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="border-primary/20 hover:bg-primary/10 transition-all duration-200"
                onClick={() => fetchFournisseurs()}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Rafraîchir
              </Button>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 transition-colors">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Fournisseur
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm rounded-lg shadow-xl">
                  <DialogHeader>
                    <DialogTitle>Ajouter un Nouveau Fournisseur</DialogTitle>
                    <DialogDescription>Créer un nouveau fournisseur.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nom" className="text-sm font-medium">Nom de l'entreprise</Label>
                      <Input
                        id="nom"
                        {...form.register("nom", { required: "Nom de l'entreprise est requis" })}
                        placeholder="Nom de l'entreprise"
                        className="border-muted focus:ring-primary"
                      />
                      {form.formState.errors.nom && (
                        <p className="text-sm text-destructive">{form.formState.errors.nom.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_nom" className="text-sm font-medium">Personne de contact</Label>
                      <Input
                        id="contact_nom"
                        {...form.register("contact_nom", { required: "Nom du contact est requis" })}
                        placeholder="Nom du contact"
                        className="border-muted focus:ring-primary"
                      />
                      {form.formState.errors.contact_nom && (
                        <p className="text-sm text-destructive">{form.formState.errors.contact_nom.message}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="telephone" className="text-sm font-medium">Téléphone</Label>
                        <Input
                          id="telephone"
                          {...form.register("telephone", {
                            required: "Téléphone est requis",
                            pattern: {
                              value: /^\+?[\d\s()-]{7,15}$/,
                              message: "Format de téléphone invalide",
                            },
                          })}
                          placeholder="+257 XX XX XX XX"
                          className="border-muted focus:ring-primary"
                        />
                        {form.formState.errors.telephone && (
                          <p className="text-sm text-destructive">{form.formState.errors.telephone.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          {...form.register("email", {
                            required: "Email est requis",
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: "Format d'email invalide",
                            },
                          })}
                          placeholder="fournisseur@email.com"
                          className="border-muted focus:ring-primary"
                        />
                        {form.formState.errors.email && (
                          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="conditions_paiement" className="text-sm font-medium">Conditions de paiement</Label>
                        <Controller
                          name="conditions_paiement"
                          control={form.control}
                          rules={{ required: "Conditions de paiement sont requises" }}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="border-muted">
                                <SelectValue placeholder="Sélectionner les conditions" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Net 15">Net 15</SelectItem>
                                <SelectItem value="Net 30">Net 30</SelectItem>
                                <SelectItem value="Net 45">Net 45</SelectItem>
                                <SelectItem value="Net 60">Net 60</SelectItem>
                                <SelectItem value="COD">Paiement à la livraison</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {form.formState.errors.conditions_paiement && (
                          <p className="text-sm text-destructive">{form.formState.errors.conditions_paiement.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delai_livraison" className="text-sm font-medium">Délai de livraison (jours)</Label>
                        <Input
                          id="delai_livraison"
                          type="number"
                          {...form.register("delai_livraison", {
                            required: "Délai de livraison est requis",
                            min: { value: 1, message: "Délai doit être au moins 1 jour" },
                          })}
                          placeholder="7"
                          className="border-muted focus:ring-primary"
                        />
                        {form.formState.errors.delai_livraison && (
                          <p className="text-sm text-destructive">{form.formState.errors.delai_livraison.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adresse" className="text-sm font-medium">Adresse</Label>
                      <Textarea
                        id="adresse"
                        {...form.register("adresse", { required: "Adresse est requise" })}
                        placeholder="Adresse du fournisseur"
                        className="border-muted focus:ring-primary"
                      />
                      {form.formState.errors.adresse && (
                        <p className="text-sm text-destructive">{form.formState.errors.adresse.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="is_active" className="text-sm font-medium">Statut</Label>
                      <Controller
                        name="is_active"
                        control={form.control}
                        render={({ field }) => (
                          <Select
                            onValueChange={(value) => field.onChange(value === "true")}
                            value={field.value.toString()}
                          >
                            <SelectTrigger className="border-muted">
                              <SelectValue placeholder="Sélectionner le statut" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Actif</SelectItem>
                              <SelectItem value="false">Inactif</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="border-muted hover:bg-muted"
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        {loading ? "Création..." : "Ajouter Fournisseur"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters */}
          <Card className="bg-background/95 backdrop-blur-sm shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher des fournisseurs par nom, contact ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-muted focus:ring-primary rounded-lg"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-48 border-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Total Fournisseurs</CardTitle>
                <Factory className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-800 dark:text-blue-200 animate-pulse">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalSuppliers}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Fournisseurs enregistrés</p>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/10 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">Fournisseurs Actifs</CardTitle>
                <Factory className="h-5 w-5 text-green-500 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800 dark:text-green-200 animate-pulse">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : activeSuppliers}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Relations actuellement actives</p>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-900/10 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">Délai Moyen</CardTitle>
                <Clock className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-800 dark:text-yellow-200 animate-pulse">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${averageDeliveryTime} jours`}
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Délai moyen de livraison</p>
              </CardContent>
            </Card>
          </div>

          {/* Suppliers Table */}
          <Card className="bg-background/95 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-foreground">Répertoire des Fournisseurs</CardTitle>
              <p className="text-sm text-muted-foreground">Gérer les fournisseurs et leurs détails</p>
            </CardHeader>
            <CardContent>
              {error && (
                <p className="text-sm text-destructive mb-4 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {error}
                </p>
              )}
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="text-foreground font-semibold">Entreprise</TableHead>
                    <TableHead className="text-foreground font-semibold">Contact</TableHead>
                    <TableHead className="text-foreground font-semibold">Conditions de paiement</TableHead>
                    <TableHead className="text-foreground font-semibold">Délai de livraison</TableHead>
                    <TableHead className="text-foreground font-semibold">Statut</TableHead>
                    <TableHead className="text-foreground font-semibold">Date de création</TableHead>
                    <TableHead className="text-foreground font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Factory className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">{supplier.nom}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{supplier.contact_nom}</p>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span>{supplier.telephone}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span>{supplier.email}</span>
                              </div>
                            </div>
                            </div>
                          </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-primary/20">{supplier.conditions_paiement}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{supplier.delai_livraison} jours</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(supplier.is_active)}</TableCell>
                        <TableCell>{formatDate(supplier.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedSupplierId(supplier.id)
                                    setIsDetailModalOpen(true)
                                  }}
                                  className="hover:bg-primary/10"
                                >
                                  <Eye className="h-3 w-3 text-primary" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Voir les détails</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditSupplier(supplier)}
                                  className="hover:bg-primary/10"
                                >
                                  <Edit className="h-3 w-3 text-primary" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Modifier Fournisseur</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteSupplier(supplier.id)}
                                  className="hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Supprimer Fournisseur</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleToggleActive(supplier.id, supplier.is_active)}
                                  className="hover:bg-primary/10"
                                >
                                  <Factory className="h-3 w-3 text-primary" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{supplier.is_active ? "Désactiver" : "Activer"} Fournisseur</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit Supplier Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm rounded-lg shadow-xl">
              <DialogHeader>
                <DialogTitle>Modifier Fournisseur</DialogTitle>
                <DialogDescription>Mettre à jour les détails du fournisseur.</DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-sm font-medium">Nom de l'entreprise</Label>
                  <Input
                    id="nom"
                    {...form.register("nom", { required: "Nom de l'entreprise est requis" })}
                    placeholder="Nom de l'entreprise"
                    className="border-muted focus:ring-primary"
                  />
                  {form.formState.errors.nom && (
                    <p className="text-sm text-destructive">{form.formState.errors.nom.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_nom" className="text-sm font-medium">Personne de contact</Label>
                  <Input
                    id="contact_nom"
                    {...form.register("contact_nom", { required: "Nom du contact est requis" })}
                    placeholder="Nom du contact"
                    className="border-muted focus:ring-primary"
                  />
                  {form.formState.errors.contact_nom && (
                    <p className="text-sm text-destructive">{form.formState.errors.contact_nom.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telephone" className="text-sm font-medium">Téléphone</Label>
                    <Input
                      id="telephone"
                      {...form.register("telephone", {
                        required: "Téléphone est requis",
                        pattern: {
                          value: /^\+?[\d\s()-]{7,15}$/,
                          message: "Format de téléphone invalide",
                        },
                      })}
                      placeholder="+257 XX XX XX XX"
                      className="border-muted focus:ring-primary"
                    />
                    {form.formState.errors.telephone && (
                      <p className="text-sm text-destructive">{form.formState.errors.telephone.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email", {
                        required: "Email est requis",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Format d'email invalide",
                        },
                      })}
                      placeholder="fournisseur@email.com"
                      className="border-muted focus:ring-primary"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="conditions_paiement" className="text-sm font-medium">Conditions de paiement</Label>
                    <Controller
                      name="conditions_paiement"
                      control={form.control}
                      rules={{ required: "Conditions de paiement sont requises" }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="border-muted">
                            <SelectValue placeholder="Sélectionner les conditions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Net 15">Net 15</SelectItem>
                            <SelectItem value="Net 30">Net 30</SelectItem>
                            <SelectItem value="Net 45">Net 45</SelectItem>
                            <SelectItem value="Net 60">Net 60</SelectItem>
                            <SelectItem value="COD">Paiement à la livraison</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {form.formState.errors.conditions_paiement && (
                      <p className="text-sm text-destructive">{form.formState.errors.conditions_paiement.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delai_livraison" className="text-sm font-medium">Délai de livraison (jours)</Label>
                    <Input
                      id="delai_livraison"
                      type="number"
                      {...form.register("delai_livraison", {
                        required: "Délai de livraison est requis",
                        min: { value: 1, message: "Délai doit être au moins 1 jour" },
                      })}
                      placeholder="7"
                      className="border-muted focus:ring-primary"
                    />
                    {form.formState.errors.delai_livraison && (
                      <p className="text-sm text-destructive">{form.formState.errors.delai_livraison.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adresse" className="text-sm font-medium">Adresse</Label>
                  <Textarea
                    id="adresse"
                    {...form.register("adresse", { required: "Adresse est requise" })}
                    placeholder="Adresse du fournisseur"
                    className="border-muted focus:ring-primary"
                  />
                  {form.formState.errors.adresse && (
                    <p className="text-sm text-destructive">{form.formState.errors.adresse.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="is_active" className="text-sm font-medium">Statut</Label>
                  <Controller
                    name="is_active"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => field.onChange(value === "true")}
                        value={field.value.toString()}
                      >
                        <SelectTrigger className="border-muted">
                          <SelectValue placeholder="Sélectionner le statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Actif</SelectItem>
                          <SelectItem value="false">Inactif</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="border-muted hover:bg-muted"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Edit className="h-4 w-4 mr-2" />
                    )}
                    {loading ? "Mise à jour..." : "Mettre à jour Fournisseur"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Supplier Detail Modal */}
          <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
            <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-sm rounded-lg shadow-xl">
              <DialogHeader>
                <DialogTitle>Détails du Fournisseur - {selectedSupplierData?.nom}</DialogTitle>
                <DialogDescription>Voir les informations détaillées du fournisseur.</DialogDescription>
              </DialogHeader>
              {selectedSupplierData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-800/10">
                      <CardHeader>
                        <CardTitle className="text-lg">Informations de contact</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="font-medium">{selectedSupplierData.contact_nom}</p>
                          <p className="text-sm text-muted-foreground">Personne de contact</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedSupplierData.telephone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedSupplierData.email}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{selectedSupplierData.adresse}</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-800/10">
                      <CardHeader>
                        <CardTitle className="text-lg">Conditions & Livraison</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Conditions de paiement:</span>
                          <Badge variant="outline" className="border-primary/20">{selectedSupplierData.conditions_paiement}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Délai de livraison:</span>
                          <span>{selectedSupplierData.delai_livraison} jours</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Statut:</span>
                          {getStatusBadge(selectedSupplierData.is_active)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Créé le:</span>
                          <span>{formatDate(selectedSupplierData.created_at)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </POSLayout>
  )
}

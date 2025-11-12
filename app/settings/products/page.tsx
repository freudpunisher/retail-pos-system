
"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { POSLayout } from "@/components/pos-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Tag,
  TrendingUp,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { useCategories } from "@/hooks/useCategories"
import { useProducts } from "@/hooks/useProducts"
import { Category, CategoryResponse } from "@/types/category.types"
import { Product, ProductResponse, UniteMesureEnum } from "@/types/product.types"

interface CategoryFormData {
  nom: string
  description: string
  is_active: boolean
}

interface ProductFormData {
  nom: string
  // description: string
  // code_barre: string
  // reference: string
  unite_mesure: UniteMesureEnum
  // prix_achat: string
  prix_vente: string
  // taux_tva: string
  // stock_minimum: number
  // stock_maximum: number
  is_active: boolean
  has_expiry: boolean
  categorie: string
}

export default function ProductsPage() {
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories()
  const {
    products,
     productsLoading,
  productsError,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categoryForm = useForm<CategoryFormData>({
    defaultValues: {
      nom: "",
      description: "",
      is_active: true,
    },
  })

  const productForm = useForm<ProductFormData>({
    defaultValues: {
      nom: "",
      
     
      unite_mesure: UniteMesureEnum.Piece,
      
      prix_vente: "",
     
      is_active: true,
      has_expiry: false,
      categorie: "",
    },
  })

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [fetchCategories, fetchProducts])

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.nom.toLowerCase().includes(productSearchTerm.toLowerCase()) 
    const matchesCategory = selectedCategory === "all" || product.categorie === selectedCategory
    return matchesSearch && matchesCategory
  })

  const onSubmitCategory = async (data: CategoryFormData) => {
    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, data)
        setEditingCategoryId(null)
        setIsEditCategoryOpen(false)
      } else {
        await createCategory(data)
        setIsAddCategoryOpen(false)
      }
      categoryForm.reset()
    } catch (err) {
      console.error(err)
    }
  }

  const onSubmitProduct = async (data: ProductFormData) => {
    try {
      if (editingProductId) {
        await updateProduct(editingProductId, data)
        setEditingProductId(null)
        setIsEditProductOpen(false)
      } else {
        await createProduct(data)
        setIsAddProductOpen(false)
      }
      productForm.reset()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditCategory = (category: CategoryResponse) => {
    setEditingCategoryId(category.id)
    categoryForm.reset({
      nom: category.nom,
      description: category.description,
      is_active: category.is_active,
    })
    setIsEditCategoryOpen(true)
  }

  const handleEditProduct = (product: ProductResponse) => {
    setEditingProductId(product.id)
    productForm.reset({
      nom: product.nom,
      // description: product.description,
      // code_barre: product.code_barre,
      // reference: product.reference,
      // unite_mesure: product.unite_mesure,
      // prix_achat: product.prix_achat,
      prix_vente: product.prix_vente,
      // taux_tva: product.taux_tva,
      // stock_minimum: product.stock_minimum,
      // stock_maximum: product.stock_maximum,
      is_active: product.is_active,
      has_expiry: product.has_expiry,
      categorie: product.categorie,
    })
    setIsEditProductOpen(true)
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id)
    } catch (err) {
      console.error(err)
    }
  }

  const totalInventoryValue = 0
  // Assuming stock_minimum is current stock; adjust if there's a separate stock field
  const lowStockItems = 0

  return (
    <POSLayout>
      <TooltipProvider>
        <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Products & Categories</h1>
              <p className="text-lg text-muted-foreground mt-1">Effortlessly manage your inventory and categories</p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="border-primary/20 hover:bg-primary/10 transition-all duration-200"
                onClick={() => {
                  fetchCategories()
                  fetchProducts()
                }}
                disabled={categoriesLoading || productsLoading}
              >
                {categoriesLoading || productsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Total Categories</CardTitle>
                <Tag className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-800 dark:text-blue-200 animate-pulse">
                  {categoriesLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : categories.length}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Active categories</p>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/10 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">Total Products</CardTitle>
                <Package className="h-5 w-5 text-green-500 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800 dark:text-green-200 animate-pulse">
                  {productsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : products.length}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Across all categories</p>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-900/10 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">Low Stock Items</CardTitle>
                <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-800 dark:text-yellow-200 animate-pulse">
                  {productsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : lowStockItems}
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Need restocking</p>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/10 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">Inventory Value</CardTitle>
                <Tag className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-800 dark:text-purple-200 animate-pulse">
                  {productsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${totalInventoryValue.toFixed(2)} FBU`}
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Total stock value</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs component */}
          <Tabs defaultValue="categories" className="space-y-6">
            <TabsList className="bg-background/80 backdrop-blur-sm rounded-lg">
              <TabsTrigger
                value="categories"
                className="text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Categories
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Products
              </TabsTrigger>
            </TabsList>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">Product Categories</h2>
                  <p className="text-sm text-muted-foreground">Manage product categories and classifications</p>
                </div>
                <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 transition-colors">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm rounded-lg shadow-xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold">Add New Category</DialogTitle>
                      <DialogDescription>Create a new product category for your inventory.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nom" className="text-sm font-medium">Category Name</Label>
                        <Input
                          id="nom"
                          {...categoryForm.register("nom", { required: "Category name is required" })}
                          placeholder="Enter category name"
                          className="border-muted focus:ring-primary"
                        />
                        {categoryForm.formState.errors.nom && (
                          <p className="text-sm text-destructive">{categoryForm.formState.errors.nom.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                        <Textarea
                          id="description"
                          {...categoryForm.register("description")}
                          placeholder="Enter category description"
                          className="border-muted focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="is_active" className="text-sm font-medium">Status</Label>
                        <Controller
                          name="is_active"
                          control={categoryForm.control}
                          render={({ field }) => (
                            <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value.toString()}>
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
                          onClick={() => setIsAddCategoryOpen(false)}
                          className="border-muted hover:bg-muted"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={categoriesLoading} className="bg-primary hover:bg-primary/90">
                          {categoriesLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          {categoriesLoading ? "Creating..." : "Create Category"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="shadow-sm border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  {categoriesError && (
                    <p className="text-sm text-destructive mb-4 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {categoriesError}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search categories by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-muted focus:ring-primary rounded-lg"
                      />
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-muted/50">
                        <TableHead className="text-foreground font-semibold">Category Name</TableHead>
                        <TableHead className="text-foreground font-semibold">Description</TableHead>
                        <TableHead className="text-foreground font-semibold">Status</TableHead>
                        <TableHead className="text-foreground font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoriesLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          </TableCell>
                        </TableRow>
                      ) : (
                        categories
                          .filter(
                            (category) =>
                              category.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              category.description.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((category) => (
                            <TableRow key={category.id} className="hover:bg-muted/20 transition-colors">
                              <TableCell className="font-medium text-foreground">{category.nom}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{category.description}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={category.is_active ? "default" : "secondary"}
                                  className={category.is_active ? "bg-green-500" : "bg-gray-500"}
                                >
                                  {category.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditCategory(category)}
                                        className="hover:bg-primary/10"
                                      >
                                        <Edit className="h-4 w-4 text-primary" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit Category</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="hover:bg-destructive/10"
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete Category</TooltipContent>
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

              <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
                <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm rounded-lg shadow-xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Edit Category</DialogTitle>
                    <DialogDescription>Update category details.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nom" className="text-sm font-medium">Category Name</Label>
                      <Input
                        id="nom"
                        {...categoryForm.register("nom", { required: "Category name is required" })}
                        placeholder="Enter category name"
                        className="border-muted focus:ring-primary"
                      />
                      {categoryForm.formState.errors.nom && (
                        <p className="text-sm text-destructive">{categoryForm.formState.errors.nom.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                      <Textarea
                        id="description"
                        {...categoryForm.register("description")}
                        placeholder="Enter category description"
                        className="border-muted focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="is_active" className="text-sm font-medium">Status</Label>
                      <Controller
                        name="is_active"
                        control={categoryForm.control}
                        render={({ field }) => (
                          <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value.toString()}>
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
                        onClick={() => setIsEditCategoryOpen(false)}
                        className="border-muted hover:bg-muted"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={categoriesLoading} className="bg-primary hover:bg-primary/90">
                        {categoriesLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Edit className="h-4 w-4 mr-2" />
                        )}
                        {categoriesLoading ? "Updating..." : "Update Category"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">Products</h2>
                  <p className="text-sm text-muted-foreground">Manage product inventory and details</p>
                </div>
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
  <DialogTrigger asChild>
    <Button className="bg-primary hover:bg-primary/90">
      <Plus className="h-4 w-4 mr-2" />
      Add Product
    </Button>
  </DialogTrigger>

  <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-sm rounded-xl shadow-xl">
    <DialogHeader>
      <DialogTitle className="text-xl font-semibold">Add New Product</DialogTitle>
      <DialogDescription>
        Fill only the essentials. Edit advanced details later.
      </DialogDescription>
    </DialogHeader>

    <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="grid gap-5">
      {/* Product Name */}
      <div className="space-y-2">
        <Label htmlFor="add-prod-nom">Product Name</Label>
        <Input
          id="add-prod-nom"
          {...productForm.register("nom", { required: "Name is required" })}
          placeholder="e.g., Coca Cola 33cl"
          className="border-muted focus:ring-primary"
        />
        {productForm.formState.errors.nom && (
          <p className="text-sm text-destructive">{productForm.formState.errors.nom.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="add-prod-cat">Category</Label>
        <Controller
          name="categorie"
          control={productForm.control}
          rules={{ required: "Category is required" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="border-muted">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {productForm.formState.errors.categorie && (
          <p className="text-sm text-destructive">{productForm.formState.errors.categorie.message}</p>
        )}
      </div>

      {/* Selling Price */}
      <div className="space-y-2">
        <Label htmlFor="add-prod-price">Selling Price (FBU)</Label>
        <Input
          id="add-prod-price"
          type="number"
          step="0.01"
          {...productForm.register("prix_vente", {
            required: "Price is required",
            min: { value: 0, message: "Price must be ≥ 0" },
          })}
          placeholder="2500.00"
          className="border-muted focus:ring-primary"
        />
        {productForm.formState.errors.prix_vente && (
          <p className="text-sm text-destructive">{productForm.formState.errors.prix_vente.message}</p>
        )}
      </div>

      {/* Unit of Measure */}
      <div className="space-y-2">
        <Label htmlFor="add-prod-unit">Unit of Measure</Label>
        <Controller
          name="unite_mesure"
          control={productForm.control}
          rules={{ required: "Unit is required" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="border-muted">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(UniteMesureEnum).map((u) => (
                  <SelectItem key={u} value={u}>
                    {u.charAt(0).toUpperCase() + u.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {productForm.formState.errors.unite_mesure && (
          <p className="text-sm text-destructive">{productForm.formState.errors.unite_mesure.message}</p>
        )}
      </div>

      {/* Has Expiry */}
      <div className="space-y-2">
        <Label htmlFor="add-prod-expiry">Has Expiry Date?</Label>
        <Controller
          name="has_expiry"
          control={productForm.control}
          render={({ field }) => (
            <Select
              onValueChange={(v) => field.onChange(v === "true")}
              value={field.value.toString()}
            >
              <SelectTrigger className="border-muted">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">No</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="add-prod-active">Status</Label>
        <Controller
          name="is_active"
          control={productForm.control}
          render={({ field }) => (
            <Select
              onValueChange={(v) => field.onChange(v === "true")}
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

      <DialogFooter className="flex-col sm:flex-row sm:justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsAddProductOpen(false)}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={productsLoading}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90"
        >
          {productsLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Product
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
              </div>

              <Card className="shadow-sm border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  {productsError && (
                    <p className="text-sm text-destructive mb-4 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {productsError}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products by name, SKU, or barcode..."
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        className="pl-10 border-muted focus:ring-primary rounded-lg"
                      />
                    </div>
                    <Controller
                      name="categorie"
                      control={productForm.control}
                      render={({ field }) => (
                        <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                          <SelectTrigger className="w-48 border-muted">
                            <SelectValue placeholder="Filter by category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-muted/50">
                        <TableHead className="text-foreground font-semibold">Product Name</TableHead>
                        {/* <TableHead className="text-foreground font-semibold">SKU</TableHead> */}
                        <TableHead className="text-foreground font-semibold">Category</TableHead>
                        <TableHead className="text-foreground font-semibold">Price (FBU)</TableHead>
                        {/* <TableHead className="text-foreground font-semibold">Stock</TableHead> */}
                        <TableHead className="text-foreground font-semibold">Status</TableHead>
                        <TableHead className="text-foreground font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProducts.map((product) => (
                          <TableRow key={product.id} className="hover:bg-muted/20 transition-colors">
                            <TableCell className="font-medium text-foreground">{product.nom}</TableCell>
                            {/* <TableCell className="text-sm text-muted-foreground">{product.reference}</TableCell> */}
                            <TableCell>
                              {categories.find((cat) => cat.id === product.categorie)?.nom || "Unknown"}
                            </TableCell>
                            <TableCell>{Number(product.prix_vente).toFixed(2)} FBU</TableCell>
                            {/* <TableCell>
                              <div className="flex items-center space-x-2">
                                <span>{product.stock_minimum}</span>
                                {product.stock_minimum <= product.stock_minimum && (
                                  <Badge variant="destructive" className="text-xs">
                                    Low
                                  </Badge>
                                )}
                              </div>
                            </TableCell> */}
                            <TableCell>
                              <Badge
                                variant={product.is_active ? "default" : "secondary"}
                                className={product.is_active ? "bg-green-500" : "bg-gray-500"}
                              >
                                {product.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditProduct(product)}
                                      className="hover:bg-primary/10"
                                    >
                                      <Edit className="h-4 w-4 text-primary" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit Product</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteProduct(product.id)}
                                      className="hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete Product</TooltipContent>
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

              {/* ADD PRODUCT DIALOG - SIMPLIFIED */}
<Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
  {/* <DialogTrigger asChild>
    <Button className="bg-primary hover:bg-primary/90 transition-colors">
      <Plus className="h-4 w-4 mr-2" />
      Add Product
    </Button>
  </DialogTrigger> */}
  <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-sm rounded-lg shadow-xl">
    <DialogHeader>
      <DialogTitle className="text-xl font-semibold">Add New Product</DialogTitle>
      <DialogDescription>
        Quickly add a product. You can edit advanced details later.
      </DialogDescription>
    </DialogHeader>

    <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="space-y-5">
      {/* Product Name */}
      <div className="space-y-2">
        <Label htmlFor="add-nom">Product Name</Label>
        <Input
          id="add-nom"
          {...productForm.register("nom", { required: "Product name is required" })}
          placeholder="e.g., Coca Cola 33cl"
          className="border-muted focus:ring-primary"
        />
        {productForm.formState.errors.nom && (
          <p className="text-sm text-destructive">{productForm.formState.errors.nom.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="add-categorie">Category</Label>
        <Controller
          name="categorie"
          control={productForm.control}
          rules={{ required: "Category is required" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="border-muted">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {productForm.formState.errors.categorie && (
          <p className="text-sm text-destructive">{productForm.formState.errors.categorie.message}</p>
        )}
      </div>

      {/* Selling Price */}
      <div className="space-y-2">
        <Label htmlFor="add-prix_vente">Selling Price (FBU)</Label>
        <Input
          id="add-prix_vente"
          type="number"
          step="0.01"
          {...productForm.register("prix_vente", {
            required: "Selling price is required",
            min: { value: 0, message: "Price must be positive" },
          })}
          placeholder="2500.00"
          className="border-muted focus:ring-primary"
        />
        {productForm.formState.errors.prix_vente && (
          <p className="text-sm text-destructive">{productForm.formState.errors.prix_vente.message}</p>
        )}
      </div>

      {/* Unit of Measure */}
      <div className="space-y-2">
        <Label htmlFor="add-unite_mesure">Unit of Measure</Label>
        <Controller
          name="unite_mesure"
          control={productForm.control}
          rules={{ required: "Unit is required" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="border-muted">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(UniteMesureEnum).map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {productForm.formState.errors.unite_mesure && (
          <p className="text-sm text-destructive">{productForm.formState.errors.unite_mesure.message}</p>
        )}
      </div>

      {/* Has Expiry */}
      <div className="space-y-2">
        <Label htmlFor="add-has_expiry">Has Expiry Date?</Label>
        <Controller
          name="has_expiry"
          control={productForm.control}
          render={({ field }) => (
            <Select
              onValueChange={(v) => field.onChange(v === "true")}
              value={field.value.toString()}
            >
              <SelectTrigger className="border-muted">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">No</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="add-is_active">Status</Label>
        <Controller
          name="is_active"
          control={productForm.control}
          render={({ field }) => (
            <Select
              onValueChange={(v) => field.onChange(v === "true")}
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

      <DialogFooter className="flex sm:justify-between gap-3">
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            setIsAddProductOpen(false)
            productForm.reset()
          }}
          className="border-muted hover:bg-muted"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={productsLoading}
          className="bg-primary hover:bg-primary/90"
        >
          {productsLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Product
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    </POSLayout>
  )
}

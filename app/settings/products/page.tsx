"use client";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import { POSLayout } from "@/components/pos-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search, Plus, Package, Tag, TrendingUp, AlertTriangle, Loader2,
  RefreshCw, Edit, Trash2, ToggleLeft, ToggleRight, DollarSign, Box,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Save, X
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { CategoryResponse } from "@/types/category.types";
import { ProductResponse, UniteMesureEnum } from "@/types/product.types";

interface CategoryFormData {
  nom: string;
  description: string;
  is_active: boolean;
}

interface ProductFormData {
  nom: string;
  unite_mesure: UniteMesureEnum;
  prix_vente: string;
  is_active: boolean;
  has_expiry: boolean;
  categorie: string;
}

export default function ProductsPage() {
  const { categories, loading: catLoading, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { products, loading: prodLoading, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts();

  const [searchCat, setSearchCat] = useState("");
  const [searchProd, setSearchProd] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [isAddProdOpen, setIsAddProdOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryResponse | null>(null);
  const [editingProd, setEditingProd] = useState<ProductResponse | null>(null);

  // Pagination states
  const [currentPageProd, setCurrentPageProd] = useState(1);
  const [currentPageCat, setCurrentPageCat] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Deleting states for loading
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);
  const [deletingProdId, setDeletingProdId] = useState<string | null>(null);

  const catForm = useForm<CategoryFormData>({ defaultValues: { nom: "", description: "", is_active: true } });
  const prodForm = useForm<ProductFormData>({ 
    defaultValues: { 
      nom: "", 
      unite_mesure: UniteMesureEnum.Piece, 
      prix_vente: "", 
      is_active: true, 
      has_expiry: false, 
      categorie: "" 
    } 
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Filtered data
  const filteredCats = categories.filter(c => c.nom.toLowerCase().includes(searchCat.toLowerCase()));
  const filteredProds = products.filter(p => {
    const matchName = p.nom.toLowerCase().includes(searchProd.toLowerCase());
    const matchCat = filterCat === "all" || p.categorie === filterCat;
    return matchName && matchCat;
  });

  // Pagination calculations
  const totalPagesProd = Math.ceil(filteredProds.length / itemsPerPage);
  const totalPagesCat = Math.ceil(filteredCats.length / itemsPerPage);

  const paginatedProds = filteredProds.slice(
    (currentPageProd - 1) * itemsPerPage,
    currentPageProd * itemsPerPage
  );

  const paginatedCats = filteredCats.slice(
    (currentPageCat - 1) * itemsPerPage,
    currentPageCat * itemsPerPage
  );

  // Stats
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const lowStock = products.filter(p => (p.stock_actuel || 0) <= (p.stock_minimum || 0)).length;
  const totalValue = products.reduce((acc, p) => acc + ((p.stock_actuel || 0) * Number(p.prix_vente)), 0);

  // Category handlers
  const onSubmitCat = async (data: CategoryFormData) => {
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, data);
        toast.success("Catégorie mise à jour avec succès !");
      } else {
        await createCategory(data);
        toast.success("Catégorie créée avec succès !");
      }
      setIsAddCatOpen(false);
      setEditingCat(null);
      catForm.reset();
      fetchCategories();
    } catch (err) {
      toast.error("Erreur lors de l'opération");
    }
  };

  const openEditCat = (cat: CategoryResponse) => {
    setEditingCat(cat);
    catForm.reset({ 
      nom: cat.nom, 
      description: cat.description || "", 
      is_active: cat.is_active 
    });
    setIsAddCatOpen(true);
  };

  const handleDeleteCat = async (catId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) return;
    
    setDeletingCatId(catId);
    try {
      await deleteCategory(catId);
      toast.success("Catégorie supprimée avec succès !");
      fetchCategories();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeletingCatId(null);
    }
  };

  // Product handlers
  const onSubmitProd = async (data: ProductFormData) => {
    try {
      if (editingProd) {
        await updateProduct(editingProd.id, data);
        toast.success("Produit mis à jour avec succès !");
      } else {
        await createProduct(data);
        toast.success("Produit créé avec succès !");
      }
      setIsAddProdOpen(false);
      setEditingProd(null);
      prodForm.reset();
      fetchProducts();
    } catch (err) {
      toast.error("Erreur lors de l'opération");
    }
  };

  const openEditProd = (prod: ProductResponse) => {
    setEditingProd(prod);
    prodForm.reset({
      nom: prod.nom,
      unite_mesure: prod.unite_mesure,
      prix_vente: prod.prix_vente,
      is_active: prod.is_active,
      has_expiry: prod.has_expiry || false,
      categorie: prod.categorie,
    });
    setIsAddProdOpen(true);
  };

  const handleDeleteProd = async (prodId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
    
    setDeletingProdId(prodId);
    try {
      await deleteProduct(prodId);
      toast.success("Produit supprimé avec succès !");
      fetchProducts();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeletingProdId(null);
    }
  };

  // Pagination component
  const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange 
  }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
  }) => {
    return (
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span className="font-semibold">Page {currentPage} sur {totalPages}</span>
          <span>•</span>
          <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 par page</SelectItem>
              <SelectItem value="10">10 par page</SelectItem>
              <SelectItem value="20">20 par page</SelectItem>
              <SelectItem value="50">50 par page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className={currentPage === pageNum ? "bg-blue-600 text-white" : ""}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (catLoading || prodLoading) {
    return (
      <POSLayout currentPath="/stock/products">
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
        </div>
      </POSLayout>
    );
  }

  return (
    <POSLayout currentPath="/stock/products">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="p-8 space-y-8 mx-auto">

          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl shadow-2xl">
                  <Package className="h-20 w-20 text-white" />
                </div>
                <div>
                  <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Produits & Catégories
                  </h1>
                  <p className="text-2xl text-slate-600 dark:text-slate-400 mt-3 flex items-center gap-3">
                    <Box className="h-8 w-8 text-blue-600" />
                    Gérez votre catalogue complet en un clin d'œil
                  </p>
                </div>
              </div>
              <Button size="lg" variant="outline" onClick={() => { fetchCategories(); fetchProducts(); }}>
                <RefreshCw className="h-6 w-6 mr-3" />
                Actualiser
              </Button>
            </div>
          </div>

          {/* Stats Premium */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-2xl border-0">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-lg">Produits</p>
                    <p className="text-5xl font-extrabold mt-2">{totalProducts}</p>
                  </div>
                  <Package className="h-20 w-20 opacity-30" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-2xl border-0">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100">Catégories</p>
                    <p className="text-4xl font-bold mt-2">{totalCategories}</p>
                  </div>
                  <Tag className="h-16 w-16 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-2xl border-0">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Stock faible</p>
                    <p className="text-4xl font-bold mt-2">{lowStock}</p>
                  </div>
                  <AlertTriangle className="h-16 w-16 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-2xl border-0">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Valeur stock</p>
                    <p className="text-4xl font-bold mt-2">{totalValue.toLocaleString()} FBU</p>
                  </div>
                  <DollarSign className="h-16 w-16 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="products" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 h-16 text-lg font-bold bg-blue-900/40 backdrop-blur-xl border border-blue-400/20 shadow-2xl">
              <TabsTrigger 
                value="products" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-blue-300 hover:data-[state=inactive]:bg-blue-600/40 transition-all duration-200 rounded-l-lg"
              >
                <Package className="h-6 w-6 mr-3" /> Produits
              </TabsTrigger>
              <TabsTrigger 
                value="categories" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-blue-300 hover:data-[state=inactive]:bg-blue-600/40 transition-all duration-200 rounded-r-lg"
              >
                <Tag className="h-6 w-6 mr-3" /> Catégories
              </TabsTrigger>
            </TabsList>

            {/* PRODUITS TAB */}
            <TabsContent value="products" className="space-y-8">
              <div className="flex justify-between items-center gap-4">
                {/* Enhanced Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-blue-600 z-10" />
                  <Input 
                    placeholder="Rechercher un produit..." 
                    value={searchProd} 
                    onChange={e => {
                      setSearchProd(e.target.value);
                      setCurrentPageProd(1); // Reset to first page on search
                    }} 
                    className="pl-14 h-14 w-full text-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white shadow-lg font-medium"
                  />
                </div>

                <div className="flex gap-4">
                  <Select value={filterCat} onValueChange={(v) => {
                    setFilterCat(v);
                    setCurrentPageProd(1); // Reset to first page on filter
                  }}>
                    <SelectTrigger className="w-64 h-14 text-lg border-2 border-blue-200">
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Dialog open={isAddProdOpen} onOpenChange={(open) => {
                    setIsAddProdOpen(open);
                    if (!open) {
                      setEditingProd(null);
                      prodForm.reset();
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl h-14">
                        <Plus className="h-6 w-6 mr-3" /> Nouveau Produit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-blue-700">
                          {editingProd ? "Modifier le Produit" : "Créer un Nouveau Produit"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={prodForm.handleSubmit(onSubmitProd)} className="space-y-6 mt-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <Label className="text-lg font-semibold">Nom du produit <span className="text-red-500">*</span></Label>
                            <Input {...prodForm.register("nom", { required: true })} className="h-12 text-lg mt-2" placeholder="Coca Cola 33cl" />
                          </div>
                          <div>
                            <Label className="text-lg font-semibold">Catégorie <span className="text-red-500">*</span></Label>
                            <Controller name="categorie" control={prodForm.control} render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="h-12 text-lg mt-2"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}</SelectContent>
                              </Select>
                            )} />
                          </div>
                          <div>
                            <Label className="text-lg font-semibold">Prix de vente (FBU)</Label>
                            <Input type="number" step="0.01" {...prodForm.register("prix_vente")} className="h-12 text-lg mt-2" placeholder="2500" />
                          </div>
                          <div>
                            <Label className="text-lg font-semibold">Unité de mesure</Label>
                            <Controller name="unite_mesure" control={prodForm.control} render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="h-12 text-lg mt-2"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {Object.values(UniteMesureEnum).map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            )} />
                          </div>
                        </div>
                        <div className="flex justify-end gap-4 pt-6 border-t">
                          <Button type="button" variant="outline" size="lg" onClick={() => { 
                            setIsAddProdOpen(false); 
                            setEditingProd(null); 
                            prodForm.reset();
                          }}>
                            <X className="h-5 w-5 mr-2" />
                            Annuler
                          </Button>
                          <Button type="submit" size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 px-10">
                            <Save className="h-6 w-6 mr-3" />
                            {editingProd ? "Mettre à jour" : "Créer le Produit"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Card className="shadow-2xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-50 dark:bg-blue-900/30">
                        <TableHead className="font-bold text-lg text-blue-700">Produit</TableHead>
                        <TableHead className="font-bold text-lg text-blue-700">Catégorie</TableHead>
                        <TableHead className="font-bold text-lg text-blue-700">Prix</TableHead>
                        <TableHead className="font-bold text-lg text-blue-700 text-center">Statut</TableHead>
                        <TableHead className="font-bold text-lg text-blue-700 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProds.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12">
                            <Package className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                            <p className="text-xl font-semibold text-slate-500">Aucun produit trouvé</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedProds.map(p => {
                          const cat = categories.find(c => c.id === p.categorie);
                          return (
                            <TableRow key={p.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 h-20">
                              <TableCell className="font-bold text-xl">{p.nom}</TableCell>
                              <TableCell><Badge variant="secondary" className="text-base">{cat?.nom || "Inconnue"}</Badge></TableCell>
                              <TableCell className="font-bold text-lg">{Number(p.prix_vente).toLocaleString()} FBU</TableCell>
                              <TableCell className="text-center">
                                <Badge className={`text-lg px-6 py-2 ${p.is_active ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                                  {p.is_active ? "ACTIF" : "INACTIF"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center gap-3">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => openEditProd(p)}
                                    className="hover:bg-blue-100 transition-colors"
                                  >
                                    <Edit className="h-5 w-5 text-blue-600" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => handleDeleteProd(p.id)}
                                    disabled={deletingProdId === p.id}
                                    className="hover:bg-red-100 transition-colors"
                                  >
                                    {deletingProdId === p.id ? (
                                      <Loader2 className="h-5 w-5 animate-spin text-red-600" />
                                    ) : (
                                      <Trash2 className="h-5 w-5 text-red-600" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                  {totalPagesProd > 0 && (
                    <Pagination 
                      currentPage={currentPageProd} 
                      totalPages={totalPagesProd} 
                      onPageChange={setCurrentPageProd} 
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* CATÉGORIES TAB */}
            <TabsContent value="categories" className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-extrabold text-blue-700">Catégories de Produits</h2>
                  <p className="text-xl text-slate-600 dark:text-slate-400 mt-2">Organisez votre catalogue comme un pro</p>
                </div>
                <div className="flex items-center gap-6">
                  {/* Enhanced Search Input */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-blue-600 z-10" />
                    <Input
                      placeholder="Rechercher une catégorie..."
                      value={searchCat}
                      onChange={(e) => {
                        setSearchCat(e.target.value);
                        setCurrentPageCat(1); // Reset to first page on search
                      }}
                      className="pl-14 h-14 w-80 text-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white shadow-lg font-medium"
                    />
                  </div>

                  <Dialog open={isAddCatOpen} onOpenChange={(open) => {
                    setIsAddCatOpen(open);
                    if (!open) {
                      setEditingCat(null);
                      catForm.reset();
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl h-14">
                        <Plus className="h-6 w-6 mr-3" />
                        Nouvelle Catégorie
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-blue-700">
                          {editingCat ? "Modifier la Catégorie" : "Créer une Catégorie"}
                        </DialogTitle>
                      </DialogHeader>

                      <form onSubmit={catForm.handleSubmit(onSubmitCat)} className="space-y-8 mt-6">
                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <Label className="text-lg font-semibold">
                              Nom de la catégorie <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              {...catForm.register("nom", { required: "Requis" })}
                              className="h-14 text-lg mt-3"
                              placeholder="Ex: Boissons gazeuses, Produits laitiers..."
                            />
                          </div>

                          <div>
                            <Label className="text-lg font-semibold">Description (facultatif)</Label>
                            <Textarea
                              {...catForm.register("description")}
                              rows={4}
                              className="mt-3 text-lg resize-none"
                              placeholder="Décrivez cette catégorie pour vos équipes..."
                            />
                          </div>

                          <div className="flex items-center gap-6">
                            <Label className="text-lg font-semibold">Statut</Label>
                            <Controller
                              name="is_active"
                              control={catForm.control}
                              render={({ field }) => (
                                <Select
                                  onValueChange={(v) => field.onChange(v === "true")}
                                  value={field.value.toString()}
                                >
                                  <SelectTrigger className="w-64 h-14 text-lg">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="true">
                                      <Badge className="bg-emerald-500 text-white">ACTIF</Badge>
                                    </SelectItem>
                                    <SelectItem value="false">
                                      <Badge className="bg-red-500 text-white">INACTIF</Badge>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t">
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => {
                              setIsAddCatOpen(false);
                              setEditingCat(null);
                              catForm.reset();
                            }}
                          >
                            <X className="h-5 w-5 mr-2" />
                            Annuler
                          </Button>
                          <Button
                            type="submit"
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-10"
                          >
                            <Save className="h-6 w-6 mr-3" />
                            {editingCat ? "Mettre à jour" : "Créer la Catégorie"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Card className="shadow-2xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 border-b-2 border-blue-200">
                  <CardTitle className="text-3xl font-bold flex items-center gap-4">
                    <Tag className="h-10 w-10 text-blue-600" />
                    Toutes les Catégories
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-50 dark:bg-blue-900/30">
                        <TableHead className="font-bold text-lg text-blue-700">Nom</TableHead>
                        <TableHead className="font-bold text-lg text-blue-700">Description</TableHead>
                        <TableHead className="font-bold text-lg text-blue-700 text-center">Produits</TableHead>
                        <TableHead className="font-bold text-lg text-blue-700 text-center">Statut</TableHead>
                        <TableHead className="font-bold text-lg text-blue-700 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCats.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12">
                            <Tag className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                            <p className="text-xl font-semibold text-slate-500">Aucune catégorie trouvée</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedCats.map((cat) => {
                          const productCount = products.filter(p => p.categorie === cat.id).length;
                          return (
                            <TableRow key={cat.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 h-20 border-b border-slate-100">
                              <TableCell className="font-bold text-xl">{cat.nom}</TableCell>
                              <TableCell className="text-slate-600 max-w-lg">
                                {cat.description || <span className="italic text-slate-400">Aucune description</span>}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className="text-lg px-4 py-2 bg-blue-100 text-blue-700">
                                  {productCount} produit{productCount > 1 ? "s" : ""}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className={`text-white text-lg px-6 py-2 ${cat.is_active ? "bg-emerald-500" : "bg-red-500"}`}>
                                  {cat.is_active ? "ACTIF" : "INACTIF"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center gap-4">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => openEditCat(cat)}
                                    className="hover:bg-blue-100 transition-colors"
                                  >
                                    <Edit className="h-5 w-5 text-blue-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteCat(cat.id)}
                                    disabled={deletingCatId === cat.id}
                                    className="hover:bg-red-100 transition-colors"
                                  >
                                    {deletingCatId === cat.id ? (
                                      <Loader2 className="h-5 w-5 animate-spin text-red-600" />
                                    ) : (
                                      <Trash2 className="h-5 w-5 text-red-600" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                  {totalPagesCat > 0 && (
                    <Pagination 
                      currentPage={currentPageCat} 
                      totalPages={totalPagesCat} 
                      onPageChange={setCurrentPageCat} 
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </POSLayout>
  );
}
"use client";
import { useState, useEffect, useMemo } from "react";
import { POSLayout } from "@/components/pos-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Search, Plus, Edit, Trash2, Eye, FileText, Truck, CheckCircle, Package,
  Loader2, AlertCircle, Save, ShoppingCart, Clock, CheckSquare, XCircle
} from "lucide-react";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { CreatePurchaseOrderRequest, PurchaseOrderResponse, UpdatePurchaseOrderRequest } from "@/types/PurchaseOrder";
import { fetchCommandesFournisseurs, fetchFournisseurs, fetchProduits } from "@/services/commandesFournisseursService";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: "Brouillon", color: "bg-slate-500", icon: <FileText className="h-4 w-4" /> },
  sent: { label: "Envoyé", color: "bg-blue-500", icon: <Package className="h-4 w-4" /> },
  confirmed: { label: "Confirmé", color: "bg-purple-500", icon: <CheckCircle className="h-4 w-4" /> },
  partially_received: { label: "Part. Reçu", color: "bg-orange-500", icon: <Truck className="h-4 w-4" /> },
  received: { label: "Reçu", color: "bg-emerald-500", icon: <Truck className="h-4 w-4" /> },
  cancelled: { label: "Annulé", color: "bg-red-500", icon: <XCircle className="h-4 w-4" /> },
};

export default function PurchaseOrdersPage() {
  const {
    purchaseOrders, fournisseurs, pointsVente, produits, loading, error,
    fetchPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder,
    fetchFournisseurs, fetchPointsVente,
    fetchProduits
  } = usePurchaseOrders();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<PurchaseOrderResponse | null>(null);

  const [formData, setFormData] = useState<any>({
    status: "confirmed",
    date_livraison_prevue: "",
    commentaire: "",
    fournisseur: "",
    point_vente: "",
    lignes: [],
  });

  useEffect(() => {
    fetchPurchaseOrders();
    fetchFournisseurs();
    fetchPointsVente();
    fetchProduits();  
  }, []);

  // Stats
  const stats = useMemo(() => {
    const total = purchaseOrders.length;
    const draft = purchaseOrders.filter(p => p.status === "draft").length;
    const pending = purchaseOrders.filter(p => ["sent", "confirmed"].includes(p.status)).length;
    const received = purchaseOrders.filter(p => p.status === "received").length;
    const totalAmount = purchaseOrders.reduce((sum, p) => sum + (p.montant_total || 0), 0);
    console.log("Recalculating stats:", { total, draft, pending, received, totalAmount });
    return { total, draft, pending, received, totalAmount };
  }, [purchaseOrders]);

  // Filtrage
  const filtered = purchaseOrders.filter(po => {
    const fournisseur = fournisseurs.find(f => f.id === po.fournisseur);
    const matchesSearch = po.numero_commande.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fournisseur?.nom || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || po.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const openEdit = (order: PurchaseOrderResponse) => {
    setCurrentOrder(order);
    setFormData({
      numero_commande: order.numero_commande,
      status: order.status,
      date_livraison_prevue: order.date_livraison_prevue.split("T")[0],
      commentaire: order.commentaire || "",
      fournisseur: order.fournisseur,
      point_vente: order.point_vente,
      lignes: (order.lignes ?? []).map(l => ({
        id: l.id,
        produit: l.id,
        quantite_commandee: l.quantite_commandee,
        quantite_recue: l.quantite_recue,
        prix_unitaire: l.prix_unitaire,
      })),
    });
    setIsEditOpen(true);
  };

  const openView = (order: PurchaseOrderResponse) => {
    setCurrentOrder(order);
    setFormData({
      numero_commande: order.numero_commande,
      status: order.status,
      date_livraison_prevue: order.date_livraison_prevue.split("T")[0],
      commentaire: order.commentaire || "",
      fournisseur: order.fournisseur,
      point_vente: order.point_vente,
      lignes: (order.lignes ?? []).map(l => ({
        produit: l.produit,
        quantite_commandee: l.quantite_commandee,
        quantite_recue: l.quantite_recue,
        prix_unitaire: l.prix_unitaire,
      })),
    });
    setIsViewOpen(true);
  };

  if (loading && purchaseOrders.length === 0) {
    return (
      <POSLayout currentPath="/stock/purchase-orders">
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-6" />
            <p className="text-xl text-slate-600 dark:text-slate-400">Chargement des commandes fournisseurs...</p>
          </div>
        </div>
      </POSLayout>
    );
  }

  return (
    <POSLayout currentPath="/stock/purchase-orders">
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="p-6 space-y-8  mx-auto">

            {/* Header Premium */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="p-5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-2xl">
                    <ShoppingCart className="h-14 w-14 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">
                      Commandes Fournisseurs
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 flex items-center">
                      <Truck className="h-5 w-5 mr-2 text-purple-600" />
                      Gestion complète des achats et réceptions
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                 onClick={() => {
    setFormData({
      status: "confirmed",                    // ← Ici aussi !
      date_livraison_prevue: "",
      commentaire: "",
      fournisseur: "",
      point_vente: "",
      lignes: [],
    });
    setIsAddOpen(true);
  }}
                >
                  <Plus className="h-6 w-6 mr-2" />
                  Nouvelle Commande
                </Button>
              </div>
            </div>

            {/* Stats Magnifiques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-xl border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Total Commandes</p>
                      <p className="text-3xl font-bold mt-1">{stats.total}</p>
                    </div>
                    <ShoppingCart className="h-12 w-12 opacity-80" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-xl border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Brouillons</p>
                      <p className="text-3xl font-bold mt-1">{stats.draft}</p>
                    </div>
                    <FileText className="h-12 w-12 opacity-80" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-xl border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">En Attente</p>
                      <p className="text-3xl font-bold mt-1">{stats.pending}</p>
                    </div>
                    <Clock className="h-12 w-12 opacity-80" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-xl border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100">Reçues</p>
                      <p className="text-3xl font-bold mt-1">{stats.received}</p>
                    </div>
                    <CheckSquare className="h-12 w-12 opacity-80" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100">Montant Total</p>
                      <p className="text-2xl font-bold mt-1">
                        {stats.totalAmount.toLocaleString()} FC
                      </p>
                    </div>
                    <Package className="h-12 w-12 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtres */}
            <Card className="shadow-lg border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      placeholder="Rechercher par numéro ou fournisseur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-14 text-lg bg-slate-50 dark:bg-slate-700"
                    />
                  </div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-64 h-14">
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      {Object.entries(statusConfig).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tableau Premium */}
            <Card className="shadow-2xl border-0 overflow-hidden bg-white/95 dark:bg-slate-800/95 backdrop-blur">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Truck className="h-8 w-8 text-purple-600" />
                  Liste des Commandes Fournisseurs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-700">
                      <TableHead className="font-bold">N° Commande</TableHead>
                      <TableHead className="font-bold">Fournisseur</TableHead>
                      <TableHead className="font-bold">Point de Vente</TableHead>
                      <TableHead className="font-bold">Statut</TableHead>
                      <TableHead className="font-bold">Livraison</TableHead>
                      <TableHead className="font-bold text-right">Montant</TableHead>
                      <TableHead className="font-bold text-center">Articles</TableHead>
                      <TableHead className="font-bold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-16">
                          <Package className="h-20 w-20 mx-auto mb-4 text-slate-300" />
                          <p className="text-xl font-medium text-slate-500">Aucune commande trouvée</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((po) => {
                        const fournisseur = fournisseurs.find(f => f.id === po.fournisseur);
                        const pv = pointsVente.find(p => p.id === po.point_vente);
                        const status = statusConfig[po.status] || statusConfig.draft;

                        return (
                          <TableRow key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all">
                            <TableCell className="font-bold text-purple-600">{po.numero_commande}</TableCell>
                            <TableCell className="font-medium">{fournisseur?.nom || "—"}</TableCell>
                            <TableCell>{pv?.nom || "—"}</TableCell>
                            <TableCell>
                              <Badge className={`${status.color} text-white flex items-center gap-1 w-fit`}>
                                {status.icon}
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(po.date_livraison_prevue).toLocaleDateString("fr-FR")}</TableCell>
                            <TableCell className="text-right font-bold text-lg">
                              {po.montant_total.toLocaleString("fr-FR")} FC
                            </TableCell>
                            <TableCell className="text-center font-semibold">{po.lignes?.length ?? 0}</TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm" variant="outline" onClick={() => openView(po)}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Voir</TooltipContent>
                                </Tooltip>

                                {po.status === "draft" && (
                                  <>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button size="sm" variant="ghost" onClick={() => openEdit(po)}>
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Modifier</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deletePurchaseOrder(po.id)}>
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Supprimer</TooltipContent>
                                    </Tooltip>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

           <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl p" style={{ width: "80vw", maxWidth: "80vw" }}>
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold flex items-center gap-4">
                    <ShoppingCart className="h-10 w-10 text-purple-600" />
                    Nouvelle Commande Fournisseur
                  </DialogTitle>
                  <DialogDescription className="text-lg">
                    Créez une commande d'achat complète avec tous les articles nécessaires.
                  </DialogDescription>
                </DialogHeader>

                <PurchaseOrderForm
                  mode="create"
                  formData={formData}
                  setFormData={setFormData}
                  fournisseurs={fournisseurs}
                  pointsVente={pointsVente}
                  produits={produits}
                  onSubmit={async (data: CreatePurchaseOrderRequest) => {
                    await createPurchaseOrder(data);
                    setIsAddOpen(false);
                    setFormData({
                      status: "confirmed",
                      date_livraison_prevue: "",
                      commentaire: "",
                      fournisseur: "",
                      point_vente: "",
                      lignes: [],
                    });
                  }}
                  onCancel={() => setIsAddOpen(false)}
                />
              </DialogContent>
            </Dialog>

            {/* ==================== MODAL MODIFIER ==================== */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl" style={{ width: "80vw", maxWidth: "80vw" }}>
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold flex items-center gap-4">
                    <Edit className="h-10 w-10 text-orange-600" />
                    Modifier la Commande
                  </DialogTitle>
                  <DialogDescription className="text-lg">
                    N° {currentOrder?.numero_commande} • Modifiez uniquement si le statut est Brouillon
                  </DialogDescription>
                </DialogHeader>

                <PurchaseOrderForm
                  mode="edit"
                  formData={formData}
                  setFormData={setFormData}
                  fournisseurs={fournisseurs}
                  pointsVente={pointsVente}
                  produits={produits}
                  onSubmit={async (data: UpdatePurchaseOrderRequest) => {
                    if (currentOrder?.id) {
                      await updatePurchaseOrder(currentOrder.id, data);
                      setIsEditOpen(false);
                    }
                  }}
                  onCancel={() => setIsEditOpen(false)}
                />
              </DialogContent>
            </Dialog>

            {/* ==================== MODAL VOIR ==================== */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
              <DialogContent className="ymax-w-6xl max-h-[95vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl" style={{width:"80vh" , maxWidth:"80vh"}}>
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold flex items-center gap-4">
                    <Eye className="h-10 w-10 text-blue-600" />
                    Détail de la Commande
                  </DialogTitle>
                  <DialogDescription className="text-lg flex items-center gap-3">
                    <Badge className={`${statusConfig[currentOrder?.status || "draft"].color} text-white text-lg px-4 py-1`}>
                      {statusConfig[currentOrder?.status || "draft"].icon}
                      {statusConfig[currentOrder?.status || "draft"].label}
                    </Badge>
                    <span className="text-xl font-bold">N° {currentOrder?.numero_commande}</span>
                  </DialogDescription>
                </DialogHeader>

                <PurchaseOrderForm
                  mode="view"
                  formData={formData}
                  setFormData={() => {}}
                  fournisseurs={fournisseurs}
                  pointsVente={pointsVente}
                  produits={produits}
                  onSubmit={() => {}}
                  onCancel={() => setIsViewOpen(false)}
                />
              </DialogContent>
            </Dialog>

          </div>
        </div>
      </TooltipProvider>
    </POSLayout>
  );
}

function PurchaseOrderForm({ mode, formData, setFormData, fournisseurs, pointsVente, produits, onSubmit, onCancel }: any) {
  const isViewMode = mode === "view";
  const isCreateMode = mode === "create";

  // On utilise UNIQUEMENT "items" partout (plus cohérent avec le reste du code)
  const lignes = formData.lignes || [];

  // Calcul du total – maintenant ça marche !
  const totalCommande = lignes.reduce((sum: number, item: any) => {
    const qty = Number(item.quantite_commandee) || 0;
    const price = Number(item.prix_unitaire) || 0;
    return sum + qty * price;
  }, 0);

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...lignes];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, lignes: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      lignes: [...lignes, { produit: "", quantite_commandee: 1, quantite_recue: 0, prix_unitaire: 0 }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      lignes: lignes.filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!isViewMode) onSubmit(formData);
      }}
      className="space-y-8 mt-6"
    >
      {/* === EN-TÊTE : Statut + Fournisseur + Point de vente + Date === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Statut automatique en création */}
        {isCreateMode && (
          <div className="space-y-2">
            <Label className="text-lg font-semibold">Statut</Label>
            <div className="h-12 px-5 flex items-center bg-blue-100 dark:bg-blue-900/40 rounded-lg text-lg font-bold text-blue-700 dark:text-blue-300">
              <Package className="h-5 w-5 mr-2" />
             Confirme (automatique)
            </div>
          </div>
        )}

        {/* Statut en vue/édition */}
        {!isCreateMode && (
          <div className="space-y-2">
            <Label className="text-lg font-semibold">Statut</Label>
            <div className={`h-12 px-5 flex items-center rounded-lg text-white text-lg font-semibold ${statusConfig[formData.status]?.color || "bg-slate-500"}`}>
              {statusConfig[formData.status]?.icon}
              <span className="ml-2">{statusConfig[formData.status]?.label || "Inconnu"}</span>
            </div>
          </div>
        )}

        {/* Fournisseur */}
        <div className="space-y-2">
          <Label className="text-lg font-semibold flex items-center gap-1">
            Fournisseur <span className="text-red-500">*</span>
          </Label>
          {isViewMode ? (
            <div className="h-12 px-4 flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg text-lg font-medium">
              {fournisseurs.find((f: any) => f.id === formData.fournisseur)?.nom || "—"}
            </div>
          ) : (
            <Select
              value={formData.fournisseur}
              onValueChange={(v) => setFormData({ ...formData, fournisseur: v })}
              required={!isViewMode}
            >
              <SelectTrigger className="h-12 text-lg">
                <SelectValue placeholder="Sélectionner un fournisseur" />
              </SelectTrigger>
              <SelectContent>
                {fournisseurs.map((f: any) => (
                  <SelectItem key={f.id} value={f.id}>{f.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Point de vente */}
        <div className="space-y-2">
          <Label className="text-lg font-semibold">Point de vente</Label>
          {isViewMode ? (
            <div className="h-12 px-4 flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg text-lg font-medium">
              {pointsVente.find((p: any) => p.id === formData.point_vente)?.nom || "—"}
            </div>
          ) : (
            <Select value={formData.point_vente} onValueChange={(v) => setFormData({ ...formData, point_vente: v })}>
              <SelectTrigger className="h-12 text-lg">
                <SelectValue placeholder="Choisir..." />
              </SelectTrigger>
              <SelectContent>
                {pointsVente.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Date livraison */}
        <div className="space-y-2">
          <Label className="text-lg font-semibold">Date livraison prévue</Label>
          <Input
            type="date"
            value={formData.date_livraison_prevue || ""}
            onChange={(e) => setFormData({ ...formData, date_livraison_prevue: e.target.value })}
            disabled={isViewMode}
            className="h-12 text-lg"
          />
        </div>
      </div>

      {/* Commentaire */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Commentaire (facultatif)</Label>
        <Textarea
          value={formData.commentaire || ""}
          onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
          placeholder="Notes sur la commande..."
          disabled={isViewMode}
          className="min-h-24 text-lg"
        />
      </div>

      {/* === ARTICLES === */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label className="text-2xl font-bold flex items-center gap-3">
            Articles commandés
          </Label>
          <Badge variant="secondary" className="text-xl px-5 py-2">
            {lignes.length} article{lignes.length > 1 ? "s" : ""}
          </Badge>
        </div>

        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 bg-slate-50/50 dark:bg-slate-800/50">
          {lignes.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Package className="h-20 w-20 mx-auto mb-4 opacity-40" />
              <p className="text-xl">Aucun article ajouté</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100 dark:bg-slate-700">
                  <TableHead className="font-bold">Produit</TableHead>
                  <TableHead className="text-center font-bold">Qté commandée</TableHead>
                  <TableHead className="text-center font-bold">Qté reçue</TableHead>
                  <TableHead className="text-center font-bold">Prix unitaire</TableHead>
                  <TableHead className="text-center font-bold">Total ligne</TableHead>
                  {!isViewMode && <TableHead className="text-center">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {lignes.map((item: any, i: number) => {
                  const produit = produits.find((p: any) => p.id === item.produit);
                  const lineTotal = (item.quantite_commandee || 0) * (item.prix_unitaire || 0);

                  return (
                    <TableRow key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <TableCell>
                        {isViewMode ? (
                          <span className="font-medium">{produit?.nom || "—"}</span>
                        ) : (
                          <Select value={item.produit} onValueChange={(v) => handleItemChange(i, "produit", v)}>
                            <SelectTrigger><SelectValue placeholder="Choisir un produit" /></SelectTrigger>
                            <SelectContent>
                              {produits.map((p: any) => (
                                <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        {isViewMode ? item.quantite_commandee : (
                          <Input
                            type="number"
                            value={item.quantite_commandee || ""}
                            onChange={(e) => handleItemChange(i, "quantite_commandee", Number(e.target.value))}
                            className="w-24 text-center"
                            min="1"
                          />
                        )}
                      </TableCell>

                      <TableCell className="text-center font-medium text-emerald-600">
                        {item.quantite_recue || 0}
                      </TableCell>

                      <TableCell className="text-center">
                        {isViewMode ? (
                          <span className="font-mono">{Number(item.prix_unitaire).toLocaleString()} FC</span>
                        ) : (
                          <Input
                            type="number"
                            value={item.prix_unitaire || ""}
                            onChange={(e) => handleItemChange(i, "prix_unitaire", Number(e.target.value))}
                            className="w-32 text-center"
                            min="0"
                            step="100"
                          />
                        )}
                      </TableCell>

                      <TableCell className="text-center font-bold text-lg">
                        {lineTotal.toLocaleString()} FC
                      </TableCell>

                      {!isViewMode && (
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-red-600 hover:bg-red-50">
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {!isViewMode && (
            <Button type="button" onClick={addItem} variant="outline" size="lg" className="w-full mt-6 border-2 border-dashed border-purple-500 hover:bg-purple-50">
              <Plus className="h-6 w-6 mr-2" />
              Ajouter un article
            </Button>
          )}
        </div>

        </div>

        {/* === TOTAL COMMANDE === */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-8 -mx-6 -mb-6 mt-10">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">TOTAL COMMANDE</span>
            <span className="text-4xl font-extrabold">
              {totalCommande.toLocaleString("fr-FR")} FC
            </span>
          </div>
        </div>
     

      {/* === BOUTONS === */}
      <div className="flex justify-end gap-4 pt-6 border-t mt-6">
        <Button type="button" variant="outline" size="lg" onClick={onCancel}>
          {isViewMode ? "Fermer" : "Annuler"}
        </Button>
        {!isViewMode && (
          <Button
            type="submit"
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-10 text-lg font-bold"
          >
            {mode === "edit" ? "Mettre à jour" : "Créer la commande"}
          </Button>
        )}
      </div>
    </form>
  );
}
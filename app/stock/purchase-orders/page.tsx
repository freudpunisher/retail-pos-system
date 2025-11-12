"use client";
import { useState, useEffect, useMemo } from "react";
import { POSLayout } from "@/components/pos-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Truck,
  CheckCircle,
  Package,
  Loader2,
  AlertTriangle,
  Save,
} from "lucide-react";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import {
  PurchaseOrderResponse,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  Fournisseur,
  PointVente,
  Produit,
} from "@/types/PurchaseOrder";
import { flushSync } from "react-dom";

interface FormItem {
  id?: string;
  produit: string;
  quantite_commandee: number;
  quantite_recue: number;
  prix_unitaire: number;
}

interface FormData {
  numero_commande?: string;
  status: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';
  date_livraison_prevue: string;
  commentaire?: string;
  fournisseur: string;
  point_vente: string;
  items: FormItem[];
}

interface FormErrors {
  status?: string;
  fournisseur?: string;
  point_vente?: string;
  date_livraison_prevue?: string;
  items?: string;
  numero_commande?: string;
  itemErrors?: Array<{ produit?: string; quantite_commandee?: string; prix_unitaire?: string }>;
}

const statusOptions = [
  { value: "all", label: "Tous les Statuts" },
  { value: "draft", label: "Brouillon" },
  { value: "sent", label: "Envoyé" },
  { value: "confirmed", label: "Confirmé" },
  { value: "partially_received", label: "Partiellement Reçu" },
  { value: "received", label: "Reçu" },
  { value: "cancelled", label: "Annulé" },
];

export default function PurchaseOrdersPage() {
  const {
    purchaseOrders,
    fournisseurs,
    pointsVente,
    users,
    produits,
    loading,
    error,
    fetchPurchaseOrders,
    fetchFournisseurs,
    fetchPointsVente,
    fetchUsers,
    fetchProduits,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
  } = usePurchaseOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    status: "draft",
    date_livraison_prevue: "",
    commentaire: "",
    fournisseur: "",
    point_vente: "",
    items: [],
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const calculateLineTotal = useMemo(
    () => (quantite: number, prix: number): number => (quantite || 0) * (prix || 0),
    []
  );

  const calculateOrderTotal = useMemo(
    () =>
      (items: FormItem[]): number =>
        items?.reduce((total, item) => total + calculateLineTotal(item.quantite_commandee || 0, item.prix_unitaire || 0), 0) || 0,
    [calculateLineTotal]
  );

  useEffect(() => {
    fetchPurchaseOrders();
    fetchFournisseurs();
    fetchPointsVente();
    fetchUsers();
    fetchProduits();
  }, [fetchPurchaseOrders, fetchFournisseurs, fetchPointsVente, fetchUsers, fetchProduits]);

  useEffect(() => {
    if (selectedOrderId || editingOrderId) {
      const order = purchaseOrders.find((po) => po.id === (selectedOrderId || editingOrderId));
      if (order) {
        setFormData({
          numero_commande: order.numero_commande,
          status: order.status,
          date_livraison_prevue: order.date_livraison_prevue.split('T')[0],
          commentaire: order.commentaire || "",
          fournisseur: order.fournisseur,
          point_vente: order.point_vente,
          items: (order.lignes || []).map((line) => ({
            id: line.id,
            produit: line.produit,
            quantite_commandee: line.quantite_commandee,
            quantite_recue: line.quantite_recue,
            prix_unitaire: line.prix_unitaire,
          })),
        });
        setFormErrors({});
      }
    } else {
      setFormData({
        status: "draft",
        date_livraison_prevue: "",
        commentaire: "",
        fournisseur: "",
        point_vente: "",
        items: [],
      });
      setFormErrors({});
    }
  }, [selectedOrderId, editingOrderId, purchaseOrders]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {};
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  const validateForm = (data: FormData, isEdit: boolean): FormErrors => {
    console.log("Validating form data:", data);
    const errors: FormErrors = {};
    if (!data.status) errors.status = "Statut est requis";
    if (!data.fournisseur) errors.fournisseur = "Fournisseur est requis";
    if (!data.point_vente) errors.point_vente = "Point de vente est requis";
    if (!data.date_livraison_prevue) {
      errors.date_livraison_prevue = "Date de livraison prévue est requise";
    } else if (new Date(data.date_livraison_prevue) < new Date()) {
      errors.date_livraison_prevue = "La date doit être dans le futur";
    }
    if (data.items.length === 0) {
      errors.items = "Au moins un article est requis";
    } else {
      const itemErrors = data.items.map((item) => {
        const itemError: { produit?: string; quantite_commandee?: string; prix_unitaire?: string } = {};
        if (!item.produit) itemError.produit = "Produit est requis";
        if (!item.quantite_commandee || item.quantite_commandee < 1) {
          itemError.quantite_commandee = "Quantité doit être positive";
        }
        if (item.prix_unitaire === undefined || item.prix_unitaire < 0) {
          itemError.prix_unitaire = "Prix unitaire ne peut pas être négatif";
        }
        return itemError;
      });
      if (itemErrors.some((err) => Object.keys(err).length > 0)) {
        errors.itemErrors = itemErrors;
      }
    }
    if (isEdit && !data.numero_commande) {
      errors.numero_commande = "Numéro de commande est requis";
    }
    return errors;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof FormItem, value: any) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { produit: "", quantite_commandee: 1, quantite_recue: 0, prix_unitaire: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const filteredPOs = purchaseOrders.filter((po) => {
    const fournisseur = fournisseurs.find((f) => f.id === po.fournisseur);
    const matchesSearch =
      po.numero_commande.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fournisseur?.nom.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = selectedStatus === "all" || po.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: <Badge className="bg-gray-500 text-white">Brouillon</Badge>,
      sent: <Badge className="bg-blue-500 text-white">Envoyé</Badge>,
      confirmed: <Badge className="bg-purple-500 text-white">Confirmé</Badge>,
      partially_received: <Badge className="bg-yellow-500 text-white">Partiellement Reçu</Badge>,
      received: <Badge className="bg-green-500 text-white">Reçu</Badge>,
      cancelled: <Badge className="bg-red-500 text-white">Annulé</Badge>,
    };
    return badges[status as keyof typeof badges] || <Badge variant="outline">{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft": return <FileText className="h-4 w-4 text-gray-600" />;
      case "sent": return <Package className="h-4 w-4 text-blue-600" />;
      case "confirmed": return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case "partially_received": return <Truck className="h-4 w-4 text-yellow-600" />;
      case "received": return <Truck className="h-4 w-4 text-green-600" />;
      case "cancelled": return <FileText className="h-4 w-4 text-red-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCreateOrUpdateOrder = async (data: FormData, orderId?: string) => {
    const user = localStorage.getItem("user");
    const idUser = user ? JSON.parse(user).id : null;
    console.log("handleCreateOrUpdateOrder called with data:", data);
    const isEdit = !!orderId || !!editingOrderId;
    const errors = validateForm(data, isEdit);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors);
      alert("Veuillez corriger les erreurs dans le formulaire.");
      return;
    }

    try {
      const orderData: CreatePurchaseOrderRequest = {
        status: data.status,
        date_livraison_prevue: data.date_livraison_prevue,
        commentaire: data.commentaire,
        fournisseur: data.fournisseur,
        point_vente: data.point_vente,
        utilisateur: idUser,
        lignes: data.items.map((item) => {
          console.log("Mapping item:", item);
          return {
            quantite_commandee: Number(item.quantite_commandee),
            quantite_recue: Number(item.quantite_recue) || 0,
            prix_unitaire: Number(item.prix_unitaire),
            produit: item.produit,
          };
        }),
      };
      console.log("Prepared orderData:", orderData);

      const targetOrderId = orderId || editingOrderId;
      console.log("Target order ID:", targetOrderId);
      if (targetOrderId) {
        const updateData: UpdatePurchaseOrderRequest = {
          numero_commande: data.numero_commande!,
          status: data.status,
          date_livraison_prevue: data.date_livraison_prevue,
          commentaire: data.commentaire,
          fournisseur: data.fournisseur,
          point_vente: data.point_vente,
          utilisateur: "3a9d9fd3-5b7f-48b4-af7f-8eed0387d30f",
          lignes: data.items.map((item) => ({
            id: item.id,
            quantite_commandee: Number(item.quantite_commandee),
            quantite_recue: Number(item.quantite_recue) || 0,
            prix_unitaire: Number(item.prix_unitaire),
            produit: item.produit,
          })),
        };
        console.log("Calling updatePurchaseOrder with:", updateData);
        await updatePurchaseOrder(targetOrderId, updateData);
        flushSync(() => {
          setEditingOrderId(null);
          setIsEditModalOpen(false);
          setIsDetailModalOpen(false);
        });
      } else {
        console.log("Calling createPurchaseOrder with:", orderData);
        await createPurchaseOrder(orderData);
        flushSync(() => {
          setIsAddModalOpen(false);
        });
      }

      setFormData({
        status: "draft",
        date_livraison_prevue: "",
        commentaire: "",
        fournisseur: "",
        point_vente: "",
        items: [],
      });
      setFormErrors({});
      await fetchPurchaseOrders();
      alert("Commande créée/mise à jour avec succès !");
    } catch (err: any) {
      console.error("Error in handleCreateOrUpdateOrder:", err);
      alert("Erreur lors de la création/mise à jour de la commande : " + (err.message || "Erreur inconnue"));
    }
  };

  const handleEditOrder = (order: PurchaseOrderResponse) => {
    setEditingOrderId(order.id);
    setIsEditModalOpen(true);
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await deletePurchaseOrder(id);
      await fetchPurchaseOrders();
      alert("Commande supprimée avec succès !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression de la commande");
    }
  };

  const handleConfirmOrder = async (id: string) => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir confirmer cette commande ? Cette action rendra la commande non modifiable.");
    if (!confirmed) return;

    try {
      await updatePurchaseOrder(id, { status: 'confirmed' });
      await fetchPurchaseOrders();
      alert("Commande confirmée avec succès !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la confirmation de la commande");
    }
  };

  const handleReceiveOrder = async (id: string) => {
    try {
      await updatePurchaseOrder(id, { status: 'received' });
      await fetchPurchaseOrders();
      alert("Commande reçue avec succès !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la réception de la commande");
    }
  };

  if (loading && purchaseOrders.length === 0) {
    return (
      <POSLayout currentPath="/stock/purchase-orders">
        <div className="flex items-center justify-center h-96 bg-background/95 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg text-foreground">Chargement des commandes...</span>
        </div>
      </POSLayout>
    );
  }

  if (error && purchaseOrders.length === 0) {
    return (
      <POSLayout currentPath="/stock/purchase-orders">
        <div className="flex items-center justify-center h-96 bg-background/95 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <p className="text-destructive flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Erreur: {error}
            </p>
            <Button
              onClick={() => {
                fetchPurchaseOrders();
                fetchFournisseurs();
                fetchPointsVente();
                fetchUsers();
                fetchProduits();
              }}
              className="bg-primary hover:bg-primary/90"
            >
              Réessayer
            </Button>
          </div>
        </div>
      </POSLayout>
    );
  }

  return (
    <POSLayout currentPath="/stock/purchase-orders">
      <TooltipProvider>
        <div className="space-y-8 p-6 bg-gradient-to-b from-background to-background/90 min-h-screen">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Commandes Fournisseurs</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro ou fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64 border-muted focus:ring-primary"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48 border-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* <DialogTrigger asChild> */}
                <Button className="bg-primary hover:bg-primary/90 transition-colors" onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Commande
                </Button>
              {/* </DialogTrigger> */}
            </div>
          </div>

          <Card className="bg-background/95 shadow-lg border-muted">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Liste des Commandes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="text-foreground font-semibold">N° Commande</TableHead>
                    <TableHead className="text-foreground font-semibold">Fournisseur</TableHead>
                    <TableHead className="text-foreground font-semibold">Point de Vente</TableHead>
                    <TableHead className="text-foreground font-semibold">Statut</TableHead>
                    <TableHead className="text-foreground font-semibold">Date Livraison</TableHead>
                    <TableHead className="text-foreground font-semibold">Montant (FBU)</TableHead>
                    <TableHead className="text-foreground font-semibold">Articles</TableHead>
                    <TableHead className="text-foreground font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPOs.map((po) => {
                    const fournisseur = fournisseurs.find((f) => f.id === po.fournisseur);
                    const pointVente = pointsVente.find((pv) => pv.id === po.point_vente);
                    return (
                      <TableRow key={po.id} className="hover:bg-muted/20">
                        <TableCell className="font-medium">{po.numero_commande}</TableCell>
                        <TableCell>{fournisseur?.nom || "Inconnu"}</TableCell>
                        <TableCell>{pointVente?.nom || "Inconnu"}</TableCell>
                        <TableCell>{getStatusBadge(po.status)}</TableCell>
                        <TableCell>{formatDate(po.date_livraison_prevue)}</TableCell>
                        <TableCell>{po.montant_total.toLocaleString('fr-FR')} FBU</TableCell>
                        <TableCell>{po.lignes?.length || 0}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedOrderId(po.id);
                                    setIsDetailModalOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Voir Détails</TooltipContent>
                            </Tooltip>
                            {po.status === "draft" && (
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditOrder(po)}
                                    >
                                      <Edit className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Modifier</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteOrder(po.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Supprimer</TooltipContent>
                                </Tooltip>
                              </>
                            )}
                            {po.status === "sent" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleConfirmOrder(po.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 text-purple-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Confirmer</TooltipContent>
                              </Tooltip>
                            )}
                            {["confirmed", "partially_received"].includes(po.status) && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleReceiveOrder(po.id)}
                                  >
                                    <Truck className="h-4 w-4 text-green-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Marquer comme Reçu</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogContent
              className="max-h-[95vh] overflow-y-auto p-8"
              style={{ width: '70vw', maxWidth: '70vw', minWidth: '70vw' }}
            >
              <DialogHeader>
                <DialogTitle>Créer une Commande Fournisseur</DialogTitle>
                <DialogDescription>Ajouter une nouvelle commande avec ses articles.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log("Form submitted with data:", formData);
                  handleCreateOrUpdateOrder(formData);
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">Statut</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange("status", value)}
                    >
                      <SelectTrigger className="border-muted">
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.slice(1).map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.status && (
                      <p className="text-sm text-destructive">{formErrors.status}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fournisseur" className="text-sm font-medium">Fournisseur</Label>
                    <Select
                      value={formData.fournisseur}
                      onValueChange={(value) => handleInputChange("fournisseur", value)}
                    >
                      <SelectTrigger className="border-muted">
                        <SelectValue placeholder="Sélectionner un fournisseur" />
                      </SelectTrigger>
                      <SelectContent>
                        {fournisseurs.map((fournisseur) => (
                          <SelectItem key={fournisseur.id} value={fournisseur.id}>
                            {fournisseur.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.fournisseur && (
                      <p className="text-sm text-destructive">{formErrors.fournisseur}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="point_vente" className="text-sm font-medium">Point de Vente</Label>
                    <Select
                      value={formData.point_vente}
                      onValueChange={(value) => handleInputChange("point_vente", value)}
                    >
                      <SelectTrigger className="border-muted">
                        <SelectValue placeholder="Sélectionner un point de vente" />
                      </SelectTrigger>
                      <SelectContent>
                        {pointsVente.map((pv) => (
                          <SelectItem key={pv.id} value={pv.id}>
                            {pv.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.point_vente && (
                      <p className="text-sm text-destructive">{formErrors.point_vente}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_livraison_prevue" className="text-sm font-medium">Date de Livraison Prévue</Label>
                    <Input
                      id="date_livraison_prevue"
                      type="date"
                      value={formData.date_livraison_prevue}
                      onChange={(e) => handleInputChange("date_livraison_prevue", e.target.value)}
                      className="border-muted focus:ring-primary"
                    />
                    {formErrors.date_livraison_prevue && (
                      <p className="text-sm text-destructive">{formErrors.date_livraison_prevue}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commentaire" className="text-sm font-medium">Commentaire</Label>
                  <Textarea
                    id="commentaire"
                    value={formData.commentaire || ""}
                    onChange={(e) => handleInputChange("commentaire", e.target.value)}
                    placeholder="Commentaires sur la commande"
                    className="border-muted focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Articles de la Commande</Label>
                  {formErrors.items && (
                    <p className="text-sm text-destructive">{formErrors.items}</p>
                  )}
                  <div className="border rounded-lg bg-background/95">
                    {formData.items.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Aucun article ajouté</p>
                    ) : (
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow className="hover:bg-muted/50">
                            <TableHead className="text-foreground font-semibold w-1/4">Produit</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-1/6">Qté Commandée</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-1/6">Qté Reçue</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-1/6">Prix Unit. (FBU)</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-1/6">Total Ligne (FBU)</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.items.map((item, index) => (
                            <TableRow key={index} className="hover:bg-muted/20">
                              <TableCell className="py-2">
                                <Select
                                  value={item.produit}
                                  onValueChange={(value) => handleItemChange(index, "produit", value)}
                                >
                                  <SelectTrigger className="border-muted h-9">
                                    <SelectValue placeholder="Sélectionner un produit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {produits.map((produit) => (
                                      <SelectItem key={produit.id} value={produit.id}>
                                        {produit.nom}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {formErrors.itemErrors?.[index]?.produit && (
                                  <p className="text-xs text-destructive mt-1">{formErrors.itemErrors[index].produit}</p>
                                )}
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                <Input
                                  type="number"
                                  value={item.quantite_commandee}
                                  onChange={(e) => handleItemChange(index, "quantite_commandee", Number(e.target.value))}
                                  className="border-muted focus:ring-primary h-9 text-center"
                                  min="1"
                                />
                                {formErrors.itemErrors?.[index]?.quantite_commandee && (
                                  <p className="text-xs text-destructive mt-1">{formErrors.itemErrors[index].quantite_commandee}</p>
                                )}
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                <Input
                                  type="number"
                                  value={item.quantite_recue}
                                  onChange={(e) => handleItemChange(index, "quantite_recue", Number(e.target.value))}
                                  className="border-muted focus:ring-primary h-9 text-center"
                                  min="0"
                                />
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                <Input
                                  type="number"
                                  value={item.prix_unitaire}
                                  onChange={(e) => handleItemChange(index, "prix_unitaire", Number(e.target.value))}
                                  className="border-muted focus:ring-primary h-9 text-center"
                                  min="0"
                                />
                                {formErrors.itemErrors?.[index]?.prix_unitaire && (
                                  <p className="text-xs text-destructive mt-1">{formErrors.itemErrors[index].prix_unitaire}</p>
                                )}
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                {calculateLineTotal(item.quantite_commandee, item.prix_unitaire).toLocaleString('fr-FR')} FBU
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(index)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addItem}
                      className="m-2 border-muted"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un Article
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">
                    Total Commande: {calculateOrderTotal(formData.items).toLocaleString('fr-FR')} FBU
                  </div>
                  <div className="flex space-x-2">
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
                      {loading ? "Ajout..." : "Créer Commande"}
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent
              className="max-h-[95vh] overflow-y-auto p-8"
              style={{ width: '70vw', maxWidth: '70vw', minWidth: '70vw' }}
            >
              <DialogHeader>
                <DialogTitle>Modifier la Commande</DialogTitle>
                <DialogDescription>Modifier les détails de la commande fournisseur.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log("Form submitted with data:", formData);
                  handleCreateOrUpdateOrder(formData);
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero_commande" className="text-sm font-medium">Numéro de Commande</Label>
                    <Input
                      id="numero_commande"
                      value={formData.numero_commande || ""}
                      readOnly
                      className="border-muted bg-muted/20"
                    />
                    {formErrors.numero_commande && (
                      <p className="text-sm text-destructive">{formErrors.numero_commande}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">Statut</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange("status", value)}
                    >
                      <SelectTrigger className="border-muted">
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.slice(1).map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.status && (
                      <p className="text-sm text-destructive">{formErrors.status}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fournisseur" className="text-sm font-medium">Fournisseur</Label>
                    <Select
                      value={formData.fournisseur}
                      onValueChange={(value) => handleInputChange("fournisseur", value)}
                    >
                      <SelectTrigger className="border-muted">
                        <SelectValue placeholder="Sélectionner un fournisseur" />
                      </SelectTrigger>
                      <SelectContent>
                        {fournisseurs.map((fournisseur) => (
                          <SelectItem key={fournisseur.id} value={fournisseur.id}>
                            {fournisseur.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.fournisseur && (
                      <p className="text-sm text-destructive">{formErrors.fournisseur}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="point_vente" className="text-sm font-medium">Point de Vente</Label>
                    <Select
                      value={formData.point_vente}
                      onValueChange={(value) => handleInputChange("point_vente", value)}
                    >
                      <SelectTrigger className="border-muted">
                        <SelectValue placeholder="Sélectionner un point de vente" />
                      </SelectTrigger>
                      <SelectContent>
                        {pointsVente.map((pv) => (
                          <SelectItem key={pv.id} value={pv.id}>
                            {pv.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.point_vente && (
                      <p className="text-sm text-destructive">{formErrors.point_vente}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_livraison_prevue" className="text-sm font-medium">Date de Livraison Prévue</Label>
                  <Input
                    id="date_livraison_prevue"
                    type="date"
                    value={formData.date_livraison_prevue}
                    onChange={(e) => handleInputChange("date_livraison_prevue", e.target.value)}
                    className="border-muted focus:ring-primary"
                  />
                  {formErrors.date_livraison_prevue && (
                    <p className="text-sm text-destructive">{formErrors.date_livraison_prevue}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commentaire" className="text-sm font-medium">Commentaire</Label>
                  <Textarea
                    id="commentaire"
                    value={formData.commentaire || ""}
                    onChange={(e) => handleInputChange("commentaire", e.target.value)}
                    placeholder="Commentaires sur la commande"
                    className="border-muted focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Articles de la Commande</Label>
                  {formErrors.items && (
                    <p className="text-sm text-destructive">{formErrors.items}</p>
                  )}
                  <div className="border rounded-lg bg-background/95">
                    {formData.items.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Aucun article ajouté</p>
                    ) : (
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow className="hover:bg-muted/50">
                            <TableHead className="text-foreground font-semibold w-1/4">Produit</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-1/6">Qté Commandée</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-1/6">Qté Reçue</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-1/6">Prix Unit. (FBU)</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-1/6">Total Ligne (FBU)</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.items.map((item, index) => (
                            <TableRow key={index} className="hover:bg-muted/20">
                              <TableCell className="py-2">
                                <Select
                                  value={item.produit}
                                  onValueChange={(value) => handleItemChange(index, "produit", value)}
                                >
                                  <SelectTrigger className="border-muted h-9">
                                    <SelectValue placeholder="Sélectionner un produit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {produits.map((produit) => (
                                      <SelectItem key={produit.id} value={produit.id}>
                                        {produit.nom}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {formErrors.itemErrors?.[index]?.produit && (
                                  <p className="text-xs text-destructive mt-1">{formErrors.itemErrors[index].produit}</p>
                                )}
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                <Input
                                  type="number"
                                  value={item.quantite_commandee}
                                  onChange={(e) => handleItemChange(index, "quantite_commandee", Number(e.target.value))}
                                  className="border-muted focus:ring-primary h-9 text-center"
                                  min="1"
                                />
                                {formErrors.itemErrors?.[index]?.quantite_commandee && (
                                  <p className="text-xs text-destructive mt-1">{formErrors.itemErrors[index].quantite_commandee}</p>
                                )}
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                <Input
                                  type="number"
                                  value={item.quantite_recue}
                                  onChange={(e) => handleItemChange(index, "quantite_recue", Number(e.target.value))}
                                  className="border-muted focus:ring-primary h-9 text-center"
                                  min="0"
                                />
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                <Input
                                  type="number"
                                  value={item.prix_unitaire}
                                  onChange={(e) => handleItemChange(index, "prix_unitaire", Number(e.target.value))}
                                  className="border-muted focus:ring-primary h-9 text-center"
                                  min="0"
                                />
                                {formErrors.itemErrors?.[index]?.prix_unitaire && (
                                  <p className="text-xs text-destructive mt-1">{formErrors.itemErrors[index].prix_unitaire}</p>
                                )}
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                {calculateLineTotal(item.quantite_commandee, item.prix_unitaire).toLocaleString('fr-FR')} FBU
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(index)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addItem}
                      className="m-2 border-muted"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un Article
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">
                    Total Commande: {calculateOrderTotal(formData.items).toLocaleString('fr-FR')} FBU
                  </div>
                  <div className="flex space-x-2">
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
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {loading ? "Mise à jour..." : "Mettre à jour"}
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
            <DialogContent
              className="max-h-[95vh] overflow-y-auto p-8"
              style={{ width: '70vw', maxWidth: '70vw', minWidth: '70vw' }}
            >
              <DialogHeader>
                <DialogTitle>Détails de la Commande</DialogTitle>
                <DialogDescription>Voir les détails de la commande fournisseur.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Numéro de Commande</Label>
                    <Input value={formData.numero_commande || ""} readOnly className="border-muted bg-muted/20" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Statut</Label>
                    <Input
                      value={statusOptions.find((opt) => opt.value === formData.status)?.label || ""}
                      readOnly
                      className="border-muted bg-muted/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Fournisseur</Label>
                    <Input
                      value={fournisseurs.find((f) => f.id === formData.fournisseur)?.nom || ""}
                      readOnly
                      className="border-muted bg-muted/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Point de Vente</Label>
                    <Input
                      value={pointsVente.find((pv) => pv.id === formData.point_vente)?.nom || ""}
                      readOnly
                      className="border-muted bg-muted/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date de Livraison Prévue</Label>
                  <Input
                    value={formData.date_livraison_prevue ? formatDate(formData.date_livraison_prevue) : ""}
                    readOnly
                    className="border-muted bg-muted/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Commentaire</Label>
                  <Textarea value={formData.commentaire || ""} readOnly className="border-muted bg-muted/20" />
                </div>
                <div className="space-y-2">
                  <Label>Articles de la Commande</Label>
                  <div className="border rounded-lg bg-background/95">
                    {formData.items.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Aucun article</p>
                    ) : (
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow className="hover:bg-muted/50">
                            <TableHead className="text-foreground font-semibold w-1/4">Produit</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-1/6">Qté Commandée</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-1/6">Qté Reçue</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-1/6">Prix Unit. (FBU)</TableHead>
                            <TableHead className="text-foreground font-semibold text-center w-1/6">Total Ligne (FBU)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.items.map((item, index) => (
                            <TableRow key={index} className="hover:bg-muted/20">
                              <TableCell className="py-2">
                                {produits.find((p) => p.id === item.produit)?.nom || "Inconnu"}
                              </TableCell>
                              <TableCell className="py-2 text-center">{item.quantite_commandee}</TableCell>
                              <TableCell className="py-2 text-center">{item.quantite_recue}</TableCell>
                              <TableCell className="py-2 text-center">{item.prix_unitaire.toLocaleString('fr-FR')} FBU</TableCell>
                              <TableCell className="py-2 text-center">
                                {calculateLineTotal(item.quantite_commandee, item.prix_unitaire).toLocaleString('fr-FR')} FBU
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
                <div className="text-sm font-medium">
                  Total Commande: {calculateOrderTotal(formData.items).toLocaleString('fr-FR')} FBU
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </POSLayout>
  );
}
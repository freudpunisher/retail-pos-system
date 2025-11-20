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
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Search, Plus, Factory, Phone, Mail, Eye, Edit, Trash2, Clock, Loader2,
  RefreshCw, Building2, Truck, CheckCircle2, XCircle, UserCheck
} from "lucide-react";
import { useFournisseurs } from "@/hooks/use-fournisseur";
import { FournisseurResponse } from "@/types/fournisseur";

interface FormData {
  nom: string;
  contact_nom: string;
  telephone: string;
  email: string;
  conditions_paiement: string;
  delai_livraison: number;
  adresse: string;
  is_active: boolean;
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
  } = useFournisseurs();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<FournisseurResponse | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<FournisseurResponse | null>(null);

  const { control, handleSubmit, register, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      nom: "",
      contact_nom: "",
      telephone: "",
      email: "",
      conditions_paiement: "Net 30",
      delai_livraison: 7,
      adresse: "",
      is_active: true,
    }
  });

  useEffect(() => { fetchFournisseurs(); }, [fetchFournisseurs]);

  const filtered = fournisseurs.filter(s => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = s.nom.toLowerCase().includes(search) ||
                         s.contact_nom.toLowerCase().includes(search) ||
                         s.email.toLowerCase().includes(search);
    const matchesStatus = selectedStatus === "all" ||
                         (selectedStatus === "active" && s.is_active) ||
                         (selectedStatus === "inactive" && !s.is_active);
    return matchesSearch && matchesStatus;
  });

  const total = fournisseurs.length;
  const active = fournisseurs.filter(s => s.is_active).length;
  const avgDelay = fournisseurs.length > 0
    ? Math.round(fournisseurs.reduce((a, s) => a + s.delai_livraison, 0) / fournisseurs.length)
    : 0;

  const onSubmit = async (data: FormData) => {
    try {
      if (editingSupplier) {
        await updateFournisseur(editingSupplier.id, data);
        toast.success("Fournisseur mis à jour");
        setIsEditOpen(false);
      } else {
        await createFournisseur(data);
        toast.success("Fournisseur ajouté avec succès");
        setIsAddOpen(false);
      }
      reset();
      setEditingSupplier(null);
      fetchFournisseurs();
    } catch (err) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const openEdit = (s: FournisseurResponse) => {
    setEditingSupplier(s);
    reset({
      nom: s.nom,
      contact_nom: s.contact_nom,
      telephone: s.telephone,
      email: s.email,
      conditions_paiement: s.conditions_paiement,
      delai_livraison: s.delai_livraison,
      adresse: s.adresse,
      is_active: s.is_active,
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer ce fournisseur ?")) {
      await deleteFournisseur(id);
      toast.success("Fournisseur supprimé");
      fetchFournisseurs();
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    await toggleFournisseurActive(id, !active);
    toast.success(active ? "Fournisseur désactivé" : "Fournisseur activé");
    fetchFournisseurs();
  };

  if (loading) {
    return (
      <POSLayout currentPath="/fournisseurs">
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
        </div>
      </POSLayout>
    );
  }

  return (
    <POSLayout currentPath="/fournisseurs">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="p-8 space-y-8 max-w-screen-2xl mx-auto">

          {/* Header Premium */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl shadow-2xl">
                  <Factory className="h-20 w-20 text-white" />
                </div>
                <div>
                  <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Fournisseurs
                  </h1>
                  <p className="text-2xl text-slate-600 dark:text-slate-400 mt-3 flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-blue-600" />
                    Gestion complète des partenaires d'approvisionnement
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button size="lg" variant="outline" onClick={fetchFournisseurs}>
                  <RefreshCw className="h-6 w-6 mr-3" />
                  Actualiser
                </Button>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl">
                      <Plus className="h-6 w-6 mr-3" />
                      Nouveau Fournisseur
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-bold text-blue-700">Ajouter un Fournisseur</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label className="text-lg font-semibold">Nom de l'entreprise <span className="text-red-500">*</span></Label>
                          <Input {...register("nom", { required: "Requis" })} className="h-12 text-lg mt-2" placeholder="Ex: Coca-Cola Burundi" />
                          {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom.message}</p>}
                        </div>
                        <div>
                          <Label className="text-lg font-semibold">Contact principal <span className="text-red-500">*</span></Label>
                          <Input {...register("contact_nom", { required: "Requis" })} className="h-12 text-lg mt-2" placeholder="Jean Dupont" />
                        </div>
                        <div>
                          <Label className="text-lg font-semibold">Téléphone <span className="text-red-500">*</span></Label>
                          <Input {...register("telephone", { required: "Requis" })} className="h-12 text-lg mt-2" placeholder="+257 79 123 456" />
                        </div>
                        <div>
                          <Label className="text-lg font-semibold">Email <span className="text-red-500">*</span></Label>
                          <Input type="email" {...register("email", { required: "Requis" })} className="h-12 text-lg mt-2" placeholder="contact@coca.bi" />
                        </div>
                        <div>
                          <Label className="text-lg font-semibold">Conditions de paiement</Label>
                          <Controller
                            name="conditions_paiement"
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="h-12 text-lg mt-2">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Net 15">Net 15 jours</SelectItem>
                                  <SelectItem value="Net 30">Net 30 jours</SelectItem>
                                  <SelectItem value="Net 45">Net 45 jours</SelectItem>
                                  <SelectItem value="Net 60">Net 60 jours</SelectItem>
                                  <SelectItem value="COD">À la livraison</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <div>
                          <Label className="text-lg font-semibold">Délai moyen de livraison (jours)</Label>
                          <Input type="number" {...register("delai_livraison", { valueAsNumber: true, min: 1 })} defaultValue={7} className="h-12 text-lg mt-2" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-lg font-semibold">Adresse complète</Label>
                        <Textarea {...register("adresse")} rows={3} className="mt-2 text-lg" placeholder="Quartier, Avenue, Bujumbura..." />
                      </div>
                      <div className="flex justify-end gap-4 pt-6 border-t">
                        <Button type="button" variant="outline" size="lg" onClick={() => setIsAddOpen(false)}>Annuler</Button>
                        <Button type="submit" size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-10">
                          <Plus className="h-6 w-6 mr-3" />
                          Ajouter le Fournisseur
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Stats Premium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-2xl border-0">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-lg">Total Fournisseurs</p>
                    <p className="text-5xl font-extrabold mt-2">{total}</p>
                  </div>
                  <Factory className="h-20 w-20 opacity-30" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-2xl border-0">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100">Actifs</p>
                    <p className="text-4xl font-bold mt-2">{active}</p>
                  </div>
                  <CheckCircle2 className="h-16 w-16 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-2xl border-0">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100">Délai Moyen</p>
                    <p className="text-4xl font-bold mt-2">{avgDelay} j</p>
                  </div>
                  <Truck className="h-16 w-16 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres + Tableau */}
          <Card className="shadow-2xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl font-bold flex items-center gap-4">
                  <Building2 className="h-10 w-10 text-blue-600" />
                  Répertoire des Fournisseurs
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input placeholder="Rechercher un fournisseur..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-12 h-12 w-96" />
                  </div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-56 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="active">Actifs uniquement</SelectItem>
                      <SelectItem value="inactive">Inactifs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50 dark:bg-blue-900/30">
                    <TableHead className="font-bold text-lg text-blue-700">Fournisseur</TableHead>
                    <TableHead className="font-bold text-lg text-blue-700">Contact</TableHead>
                    <TableHead className="font-bold text-lg text-blue-700">Conditions</TableHead>
                    <TableHead className="font-bold text-lg text-blue-700 text-center">Délai</TableHead>
                    <TableHead className="font-bold text-lg text-blue-700 text-center">Statut</TableHead>
                    <TableHead className="font-bold text-lg text-blue-700">Créé le</TableHead>
                    <TableHead className="font-bold text-lg text-blue-700 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(s => (
                    <TableRow key={s.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 h-20">
                      <TableCell className="font-bold text-lg">{s.nom}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-blue-600" />
                            {s.contact_nom}
                          </p>
                          <p className="text-sm text-slate-600 flex items-center gap-2">
                            <Phone className="h-4 w-4" /> {s.telephone}
                          </p>
                          <p className="text-sm text-slate-600 flex items-center gap-2">
                            <Mail className="h-4 w-4" /> {s.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-base px-4 py-2">{s.conditions_paiement}</Badge>
                      </TableCell>
                      <TableCell className="text-center font-bold text-xl">
                        <span className="flex items-center justify-center gap-2">
                          <Clock className="h-5 w-5 text-amber-600" />
                          {s.delai_livraison} j
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`text-white text-lg px-5 py-2 ${s.is_active ? "bg-emerald-500" : "bg-red-500"}`}>
                          {s.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {format(new Date(s.created_at), "dd MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-3">
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedSupplier(s); setIsDetailOpen(true); }}>
                            <Eye className="h-5 w-5 text-blue-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openEdit(s)}>
                            <Edit className="h-5 w-5 text-blue-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleToggle(s.id, s.is_active)}>
                            {s.is_active ? <XCircle className="h-5 w-5 text-red-600" /> : <CheckCircle2 className="h-5 w-5 text-green-600" />}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id)}>
                            <Trash2 className="h-5 w-5 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

         {/* ──────────────────────── MODAL ÉDITION ──────────────────────── */}
<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
  <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-3xl font-bold text-blue-700">
        Modifier le Fournisseur
      </DialogTitle>
    </DialogHeader>
    {editingSupplier && (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-lg font-semibold">Nom de l'entreprise <span className="text-red-500">*</span></Label>
            <Input {...register("nom", { required: "Requis" })} className="h-12 text-lg mt-2" />
            {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom.message}</p>}
          </div>
          <div>
            <Label className="text-lg font-semibold">Contact principal <span className="text-red-500">*</span></Label>
            <Input {...register("contact_nom", { required: "Requis" })} className="h-12 text-lg mt-2" />
          </div>
          <div>
            <Label className="text-lg font-semibold">Téléphone <span className="text-red-500">*</span></Label>
            <Input {...register("telephone", { required: "Requis" })} className="h-12 text-lg mt-2" />
          </div>
          <div>
            <Label className="text-lg font-semibold">Email <span className="text-red-500">*</span></Label>
            <Input type="email" {...register("email", { required: "Requis" })} className="h-12 text-lg mt-2" />
          </div>
          <div>
            <Label className="text-lg font-semibold">Conditions de paiement</Label>
            <Controller
              name="conditions_paiement"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-12 text-lg mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 15">Net 15 jours</SelectItem>
                    <SelectItem value="Net 30">Net 30 jours</SelectItem>
                    <SelectItem value="Net 45">Net 45 jours</SelectItem>
                    <SelectItem value="Net 60">Net 60 jours</SelectItem>
                    <SelectItem value="COD">À la livraison</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <Label className="text-lg font-semibold">Délai moyen de livraison (jours)</Label>
            <Input type="number" {...register("delai_livraison", { valueAsNumber: true, min: 1 })} className="h-12 text-lg mt-2" />
          </div>
        </div>

        <div>
          <Label className="text-lg font-semibold">Adresse complète</Label>
          <Textarea {...register("adresse")} rows={3} className="mt-2 text-lg" />
        </div>

        <div className="flex items-center gap-4">
          <Label className="text-lg font-semibold">Statut</Label>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Select onValueChange={(v) => field.onChange(v === "true")} value={field.value.toString()}>
                <SelectTrigger className="w-48 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">
                    <Badge className="bg-emerald-500 text-white">Actif</Badge>
                  </SelectItem>
                  <SelectItem value="false">
                    <Badge className="bg-red-500 text-white">Inactif</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button type="button" variant="outline" size="lg" onClick={() => { setIsEditOpen(false); setEditingSupplier(null); }}>
            Annuler
          </Button>
          <Button type="submit" size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-10">
            Mettre à jour le Fournisseur
          </Button>
        </div>
      </form>
    )}
  </DialogContent>
</Dialog>

{/* ──────────────────────── MODAL DÉTAIL ──────────────────────── */}
<Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
  <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-4xl font-bold text-blue-700 flex items-center gap-4">
        <Factory className="h-12 w-12 text-blue-600" />
        {selectedSupplier?.nom}
      </DialogTitle>
    </DialogHeader>

    {selectedSupplier && (
      <div className="space-y-8 mt-6">
        {/* Infos principales */}
        <div className="grid grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30">
            <CardHeader>
              <CardTitle className="text-xl text-blue-700 flex items-center gap-3">
                <UserCheck className="h-7 w-7" /> Contact Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg">
              <div className="font-semibold text-2xl">{selectedSupplier.contact_nom}</div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-600" />
                <span>{selectedSupplier.telephone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <span>{selectedSupplier.email}</span>
              </div>
              <div className="pt-2 text-blue-800 dark:text-blue-300">
                {selectedSupplier.adresse || "Adresse non renseignée"}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30">
            <CardHeader>
              <CardTitle className="text-xl text-emerald-700 flex items-center gap-3">
                <Truck className="h-7 w-7" /> Conditions & Délais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-lg">
              <div className="flex justify-between">
                <span className="font-medium">Conditions de paiement :</span>
                <Badge variant="secondary" className="text-base px-4 py-2">{selectedSupplier.conditions_paiement}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Délai moyen de livraison :</span>
                <span className="font-bold text-2xl text-emerald-700">{selectedSupplier.delai_livraison} jours</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Statut :</span>
                <Badge className={`text-white text-lg px-6 py-2 ${selectedSupplier.is_active ? "bg-emerald-500" : "bg-red-500"}`}>
                  {selectedSupplier.is_active ? "ACTIF" : "INACTIF"}
                </Badge>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Créé le :</span>
                <span>{format(new Date(selectedSupplier.created_at), "dd MMMM yyyy à HH:mm", { locale: fr })}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button size="lg" variant="outline" onClick={() => setIsDetailOpen(false)}>
            Fermer
          </Button>
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700" onClick={() => { setIsDetailOpen(false); openEdit(selectedSupplier); }}>
            Modifier ce fournisseur
          </Button>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>

        </div>
      </div>
    </POSLayout>
  );
}
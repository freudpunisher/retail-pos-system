"use client";
import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search, Plus, Eye, Package, Store, Truck, CheckCircle2, AlertTriangle,
  Loader2, RefreshCw, ArrowRightLeft, User, Calendar
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { usePointsVente } from "@/hooks/usePointsVente";
import { useUsers } from "@/hooks/useUsers";
import { useTransferts } from "@/hooks/useTransfertsStock";
import { TransfertStock, PointVente, Utilisateur, Produit } from "@/types/transfertsStock";

const getCurrentUser = (): Utilisateur | null => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

interface FormData {
  numero_transfert: string;
  point_vente_source: string;
  point_vente_destination: string;
  demandeur: string;
  commentaire?: string;
  lignes: { produit: string; quantite_demandee: number; quantite_expediee: number; quantite_recue: number }[];
}

export default function StockTransfersPage() {
  const { products, productsLoading } = useProducts();
  const { pointsVente, pointsVenteLoading } = usePointsVente();
  const { users } = useUsers();
  const { transferts, transfertsloading, loadTransferts, addTransfert, editTransfert } = useTransferts();
  const currentUser = getCurrentUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTransfert, setSelectedTransfert] = useState<TransfertStock | null>(null);

  const { control, handleSubmit, reset, register, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      numero_transfert: `TR-${format(new Date(), "yyyyMMdd-HHmm")}`,
      point_vente_source: "",
      point_vente_destination: "",
      demandeur: currentUser?.id || "",
      commentaire: "",
      lignes: []
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lignes" });

  useEffect(() => { loadTransferts(); }, [loadTransferts]);

  const filtered = transferts.filter(t =>
    t.numero_transfert.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedStatus === "all" || t.status === selectedStatus)
  );

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: "En attente", color: "bg-gray-500", icon: <Package className="h-5 w-5" /> },
    validated: { label: "Validé", color: "bg-blue-500", icon: <CheckCircle2 className="h-5 w-5" /> },
    shipped: { label: "Expédié", color: "bg-yellow-500", icon: <Truck className="h-5 w-5" /> },
    received: { label: "Reçu", color: "bg-green-500", icon: <CheckCircle2 className="h-5 w-5" /> },
    cancelled: { label: "Annulé", color: "bg-red-500", icon: <AlertTriangle className="h-5 w-5" /> },
  };

  const getBadge = (status: string) => {
    const cfg = statusConfig[status] || statusConfig.pending;
    return <Badge className={`${cfg.color} text-white font-semibold`}>{cfg.label}</Badge>;
  };

  const handleAction = async (id: string, status: "validated" | "shipped" | "received") => {
    try {
      await editTransfert(id, { status });
      toast.success(`Transfert ${status === "validated" ? "validé" : status === "shipped" ? "expédié" : "reçu"} !`);
      loadTransferts();
    } catch { toast.error("Échec de l'opération"); }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await addTransfert({ ...data, status: "pending" } as any);
      toast.success("Transfert créé avec succès");
      setIsAddOpen(false);
      reset();
      loadTransferts();
    } catch { toast.error("Erreur lors de la création"); }
  };

  if (transfertsloading) {
    return (
      <POSLayout currentPath="/stock/transfers">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
        </div>
      </POSLayout>
    );
  }

  return (
    <POSLayout currentPath="/stock/transfers">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="p-8 space-y-8 max-w-screen-2xl mx-auto">

          {/* Header Premium */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl shadow-2xl">
                  <ArrowRightLeft className="h-20 w-20 text-white" />
                </div>
                <div>
                  <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Transferts de Stock
                  </h1>
                  <p className="text-2xl text-slate-600 dark:text-slate-400 mt-3 flex items-center gap-3">
                    <Store className="h-8 w-8 text-blue-600" />
                    Gestion des mouvements entre points de vente
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button size="lg" variant="outline" onClick={loadTransferts} disabled={transfertsloading}>
                  <RefreshCw className={`h-6 w-6 mr-3 ${transfertsloading ? "animate-spin" : ""}`} />
                  Actualiser
                </Button>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl">
                      <Plus className="h-6 w-6 mr-3" />
                      Nouveau Transfert
                    </Button>
                  </DialogTrigger>
            
                  <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto" style={{ width: "80vh", maxWidth: "80vh" }}>
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-bold text-blue-700">Créer un Transfert de Stock</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label className="text-lg font-semibold">Numéro de transfert</Label>
                          <Input {...register("numero_transfert")} className="h-12 text-lg mt-2" readOnly />
                        </div>
                        <div>
                          <Label className="text-lg font-semibold">Demandeur</Label>
                          <div className="h-12 mt-2 px-4 flex items-center bg-blue-50 dark:bg-blue-900/30 rounded-lg text-lg font-medium text-blue-700 dark:text-blue-300">
                            <User className="h-5 w-5 mr-3" />
                            {currentUser?.prenom} {currentUser?.nom}
                          </div>
                          <input type="hidden" {...register("demandeur")} />
                        </div>
                        <div>
                          <Label className="text-lg font-semibold">Point de vente source <span className="text-red-500">*</span></Label>
                          <Controller
                            name="point_vente_source"
                            control={control}
                            rules={{ required: "Champ requis" }}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="h-12 text-lg mt-2">
                                  <SelectValue placeholder="Choisir la source..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {pointsVente.map(pv => (
                                    <SelectItem key={pv.id} value={pv.id}>{pv.nom}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.point_vente_source && <p className="text-red-500 text-sm mt-1">{errors.point_vente_source.message}</p>}
                        </div>
                        <div>
                          <Label className="text-lg font-semibold">Point de vente destination <span className="text-red-500">*</span></Label>
                          <Controller
                            name="point_vente_destination"
                            control={control}
                            rules={{ required: "Champ requis" }}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="h-12 text-lg mt-2">
                                  <SelectValue placeholder="Choisir la destination..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {pointsVente.map(pv => (
                                    <SelectItem key={pv.id} value={pv.id}>{pv.nom}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.point_vente_destination && <p className="text-red-500 text-sm mt-1">{errors.point_vente_destination.message}</p>}
                        </div>
                      </div>

                      <div>
                        <Label className="text-lg font-semibold">Commentaire (facultatif)</Label>
                        <Input {...register("commentaire")} placeholder="Notes sur le transfert..." className="h-12 text-lg mt-2" />
                      </div>

                      <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 bg-blue-50/50 dark:bg-blue-900/20">
                        <div className="flex items-center justify-between mb-4">
                          <Label className="text-2xl font-bold text-blue-700">Articles à transférer</Label>
                          <Badge variant="secondary" className="text-xl px-4 py-2">{fields.length} article{fields.length > 1 ? "s" : ""}</Badge>
                        </div>

                        {fields.length === 0 ? (
                          <div className="text-center py-12 text-slate-500">
                            <Package className="h-20 w-20 mx-auto mb-4 opacity-30" />
                            <p className="text-xl">Aucun article ajouté</p>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-blue-100 dark:bg-blue-900/40">
                                <TableHead className="font-bold text-blue-700">Produit</TableHead>
                                <TableHead className="text-center font-bold text-blue-700">Qté demandée</TableHead>
                                <TableHead className="text-center font-bold text-blue-700">Qté expédiée</TableHead>
                                <TableHead className="text-center font-bold text-blue-700">Qté reçue</TableHead>
                                <TableHead className="text-center"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {fields.map((field, i) => (
                                <TableRow key={field.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                  <TableCell>
                                    <Controller
                                      name={`lignes.${i}.produit`}
                                      control={control}
                                      rules={{ required: "Produit requis" }}
                                      render={({ field: f }) => (
                                        <Select onValueChange={f.onChange} value={f.value}>
                                          <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                          <SelectContent>
                                            {products.map(p => (
                                              <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      )}
                                    />
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Input type="number" defaultValue={1} className="w-24" {...register(`lignes.${i}.quantite_demandee`, { valueAsNumber: true, min: 1 })} />
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Input type="number" defaultValue={0} className="w-24" {...register(`lignes.${i}.quantite_expediee`, { valueAsNumber: true })} />
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Input type="number" defaultValue={0} className="w-24" {...register(`lignes.${i}.quantite_recue`, { valueAsNumber: true })} />
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Button variant="ghost" size="icon" onClick={() => remove(i)} className="text-red-600 hover:bg-red-50">
                                      <AlertTriangle className="h-5 w-5" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}

                        <Button
                          type="button"
                          onClick={() => append({ produit: "", quantite_demandee: 1, quantite_expediee: 0, quantite_recue: 0 })}
                          variant="outline"
                          className="w-full mt-6 border-2 border-dashed border-blue-500 hover:bg-blue-50"
                        >
                          <Plus className="h-6 w-6 mr-3" />
                          Ajouter un article
                        </Button>
                      </div>

                      <div className="flex justify-end gap-4 pt-6 border-t">
                        <Button type="button" variant="outline" size="lg" onClick={() => setIsAddOpen(false)}>Annuler</Button>
                        <Button type="submit" size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-10 text-lg font-bold">
                          Créer le Transfert
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <Card key={key} className={`border-l-8 border-l-${key === "pending" ? "gray" : key === "validated" ? "blue" : key === "shipped" ? "yellow" : key === "received" ? "green" : "red"}-500 bg-white dark:bg-slate-800 shadow-xl`}>
                <CardContent className="pt-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-4xl font-extrabold">{transferts.filter(t => t.status === key).length}</p>
                      <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">{cfg.label}</p>
                    </div>
                    <div className={`p-4 rounded-2xl ${cfg.color} text-white`}>
                      {cfg.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filtres + Tableau */}
          <Card className="shadow-2xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl font-bold flex items-center gap-4">
                  <ArrowRightLeft className="h-10 w-10 text-blue-600" />
                  Liste des Transferts
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-12 h-12 w-80" />
                  </div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-56 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      {Object.entries(statusConfig).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50 dark:bg-blue-900/30">
                    <TableHead className="font-bold text-lg">Numéro</TableHead>
                    <TableHead className="font-bold text-lg">Source → Destination</TableHead>
                    <TableHead className="font-bold text-lg text-center">Statut</TableHead>
                    <TableHead className="font-bold text-lg text-center">Articles</TableHead>
                    <TableHead className="font-bold text-lg">Demandeur</TableHead>
                    <TableHead className="font-bold text-lg">Date</TableHead>
                    <TableHead className="font-bold text-lg text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(t => {
                    const source = pointsVente.find(p => p.id === t.point_vente_source)?.nom || "?";
                    const dest = pointsVente.find(p => p.id === t.point_vente_destination)?.nom || "?";
                    const user = users.find(u => u.id === t.demandeur);
                    return (
                      <TableRow key={t.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 h-20">
                        <TableCell className="font-bold text-lg">{t.numero_transfert}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3 font-medium">
                            <span className="text-blue-600">{source}</span>
                            <ArrowRightLeft className="h-5 w-5 text-blue-500" />
                            <span className="text-blue-600">{dest}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl ${statusConfig[t.status]?.color} text-white font-bold`}>
                            {statusConfig[t.status]?.icon}
                            {statusConfig[t.status]?.label}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold text-xl">{t.lignes?.length || 0}</TableCell>
                        <TableCell className="font-medium">{user ? `${user.prenom} ${user.nom}` : "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="h-5 w-5" />
                            {format(new Date(t.date_demande || new Date()), "dd MMM yyyy", { locale: fr })}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-3">
                            <Button size="sm" variant="ghost" onClick={() => { setSelectedTransfert(t); setIsDetailOpen(true); }}>
                              <Eye className="h-5 w-5" />
                            </Button>
                            {t.status === "pending" && (
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleAction(t.id!, "validated")}>
                                Valider
                              </Button>
                            )}
                            {t.status === "validated" && (
                              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white" onClick={() => handleAction(t.id!, "shipped")}>
                                Expédier
                              </Button>
                            )}
                            {t.status === "shipped" && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(t.id!, "received")}>
                                Reçu
                              </Button>
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

          {/* Detail Modal */}
          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto" style={{width:"80vh", maxWidth:"80vh"}}>
              {selectedTransfert && (
                <div className="space-y-8">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-bold text-blue-700">Détail du Transfert #{selectedTransfert.numero_transfert}</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-lg">
                    <div><strong>Source :</strong> {pointsVente.find(p => p.id === selectedTransfert.point_vente_source)?.nom}</div>
                    <div><strong>Destination :</strong> {pointsVente.find(p => p.id === selectedTransfert.point_vente_destination)?.nom}</div>
                    <div><strong>Statut :</strong> {getBadge(selectedTransfert.status)}</div>
                    <div><strong>Demandeur :</strong> {users.find(u => u.id === selectedTransfert.demandeur)?.prenom} {users.find(u => u.id === selectedTransfert.demandeur)?.nom}</div>
                    <div><strong>Date demande :</strong> {format(new Date(selectedTransfert.date_demande || new Date()), "dd MMMM yyyy à HH:mm", { locale: fr })}</div>
                    <div><strong>Commentaire :</strong> {selectedTransfert.commentaire || "Aucun"}</div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-700 mb-4">Articles ({selectedTransfert.lignes?.length})</h3>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-blue-100 dark:bg-blue-900/30">
                          <TableHead className="font-bold">Produit</TableHead>
                          <TableHead className="text-center font-bold">Demandée</TableHead>
                          <TableHead className="text-center font-bold">Expédiée</TableHead>
                          <TableHead className="text-center font-bold">Reçue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTransfert.lignes?.map(l => {
                          const prod = products.find(p => p.id === l.produit);
                          return (
                            <TableRow key={l.produit}>
                              <TableCell className="font-medium">{prod?.nom || "Inconnu"}</TableCell>
                              <TableCell className="text-center font-bold text-lg">{l.quantite_demandee}</TableCell>
                              <TableCell className="text-center text-yellow-600 font-bold">{l.quantite_expediee}</TableCell>
                              <TableCell className="text-center text-green-600 font-bold">{l.quantite_recue}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
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
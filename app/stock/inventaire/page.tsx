"use client"
import React, { useEffect, useState } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import toast from "react-hot-toast"
import { POSLayout } from "@/components/pos-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Search, Plus, Edit, CheckCircle2, Loader2, Package, Store, User, FileText, Eye,
  ClipboardList, Building2, Calendar, Hash, MessageSquare, AlertCircle
} from "lucide-react"

import { usePointsVente } from "@/hooks/usePointsVente"
import { useStocks } from "@/hooks/useStock"
import { useInventaires } from "@/hooks/useInventaires"
import { Inventaire } from "@/types/inventaire"
import { getCurrentUser } from "@/lib/auth"

const CURRENT_USER = getCurrentUser()

export default function InventairePage() {
  const { pointsVente, pointsVenteLoading , fetchPointsVente} = usePointsVente()
  const { stocks, loading: stockLoading, fetchStocks } = useStocks()
  const { inventaires, loading: invLoading, add, edit, validate } = useInventaires()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [currentInventaire, setCurrentInventaire] = useState<Inventaire | null>(null)

  type Ligne = {
    produit: string
    quantite_stock: number
    quantite_reel: number
  }

  type FormValues = {
    numero_inventaire: string
    point_vente: string
    commentaire: string
    lignes: Ligne[]
  }

  const { register, control, handleSubmit, reset, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      numero_inventaire: `INV-${Date.now()}`,
      point_vente: "",
      commentaire: "",
      lignes: [],
    },
  })

  const { fields, append, remove } = useFieldArray<FormValues, "lignes">({ control, name: "lignes" })
  const watchedPointVente = watch("point_vente")
  const filteredStock = watchedPointVente ? stocks.filter((s: any) => s.point_vente === watchedPointVente) : []

  const filtered = inventaires.filter(i => {
    const matchesSearch = i.numero_inventaire.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || i.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  useEffect(() => {
    fetchPointsVente();
    fetchStocks();

  }, [])

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      utilisateur_cree: CURRENT_USER!.id,
      stock_inventaire_traitee: false,
      lignes: data.lignes.map((l: any) => ({
        produit: l.produit,
        quantite_stock: l.quantite_stock,
        quantite_reel: l.quantite_reel,
      })),
    }

    try {
      if (currentInventaire?.id) {
        await edit(currentInventaire.id, payload)
        toast.success("Inventaire mis à jour")
        setIsEditOpen(false)
      } else {
        await add(payload)
        toast.success("Inventaire créé avec succès")
        setIsAddOpen(false)
      }
      reset()
      setCurrentInventaire(null)
    } catch {
      toast.error("Erreur lors de la sauvegarde")
    }
  }

  const openEdit = (inv: Inventaire) => {
    setCurrentInventaire(inv)
    reset({
      numero_inventaire: inv.numero_inventaire,
      point_vente: inv.point_vente,
      commentaire: inv.commentaire ?? "",
      lignes: inv.lignes.map(l => ({
        produit: l.produit,
        quantite_stock: l.quantite_stock,
        quantite_reel: l.quantite_reel,
      })),
    })
    setIsEditOpen(true)
  }

  const openView = (inv: Inventaire) => {
    setCurrentInventaire(inv)
    reset({
      numero_inventaire: inv.numero_inventaire,
      point_vente: inv.point_vente,
      commentaire: inv.commentaire ?? "",
      lignes: inv.lignes.map(l => ({
        produit: l.produit,
        quantite_stock: l.quantite_stock,
        quantite_reel: l.quantite_reel,
      })),
    })
    setIsViewOpen(true)
  }

  const globalLoading = pointsVenteLoading || stockLoading || invLoading

  if (globalLoading && inventaires.length === 0) {
    return (
      <POSLayout currentPath="/stock/inventaire">
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mr-4" />
          <p className="text-xl text-slate-600 dark:text-slate-400">Chargement des inventaires...</p>
        </div>
      </POSLayout>
    )
  }

  return (
    <POSLayout currentPath="/stock/inventaire">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="p-6 space-y-8  mx-auto">

          {/* Header Magnifique */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
                  <ClipboardList className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">Gestion des Inventaires</h1>
                  <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-blue-500" />
                    Comptage physique précis du stock par point de vente
                  </p>
                </div>
              </div>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Nouvel Inventaire
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-white dark:bg-slate-800" style={{ width: "80vw", maxWidth: "80vw" }}>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center">
                      <ClipboardList className="h-7 w-7 mr-3 text-blue-600" />
                      Créer un Inventaire
                    </DialogTitle>
                  </DialogHeader>
                  <InventaireForm
                    mode="create"
                    onSubmit={handleSubmit(onSubmit)}
                    register={register}
                    control={control}
                    watch={watch}
                    setValue={setValue}
                    fields={fields}
                    append={append}
                    remove={remove}
                    pointsVente={pointsVente}
                    filteredStock={filteredStock}
                    onCancel={() => setIsAddOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filtres */}
          <Card className="shadow-md border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input placeholder="Rechercher un inventaire..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-12 h-12 text-lg bg-slate-50 dark:bg-slate-700" />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-64 h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En cours</SelectItem>
                    <SelectItem value="validated">Validés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Liste */}
          <Card className="shadow-lg border-0 overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardTitle className="text-2xl flex items-center">
                <FileText className="h-7 w-7 mr-3 text-blue-600 dark:text-blue-400" />
                Liste des Inventaires
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-700">
                    <TableHead className="font-bold"><Hash className="h-4 w-4 inline mr-2" />Numéro</TableHead>
                    <TableHead className="font-bold"><Building2 className="h-4 w-4 inline mr-2" />Point de vente</TableHead>
                    <TableHead className="font-bold"><ClipboardList className="h-4 w-4 inline mr-2" />Statut</TableHead>
                    <TableHead className="font-bold text-center"><Package className="h-4 w-4 inline mr-2" />Lignes</TableHead>
                    <TableHead className="font-bold"><User className="h-4 w-4 inline mr-2" />Créé par</TableHead>
                    <TableHead className="font-bold"><Calendar className="h-4 w-4 inline mr-2" />Date</TableHead>
                    <TableHead className="font-bold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg">Aucun inventaire trouvé</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(i => {
                      const pv = pointsVente.find(p => p.id === i.point_vente)
                      const isValidated = i.status === "validate"

                      return (
                        <TableRow key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <TableCell className="font-semibold text-blue-600 dark:text-blue-400">{i.numero_inventaire}</TableCell>
                          <TableCell className="font-medium flex items-center"><Store className="h-4 w-4 mr-2 text-slate-500" />{pv?.nom || "—"}</TableCell>
                          <TableCell>{isValidated ? <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">Validé</Badge> : <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">En cours</Badge>}</TableCell>
                          <TableCell className="text-center font-semibold">{i.lignes.length}</TableCell>
                          <TableCell>{i.utilisateur_cree}</TableCell>
                          <TableCell>{format(new Date(i.date_creation!), "dd MMM yyyy", { locale: fr })}</TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm" variant="outline" onClick={() => openView(i)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Voir le détail</TooltipContent>
                              </Tooltip>

                              {!isValidated && (
                                <>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size="sm" variant="ghost" onClick={() => openEdit(i)}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Modifier</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md" onClick={() => validate(i.id!)}>
                                        <CheckCircle2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Valider l'inventaire</TooltipContent>
                                  </Tooltip>
                                </>
                              )}
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

          {/* Modals */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className=" max-h-[95vh] overflow-y-auto bg-white dark:bg-slate-800" style={{ width: "80vw", maxWidth: "80vw" }}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center">
                  <Edit className="h-7 w-7 mr-3 text-purple-600" />
                  Modifier l'Inventaire
                </DialogTitle>
              </DialogHeader>
              <InventaireForm mode="edit" onSubmit={handleSubmit(onSubmit)} register={register} control={control} watch={watch} setValue={setValue} fields={fields} append={append} remove={remove} pointsVente={pointsVente} filteredStock={filteredStock} onCancel={() => { setIsEditOpen(false); setCurrentInventaire(null); }} />
            </DialogContent>
          </Dialog>

          <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-white dark:bg-slate-800" style={{ width: "80vw", maxWidth: "80vw" }}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center">
                  <Eye className="h-7 w-7 mr-3 text-blue-600" />
                  Détail de l'Inventaire
                </DialogTitle>
              </DialogHeader>
              <InventaireForm mode="view" onSubmit={() => {}} register={register} control={control} watch={watch} setValue={setValue} fields={fields} append={() => {}} remove={() => {}} pointsVente={pointsVente} filteredStock={filteredStock} onCancel={() => setIsViewOpen(false)} />
            </DialogContent>
          </Dialog>

        </div>
      </div>
    </POSLayout>
  )
}

/* Formulaire Magnifique (create / edit / view) */
function InventaireForm({ mode, onSubmit, register, control, watch, setValue, fields, append, remove, pointsVente, filteredStock, onCancel }: any) {
  const isViewMode = mode === "view"
  const watchedPointVente = watch("point_vente")

  return (
    <form onSubmit={isViewMode ? e => e.preventDefault() : onSubmit} className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-lg font-semibold flex items-center"><Hash className="h-5 w-5 mr-2 text-blue-600" />Numéro d'inventaire</Label>
          <Input {...register("numero_inventaire")} readOnly={isViewMode} className="h-12 text-lg" />
        </div>
        <div className="space-y-2">
          <Label className="text-lg font-semibold flex items-center"><Store className="h-5 w-5 mr-2 text-purple-600" />Point de vente</Label>
          {isViewMode ? (
            <div className="h-12 px-4 flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg text-lg font-medium">
              {pointsVente.find((p: any) => p.id === watchedPointVente)?.nom || "—"}
            </div>
          ) : (
            <Controller name="point_vente" control={control} render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="h-12 text-lg"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>{pointsVente.map((pv: any) => <SelectItem key={pv.id} value={pv.id}>{pv.nom}</SelectItem>)}</SelectContent>
              </Select>
            )} />
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-lg font-semibold flex items-center"><User className="h-5 w-5 mr-2 text-green-600" />Créé par</Label>
          <div className="h-12 px-4 flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg text-lg font-medium">
            {CURRENT_USER?.nom || CURRENT_USER?.username || "Inconnu"}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-lg font-semibold flex items-center"><MessageSquare className="h-5 w-5 mr-2 text-orange-600" />Commentaire (optionnel)</Label>
          <Input {...register("commentaire")} readOnly={isViewMode} placeholder="Notes..." className="h-12 text-lg" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-2xl font-bold flex items-center"><Package className="h-8 w-8 mr-3 text-blue-600" />Articles à compter</Label>
          <Badge variant="secondary" className="text-lg px-4 py-2">{fields.length} article{fields.length > 1 ? "s" : ""}</Badge>
        </div>

        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 bg-slate-50/50 dark:bg-slate-800/50">
          {fields.length === 0 ? (
            <div className="text-center py-12"><Package className="h-16 w-16 mx-auto mb-4 text-slate-400" /><p className="text-lg text-slate-500">Aucun article ajouté</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100 dark:bg-slate-700">
                  <TableHead className="font-bold">Produit</TableHead>
                  <TableHead className="text-center font-bold">Stock système</TableHead>
                  <TableHead className="text-center font-bold">Quantité réelle</TableHead>
                  {!isViewMode && <TableHead />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field: any, idx: number) => {
                  const prodId = watch(`lignes.${idx}.produit`)
                  const stockItem = filteredStock.find((s: any) => s.produit === prodId)
                  const qtyStock = stockItem?.quantite_actuelle ?? 0
                  const productName = stockItem ? `${stockItem.produit_nom} (${stockItem.produit_reference})` : "—"

                  return (
                    <TableRow key={field.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <TableCell>
                        {isViewMode ? (
                          <span className="font-medium">{productName}</span>
                        ) : (
                          <Controller name={`lignes.${idx}.produit`} control={control} render={({ field: f }) => (
                            <Select onValueChange={(v) => { f.onChange(v); setValue(`lignes.${idx}.quantite_stock`, filteredStock.find((s: any) => s.produit === v)?.quantite_actuelle ?? 0) }} value={f.value}>
                              <SelectTrigger><SelectValue placeholder="Choisir un produit" /></SelectTrigger>
                              <SelectContent>
                                {filteredStock.map((s: any) => (
                                  <SelectItem key={s.id} value={s.produit}>
                                    <div className="flex justify-between w-full">
                                      <span>{s.produit_nom} ({s.produit_reference})</span>
                                      <Badge variant="secondary" className="ml-4">Stock: {s.quantite_actuelle}</Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )} />
                        )}
                      </TableCell>
                      <TableCell className="text-center"><div className="font-bold text-lg text-blue-600">{qtyStock}</div></TableCell>
                      <TableCell>
                        {isViewMode ? (
                          <div className="text-center text-lg font-bold text-emerald-600">{watch(`lignes.${idx}.quantite_reel`) || 0}</div>
                        ) : (
                          <Input type="number" className="h-12 text-center text-lg font-semibold" {...register(`lignes.${idx}.quantite_reel`, { valueAsNumber: true })} />
                        )}
                      </TableCell>
                      {!isViewMode && (
                        <TableCell>
                          <Button type="button" variant="ghost" size="sm" onClick={() => remove(idx)} className="text-red-600 hover:bg-red-50">
                            <AlertCircle className="h-5 w-5" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {!isViewMode && (
            <Button type="button" variant="outline" size="lg" className="w-full mt-6 border-2 border-dashed border-blue-400 hover:border-blue-600 hover:bg-blue-50" onClick={() => append({ produit: "", quantite_stock: 0, quantite_reel: 0 })}>
              <Plus className="h-6 w-6 mr-2" />Ajouter un article
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" size="lg" onClick={onCancel}>
          {isViewMode ? "Fermer" : "Annuler"}
        </Button>
        {!isViewMode && (
          <Button type="submit" size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8">
            {mode === "edit" ? "Mettre à jour" : "Créer"} l'inventaire
          </Button>
        )}
      </div>
    </form>
  )
}
"use client"
import React, { useState, useEffect, JSX } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Search,
  Plus,
  Edit,
  CheckCircle,
  Loader2,
} from "lucide-react"

import { usePointsVente } from "@/hooks/usePointsVente"
import { useStocks } from "@/hooks/useStock"          // ← renamed
import { useInventaires } from "@/hooks/useInventaires"
import { Inventaire, CreateInventaire } from "@/types/inventaire"
import { getCurrentUser } from "@/lib/auth"

const CURRENT_USER = getCurrentUser()

interface InventaireFormData {
  numero_inventaire: string
  point_vente: string
  status: "pending" | "validated"
  commentaire?: string
  lignes: {
    produit: string
    quantite_stock: number
    quantite_reel: number
  }[]
}

/* ────────────────────────────────────────────────────────────── */
/* ──────────────────────── MAIN PAGE ─────────────────────────── */
/* ────────────────────────────────────────────────────────────── */
export default function InventairePage() {
  const { pointsVente, pointsVenteLoading, fetchPointsVente } = usePointsVente()
  const { stocks, loading: stockLoading, fetchStocks } = useStocks()               // ← useStocks
  const { inventaires, loading: invLoading, add, edit, validate } = useInventaires()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch: formWatch,
    setValue: formSetValue,
  } = useForm<InventaireFormData>({
    defaultValues: {
      numero_inventaire: `INV-${Date.now()}`,
      point_vente: "",
      status: "pending",
      commentaire: "",
      lignes: [],
    },
  })
  useEffect(() => { fetchStocks() }, [fetchStocks])  // ← fetch stocks on mount
  useEffect(() => { 
    
      fetchPointsVente()
    
  }, [fetchPointsVente])

  console.log("Stocks in InventairePage:", stocks) // Debug log

  const { fields, append, remove } = useFieldArray({ control, name: "lignes" })

  const filtered = inventaires.filter(i => {
    const matchesSearch = i.numero_inventaire.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || i.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (s: "pending" | "validated") => {
    const map: Record<string, JSX.Element> = {
      pending: <Badge className="bg-gray-500 text-white">En cours</Badge>,
      validated: <Badge className="bg-green-500 text-white">Validé</Badge>,
    }
    return map[s] ?? <Badge variant="outline">{s}</Badge>
  }

  const onSubmit = async (data: InventaireFormData) => {
    const payload: CreateInventaire = {
      ...data,
      utilisateur_cree: CURRENT_USER!.id,
      stock_inventaire_traitee: false,
      lignes: data.lignes.map(l => ({
        ...l,
        inventaire_stock: "", // backend will fill
      })),
    }

    try {
      if (editingId) {
        await edit(editingId, payload)
        setIsEditOpen(false)
      } else {
        await add(payload)
        setIsAddOpen(false)
      }
      reset()
      setEditingId(null)
    } catch {
      toast.error("Erreur sauvegarde")
    }
  }

  const openEdit = (inv: Inventaire) => {
    setEditingId(inv.id!)
    reset({
      numero_inventaire: inv.numero_inventaire,
      point_vente: inv.point_vente,
      status: inv.status,
      commentaire: inv.commentaire ?? "",
      lignes: inv.lignes.map(l => ({
        produit: l.produit,
        quantite_stock: l.quantite_stock,
        quantite_reel: l.quantite_reel,
      })),
    })
    setIsEditOpen(true)
  }

  const globalLoading = pointsVenteLoading || stockLoading || invLoading

  if (globalLoading && inventaires.length === 0) {
    return (
      <POSLayout currentPath="/stock/inventaire">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span className="text-lg">Chargement...</span>
        </div>
      </POSLayout>
    )
  }

  return (
    <POSLayout currentPath="/stock/inventaire">
      <TooltipProvider>
        <div className="p-6 space-y-8">
          {/* ── Header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold">Inventaires</h1>
              <p className="text-lg text-muted-foreground">Gérez les comptages physiques</p>
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Nouvel Inventaire</Button>
              </DialogTrigger>

              <DialogContent className="max-h-[95vh] overflow-y-auto p-8" style={{ width: "80vw", maxWidth: "80vw" }}>
                <DialogHeader><DialogTitle>Créer Inventaire</DialogTitle></DialogHeader>
                <InventaireForm
                  onSubmit={handleSubmit(onSubmit)}
                  register={register}
                  control={control}
                  errors={errors}
                  fields={fields}
                  append={append}
                  remove={remove}
                  pointsVente={pointsVente}
                  pointsVenteLoading={pointsVenteLoading}
                  stock={stocks}
                  stockLoading={stockLoading}
                  watch={formWatch}
                  setValue={formSetValue}
                  isEdit={false}
                  onCancel={() => setIsAddOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* ── Filters ── */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["all", "pending", "validated"].map(s => (
                      <SelectItem key={s} value={s}>
                        {s === "all" ? "Tous" : getStatusBadge(s as any).props.children}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* ── Table ── */}
          <Card>
            <CardHeader><CardTitle>Liste des Inventaires</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Point de vente</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Lignes</TableHead>
                    <TableHead>Créé par</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(i => {
                    const pv = pointsVente.find(p => p.id === i.point_vente)
                    return (
                      <TableRow key={i.id}>
                        <TableCell className="font-medium">{i.numero_inventaire}</TableCell>
                        <TableCell>{pv?.nom ?? "—"}</TableCell>
                        <TableCell>{getStatusBadge(i.status)}</TableCell>
                        <TableCell>{i.lignes.length}</TableCell>
                        <TableCell>{i.utilisateur_cree}</TableCell>
                        <TableCell>{format(new Date(i.date_creation!), "dd MMM yyyy", { locale: fr })}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="ghost" onClick={() => openEdit(i)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Modifier</TooltipContent>
                            </Tooltip>

                            {i.status === "pending" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm" className="bg-green-500 text-white hover:bg-green-600" onClick={() => validate(i.id!)}>
                                    Valider
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Valider inventaire</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* ── Edit Modal ── */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-h-[95vh] overflow-y-auto p-8" style={{ width: "80vw", maxWidth: "80vw" }}>
              <DialogHeader><DialogTitle>Modifier Inventaire</DialogTitle></DialogHeader>
              <InventaireForm
                onSubmit={handleSubmit(onSubmit)}
                register={register}
                control={control}
                errors={errors}
                fields={fields}
                append={append}
                remove={remove}
                pointsVente={pointsVente}
                pointsVenteLoading={pointsVenteLoading}
                stock={stocks}
                stockLoading={stockLoading}
                watch={formWatch}
                setValue={formSetValue}
                isEdit={true}
                onCancel={() => { setIsEditOpen(false); reset(); }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </POSLayout>
  )
}

/* ────────────────────────────────────────────────────────────── */
/* ──────────────────────── FORM COMPONENT ─────────────────────── */
/* ────────────────────────────────────────────────────────────── */
interface FormProps {
  onSubmit: () => void
  register: any
  control: any
  errors: any
  fields: any[]
  append: (obj: any) => void
  remove: (i: number) => void
  pointsVente: any[]
  pointsVenteLoading: boolean
  stock: any[]
  stockLoading: boolean
  watch: (name?: any) => any
  setValue: (name: any, value: any) => void
  isEdit: boolean
  onCancel: () => void
}

function InventaireForm({
  onSubmit,
  register,
  control,
  errors,
  fields,
  append,
  remove,
  pointsVente,
  pointsVenteLoading,
  stock,
  stockLoading,
  watch,
  setValue,
  isEdit,
  onCancel,
}: FormProps) {
  const watchedLignes = watch("lignes") ?? []

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* ── Header ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Numéro */}
        <div>
          <Label>Numéro d'inventaire</Label>
          <Input {...register("numero_inventaire", { required: "Requis" })} />
          {errors.numero_inventaire && <p className="text-xs text-destructive">{errors.numero_inventaire.message}</p>}
        </div>

        {/* Point de vente */}
        <div>
          <Label>Point de vente</Label>
          <Controller
            name="point_vente"
            control={control}
            rules={{ required: "Requis" }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} disabled={pointsVenteLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={pointsVenteLoading ? "Chargement…" : "Sélectionner"} />
                </SelectTrigger>
                <SelectContent>
                  {pointsVenteLoading ? (
                    <div className="p-2 text-sm text-muted-foreground">Chargement…</div>
                  ) : pointsVente.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">Aucun point de vente</div>
                  ) : (
                    pointsVente.map((pv: any) => (
                      <SelectItem key={pv.id} value={pv.id}>{pv.nom}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.point_vente && <p className="text-xs text-destructive">{errors.point_vente.message}</p>}
        </div>

        {/* Créé par – READ ONLY */}
        <div>
          <Label>Créé par</Label>
          <div className="flex items-center h-10 px-3 border rounded-md bg-muted text-sm">
            {CURRENT_USER?.nom ?? CURRENT_USER?.username ?? "Inconnu"}
          </div>
        </div>

        {/* Commentaire */}
        <div>
          <Label>Commentaire (optionnel)</Label>
          <Input {...register("commentaire")} placeholder="Notes…" />
        </div>
      </div>

      {/* ── Lignes ── */}
      <div>
        <Label>Articles</Label>
        <div className="border rounded-lg p-4 mt-2">
          {fields.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Aucun article</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead className="text-center">Stock système</TableHead>
                  <TableHead className="text-center">Quantité réelle</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field: any, idx: number) => {
                  const selectedProdId = watchedLignes[idx]?.produit
                  const stockItem = stock.find((s: any) => s.produit === selectedProdId)
                  const qtyInStock = stockItem?.quantite_actuelle ?? 0

                  return (
                    <TableRow key={field.id}>
                      {/* Produit */}
                      <TableCell>
                        <Controller
                          name={`lignes.${idx}.produit`}
                          control={control}
                          rules={{ required: "Requis" }}
                          render={({ field: prodField }) => (
                            <Select
                              onValueChange={v => {
                                prodField.onChange(v)
                                const item = stock.find((s: any) => s.produit === v)
                                setValue(`lignes.${idx}.quantite_stock`, item?.quantite_actuelle ?? 0)
                              }}
                              value={prodField.value}
                              disabled={stockLoading}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder={stockLoading ? "Chargement…" : "Produit"} />
                              </SelectTrigger>
                              <SelectContent>
                                {stockLoading ? (
                                  <div className="p-2 text-sm text-muted-foreground">Chargement…</div>
                                ) : stock.length === 0 ? (
                                  <div className="p-2 text-sm text-muted-foreground">Aucun produit</div>
                                ) : (
                                  stock.map((s: any) => (
                                    <SelectItem key={s.id} value={s.produit}>
                                      {s.produit_nom} ({s.produit_reference})
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.lignes?.[idx]?.produit && <p className="text-xs text-destructive mt-1">{errors.lignes[idx].produit.message}</p>}
                      </TableCell>

                      {/* Stock système (read‑only) */}
                      <TableCell>
                        <Input
                          type="number"
                          className="h-9 text-center bg-muted"
                          value={qtyInStock}
                          readOnly
                        />
                        <input type="hidden" {...register(`lignes.${idx}.quantite_stock`)} />
                      </TableCell>

                      {/* Quantité réelle */}
                      <TableCell>
                        <Input
                          type="number"
                          className="h-9 text-center"
                          {...register(`lignes.${idx}.quantite_reel`, {
                            required: "Requis",
                            valueAsNumber: true,
                          })}
                        />
                        {errors.lignes?.[idx]?.quantite_reel && <p className="text-xs text-destructive mt-1">{errors.lignes[idx].quantite_reel.message}</p>}
                      </TableCell>

                      {/* Delete */}
                      <TableCell>
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(idx)} className="text-destructive">
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => append({ produit: "", quantite_stock: 0, quantite_reel: 0 })}
          >
            <Plus className="h-3 w-3 mr-1" /> Ajouter
          </Button>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit">{isEdit ? "Mettre à jour" : "Créer"} Inventaire</Button>
      </div>
    </form>
  )
}
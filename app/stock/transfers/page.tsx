"use client"

import { useState, useEffect } from "react"
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
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Search,
  Plus,
  Edit,
  Eye,
  Package,
  Store,
  AlertTriangle,
  Loader2,
  Truck,
  CheckCircle,
} from "lucide-react"
import { useProducts } from "@/hooks/useProducts"
import { usePointsVente } from "@/hooks/usePointsVente"
import { useUsers } from "@/hooks/useUsers"
import { useTransferts } from "@/hooks/useTransfertsStock"
import {
  TransfertStock,
  CreateTransfertStock,
  TransfertStockLigne,
  PointVente,
  Utilisateur,
  Produit,
} from "@/types/transfertsStock"

// Mock current user (replace with real auth context)
const getCurrentUser = (): Utilisateur | null => {
  try {
    const raw = localStorage.getItem("user")
    if (!raw) return null
    return JSON.parse(raw) as Utilisateur
  } catch {
    return null
  }
}

interface TransfertFormData {
  numero_transfert: string
  point_vente_source: string
  point_vente_destination: string
  status: 'pending' | 'validated' | 'shipped' | 'received' | 'cancelled'
  demandeur: string
  commentaire?: string
  lignes: {
    produit: string
    quantite_demandee: number
    quantite_expediee: number
    quantite_recue: number
  }[]
}

export default function StockTransfersPage() {
  const { products, productsLoading, fetchProducts } = useProducts()
const { pointsVente, pointsVenteLoading, fetchPointsVente } = usePointsVente()
const { users, userLoading, fetchUsers } = useUsers()
const { transferts, transfertsloading, loadTransferts, addTransfert, editTransfert } = useTransferts()
const currentUser = getCurrentUser()
  const globalLoading = productsLoading || pointsVenteLoading || userLoading || transfertsloading

  useEffect(() => {
  fetchProducts()
  fetchPointsVente()
  fetchUsers()
  loadTransferts()
}, [fetchProducts, fetchPointsVente, fetchUsers, loadTransferts])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedTransfertId, setSelectedTransfertId] = useState<string | null>(null)
  const [editingTransfertId, setEditingTransfertId] = useState<string | null>(null)

  const { register, control, handleSubmit, reset, formState: { errors }, setValue } = useForm<TransfertFormData>({
    defaultValues: {
      numero_transfert: "",
      point_vente_source: "",
      point_vente_destination: "",
      status: "pending",
      demandeur: currentUser?.id ?? "",
      commentaire: "",
      lignes: [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "lignes" })

  const filteredTransferts = transferts.filter((t) => {
    const matchesSearch = t.numero_transfert.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || t.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      pending: <Badge className="bg-gray-500 text-white">En Attente</Badge>,
      validated: <Badge className="bg-blue-500 text-white">Validé</Badge>,
      shipped: <Badge className="bg-yellow-500 text-white">Expédié</Badge>,
      received: <Badge className="bg-green-500 text-white">Reçu</Badge>,
      cancelled: <Badge className="bg-red-500 text-white">Annulé</Badge>,
    }
    return badges[status] || <Badge variant="outline">{status}</Badge>
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      pending: <Package className="h-4 w-4 text-gray-600" />,
      validated: <CheckCircle className="h-4 w-4 text-blue-600" />,
      shipped: <Truck className="h-4 w-4 text-yellow-600" />,
      received: <CheckCircle className="h-4 w-4 text-green-600" />,
      cancelled: <AlertTriangle className="h-4 w-4 text-red-600" />,
    }
    return icons[status] || <Package className="h-4 w-4 text-gray-600" />
  }

  const formatDate = (date?: string) => {
    if (!date) return "Non défini"
    return format(new Date(date), "dd MMM yyyy", { locale: fr })
  }

  // Action: Valider
  const handleValidate = async (id: string) => {
    try {
      await editTransfert(id, {
        status: "completed",
        date_validation: new Date().toISOString().split("T")[0],
        validateur: currentUser?.id,
      })
      toast.success("Transfert validé")
      loadTransferts()
    } catch (err: any) {
      toast.error("Échec validation")
    }
  }

  // Action: Expédier
  const handleShip = async (id: string) => {
    try {
      await editTransfert(id, {
        status: "shipped",
        date_expedition: new Date().toISOString().split("T")[0],
      })
      toast.success("Transfert expédié")
      loadTransferts()
    } catch (err: any) {
      toast.error("Échec expédition")
    }
  }

  // Action: Recevoir
  const handleReceive = async (id: string) => {
    try {
      await editTransfert(id, {
        status: "received",
        date_reception: new Date().toISOString().split("T")[0],
      })
      toast.success("Transfert reçu")
      loadTransferts()
    } catch (err: any) {
      toast.error("Échec réception")
    }
  }

  const handleCreateOrUpdate = async (data: TransfertFormData) => {
    try {
      const payload: CreateTransfertStock = {
        ...data,
        status: data.status,
        demandeur: data.demandeur,
        lignes: data.lignes,
      }

      if (editingTransfertId) {
        await editTransfert(editingTransfertId, payload)
        toast.success("Transfert mis à jour")
        setIsEditModalOpen(false)
      } else {
        await addTransfert(payload)
        toast.success("Transfert créé")
        setIsAddModalOpen(false)
      }
      reset()
      setEditingTransfertId(null)
      loadTransferts()
    } catch (err) {
      toast.error("Erreur lors de la sauvegarde")
    }
  }

  const openEditModal = (t: TransfertStock) => {
  setEditingTransfertId(t.id ?? "")
  reset({
    numero_transfert: t.numero_transfert,
    point_vente_source: t.point_vente_source,
    point_vente_destination: t.point_vente_destination,
    status: t.status,
    demandeur: t.demandeur ?? currentUser?.id ?? "",   // <-- keep existing, else current
    commentaire: t.commentaire ?? "",
    lignes: (t.lignes ?? []).map(l => ({
      produit: l.produit,
      quantite_demandee: l.quantite_demandee,
      quantite_expediee: l.quantite_expediee,
      quantite_recue: l.quantite_recue,
    })),
  })
  setIsEditModalOpen(true)
}

  if (globalLoading && transferts.length === 0) {
    return (
      <POSLayout currentPath="/stock/transfers">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
          <span className="text-lg">Chargement...</span>
        </div>
      </POSLayout>
    )
  }

  return (
    <POSLayout currentPath="/stock/transfers">
      <TooltipProvider>
        <div className="p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground">Transferts de Stock</h1>
              <p className="text-lg text-muted-foreground">Gérez les transferts entre points de vente</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={loadTransferts} disabled={transfertsloading}>
                {transfertsloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Store className="h-4 w-4 mr-2" />}
                Rafraîchir
              </Button>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Transfert
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[95vh] overflow-y-auto p-8" style={{ width: '70vw', maxWidth: '70vw' }}>
                  <DialogHeader>
                    <DialogTitle>Créer un Transfert</DialogTitle>
                  </DialogHeader>
                  
  <FormContent
    onSubmit={handleSubmit(handleCreateOrUpdate)}
    register={register}
    control={control}
    errors={errors}
    fields={fields}
    append={append}
    remove={remove}
    pointsVente={pointsVente}
    pointsVenteLoading={pointsVenteLoading}
    users={users}
    userLoading={userLoading}
    products={products}
    productsLoading={productsLoading}
    isEdit={false}
  />

                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par numéro..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["all", "pending", "validated", "shipped", "received", "cancelled"].map(s => (
                      <SelectItem key={s} value={s}>
                        {s === "all" ? "Tous" : getStatusBadge(s).props.children}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {["pending", "validated", "shipped", "received", "cancelled"].map(status => (
              <Card key={status}>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold">
                    {transferts.filter(t => t.status === status).length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getStatusBadge(status).props.children}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des Transferts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Articles</TableHead>
                    <TableHead>Demandeur</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransferts.map(t => {
                    const source = pointsVente.find(pv => pv.id === t.point_vente_source)
                    const dest = pointsVente.find(pv => pv.id === t.point_vente_destination)
                    const demandeur = users.find(u => u.id === t.demandeur)
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.numero_transfert}</TableCell>
                        <TableCell>{source?.nom || "—"}</TableCell>
                        <TableCell>{dest?.nom || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(t.status)}
                            {getStatusBadge(t.status)}
                          </div>
                        </TableCell>
                        <TableCell>{t.lignes?.length || 0}</TableCell>
                        <TableCell>{demandeur?.nom || "—"}</TableCell>
                        <TableCell>{formatDate(t.date_demande)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="ghost" onClick={() => { setSelectedTransfertId(t.id || ""); setIsDetailModalOpen(true) }}>
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Détails</TooltipContent>
                            </Tooltip>

                            {t.status === "pending" && (
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm" variant="ghost" onClick={() => openEditModal(t)}>
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Modifier</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm" className="bg-blue-500 text-white hover:bg-blue-600" onClick={() => handleValidate(t.id!)}>
                                      Valider
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Valider le transfert</TooltipContent>
                                </Tooltip>
                              </>
                            )}

                            {t.status === "validated" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm" className="bg-yellow-500 text-white hover:bg-yellow-600" onClick={() => handleShip(t.id!)}>
                                    Expédier
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Marquer comme expédié</TooltipContent>
                              </Tooltip>
                            )}

                            {t.status === "shipped" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm" className="bg-green-500 text-white hover:bg-green-600" onClick={() => handleReceive(t.id!)}>
                                    Recevoir
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Marquer comme reçu</TooltipContent>
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

          {/* Edit Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-h-[95vh] overflow-y-auto p-8" style={{ width: '70vw', maxWidth: '70vw' }}>
              <DialogHeader>
                <DialogTitle>Modifier Transfert</DialogTitle>
              </DialogHeader>
              <FormContent
                onSubmit={handleSubmit(handleCreateOrUpdate)}
                register={register}
                control={control}
                errors={errors}
                fields={fields}
                append={append}
                remove={remove}
                pointsVente={pointsVente}
                users={users}
                products={products}
                isEdit={true}
                onCancel={() => { setIsEditModalOpen(false); reset(); }}
              />
            </DialogContent>
          </Dialog>

          {/* Detail Modal */}
          <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
            <DialogContent className="max-h-[95vh] overflow-y-auto p-8" style={{ width: '70vw', maxWidth: '70vw' }}>
              <DialogHeader>
                <DialogTitle>Détails du Transfert</DialogTitle>
              </DialogHeader>
              {selectedTransfertId && (() => {
                const t = transferts.find(x => x.id === selectedTransfertId)
                if (!t) return <p>Non trouvé</p>
                const source = pointsVente.find(pv => pv.id === t.point_vente_source)
                const dest = pointsVente.find(pv => pv.id === t.point_vente_destination)
                const demandeur = users.find(u => u.id === t.demandeur)
                const validateur = users.find(u => u.id === t.validateur)
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Numéro:</strong> {t.numero_transfert}</div>
                      <div><strong>Statut:</strong> {getStatusBadge(t.status)}</div>
                      <div><strong>Source:</strong> {source?.nom}</div>
                      <div><strong>Destination:</strong> {dest?.nom}</div>
                      <div><strong>Demandeur:</strong> {demandeur?.nom}</div>
                      <div><strong>Validateur:</strong> {validateur?.nom || "—"}</div>
                      <div><strong>Date demande:</strong> {formatDate(t.date_demande)}</div>
                      <div><strong>Date validation:</strong> {formatDate(t.date_validation)}</div>
                      <div><strong>Date expédition:</strong> {formatDate(t.date_expedition)}</div>
                      <div><strong>Date réception:</strong> {formatDate(t.date_reception)}</div>
                    </div>
                    {t.commentaire && (
                      <div>
                        <strong>Commentaire:</strong>
                        <p className="mt-1 p-2 bg-muted rounded">{t.commentaire}</p>
                      </div>
                    )}
                    <div>
                      <strong>Articles:</strong>
                      <Table className="mt-2">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produit</TableHead>
                            <TableHead className="text-center">Demandée</TableHead>
                            <TableHead className="text-center">Expédiée</TableHead>
                            <TableHead className="text-center">Reçue</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(t.lignes || []).map(l => {
                            const prod = products.find(p => p.id === l.produit)
                            return (
                              <TableRow key={l.produit}>
                                <TableCell>{prod?.nom || "—"}</TableCell>
                                <TableCell className="text-center">{l.quantite_demandee}</TableCell>
                                <TableCell className="text-center">{l.quantite_expediee}</TableCell>
                                <TableCell className="text-center">{l.quantite_recue}</TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )
              })()}
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </POSLayout>
  )
}

// Reusable Form Component
function FormContent({
  onSubmit,
  register,
  control,
  errors,
  fields,
  append,
  remove,
  pointsVente,
  pointsVenteLoading,
  users,
  userLoading,
  products,
  productsLoading,
  isEdit,
  onCancel,
}: any) {
  const currentUser = getCurrentUser()
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* ── Header fields ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Numéro */}
        <div>
          <Label>Numéro de transfert</Label>
          <Input {...register("numero_transfert", { required: "Requis" })} />
          {errors.numero_transfert && (
            <p className="text-xs text-destructive">{errors.numero_transfert.message}</p>
          )}
        </div>

        {/* Demandeur */}
        <div>
  <Label>Demandeur</Label>
  <div className="flex items-center h-10 px-3 border rounded-md bg-muted text-sm">
    {currentUser?.username  ?? "Utilisateur inconnu"}
  </div>
  {/* Hidden input to include the ID in form submission */}
  <input
    type="hidden"
    {...register("demandeur", { required: "Requis" })}
  />
</div>

        {/* Point de vente source */}
        <div>
          <Label>Point de vente source</Label>
          <Controller
            name="point_vente_source"
            control={control}
            rules={{ required: "Requis" }}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={pointsVenteLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={pointsVenteLoading ? "Chargement…" : "Source"} />
                </SelectTrigger>
                <SelectContent>
                  {pointsVenteLoading ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Chargement…
                    </div>
                  ) : pointsVente.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Aucun point de vente
                    </div>
                  ) : (
                    pointsVente.map((pv: PointVente) => (
                      <SelectItem key={pv.id} value={pv.id}>
                        {pv.nom}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.point_vente_source && (
            <p className="text-xs text-destructive">{errors.point_vente_source.message}</p>
          )}
        </div>

        {/* Point de vente destination */}
        <div>
          <Label>Point de vente destination</Label>
          <Controller
            name="point_vente_destination"
            control={control}
            rules={{ required: "Requis" }}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={pointsVenteLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={pointsVenteLoading ? "Chargement…" : "Destination"} />
                </SelectTrigger>
                <SelectContent>
                  {pointsVenteLoading ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Chargement…
                    </div>
                  ) : pointsVente.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Aucun point de vente
                    </div>
                  ) : (
                    pointsVente.map((pv: PointVente) => (
                      <SelectItem key={pv.id} value={pv.id}>
                        {pv.nom}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.point_vente_destination && (
            <p className="text-xs text-destructive">{errors.point_vente_destination.message}</p>
          )}
        </div>
      </div>

      {/* Commentaire */}
      <div>
        <Label>Commentaire (optionnel)</Label>
        <Input {...register("commentaire")} placeholder="Notes…" />
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
                  <TableHead className="text-center">Qté demandée</TableHead>
                  <TableHead className="text-center">Qté expédiée</TableHead>
                  <TableHead className="text-center">Qté reçue</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, i) => (
                  <TableRow key={field.id}>
                    {/* Produit */}
                    <TableCell>
                      <Controller
                        name={`lignes.${i}.produit`}
                        control={control}
                        rules={{ required: "Requis" }}
                        render={({ field: prodField }) => (
                          <Select
                            onValueChange={prodField.onChange}
                            value={prodField.value}
                            disabled={productsLoading}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder={productsLoading ? "Chargement…" : "Produit"} />
                            </SelectTrigger>
                            <SelectContent>
                              {productsLoading ? (
                                <div className="p-2 text-sm text-muted-foreground">
                                  Chargement…
                                </div>
                              ) : products.length === 0 ? (
                                <div className="p-2 text-sm text-muted-foreground">
                                  Aucun produit
                                </div>
                              ) : (
                                products.map((p: Produit) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.nom}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.lignes?.[i]?.produit && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.lignes[i].produit.message}
                        </p>
                      )}
                    </TableCell>

                    {/* Quantités */}
                    <TableCell>
                      <Input
                        type="number"
                        className="h-9 text-center"
                        {...register(`lignes.${i}.quantite_demandee`, {
                          required: "Requis",
                          min: { value: 1, message: "≥1" },
                          valueAsNumber: true,
                        })}
                      />
                      {errors.lignes?.[i]?.quantite_demandee && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.lignes[i].quantite_demandee.message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="h-9 text-center"
                        {...register(`lignes.${i}.quantite_expediee`, {
                          min: { value: 0, message: "≥0" },
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="h-9 text-center"
                        {...register(`lignes.${i}.quantite_recue`, {
                          min: { value: 0, message: "≥0" },
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>

                    {/* Delete */}
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(i)}
                        className="text-destructive"
                      >
                        Supprimer
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
            size="sm"
            className="mt-3"
            onClick={() =>
              append({
                produit: "",
                quantite_demandee: 1,
                quantite_expediee: 0,
                quantite_recue: 0,
              })
            }
          >
            <Plus className="h-3 w-3 mr-1" /> Ajouter
          </Button>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">{isEdit ? "Mettre à jour" : "Créer"} Transfert</Button>
      </div>
    </form>
  )
}
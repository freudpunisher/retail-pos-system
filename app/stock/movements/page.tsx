"use client"

import { JSX, useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { POSLayout } from "@/components/pos-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  DollarSign,
} from "lucide-react"
import { useStockMovements } from "@/hooks/useStockMovements"

const movementTypes = [
  { value: "all", label: "Tous les Types" },
  { value: "entree", label: "Entrée" },
  { value: "sortie", label: "Sortie" },
  { value: "transfert_in", label: "Transfert Entrant" },
  { value: "transfert_out", label: "Transfert Sortant" },
  { value: "ajustement", label: "Ajustement" },
  { value: "inventaire", label: "Inventaire" },
]

export default function MovementsPage() {
  const { movements, products, pointsVente, users, loading, error, refetch } = useStockMovements()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const getProductName = (stockId: string) => {
    const product = products.find(p => p.id === stockId)
    return product?.nom || "Inconnu"
  }

  const getPointVenteName = (stockId: string) => {
    const pv = pointsVente.find(pv => pv.id === stockId)
    return pv?.nom || "Inconnu"
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return "Inconnu"
    return [user.prenom, user.nom].filter(Boolean).join(" ") || "Utilisateur"
  }

  const getMovementIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      entree: <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />,
      sortie: <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />,
      transfert_in: <ArrowRightLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
      transfert_out: <ArrowRightLeft className="h-4 w-4 text-orange-600 dark:text-orange-400" />,
      ajustement: <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
      inventaire: <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />,
    }
    return icons[type] || <Package className="h-4 w-4 text-muted-foreground" />
  }

  const getMovementBadge = (type: string) => {
    const colors: Record<string, string> = {
      entree: "bg-green-500 hover:bg-green-600 text-white",
      sortie: "bg-red-500 hover:bg-red-600 text-white",
      transfert_in: "bg-blue-500 hover:bg-blue-600 text-white",
      transfert_out: "bg-orange-500 hover:bg-orange-600 text-white",
      ajustement: "bg-purple-500 hover:bg-purple-600 text-white",
      inventaire: "bg-gray-500 hover:bg-gray-600 text-white",
    }
    const label = movementTypes.find(t => t.value === type)?.label || type
    return <Badge className={colors[type] || "bg-muted"}>{label}</Badge>
  }

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const productName = getProductName(m.stock).toLowerCase()
      const ref = m.motif.toLowerCase()
      const matchesSearch = productName.includes(searchTerm.toLowerCase()) || ref.includes(searchTerm.toLowerCase())
      const matchesType = selectedType === "all" || m.type_mouvement === selectedType
      return matchesSearch && matchesType
    })
  }, [movements, searchTerm, selectedType])

  // Stats calculation
  const stats = useMemo(() => {
    const entrees = filteredMovements.filter(m => m.type_mouvement === "entree" || m.type_mouvement === "transfert_in")
    const sorties = filteredMovements.filter(m => m.type_mouvement === "sortie" || m.type_mouvement === "transfert_out")
    const totalEntrees = entrees.reduce((acc, m) => acc + Math.abs(m.quantite), 0)
    const totalSorties = sorties.reduce((acc, m) => acc + Math.abs(m.quantite), 0)
    const totalValue = filteredMovements.reduce((acc, m) => acc + (Math.abs(m.quantite) * parseFloat(m.prix_unitaire)), 0)
    
    return {
      totalMovements: filteredMovements.length,
      totalEntrees,
      totalSorties,
      totalValue,
    }
  }, [filteredMovements])

  // Pagination
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage)
  const paginatedMovements = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredMovements.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredMovements, currentPage, itemsPerPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedType, itemsPerPage])

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd MMM yyyy à HH:mm", { locale: fr })
    } catch {
      return "Date invalide"
    }
  }

  if (loading) {
    return (
      <POSLayout currentPath="/stock/mouvements">
        <div className="space-y-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground">Chargement des mouvements...</p>
            </div>
          </div>
        </div>
      </POSLayout>
    )
  }

  if (error) {
    return (
      <POSLayout currentPath="/stock/mouvements">
        <div className="p-4">
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Erreur: {error}</span>
                </div>
                <Button onClick={refetch} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </POSLayout>
    )
  }

  return (
    <POSLayout currentPath="/stock/mouvements">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Mouvements de Stock</h1>
              <p className="text-muted-foreground mt-1">Suivi complet des entrées et sorties</p>
            </div>
            <Button onClick={refetch} disabled={loading} variant="outline" className="h-10">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Actualiser
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Mouvements</p>
                    <p className="text-2xl font-bold">{stats.totalMovements}</p>
                  </div>
                  <ArrowRightLeft className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Entrées</p>
                    <p className="text-2xl font-bold">{stats.totalEntrees}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sorties</p>
                    <p className="text-2xl font-bold">{stats.totalSorties}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Valeur Totale</p>
                    <p className="text-2xl font-bold">{stats.totalValue.toFixed(0)} FBU</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white dark:bg-slate-800 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par produit ou motif..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-56 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {movementTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-white dark:bg-slate-800 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Historique des Mouvements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {paginatedMovements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 opacity-20 mb-4" />
                  <p className="font-medium">Aucun mouvement trouvé</p>
                  <p className="text-sm">Essayez de modifier vos filtres</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">
                        <div className="flex items-center gap-2">
                          <ArrowRightLeft className="h-4 w-4" />
                          Type
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Produit
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold">Point de Vente</TableHead>
                      <TableHead className="font-semibold text-center">Quantité</TableHead>
                      <TableHead className="font-semibold">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Prix Unit.
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold">Motif</TableHead>
                      <TableHead className="font-semibold">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Utilisateur
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedMovements.map(m => (
                      <TableRow key={m.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMovementIcon(m.type_mouvement)}
                            {getMovementBadge(m.type_mouvement)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {getProductName(m.stock)}
                        </TableCell>
                        <TableCell>{getPointVenteName(m.stock)}</TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={m.quantite > 0 ? "default" : "destructive"}
                            className="font-mono font-semibold"
                          >
                            {m.quantite > 0 ? "+" : ""}{m.quantite}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {parseFloat(m.prix_unitaire).toFixed(2)} FBU
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="max-w-[200px] truncate">
                            {m.motif || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{getUserName(m.utilisateur)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span className="text-sm">{formatDate(m.created_at)}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Pagination Controls */}
            {filteredMovements.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Lignes par page:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(Number(value))}
                  >
                    <SelectTrigger className="w-20 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground ml-4">
                    Affichage {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredMovements.length)} sur {filteredMovements.length} résultats
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-9 w-9"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-9 w-9"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1 px-3">
                    <span className="text-sm font-medium">Page {currentPage}</span>
                    <span className="text-sm text-muted-foreground">sur {totalPages}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="h-9 w-9"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-9 w-9"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </POSLayout>
  )
}
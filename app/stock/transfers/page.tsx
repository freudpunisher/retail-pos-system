"use client"

import { useState, useEffect } from "react"
import { POSLayout } from "@/components/pos-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, ArrowRightLeft, Package, Calendar, User, Eye, Edit, Truck, CheckCircle, Loader2 } from "lucide-react"
import { useTransfertsStock } from "@/hooks/useTransfertsStock" // Adjust path as needed
import { PointVente, TransfertStock, TransfertStockLigne } from "@/types/transfertsStock" // Adjust path as needed

// Mock data for points de vente (stores) - replace with actual API calls if available
const mockPointsVente: PointVente[] = [
    { id: "main", nom: "Main Store - Downtown" },
    { id: "branch", nom: "Branch Store - Mall" },
    { id: "outlet", nom: "Outlet Store - Airport" },
]

// Mock data for products - replace with actual API calls if available
const mockProduits = [
    { id: "1", nom: "Premium Coffee Beans" },
    { id: "2", nom: "Organic Tea Set" },
    { id: "3", nom: "Cotton T-Shirt" },
]

export default function TransfersPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [transferModalOpen, setTransferModalOpen] = useState(false)
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [selectedTransfer, setSelectedTransfer] = useState<string | null>(null)
    const [creatingTransfer, setCreatingTransfer] = useState(false)
    const [sourceStore, setSourceStore] = useState("")
    const [destinationStore, setDestinationStore] = useState("")
    const [commentaire, setCommentaire] = useState("")
    const [transferLines, setTransferLines] = useState<TransfertStockLigne[]>([])
    const [editingLine, setEditingLine] = useState<{ index: number; produit: string; quantite_demandee: number } | null>(null)

    const {
        transferts,
        isLoading,
        error,
        fetchTransferts,
        createTransfert,
        fetchLignes,
        createLigne,
        updateLigne,
        deleteLigne,
    } = useTransfertsStock()

    // Fetch transfer lines when selectedTransfer changes
    const lignesQuery = fetchLignes(selectedTransfer)

    useEffect(() => {
        fetchTransferts()
    }, [fetchTransferts])

    const filteredTransfers = transferts.filter((transfert) => {
        const matchesSearch =
            transfert.numero_transfert.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transfert.point_vente_source_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transfert.point_vente_destination_nom?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = selectedStatus === "all" || transfert.status === selectedStatus
        return matchesSearch && matchesStatus
    })

    const getStatusBadge = (status: string) => {
        const badges: Record<string, JSX.Element> = {
            pending: <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>,
            validated: <Badge className="bg-blue-100 text-blue-800">Validated</Badge>,
            shipped: <Badge className="bg-purple-100 text-purple-800">Shipped</Badge>,
            received: <Badge className="bg-green-100 text-green-800">Received</Badge>,
            cancelled: <Badge className="bg-red-100 text-red-800">Cancelled</Badge>,
        }
        return badges[status as keyof typeof badges] || <Badge variant="outline">{status}</Badge>
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending":
                return <Calendar className="h-4 w-4 text-yellow-600" />
            case "shipped":
                return <Truck className="h-4 w-4 text-purple-600" />
            case "received":
                return <CheckCircle className="h-4 w-4 text-green-600" />
            default:
                return <Package className="h-4 w-4 text-gray-600" />
        }
    }

    const handleCreateTransfer = async () => {
        if (!sourceStore || !destinationStore || transferLines.length === 0) {
            alert("Please fill all required fields and add at least one item.")
            return
        }

        setCreatingTransfer(true)
        try {
            const createData = {
                numero_transfert: `TRF-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`, // Simple ID generation
                point_vente_source: sourceStore,
                point_vente_destination: destinationStore,
                status: "pending" as const,
                demandeur: "current_user", // Replace with actual user ID
                date_demande: new Date().toISOString().split('T')[0],
                commentaire,
                lignes: transferLines.map(line => ({
                    produit: line.produit,
                    quantite_demandee: line.quantite_demandee,
                    quantite_expediee: 0,
                    quantite_recue: 0,
                })),
            } as any // Adjust to match CreateTransfertStock exactly

            await createTransfert(createData)
            setTransferModalOpen(false)
            setSourceStore("")
            setDestinationStore("")
            setCommentaire("")
            setTransferLines([])
            fetchTransferts()
        } catch (err) {
            console.error("Error creating transfer:", err)
            alert("Error creating transfer. Please try again.")
        } finally {
            setCreatingTransfer(false)
        }
    }

    const addLine = () => {
        if (editingLine) {
            // Update existing line
            setTransferLines(prev => prev.map((line, idx) =>
                idx === editingLine.index
                    ? { ...line, produit: editingLine.produit, quantite_demandee: editingLine.quantite_demandee }
                    : line
            ))
            setEditingLine(null)
        } else {
            // Add new line
            const newLine: TransfertStockLigne = {
                id: undefined,
                produit: "",
                produit_nom: "",
                quantite_demandee: 0,
                quantite_expediee: 0,
                quantite_recue: 0,
            }
            setTransferLines(prev => [...prev, newLine])
        }
    }

    const updateLineField = (index: number, field: keyof TransfertStockLigne, value: any) => {
        setTransferLines(prev => prev.map((line, idx) =>
            idx === index ? { ...line, [field]: value } : line
        ))
    }

    const removeLine = (index: number) => {
        setTransferLines(prev => prev.filter((_, idx) => idx !== index))
    }

    const editLine = (index: number) => {
        const line = transferLines[index]
        setEditingLine({
            index,
            produit: line.produit,
            quantite_demandee: line.quantite_demandee,
        })
    }

    if (error) {
        return (
            <POSLayout currentPath="/stock/transfers">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Package className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Error Loading Transfers</h2>
                        <p className="text-muted-foreground mb-4">{error.message}</p>
                        <Button onClick={fetchTransferts}>Retry</Button>
                    </div>
                </div>
            </POSLayout>
        )
    }

    return (
        <POSLayout currentPath="/stock/transfers">
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Stock Transfers</h1>
                        <p className="text-muted-foreground">Manage inter-store inventory transfers</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <Package className="h-4 w-4 mr-2" />
                            Export Transfers
                        </Button>
                        <Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Transfer
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Create Stock Transfer</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="source-store">Source Store</Label>
                                            <Select value={sourceStore} onValueChange={setSourceStore}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select source store" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {mockPointsVente.map((pv) => (
                                                        <SelectItem key={pv.id} value={pv.id}>{pv.nom}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="destination-store">Destination Store</Label>
                                            <Select value={destinationStore} onValueChange={setDestinationStore}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select destination store" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {mockPointsVente.map((pv) => (
                                                        <SelectItem key={pv.id} value={pv.id}>{pv.nom}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Comment</Label>
                                        <Input
                                            value={commentaire}
                                            onChange={(e) => setCommentaire(e.target.value)}
                                            placeholder="Optional comment"
                                        />
                                    </div>
                                    <div>
                                        <Label>Transfer Items</Label>
                                        <div className="border rounded-lg p-4 space-y-2">
                                            {transferLines.map((line, index) => (
                                                <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                                                    <Select
                                                        value={line.produit}
                                                        onValueChange={(value) => updateLineField(index, 'produit', value)}
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue placeholder="Product" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {mockProduits.map((prod) => (
                                                                <SelectItem key={prod.id} value={prod.id}>{prod.nom}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        type="number"
                                                        value={line.quantite_demandee || ''}
                                                        onChange={(e) => updateLineField(index, 'quantite_demandee', parseInt(e.target.value) || 0)}
                                                        placeholder="Qty"
                                                        className="w-20"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => removeLine(index)}
                                                    >
                                                        Remove
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => editLine(index)}
                                                    >
                                                        Edit
                                                    </Button>
                                                </div>
                                            ))}
                                            {editingLine && (
                                                <div className="flex items-center space-x-2 p-2 border rounded bg-gray-50">
                                                    <Select
                                                        value={editingLine.produit}
                                                        onValueChange={(value) => setEditingLine(prev => ({ ...prev!, produit: value }))}
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue placeholder="Product" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {mockProduits.map((prod) => (
                                                                <SelectItem key={prod.id} value={prod.id}>{prod.nom}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        type="number"
                                                        value={editingLine.quantite_demandee}
                                                        onChange={(e) => setEditingLine(prev => ({ ...prev!, quantite_demandee: parseInt(e.target.value) || 0 }))}
                                                        placeholder="Qty"
                                                        className="w-20"
                                                    />
                                                    <Button size="sm" variant="outline" onClick={addLine}>
                                                        Update
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setEditingLine(null)}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            )}
                                            {!editingLine && (
                                                <Button size="sm" variant="outline" onClick={addLine}>
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Add Item
                                                </Button>
                                            )}
                                            {transferLines.length === 0 && !editingLine && (
                                                <span className="text-sm text-muted-foreground">No items added yet</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button variant="outline" onClick={() => setTransferModalOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleCreateTransfer} disabled={creatingTransfer}>
                                            {creatingTransfer ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                "Create Transfer"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-64">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search transfers..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="validated">Validated</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="received">Received</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Transfers Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transfer Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                                Loading transfers...
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Transfer #</TableHead>
                                        <TableHead>Route</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Requester</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTransfers.map((transfert) => {
                                        const totalItems = transfert.lignes?.length || 0
                                        return (
                                            <TableRow key={transfert.id}>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">{transfert.numero_transfert}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="text-sm">
                                                            <span className="font-medium">From:</span> {transfert.point_vente_source_nom || transfert.point_vente_source}
                                                        </div>
                                                        <div className="text-sm">
                                                            <span className="font-medium">To:</span> {transfert.point_vente_destination_nom || transfert.point_vente_destination}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(transfert.status)}
                                                        {getStatusBadge(transfert.status)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{totalItems} items</TableCell>
                                                <TableCell>
                                                    <div className="space-y-1 text-xs">
                                                        <div>Requested: {transfert.date_demande}</div>
                                                        {transfert.date_validation && <div>Validated: {transfert.date_validation}</div>}
                                                        {transfert.date_expedition && <div>Shipped: {transfert.date_expedition}</div>}
                                                        {transfert.date_reception && <div>Received: {transfert.date_reception}</div>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-1">
                                                        <User className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-sm">{transfert.demandeur_username || transfert.demandeur}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSelectedTransfer(transfert.id || "")
                                                                setViewModalOpen(true)
                                                            }}
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                        </Button>
                                                        {transfert.status === "pending" && (
                                                            <Button size="sm" variant="outline">
                                                                <Edit className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                    {filteredTransfers.length === 0 && !isLoading && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                No transfers found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* View Transfer Modal */}
                <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Transfer Details - {selectedTransfer}</DialogTitle>
                        </DialogHeader>
                        {selectedTransfer && lignesQuery.isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                                Loading details...
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Transfer Info */}
                                <div className="grid grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Transfer Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex justify-between">
                                                <span>Status:</span>
                                                {selectedTransfer && getStatusBadge(transferts.find(t => t.id === selectedTransfer)?.status || "pending")}
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Requested:</span>
                                                <span>{transferts.find(t => t.id === selectedTransfer)?.date_demande}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Validated:</span>
                                                <span>{transferts.find(t => t.id === selectedTransfer)?.date_validation || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Shipped:</span>
                                                <span>{transferts.find(t => t.id === selectedTransfer)?.date_expedition || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Received:</span>
                                                <span>{transferts.find(t => t.id === selectedTransfer)?.date_reception || 'N/A'}</span>
                                            </div>
                                            {transferts.find(t => t.id === selectedTransfer)?.commentaire && (
                                                <div className="flex justify-between">
                                                    <span>Comment:</span>
                                                    <span>{transferts.find(t => t.id === selectedTransfer)?.commentaire}</span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">People</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex justify-between">
                                                <span>Requester:</span>
                                                <span>{transferts.find(t => t.id === selectedTransfer)?.demandeur_username || transferts.find(t => t.id === selectedTransfer)?.demandeur}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Validator:</span>
                                                <span>{transferts.find(t => t.id === selectedTransfer)?.validateur_username || transferts.find(t => t.id === selectedTransfer)?.validateur || 'N/A'}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Transfer Items */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Transfer Items</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Product</TableHead>
                                                    <TableHead>Requested</TableHead>
                                                    <TableHead>Shipped</TableHead>
                                                    <TableHead>Received</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {(lignesQuery.data || []).map((ligne: TransfertStockLigne) => (
                                                    <TableRow key={ligne.id || ligne.produit}>
                                                        <TableCell className="font-medium">{ligne.produit_nom || ligne.produit}</TableCell>
                                                        <TableCell>{ligne.quantite_demandee}</TableCell>
                                                        <TableCell>{ligne.quantite_expediee}</TableCell>
                                                        <TableCell>{ligne.quantite_recue}</TableCell>
                                                        <TableCell>
                                                            {ligne.quantite_recue === ligne.quantite_demandee ? (
                                                                <Badge className="bg-green-100 text-green-800">Complete</Badge>
                                                            ) : (
                                                                <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {(lignesQuery.data || []).length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-4">
                                                            No items for this transfer.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </POSLayout>
    )
}
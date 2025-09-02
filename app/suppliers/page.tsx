"use client"

import { JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useState} from "react"
import {POSLayout} from "@/components/pos-layout"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Badge} from "@/components/ui/badge"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import {Label} from "@/components/ui/label"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Textarea} from "@/components/ui/textarea"
import {
    Search,
    Plus,
    Factory,
    Phone,
    Mail,
    Eye,
    Edit,
    DollarSign,
    Truck,
    TrendingUp,
    Clock,
    Loader2
} from "lucide-react"
import {useFournisseurs} from "@/hooks/use-fournisseur"
import {FournisseurService} from "@/services/fournisseurService"


export default function SuppliersPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [supplierModalOpen, setSupplierModalOpen] = useState(false)
    const [detailModalOpen, setDetailModalOpen] = useState(false)
    const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null)
    const [isCreating, setIsCreating] = useState(false)

    // Utilisation de votre hook personnalisé
    const {fournisseurs, loading, error} = useFournisseurs()

    const [newSupplier, setNewSupplier] = useState({
        nom: "",
        contact_nom: "",
        telephone: "",
        email: "",
        conditions_paiement: "Net 30",
        delai_livraison: 7,
        adresse: "",
    })

    // Filtrage des fournisseurs
    const filteredSuppliers = fournisseurs.filter((supplier: {
        nom: string;
        contact_nom: string;
        email: string;
        is_active: any
    }) => {
        const matchesSearch =
            supplier.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.contact_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus =
            selectedStatus === "all" ||
            (selectedStatus === "active" && supplier.is_active) ||
            (selectedStatus === "inactive" && !supplier.is_active)
        return matchesSearch && matchesStatus
    })

    const getStatusBadge = (isActive: boolean) => {
        return isActive
            ? <Badge className="bg-green-100 text-green-800">Actif</Badge>
            : <Badge variant="outline">Inactif</Badge>
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR')
    }

    const selectedSupplierData = fournisseurs.find((supplier: {
        id: string | null
    }) => supplier.id === selectedSupplier)

    const handleCreateSupplier = async () => {
        setIsCreating(true)
        try {
            await FournisseurService.createFournisseur({
                ...newSupplier,
                is_active: true
            })

            // Réinitialiser le formulaire
            setNewSupplier({
                nom: "",
                contact_nom: "",
                telephone: "",
                email: "",
                conditions_paiement: "Net 30",
                delai_livraison: 7,
                adresse: "",
            })

            setSupplierModalOpen(false)

            // Recharger la page pour voir les nouvelles données
            window.location.reload()

        } catch (error) {
            console.error('Erreur lors de la création du fournisseur:', error)
        } finally {
            setIsCreating(false)
        }
    }

    if (loading) {
        return (
            <POSLayout currentPath="/suppliers">
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin"/>
                    <span className="ml-2">Chargement des fournisseurs...</span>
                </div>
            </POSLayout>
        )
    }

    if (error) {
        return (
            <POSLayout currentPath="/suppliers">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <p className="text-red-500 mb-4">Erreur: {error}</p>
                        <Button onClick={() => window.location.reload()}>Réessayer</Button>
                    </div>
                </div>
            </POSLayout>
        )
    }

    return (
        <POSLayout currentPath="/suppliers">
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Gestion des Fournisseurs</h1>
                        <p className="text-muted-foreground">Gérer les relations fournisseurs et suivre les
                            performances</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <Factory className="h-4 w-4 mr-2"/>
                            Exporter Fournisseurs
                        </Button>
                        <Dialog open={supplierModalOpen} onOpenChange={setSupplierModalOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2"/>
                                    Nouveau Fournisseur
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Ajouter un Nouveau Fournisseur</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="supplier-name">Nom de l'entreprise</Label>
                                        <Input
                                            id="supplier-name"
                                            value={newSupplier.nom}
                                            onChange={(e) => setNewSupplier({...newSupplier, nom: e.target.value})}
                                            placeholder="Nom de l'entreprise"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="supplier-contact">Personne de contact</Label>
                                        <Input
                                            id="supplier-contact"
                                            value={newSupplier.contact_nom}
                                            onChange={(e) => setNewSupplier({
                                                ...newSupplier,
                                                contact_nom: e.target.value
                                            })}
                                            placeholder="Nom du contact"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="supplier-phone">Téléphone</Label>
                                            <Input
                                                id="supplier-phone"
                                                value={newSupplier.telephone}
                                                onChange={(e) => setNewSupplier({
                                                    ...newSupplier,
                                                    telephone: e.target.value
                                                })}
                                                placeholder="+257 XX XX XX XX"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="supplier-email">Email</Label>
                                            <Input
                                                id="supplier-email"
                                                type="email"
                                                value={newSupplier.email}
                                                onChange={(e) => setNewSupplier({
                                                    ...newSupplier,
                                                    email: e.target.value
                                                })}
                                                placeholder="fournisseur@email.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="payment-terms">Conditions de paiement</Label>
                                            <Select
                                                value={newSupplier.conditions_paiement}
                                                onValueChange={(value) => setNewSupplier({
                                                    ...newSupplier,
                                                    conditions_paiement: value
                                                })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Net 15">Net 15</SelectItem>
                                                    <SelectItem value="Net 30">Net 30</SelectItem>
                                                    <SelectItem value="Net 45">Net 45</SelectItem>
                                                    <SelectItem value="Net 60">Net 60</SelectItem>
                                                    <SelectItem value="COD">Paiement à la livraison</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="delivery-delay">Délai de livraison (jours)</Label>
                                            <Input
                                                id="delivery-delay"
                                                type="number"
                                                value={newSupplier.delai_livraison}
                                                onChange={(e) => setNewSupplier({
                                                    ...newSupplier,
                                                    delai_livraison: Number(e.target.value)
                                                })}
                                                placeholder="7"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="supplier-address">Adresse</Label>
                                        <Textarea
                                            id="supplier-address"
                                            value={newSupplier.adresse}
                                            onChange={(e) => setNewSupplier({...newSupplier, adresse: e.target.value})}
                                            placeholder="Adresse du fournisseur"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleCreateSupplier}
                                        className="w-full"
                                        disabled={isCreating}
                                    >
                                        {isCreating ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                                Création...
                                            </>
                                        ) : (
                                            "Ajouter Fournisseur"
                                        )}
                                    </Button>
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
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                    <Input
                                        placeholder="Rechercher des fournisseurs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="w-48">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value="active">Actif</SelectItem>
                                    <SelectItem value="inactive">Inactif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Suppliers Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Répertoire des Fournisseurs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Entreprise</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Conditions de paiement</TableHead>
                                    <TableHead>Délai de livraison</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Date de création</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSuppliers.map((supplier: { id: string | number | bigint | ((prevState: string | null) => string | null) | null | undefined; nom: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; contact_nom: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; telephone: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; email: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; conditions_paiement: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; delai_livraison: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; is_active: boolean; created_at: string }) => (
                                    <TableRow key={supplier.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Factory className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">{supplier.nom}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{supplier.contact_nom}</p>
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-1 text-sm">
                                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                                        <span>{supplier.telephone}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1 text-sm">
                                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                                        <span>{supplier.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{supplier.conditions_paiement}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-sm">{supplier.delai_livraison} jours</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(supplier.is_active)}</TableCell>
                                        <TableCell>{formatDate(supplier.created_at)}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedSupplier(supplier.id)
                                                        setDetailModalOpen(true)
                                                    }}
                                                >
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Supplier Detail Modal */}
                <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Détails du fournisseur - {selectedSupplierData?.nom}</DialogTitle>
                        </DialogHeader>
                        {selectedSupplierData && (
                            <div className="space-y-6">
                                {/* Supplier Info */}
                                <div className="grid grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Informations de contact</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div>
                                                <p className="font-medium">{selectedSupplierData.contact_nom}</p>
                                                <p className="text-sm text-muted-foreground">Personne de contact</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span>{selectedSupplierData.telephone}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <span>{selectedSupplierData.email}</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-2">{selectedSupplierData.adresse}</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Conditions & Livraison</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex justify-between">
                                                <span>Conditions de paiement:</span>
                                                <Badge variant="outline">{selectedSupplierData.conditions_paiement}</Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Délai de livraison:</span>
                                                <span>{selectedSupplierData.delai_livraison} jours</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Statut:</span>
                                                {getStatusBadge(selectedSupplierData.is_active)}
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Créé le:</span>
                                                <span>{formatDate(selectedSupplierData.created_at)}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Fournisseurs</CardTitle>
                            <Factory className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{fournisseurs.length}</div>
                            <p className="text-xs text-muted-foreground">Fournisseurs enregistrés</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Fournisseurs Actifs</CardTitle>
                            <Factory className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {fournisseurs.filter((supplier: { is_active: any }) => supplier.is_active).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Relations actuellement actives</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Délai Moyen</CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {Math.round(
                                    fournisseurs.reduce((sum: any, supplier: { delai_livraison: any }) => sum + supplier.delai_livraison, 0) / fournisseurs.length || 0,
                                )} jours
                            </div>
                            <p className="text-xs text-muted-foreground">Délai moyen de livraison</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </POSLayout>
    )
}
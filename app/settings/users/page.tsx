"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr , enUS } from "date-fns/locale";
import toast from "react-hot-toast";
import { POSLayout } from "@/components/pos-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search, Plus, Shield, Users, UserCheck, Edit, ToggleLeft, ToggleRight,
  Loader2, RefreshCw, Key, Mail, Phone, Calendar, Crown, UserCog,
  Package,
  DollarSign,
  Save,
  X
} from "lucide-react";
import { useUsers, userService, RoleEnum } from "@/services/userServices";
import { CreateUserRequest, User } from "@/types/user";

const locale = fr;

export default function UsersPage() {
  const { users, loading, error, refetch } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isToggling, setIsToggling] = useState<string | null>(null);
const [isEditOpen, setIsEditOpen] = useState(false);
const [editingUser, setEditingUser] = useState<User | null>(null);
const [editFormData, setEditFormData] = useState({
  username: "",
  email: "",
  phone: "",
  role: RoleEnum.ADMIN,
  password: "",
});
  const handleEditUser = (user: User) => {
  setEditingUser(user);
  setEditFormData({
    username: user.username,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    password: "", // Leave empty for security
  });
  setIsEditOpen(true);
};

  const [formData, setFormData] = useState<CreateUserRequest>({
    username: "",
    email: "",
    phone: "",
    role: RoleEnum.ADMIN,
    password: "",
  });

  const handleUpdateUser = async () => {
  if (!editingUser) return;

  try {
    const updateData: any = {
      username: editFormData.username,
      email: editFormData.email,
      phone: editFormData.phone,
      role: editFormData.role,
    };

    // Only include password if it was changed
    if (editFormData.password) {
      updateData.password = editFormData.password;
    }

    await userService.updateUser(editingUser.id, updateData);
    toast.success("Utilisateur mis à jour avec succès !");
    setIsEditOpen(false);
    setEditingUser(null);
    refetch();
  } catch (err) {
    toast.error("Erreur lors de la mise à jour");
  }
};


// const handleToggleActive = async (user: User) => {
//   setIsToggling(user.id); // Show loading for this specific user
//   try {
//     await userService.toggleUserActive(user.id, !user.is_active);
//     toast.success(user.is_active ? "Utilisateur désactivé" : "Utilisateur activé");
//     refetch();
//   } catch (err) {
//     toast.error("Échec de la mise à jour");
//   } finally {
//     setIsToggling(null); // Remove loading state
//   }
// };

  const filteredUsers = users?.filter((user: User) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const total = users?.length || 0;
  const active = users?.filter(u => u.is_active).length || 0;
  const admins = users?.filter(u => u.role === RoleEnum.ADMIN).length || 0;
  const managers = users?.filter(u => u.role === RoleEnum.MANAGER).length || 0;

  const handleCreateUser = async () => {
    try {
      await userService.createUser(formData);
      toast.success("Utilisateur créé avec succès !");
      setIsAddOpen(false);
      setFormData({ username: "", email: "", phone: "", role: RoleEnum.ADMIN, password: "" });
      refetch();
    } catch (err) {
      toast.error("Erreur lors de la création");
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await userService.toggleUserActive(user.id, !user.is_active);
      toast.success(user.is_active ? "Utilisateur désactivé" : "Utilisateur activé");
      refetch();
    } catch (err) {
      toast.error("Échec de la mise à jour");
    }
  };

  const getRoleBadge = (role: string) => {
    const config: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      [RoleEnum.ADMIN]: { label: "Administrateur", color: "bg-purple-600", icon: <Crown className="h-4 w-4" /> },
      [RoleEnum.MANAGER]: { label: "Gestionnaire", color: "bg-blue-600", icon: <UserCog className="h-4 w-4" /> },
      [RoleEnum.STOCK_MANAGER]: { label: "Stock", color: "bg-indigo-600", icon: <Package className="h-4 w-4" /> },
      [RoleEnum.CASHIER]: { label: "Caissier", color: "bg-emerald-600", icon: <DollarSign className="h-4 w-4" /> },
    };
    const c = config[role] || config[RoleEnum.CASHIER];
    return (
      <Badge className={`${c.color} text-white font-bold flex items-center gap-2`}>
        {c.icon} {c.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <POSLayout currentPath="/admin/users">
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
        </div>
      </POSLayout>
    );
  }

  return (
    <POSLayout currentPath="/admin/users">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="p-8 space-y-8  mx-auto">

          {/* Header ÉPIQUE */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl shadow-2xl">
                  <Users className="h-20 w-20 text-white" />
                </div>
                <div>
                  <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Gestion des Utilisateurs
                  </h1>
                  <p className="text-2xl text-slate-600 dark:text-slate-400 mt-3 flex items-center gap-3">
                    <Shield className="h-8 w-8 text-blue-600" />
                    Contrôle total des comptes et permissions
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button size="lg" variant="outline" onClick={refetch}>
                  <RefreshCw className="h-6 w-6 mr-3" />
                  Actualiser
                </Button>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl">
                      <Plus className="h-6 w-6 mr-3" />
                      Nouvel Utilisateur
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-bold text-blue-700">Créer un Utilisateur</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 mt-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label className="text-lg font-semibold">Nom d'utilisateur</Label>
                          <Input
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="h-12 text-lg mt-2"
                            placeholder="jean.dupont"
                          />
                        </div>
                        <div>
                          <Label className="text-lg font-semibold">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="pl-12 h-12 text-lg mt-2"
                              placeholder="jean@entreprise.bi"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-lg font-semibold">Téléphone</Label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="pl-12 h-12 text-lg mt-2"
                              placeholder="+257 79 123 456"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-lg font-semibold">Mot de passe</Label>
                          <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                              type="password"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              className="pl-12 h-12 text-lg mt-2"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-lg font-semibold">Rôle & Permissions</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(v) => setFormData({ ...formData, role: v as RoleEnum })}
                        >
                          <SelectTrigger className="h-14 text-lg mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={RoleEnum.ADMIN}>
                              <div className="flex items-center gap-3">
                                <Crown className="h-5 w-5 text-purple-600" />
                                <span className="font-bold">Administrateur</span>
                                <Badge className="bg-purple-600 text-white">Accès total</Badge>
                              </div>
                            </SelectItem>
                            <SelectItem value={RoleEnum.MANAGER}>
                              <div className="flex items-center gap-3">
                                <UserCog className="h-5 w-5 text-blue-600" />
                                <span className="font-bold">Gestionnaire</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={RoleEnum.STOCK_MANAGER}>
                              <div className="flex items-center gap-3">
                                <Package className="h-5 w-5 text-indigo-600" />
                                <span className="font-bold">Gestionnaire de Stock</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={RoleEnum.CASHIER}>
                              <div className="flex items-center gap-3">
                                <DollarSign className="h-5 w-5 text-emerald-600" />
                                <span className="font-bold">Caissier</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-4 pt-6 border-t">
                        <Button type="button" variant="outline" size="lg" onClick={() => setIsAddOpen(false)}>
                          Annuler
                        </Button>
                        <Button size="lg" onClick={handleCreateUser} className="bg-gradient-to-r from-blue-600 to-blue-700 px-10">
                          <UserCheck className="h-6 w-6 mr-3" />
                          Créer l'Utilisateur
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>


                {/* edit dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle className="text-3xl font-bold text-blue-700">
        Modifier l'Utilisateur
      </DialogTitle>
    </DialogHeader>
    <div className="space-y-6 mt-6">
      {/* Same fields as create form but using editFormData */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="text-lg font-semibold">Nom d'utilisateur *</Label>
          <Input
            value={editFormData.username}
            onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
            className="h-12 text-lg mt-2"
          />
        </div>
       <div>
                          <Label className="text-lg font-semibold">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                              type="email"
                              value={editFormData.email}
                              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                              className="pl-12 h-12 text-lg mt-2"
                              placeholder="jean@entreprise.bi"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-lg font-semibold">Téléphone</Label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                              value={editFormData.phone}
                              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                              className="pl-12 h-12 text-lg mt-2"
                              placeholder="+257 79 123 456"
                            />
                          </div>
                        </div>
        <div>
          <Label className="text-lg font-semibold">Nouveau mot de passe</Label>
          <Input
            type="password"
            value={editFormData.password}
            onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
            placeholder="Laisser vide pour ne pas changer"
            className="h-12 text-lg mt-2"
          />
        </div>
      </div>
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="outline" onClick={() => setIsEditOpen(false)}>
          <X className="h-5 w-5 mr-2" />
          Annuler
        </Button>
        <Button onClick={handleUpdateUser} className="bg-gradient-to-r from-blue-600 to-blue-700">
          <Save className="h-6 w-6 mr-3" />
          Sauvegarder
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
              </div>
            </div>
          </div>

          {/* Stats Premium */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-2xl border-0">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-lg">Total</p>
                    <p className="text-5xl font-extrabold mt-2">{total}</p>
                  </div>
                  <Users className="h-20 w-20 opacity-30" />
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
                  <UserCheck className="h-16 w-16 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-600 to-violet-700 text-white shadow-2xl border-0">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Admins</p>
                    <p className="text-4xl font-bold mt-2">{admins}</p>
                  </div>
                  <Crown className="h-16 w-16 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-2xl border-0">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100">Gestionnaires</p>
                    <p className="text-4xl font-bold mt-2">{managers}</p>
                  </div>
                  <UserCog className="h-16 w-16 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tableau Utilisateurs */}
          <Card className="shadow-2xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl font-bold flex items-center gap-4">
                  <Shield className="h-10 w-10 text-blue-600" />
                  Liste des Utilisateurs
                </CardTitle>
                <div className="relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-blue-600 z-10" />
  <Input
    placeholder="Rechercher un utilisateur..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="pl-14 h-14 w-96 text-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white shadow-lg font-medium"
  />
</div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50 dark:bg-blue-900/30">
                    <TableHead className="font-bold text-lg text-blue-700">Utilisateur</TableHead>
                    <TableHead className="font-bold text-lg text-blue-700">Rôle</TableHead>
                    <TableHead className="font-bold text-lg text-blue-700 text-center">Statut</TableHead>
                    <TableHead className="font-bold text-lg text-blue-700">Dernière connexion</TableHead>
                    <TableHead className="font-bold text-lg text-blue-700 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 h-20">
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14 ring-4 ring-blue-100">
                            <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                              {user.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-lg">{user.username}</p>
                            <p className="text-sm text-slate-600 flex items-center gap-2">
                              <Mail className="h-4 w-4" /> {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={`text-white text-lg px-6 py-2 ${user.is_active ? "bg-emerald-500" : "bg-red-500"}`}>
                          {user.is_active ? "ACTIF" : "INACTIF"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="h-5 w-5" />
                          {user.last_login ? format(new Date(user.last_login), "dd MMM yyyy à HH:mm", { locale }) : "Jamais"}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-3">
                         <Button 
  size="sm" 
  variant="ghost" 
  onClick={() => handleEditUser(user)}
  className="hover:bg-blue-100 hover:text-blue-700 transition-colors"
>
  <Edit className="h-5 w-5 text-blue-600" />
</Button>
                         <Button 
  size="sm" 
  variant="ghost" 
  onClick={() => handleToggleActive(user)}
  disabled={isToggling === user.id}
  className="hover:bg-slate-100 transition-colors"
>
  {isToggling === user.id ? (
    <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
  ) : user.is_active ? (
    <ToggleRight className="h-6 w-6 text-emerald-600" />
  ) : (
    <ToggleLeft className="h-6 w-6 text-red-600" />
  )}
</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </POSLayout>
  );
}
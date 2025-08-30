"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import {
  BarChart3,
  Receipt,
  Package,
  Users,
  Factory,
  CreditCard,
  FileText,
  Settings,
  Menu,
  Bell,
  ChevronLeft,
  ChevronRight,
  Store,
  DollarSign,
  Plus,
  LogOut,
  User,
} from "lucide-react"

interface NavigationItem {
  name: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  children?: NavigationItem[]
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", icon: BarChart3, href: "/" }, // Updated dashboard href to root path
  { name: "POS Sale", icon: Receipt, href: "/pos" },
  {
    name: "Stock",
    icon: Package,
    href: "/stock",
    children: [
      { name: "Stocks", icon: Package, href: "/stock" },
      { name: "Movements", icon: Package, href: "/stock/movements" },
      { name: "Transfers", icon: Package, href: "/stock/transfers" },
      { name: "Purchase Orders", icon: Package, href: "/stock/purchase-orders" },
    ],
  },
  { name: "Clients", icon: Users, href: "/clients" },
  { name: "Suppliers", icon: Factory, href: "/suppliers" },
  {
    name: "Payments & Registers",
    icon: CreditCard,
    href: "/payments",
    children: [
      { name: "Payments", icon: CreditCard, href: "/payments" },
      { name: "Cash Registers", icon: CreditCard, href: "/payments/registers" },
    ],
  },
  { name: "Reports", icon: FileText, href: "/reports" },
  {
    name: "Settings",
    icon: Settings,
    href: "/settings",
    children: [
      { name: "Users & Roles", icon: Users, href: "/settings/users" },
      { name: "Stores", icon: Store, href: "/settings/stores" },
      { name: "Products & Categories", icon: Package, href: "/settings/products" },
      { name: "Payment Methods", icon: CreditCard, href: "/settings/payment-methods" },
      { name: "Taxes & Preferences", icon: Settings, href: "/settings/preferences" },
    ],
  },
]

interface POSLayoutProps {
  children: React.ReactNode
  currentPath?: string
}

export function POSLayout({ children, currentPath }: POSLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()
  const activePath = currentPath || pathname
  const { theme, setTheme } = useTheme()

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
  }

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName) ? prev.filter((name) => name !== itemName) : [...prev, itemName],
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!sidebarCollapsed && <h1 className="text-lg font-semibold text-sidebar-foreground">RetailPOS</h1>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <Button
                  variant={activePath === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                    sidebarCollapsed && "px-2",
                    activePath === item.href && "bg-sidebar-primary text-sidebar-primary-foreground",
                  )}
                  onClick={() => toggleExpanded(item.name)}
                >
                  <item.icon className={cn("h-4 w-4", !sidebarCollapsed && "mr-2")} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      <ChevronRight
                        className={cn("h-4 w-4 transition-transform", expandedItems.includes(item.name) && "rotate-90")}
                      />
                    </>
                  )}
                </Button>
              ) : (
                <Link href={item.href} className="block">
                  <Button
                    variant={activePath === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                      sidebarCollapsed && "px-2",
                      activePath === item.href && "bg-sidebar-primary text-sidebar-primary-foreground",
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", !sidebarCollapsed && "mr-2")} />
                    {!sidebarCollapsed && <span className="flex-1 text-left">{item.name}</span>}
                  </Button>
                </Link>
              )}

              {/* Submenu */}
              {item.children && !sidebarCollapsed && expandedItems.includes(item.name) && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link key={child.name} href={child.href} className="block">
                      <Button
                        variant={activePath === child.href ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-sm text-sidebar-foreground hover:bg-sidebar-accent",
                          activePath === child.href && "bg-sidebar-primary text-sidebar-primary-foreground",
                        )}
                      >
                        <child.icon className="h-3 w-3 mr-2" />
                        {child.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between p-4 bg-card border-b border-border">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>

            {/* Store Selector */}
            <div className="flex items-center space-x-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue="store-1">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="store-1">Main Store - Downtown</SelectItem>
                  <SelectItem value="store-2">Branch Store - Mall</SelectItem>
                  <SelectItem value="store-3">Outlet Store - Airport</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cash Register Status */}
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Register #1 - Open
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <Link href="/pos">
              <Button size="sm" className="hidden md:flex">
                <Plus className="h-4 w-4 mr-2" />
                New Sale
              </Button>
            </Link>

            {/* Theme Toggle Button */}
            <Button variant="ghost" size="sm" onClick={handleThemeToggle}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">3</Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">Manager</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}

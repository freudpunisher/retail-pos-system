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
          "flex flex-col bg-white dark:bg-slate-800/90 border-r border-gray-200 dark:border-slate-700 transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          {!sidebarCollapsed && <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">RetailPOS</h1>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80"
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
                    "w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-slate-100",
                    sidebarCollapsed && "px-2",
                    activePath === item.href && "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
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
                      "w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-slate-100",
                      sidebarCollapsed && "px-2",
                      activePath === item.href && "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
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
                          "w-full justify-start text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/80 hover:text-slate-800 dark:hover:text-slate-200",
                          activePath === child.href && "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
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
        <header className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/90 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>

            {/* Store Selector */}
            <div className="flex items-center space-x-2">
              <Store className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <Select defaultValue="store-1">
                <SelectTrigger className="w-48 bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                  <SelectItem value="store-1" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Main Store - Downtown</SelectItem>
                  <SelectItem value="store-2" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Branch Store - Mall</SelectItem>
                  <SelectItem value="store-3" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Outlet Store - Airport</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cash Register Status */}
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
                Register #1 - Open
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <Link href="/pos">
              <Button size="sm" className="hidden md:flex bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Sale
              </Button>
            </Link>

            {/* Theme Toggle Button */}
            <Button variant="ghost" size="sm" onClick={handleThemeToggle} className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 dark:bg-red-600 text-white border-white dark:border-slate-800">3</Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/80">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-100">John Doe</p>
                    <p className="text-xs leading-none text-slate-500 dark:text-slate-400">Manager</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-slate-700" />
                <DropdownMenuItem className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-slate-700" />
                <DropdownMenuItem className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-900">{children}</main>
      </div>
    </div>
  )
}

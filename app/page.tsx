"use client"

import { POSLayout } from "@/components/pos-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, DollarSign, Package, AlertTriangle, ShoppingCart, TrendingUp, Receipt } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Mock data for KPIs
const kpiData = {
  todaysSales: 12450.75,
  openRegisters: 3,
  totalRegisters: 5,
  stockValue: 245680.5,
  lowStockAlerts: 12,
  pendingPOs: 8,
}

const topProducts = [
  { name: "Premium Coffee Beans", sales: 145, amount: 2175.0 },
  { name: "Wireless Headphones", sales: 89, amount: 8900.0 },
  { name: "Organic Tea Set", sales: 76, amount: 1520.0 },
  { name: "Bluetooth Speaker", sales: 65, amount: 3250.0 },
  { name: "Artisan Chocolate", sales: 54, amount: 810.0 },
]

const salesTrendData = [
  { date: "Jan 1", sales: 8500, purchases: 6200 },
  { date: "Jan 2", sales: 9200, purchases: 5800 },
  { date: "Jan 3", sales: 7800, purchases: 7100 },
  { date: "Jan 4", sales: 11200, purchases: 6900 },
  { date: "Jan 5", sales: 10500, purchases: 8200 },
  { date: "Jan 6", sales: 12800, purchases: 7500 },
  { date: "Jan 7", sales: 13500, purchases: 6800 },
  { date: "Jan 8", sales: 9800, purchases: 7200 },
  { date: "Jan 9", sales: 11500, purchases: 8900 },
  { date: "Jan 10", sales: 12450, purchases: 7800 },
]

const productMixData = [
  { name: "Electronics", value: 35, amount: 45200 },
  { name: "Food & Beverages", value: 28, amount: 32800 },
  { name: "Clothing", value: 18, amount: 24500 },
  { name: "Home & Garden", value: 12, amount: 18200 },
  { name: "Books & Media", value: 7, amount: 9800 },
]

const COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"]

export default function Dashboard() {
  return (
    <POSLayout currentPath="/">
      {" "}
      {/* Updated currentPath to match root route */}
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your store overview.</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Receipt className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button>
              <ShoppingCart className="h-4 w-4 mr-2" />
              New Sale
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${kpiData.todaysSales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12.5% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Registers</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpiData.openRegisters}/{kpiData.totalRegisters}
              </div>
              <p className="text-xs text-muted-foreground">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {kpiData.openRegisters} Open
                </Badge>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${kpiData.stockValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total inventory value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{kpiData.lowStockAlerts}</div>
              <p className="text-xs text-muted-foreground">Low stock items</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used operations</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button className="h-20 flex-col">
                <ShoppingCart className="h-6 w-6 mb-2" />
                New Sale
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <Package className="h-6 w-6 mb-2" />
                New Purchase Order
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <BarChart3 className="h-6 w-6 mb-2" />
                Stock Transfer
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <DollarSign className="h-6 w-6 mb-2" />
                Close Register
              </Button>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Products</CardTitle>
              <CardDescription>Best performing products today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sales} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${product.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Sales Trend (Last 10 Days)</CardTitle>
              <CardDescription>Daily sales performance and purchase comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#059669" strokeWidth={3} name="Sales" />
                  <Line
                    type="monotone"
                    dataKey="purchases"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Purchases"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Product Mix Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Product Mix</CardTitle>
              <CardDescription>Sales distribution by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productMixData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productMixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Share"]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Revenue by product category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productMixData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]} />
                  <Bar dataKey="amount" fill="#059669" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Pending Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>Items requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Premium Coffee Beans", current: 5, minimum: 20 },
                  { name: "Wireless Mouse", current: 2, minimum: 15 },
                  { name: "Notebook Set", current: 8, minimum: 25 },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Current: {item.current} | Min: {item.minimum}
                      </p>
                    </div>
                    <Badge variant="destructive">Low Stock</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Purchase Orders</CardTitle>
              <CardDescription>{kpiData.pendingPOs} orders awaiting action</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { number: "PO-2024-001", supplier: "Coffee Suppliers Inc.", amount: 2450.0, status: "Pending" },
                  { number: "PO-2024-002", supplier: "Tech Distributors", amount: 5670.0, status: "Confirmed" },
                  { number: "PO-2024-003", supplier: "Office Supplies Co.", amount: 890.0, status: "Shipped" },
                ].map((po) => (
                  <div key={po.number} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{po.number}</p>
                      <p className="text-xs text-muted-foreground">{po.supplier}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${po.amount.toLocaleString()}</p>
                      <Badge variant="outline">{po.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </POSLayout>
  )
}

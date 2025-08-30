"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Filter, TrendingUp, Package, DollarSign, Users } from "lucide-react"

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("today")
  const [reportType, setReportType] = useState("sales")

  const reportTypes = [
    { id: "sales", name: "Sales Reports", icon: DollarSign, color: "bg-emerald-500" },
    { id: "stock", name: "Stock Reports", icon: Package, color: "bg-blue-500" },
    { id: "financial", name: "Financial Reports", icon: TrendingUp, color: "bg-purple-500" },
    { id: "customer", name: "Customer Reports", icon: Users, color: "bg-orange-500" },
  ]

  const salesReports = [
    { name: "Daily Sales Summary", description: "Total sales, transactions, and averages", generated: "2 min ago" },
    { name: "Product Performance", description: "Best and worst selling products", generated: "5 min ago" },
    { name: "Category Analysis", description: "Sales breakdown by product category", generated: "10 min ago" },
    { name: "Hourly Sales Trend", description: "Sales distribution throughout the day", generated: "15 min ago" },
    { name: "Payment Method Analysis", description: "Breakdown by payment types", generated: "20 min ago" },
  ]

  const stockReports = [
    { name: "Current Stock Levels", description: "All products with current quantities", generated: "1 min ago" },
    { name: "Low Stock Alert", description: "Products below minimum threshold", generated: "3 min ago" },
    { name: "Stock Movement History", description: "All stock transactions and adjustments", generated: "8 min ago" },
    { name: "Supplier Performance", description: "Delivery times and order accuracy", generated: "12 min ago" },
    { name: "Dead Stock Analysis", description: "Products with no movement", generated: "25 min ago" },
  ]

  const getCurrentReports = () => {
    switch (reportType) {
      case "sales":
        return salesReports
      case "stock":
        return stockReports
      case "financial":
        return [
          { name: "Profit & Loss", description: "Revenue, costs, and profit margins", generated: "5 min ago" },
          { name: "Cash Flow Statement", description: "Money in and out of business", generated: "10 min ago" },
          { name: "Tax Summary", description: "Tax calculations and obligations", generated: "15 min ago" },
        ]
      case "customer":
        return [
          {
            name: "Customer Purchase History",
            description: "Individual customer transactions",
            generated: "3 min ago",
          },
          { name: "Customer Loyalty Analysis", description: "Repeat customers and frequency", generated: "7 min ago" },
          { name: "Customer Demographics", description: "Age, location, and preferences", generated: "12 min ago" },
        ]
      default:
        return salesReports
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generate and view business reports</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export All
        </Button>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {reportTypes.map((type) => {
          const Icon = type.icon
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all ${reportType === type.id ? "ring-2 ring-emerald-500" : ""}`}
              onClick={() => setReportType(type.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${type.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{type.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Store</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  <SelectItem value="main">Main Store</SelectItem>
                  <SelectItem value="branch1">Branch 1</SelectItem>
                  <SelectItem value="branch2">Branch 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="food">Food & Beverages</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">Generate Report</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>
            Recently generated reports for {reportTypes.find((t) => t.id === reportType)?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getCurrentReports().map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{report.name}</h4>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">Generated {report.generated}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Ready</Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

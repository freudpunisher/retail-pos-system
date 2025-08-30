import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    direction: "up" | "down" | "neutral"
    period: string
  }
  progress?: {
    value: number
    max: number
    label: string
  }
  icon?: React.ReactNode
}

export function MetricCard({ title, value, description, trend, progress, icon }: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend?.direction) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-600" />
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-600" />
      default:
        return <Minus className="h-3 w-3 text-gray-500" />
    }
  }

  const getTrendColor = () => {
    switch (trend?.direction) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}

        {trend && (
          <div className={`flex items-center mt-2 text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="ml-1">
              {trend.value > 0 ? "+" : ""}
              {trend.value}% {trend.period}
            </span>
          </div>
        )}

        {progress && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">{progress.label}</span>
              <span className="font-medium">
                {progress.value}/{progress.max}
              </span>
            </div>
            <Progress value={(progress.value / progress.max) * 100} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface AlertItemProps {
  title: string
  description: string
  severity: "low" | "medium" | "high"
  action?: string
}

export function AlertItem({ title, description, severity, action }: AlertItemProps) {
  const getSeverityColor = () => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center space-x-2">
        {action && <span className="text-xs text-primary cursor-pointer hover:underline">{action}</span>}
        <Badge variant={getSeverityColor()}>{severity.toUpperCase()}</Badge>
      </div>
    </div>
  )
}

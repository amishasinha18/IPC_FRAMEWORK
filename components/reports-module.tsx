"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, TrendingUp, Clock, Shield, Activity, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"

interface ReportData {
  timestamp: string
  totalOperations: number
  successRate: number
  avgLatency: number
  securityEvents: number
  activeProcesses: number
}

interface PerformanceMetric {
  method: string
  operations: number
  avgTime: string
  successRate: number
  throughput: string
}

interface SecurityLog {
  id: number
  timestamp: string
  event: string
  severity: "info" | "warning" | "critical"
  details: string
}

export function ReportsModule() {
  const [mounted, setMounted] = useState(false)
  const [reportData, setReportData] = useState<ReportData>({
    timestamp: new Date().toISOString(),
    totalOperations: 15847,
    successRate: 99.7,
    avgLatency: 2.4,
    securityEvents: 3,
    activeProcesses: 12,
  })

  const [performanceMetrics] = useState<PerformanceMetric[]>([
    {
      method: "Pipes",
      operations: 6234,
      avgTime: "1.2ms",
      successRate: 99.9,
      throughput: "5.2K/s",
    },
    {
      method: "Message Queues",
      operations: 7891,
      avgTime: "2.8ms",
      successRate: 99.8,
      throughput: "6.6K/s",
    },
    {
      method: "Shared Memory",
      operations: 1722,
      avgTime: "0.8ms",
      successRate: 99.5,
      throughput: "1.4K/s",
    },
  ])

  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([
    {
      id: 1,
      timestamp: "Loading...",
      event: "Authentication Success",
      severity: "info",
      details: "Process PID 4521 authenticated successfully",
    },
    {
      id: 2,
      timestamp: "Loading...",
      event: "Rate Limit Warning",
      severity: "warning",
      details: "Process PID 3289 exceeded rate limit threshold",
    },
    {
      id: 3,
      timestamp: "Loading...",
      event: "Invalid Token Attempt",
      severity: "critical",
      details: "Unauthorized access attempt detected from PID 8912",
    },
  ])

  useEffect(() => {
    setMounted(true)
    setSecurityLogs([
      {
        id: 1,
        timestamp: new Date().toLocaleString(),
        event: "Authentication Success",
        severity: "info",
        details: "Process PID 4521 authenticated successfully",
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 120000).toLocaleString(),
        event: "Rate Limit Warning",
        severity: "warning",
        details: "Process PID 3289 exceeded rate limit threshold",
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 300000).toLocaleString(),
        event: "Invalid Token Attempt",
        severity: "critical",
        details: "Unauthorized access attempt detected from PID 8912",
      },
    ])

    const interval = setInterval(() => {
      setReportData((prev) => ({
        ...prev,
        totalOperations: prev.totalOperations + Math.floor(Math.random() * 10),
        avgLatency: Math.max(1, prev.avgLatency + (Math.random() - 0.5) * 0.2),
        successRate: Math.min(100, prev.successRate + (Math.random() - 0.48) * 0.1),
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const exportReport = (format: "json" | "csv") => {
    const data = {
      generatedAt: new Date().toISOString(),
      summary: reportData,
      performance: performanceMetrics,
      security: securityLogs,
    }

    if (format === "json") {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ipc-report-${Date.now()}.json`
      a.click()
    } else {
      let csv = "Metric,Value\n"
      csv += `Total Operations,${reportData.totalOperations}\n`
      csv += `Success Rate,${reportData.successRate}%\n`
      csv += `Avg Latency,${reportData.avgLatency}ms\n`
      csv += `Security Events,${reportData.securityEvents}\n`
      csv += `Active Processes,${reportData.activeProcesses}\n`

      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ipc-report-${Date.now()}.csv`
      a.click()
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "warning":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "info":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-4 h-4" />
      case "warning":
        return <AlertTriangle className="w-4 h-4" />
      case "info":
        return <CheckCircle2 className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">System Reports</h2>
          <p className="text-sm text-muted-foreground mt-1">Comprehensive IPC framework analytics and monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportReport("json")}>
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportReport("csv")}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-3 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Operations</p>
                  <p className="text-2xl font-bold">{reportData.totalOperations.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-3 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{reportData.successRate.toFixed(1)}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="bg-violet-500/10 p-3 rounded-lg">
                  <Clock className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Latency</p>
                  <p className="text-2xl font-bold">{reportData.avgLatency.toFixed(1)}ms</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500/10 p-3 rounded-lg">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Security Events</p>
                  <p className="text-2xl font-bold">{reportData.securityEvents}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-500/10 p-3 rounded-lg">
                  <Activity className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Processes</p>
                  <p className="text-2xl font-bold">{reportData.activeProcesses}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="bg-pink-500/10 p-3 rounded-lg">
                  <Clock className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Report Time</p>
                  <p className="text-sm font-medium">{mounted ? new Date().toLocaleString() : "Loading..."}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-4 bg-muted/30">
            <h3 className="font-semibold mb-3">System Health Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">IPC Core</span>
                <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Security Layer</span>
                <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Message Processing</span>
                <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Running
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold">IPC Method</th>
                      <th className="text-left p-3 text-sm font-semibold">Operations</th>
                      <th className="text-left p-3 text-sm font-semibold">Avg Time</th>
                      <th className="text-left p-3 text-sm font-semibold">Success Rate</th>
                      <th className="text-left p-3 text-sm font-semibold">Throughput</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceMetrics.map((metric, index) => (
                      <tr key={index} className="border-t border-border">
                        <td className="p-3 font-medium">{metric.method}</td>
                        <td className="p-3">{metric.operations.toLocaleString()}</td>
                        <td className="p-3">{metric.avgTime}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2 max-w-[100px]">
                              <div
                                className="bg-emerald-400 h-2 rounded-full"
                                style={{ width: `${metric.successRate}%` }}
                              />
                            </div>
                            <span className="text-sm">{metric.successRate}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-blue-400">{metric.throughput}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="p-4 bg-muted/30">
                <h3 className="font-semibold mb-3">Resource Utilization</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU Usage</span>
                      <span className="text-muted-foreground">23%</span>
                    </div>
                    <div className="bg-muted rounded-full h-2">
                      <div className="bg-blue-400 h-2 rounded-full" style={{ width: "23%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory Usage</span>
                      <span className="text-muted-foreground">67%</span>
                    </div>
                    <div className="bg-muted rounded-full h-2">
                      <div className="bg-emerald-400 h-2 rounded-full" style={{ width: "67%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Network I/O</span>
                      <span className="text-muted-foreground">45%</span>
                    </div>
                    <div className="bg-muted rounded-full h-2">
                      <div className="bg-violet-400 h-2 rounded-full" style={{ width: "45%" }} />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-muted/30">
                <h3 className="font-semibold mb-3">Error Distribution</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Timeout Errors</span>
                    <span className="text-sm font-medium text-amber-400">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Permission Denied</span>
                    <span className="text-sm font-medium text-red-400">5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Connection Failed</span>
                    <span className="text-sm font-medium text-orange-400">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Invalid Format</span>
                    <span className="text-sm font-medium text-yellow-400">3</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  <div>
                    <p className="text-2xl font-bold">1,847</p>
                    <p className="text-sm text-muted-foreground">Successful Auth</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-muted/30">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-2xl font-bold">23</p>
                    <p className="text-sm text-muted-foreground">Warnings</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-muted/30">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-red-400" />
                  <div>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm text-muted-foreground">Critical Events</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card>
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Security Event Log</h3>
              </div>
              <div className="divide-y divide-border">
                {securityLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg border ${getSeverityColor(log.severity)}`}>
                        {getSeverityIcon(log.severity)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{log.event}</h4>
                          <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

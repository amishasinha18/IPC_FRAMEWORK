"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatsGrid } from "@/components/stats-grid"
import { IPCMethodsPanel } from "@/components/ipc-methods-panel"
import { ActivityFeed } from "@/components/activity-feed"
import { SecurityPanel } from "@/components/security-panel"
import { ReportsModule } from "@/components/reports-module"

interface IPCStats {
  active_connections: number
  total_messages: number
  pipe_count: number
  queue_count: number
  shm_segments: number
  status: string
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<IPCStats>({
    active_connections: 3,
    total_messages: 847,
    pipe_count: 2,
    queue_count: 5,
    shm_segments: 1,
    status: "Running",
  })

  useEffect(() => {
    setMounted(true)

    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        total_messages: prev.total_messages + Math.floor(Math.random() * 3),
        active_connections: Math.max(1, Math.min(10, prev.active_connections + (Math.random() > 0.5 ? 1 : -1))),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = (type: "pipe" | "queue" | "shm", message: string) => {
    setStats((prev) => ({
      ...prev,
      total_messages: prev.total_messages + 1,
    }))
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-balance mb-2">IPC Framework Dashboard</h1>
            <p className="text-muted-foreground text-lg">Monitor and manage inter-process communication channels</p>
          </div>
          <div className="text-center text-muted-foreground py-12">Loading dashboard...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-balance mb-2">IPC Framework Dashboard</h1>
          <p className="text-muted-foreground text-lg">Monitor and manage inter-process communication channels</p>
        </div>

        <StatsGrid stats={stats} />

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <IPCMethodsPanel stats={stats} onSendMessage={handleSendMessage} />
          <SecurityPanel />
        </div>

        <div className="mt-6">
          <ActivityFeed stats={stats} />
        </div>

        <div className="mt-6">
          <ReportsModule />
        </div>
      </main>
    </div>
  )
}

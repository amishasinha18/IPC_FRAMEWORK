"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface ActivityFeedProps {
  stats: {
    total_messages: number
    status: string
  }
}

interface ActivityItem {
  id: number
  type: "pipe" | "queue" | "shm"
  message: string
  timestamp: string
}

export function ActivityFeed({ stats }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: 1,
      type: "pipe",
      message: "Process A sent data to Process B via pipe_0",
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 2,
      type: "queue",
      message: "Message enqueued to queue_main with priority 1",
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 3,
      type: "shm",
      message: "Shared memory segment shm_main updated",
      timestamp: new Date().toLocaleTimeString(),
    },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      const types: ("pipe" | "queue" | "shm")[] = ["pipe", "queue", "shm"]
      const messages = [
        "Data transferred via pipe channel",
        "Message received from queue",
        "Shared memory synchronized",
        "Process authentication successful",
        "IPC channel established",
      ]

      const newActivity: ActivityItem = {
        id: Date.now(),
        type: types[Math.floor(Math.random() * types.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        timestamp: new Date().toLocaleTimeString(),
      }

      setActivities((prev) => [newActivity, ...prev.slice(0, 9)])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getTypeColor = (type: string) => {
    switch (type) {
      case "pipe":
        return "bg-violet-500/10 text-violet-400 border-violet-500/20"
      case "queue":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "shm":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Activity Feed</h2>
        <span className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</span>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(activity.type)}`}>
              {activity.type.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{activity.message}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {activity.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

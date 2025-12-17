import { Activity, Database, MessageSquare, Share2 } from "lucide-react"
import { Card } from "@/components/ui/card"

interface StatsGridProps {
  stats: {
    active_connections: number
    total_messages: number
    pipe_count: number
    queue_count: number
    shm_segments: number
    status: string
  }
}

export function StatsGrid({ stats }: StatsGridProps) {
  const statCards = [
    {
      title: "Active Connections",
      value: stats.active_connections,
      icon: Activity,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Messages",
      value: stats.total_messages,
      icon: MessageSquare,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Active Pipes",
      value: stats.pipe_count,
      icon: Share2,
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
    },
    {
      title: "Message Queues",
      value: stats.queue_count,
      icon: Database,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
  ]

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

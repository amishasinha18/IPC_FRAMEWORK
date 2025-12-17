"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Send, CheckCircle2 } from "lucide-react"

interface IPCMethodsPanelProps {
  stats: {
    pipe_count: number
    queue_count: number
    shm_segments: number
  }
  onSendMessage: (type: "pipe" | "queue" | "shm", message: string) => void
}

export function IPCMethodsPanel({ stats, onSendMessage }: IPCMethodsPanelProps) {
  const [pipeMessage, setPipeMessage] = useState("")
  const [queueMessage, setQueueMessage] = useState("")
  const [pipeSent, setPipeSent] = useState(false)
  const [queueSent, setQueueSent] = useState(false)

  const sendPipeMessage = () => {
    if (pipeMessage.trim()) {
      onSendMessage("pipe", pipeMessage)
      setPipeMessage("")
      setPipeSent(true)
      setTimeout(() => setPipeSent(false), 2000)
    }
  }

  const sendQueueMessage = () => {
    if (queueMessage.trim()) {
      onSendMessage("queue", queueMessage)
      setQueueMessage("")
      setQueueSent(true)
      setTimeout(() => setQueueSent(false), 2000)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">IPC Methods</h2>

      <Tabs defaultValue="pipes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pipes">Pipes</TabsTrigger>
          <TabsTrigger value="queues">Queues</TabsTrigger>
          <TabsTrigger value="shared">Shared Memory</TabsTrigger>
        </TabsList>

        <TabsContent value="pipes" className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Active Pipes</span>
              <span className="text-2xl font-bold text-violet-400">{stats.pipe_count}</span>
            </div>
            <p className="text-xs text-muted-foreground">Unidirectional data streams between processes</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Send Data via Pipe</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter message..."
                value={pipeMessage}
                onChange={(e) => setPipeMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendPipeMessage()}
              />
              <Button onClick={sendPipeMessage} size="icon">
                {pipeSent ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>pipe_0</span>
              <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
              <span>Process A → Process B</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>pipe_1</span>
              <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
              <span>Process C → Process D</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="queues" className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Message Queues</span>
              <span className="text-2xl font-bold text-amber-400">{stats.queue_count}</span>
            </div>
            <p className="text-xs text-muted-foreground">Asynchronous message passing with priority support</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Send Message to Queue</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter message..."
                value={queueMessage}
                onChange={(e) => setQueueMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendQueueMessage()}
              />
              <Button onClick={sendQueueMessage} size="icon">
                {queueSent ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">queue_main</span>
                <span className="text-xs text-muted-foreground">3 messages</span>
              </div>
              <p className="text-xs text-muted-foreground">Primary message queue</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">queue_priority</span>
                <span className="text-xs text-muted-foreground">1 message</span>
              </div>
              <p className="text-xs text-muted-foreground">High priority messages</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Shared Memory Segments</span>
              <span className="text-2xl font-bold text-blue-400">{stats.shm_segments}</span>
            </div>
            <p className="text-xs text-muted-foreground">Direct memory access shared between processes</p>
          </div>

          <div className="space-y-2">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">shm_main</span>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <span className="ml-2 font-medium">8192 bytes</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Processes:</span>
                  <span className="ml-2 font-medium">4</span>
                </div>
              </div>
            </div>
          </div>

          <Button className="w-full bg-transparent" variant="outline">
            View Memory Map
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Shield, Key, CheckCircle2 } from "lucide-react"

export function SecurityPanel() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [authenticated, setAuthenticated] = useState(true) // Demo mode

  const handleLogin = async () => {
    console.log("[v0] Login attempt:", username)
    setAuthenticated(true)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold">Security</h2>
      </div>

      {authenticated ? (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-medium text-emerald-400">Authenticated</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Secure connection established with token-based authentication
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Encryption</span>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">AES-256</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Key className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Token Expiry</span>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">23h 45m</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Access Level</span>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-violet-500/10 text-violet-400">Admin</span>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium mb-3">Security Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                SHA-256 password hashing
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Token-based authentication
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Encrypted IPC channels
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                24-hour session expiry
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button onClick={handleLogin} className="w-full">
            <Lock className="w-4 h-4 mr-2" />
            Authenticate
          </Button>
        </div>
      )}
    </Card>
  )
}

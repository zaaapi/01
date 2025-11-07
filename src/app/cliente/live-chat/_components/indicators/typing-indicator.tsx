"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User } from "lucide-react"

interface TypingIndicatorProps {
  userName?: string
}

export function TypingIndicator({ userName = "Cliente" }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3 items-center">
      <Avatar className="h-8 w-8">
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="rounded-lg p-3 bg-muted">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      <span className="text-xs text-muted-foreground">{userName} está digitando...</span>
    </div>
  )
}

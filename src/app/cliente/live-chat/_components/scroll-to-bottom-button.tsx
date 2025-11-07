"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScrollToBottomButtonProps {
  show: boolean
  onClick: () => void
  unreadCount?: number
}

export function ScrollToBottomButton({ show, onClick, unreadCount }: ScrollToBottomButtonProps) {
  if (!show) return null

  return (
    <div className="absolute bottom-24 right-8 z-10">
      <Button
        onClick={onClick}
        size="sm"
        className={cn(
          "rounded-full h-10 w-10 p-0 shadow-lg",
          unreadCount && unreadCount > 0 && "relative"
        )}
      >
        <ChevronDown className="h-4 w-4" />
        {unreadCount && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Loader2, ArrowUp } from "lucide-react"

interface LoadMoreMessagesButtonProps {
  onClick: () => void
  isLoading: boolean
  hasMore: boolean
}

export function LoadMoreMessagesButton({
  onClick,
  isLoading,
  hasMore,
}: LoadMoreMessagesButtonProps) {
  if (!hasMore) return null

  return (
    <div className="flex justify-center py-4">
      <Button variant="outline" size="sm" onClick={onClick} disabled={isLoading} className="gap-2">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando mensagens antigas...
          </>
        ) : (
          <>
            <ArrowUp className="h-4 w-4" />
            Carregar mensagens antigas
          </>
        )}
      </Button>
    </div>
  )
}

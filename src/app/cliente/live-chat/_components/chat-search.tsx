"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatSearchProps {
  onSearch: (query: string) => void
  totalResults?: number
  currentResult?: number
  onNext?: () => void
  onPrevious?: () => void
  className?: string
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ChatSearch({
  onSearch,
  totalResults,
  currentResult,
  onNext,
  onPrevious,
  className,
  isOpen: controlledIsOpen,
  onOpenChange,
}: ChatSearchProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false)
  const [query, setQuery] = useState("")

  // Suporta modo controlado e não controlado
  const isOpen = controlledIsOpen ?? uncontrolledIsOpen
  const setIsOpen = onOpenChange ?? setUncontrolledIsOpen

  // Debounce da busca - 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(query)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [query, onSearch])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setQuery("")
    onSearch("")
  }, [onSearch, setIsOpen])

  if (!isOpen) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)} className={className}>
        <Search className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar na conversa..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8 pr-3"
          autoFocus
        />
      </div>

      {totalResults !== undefined && totalResults > 0 && (
        <>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {currentResult}/{totalResults}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              disabled={!currentResult || currentResult <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              disabled={!currentResult || currentResult >= totalResults}
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface WordCloudProps {
  words: Array<{ word: string; count: number }>
  className?: string
}

export function WordCloud({ words, className }: WordCloudProps) {
  if (words.length === 0) {
    return (
      <div className={cn("flex items-center justify-center py-8 text-muted-foreground", className)}>
        <p>Nenhuma palavra encontrada</p>
      </div>
    )
  }

  // Ordenar por frequência e pegar as top palavras
  const sortedWords = [...words].sort((a, b) => b.count - a.count).slice(0, 20)
  const maxCount = Math.max(...sortedWords.map((w) => w.count))
  const minCount = Math.min(...sortedWords.map((w) => w.count))
  const range = maxCount - minCount || 1

  return (
    <div className={cn("flex flex-wrap gap-2 p-4", className)}>
      {sortedWords.map(({ word, count }) => {
        // Calcular tamanho baseado na frequência (entre text-xs e text-lg)
        const sizeRatio = (count - minCount) / range
        const fontSize =
          sizeRatio < 0.3
            ? "text-xs"
            : sizeRatio < 0.6
              ? "text-sm"
              : sizeRatio < 0.8
                ? "text-base"
                : "text-lg"

        return (
          <Badge
            key={word}
            variant="secondary"
            className={cn(fontSize, "cursor-default hover:bg-secondary/80 transition-colors")}
          >
            {word} ({count})
          </Badge>
        )
      })}
    </div>
  )
}

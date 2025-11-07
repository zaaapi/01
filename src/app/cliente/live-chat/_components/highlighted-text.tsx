import { cn } from "@/lib/utils"

interface HighlightedTextProps {
  text: string
  highlight: string
  isCurrentMatch?: boolean
  className?: string
}

export function HighlightedText({
  text,
  highlight,
  isCurrentMatch = false,
  className,
}: HighlightedTextProps) {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>
  }

  const parts = text.split(new RegExp(`(${highlight})`, "gi"))

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isHighlight = part.toLowerCase() === highlight.toLowerCase()
        return (
          <span
            key={index}
            className={cn(
              isHighlight &&
                (isCurrentMatch
                  ? "bg-yellow-400 text-black font-semibold"
                  : "bg-yellow-200 text-black")
            )}
          >
            {part}
          </span>
        )
      })}
    </span>
  )
}

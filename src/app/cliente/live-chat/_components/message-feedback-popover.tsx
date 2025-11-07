"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { Message, Conversation, FeedbackType } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { useData } from "@/lib/contexts/data-provider"

interface MessageFeedbackPopoverProps {
  message: Message
  conversation: Conversation
}

export function MessageFeedbackPopover({ message }: MessageFeedbackPopoverProps) {
  const { toast } = useToast()
  const { updateMessageFeedback } = useData()
  const [open, setOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null)

  const handleFeedback = async () => {
    if (!selectedType) return

    try {
      await updateMessageFeedback(message.id, {
        feedback_type: selectedType,
        feedback_text: feedbackText || undefined,
      })

      toast({
        title: selectedType === FeedbackType.LIKE ? "Like enviado" : "Dislike enviado",
        description: "Feedback registrado com sucesso.",
      })

      setOpen(false)
      setSelectedType(null)
      setFeedbackText("")
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o feedback.",
        variant: "destructive",
      })
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2">
          {message.feedback ? (
            message.feedback.type === FeedbackType.LIKE ? (
              <ThumbsUp className="h-3 w-3 text-green-600" />
            ) : (
              <ThumbsDown className="h-3 w-3 text-red-600" />
            )
          ) : (
            <ThumbsUp className="h-3 w-3" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant={selectedType === FeedbackType.LIKE ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setSelectedType(FeedbackType.LIKE)}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              Like
            </Button>
            <Button
              variant={selectedType === FeedbackType.DISLIKE ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setSelectedType(FeedbackType.DISLIKE)}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              Dislike
            </Button>
          </div>

          <div>
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Comentário (opcional)..."
              className="text-xs"
              rows={2}
            />
          </div>

          <Button size="sm" className="w-full" onClick={handleFeedback} disabled={!selectedType}>
            Enviar Feedback
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

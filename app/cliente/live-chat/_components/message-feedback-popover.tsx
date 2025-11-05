"use client"

import { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { Message, Conversation, FeedbackType } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface MessageFeedbackPopoverProps {
  message: Message
  conversation: Conversation
}

export function MessageFeedbackPopover({
  message,
  conversation,
}: MessageFeedbackPopoverProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const handleFeedback = async (type: FeedbackType) => {
    // Simular feedback (será implementado com DataProvider depois)
    toast({
      title: type === FeedbackType.LIKE ? "Like enviado" : "Dislike enviado",
      description: "Feedback registrado com sucesso.",
    })
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2">
          <ThumbsUp className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => handleFeedback(FeedbackType.LIKE)}
          >
            <ThumbsUp className="h-4 w-4 mr-1 text-green-600" />
            Like
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => handleFeedback(FeedbackType.DISLIKE)}
          >
            <ThumbsDown className="h-4 w-4 mr-1 text-red-600" />
            Dislike
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}


"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { Conversation, Contact, FeedbackType } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { useData } from "@/lib/contexts/data-provider"

interface ConversationFeedbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversation: Conversation | null
  contact: Contact | null
}

export function ConversationFeedbackModal({
  open,
  onOpenChange,
  conversation,
  contact,
}: ConversationFeedbackModalProps) {
  const { toast } = useToast()
  const { updateConversation } = useData()
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null)
  const [feedbackText, setFeedbackText] = useState("")

  // Load existing feedback when modal opens
  useEffect(() => {
    if (open && conversation?.overallFeedback) {
      setFeedbackType(conversation.overallFeedback.type)
      setFeedbackText(conversation.overallFeedback.text || "")
    } else if (!open) {
      // Reset when modal closes
      setFeedbackType(null)
      setFeedbackText("")
    }
  }, [open, conversation])

  const handleSubmit = async () => {
    if (!feedbackType || !conversation) return

    try {
      await updateConversation(conversation.id, {
        overallFeedback: {
          type: feedbackType,
          text: feedbackText || null,
        },
      })

      toast({
        title: feedbackType === FeedbackType.LIKE ? "Like enviado" : "Dislike enviado",
        description: "Feedback da conversa registrado com sucesso.",
      })

      setFeedbackType(null)
      setFeedbackText("")
      onOpenChange(false)
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o feedback.",
        variant: "destructive",
      })
    }
  }

  if (!conversation || !contact) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Feedback da Conversa</DialogTitle>
          <DialogDescription>Avalie a conversa com {contact.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={feedbackType === FeedbackType.LIKE ? "default" : "outline"}
              className="flex-1"
              onClick={() => setFeedbackType(FeedbackType.LIKE)}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Like
            </Button>
            <Button
              variant={feedbackType === FeedbackType.DISLIKE ? "default" : "outline"}
              className="flex-1"
              onClick={() => setFeedbackType(FeedbackType.DISLIKE)}
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Dislike
            </Button>
          </div>

          <div>
            <label className="text-sm font-medium">Comentário (opcional)</label>
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Deixe um comentário sobre a conversa..."
              className="mt-2"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!feedbackType}>
            Enviar Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

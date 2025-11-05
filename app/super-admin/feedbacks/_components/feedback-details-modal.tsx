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
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useData } from "@/lib/contexts/data-provider"
import { Feedback, FeedbackType, FeedbackStatus, MessageSenderType } from "@/types"
import { formatDateTime } from "@/lib/formatters"
import { ThumbsUp, ThumbsDown, Bot, User, MessageSquare } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface FeedbackDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feedback: Feedback | null
}

export function FeedbackDetailsModal({
  open,
  onOpenChange,
  feedback,
}: FeedbackDetailsModalProps) {
  const { state } = useData()

  if (!feedback) return null

  // Buscar dados relacionados
  const message = state.messages.find((m) => m.id === feedback.messageId)
  const conversation = message
    ? state.conversations.find((c) => c.id === message.conversationId)
    : null
  const contact = conversation
    ? state.contacts.find((c) => c.id === conversation.contactId)
    : null
  const tenant = conversation
    ? state.tenants.find((t) => t.id === conversation.tenantId)
    : null
  const user = feedback.userId
    ? state.users.find((u) => u.id === feedback.userId)
    : null

  // Buscar todas as mensagens da conversa
  const conversationMessages = conversation
    ? state.messages
        .filter((m) => m.conversationId === conversation.id)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Detalhes do Feedback</DialogTitle>
          <DialogDescription>
            Informações completas sobre o feedback e histórico da conversa
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Informações do Feedback */}
            <div className="space-y-3">
              <h3 className="font-semibold">Informações do Feedback</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <div className="flex items-center gap-2 mt-1">
                    {feedback.feedbackType === FeedbackType.LIKE ? (
                      <>
                        <ThumbsUp className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-600">LIKE</span>
                      </>
                    ) : (
                      <>
                        <ThumbsDown className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-600">DISLIKE</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      feedback.feedbackStatus === FeedbackStatus.EM_ABERTO
                        ? "destructive"
                        : feedback.feedbackStatus === FeedbackStatus.SENDO_TRATADO
                        ? "secondary"
                        : "default"
                    }
                    className="mt-1"
                  >
                    {feedback.feedbackStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium mt-1">{formatDateTime(feedback.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium mt-1">{tenant?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Usuário</p>
                  <p className="font-medium mt-1">{user?.fullName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contato</p>
                  <p className="font-medium mt-1">{contact?.name || "N/A"}</p>
                </div>
              </div>
              {feedback.feedbackText && (
                <div>
                  <p className="text-sm text-muted-foreground">Comentário</p>
                  <p className="mt-1 p-3 bg-muted rounded-md">{feedback.feedbackText}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Mensagem que recebeu feedback */}
            {message && (
              <div className="space-y-3">
                <h3 className="font-semibold">Mensagem que Recebeu Feedback</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-3">
                    <Bot className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">
                        {formatDateTime(message.timestamp)}
                      </p>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Histórico da Conversa */}
            {conversationMessages.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Histórico da Conversa</h3>
                <div className="space-y-3">
                  {conversationMessages.map((msg) => {
                    const isIA = msg.senderType === MessageSenderType.IA
                    const isCustomer = msg.senderType === MessageSenderType.CUSTOMER
                    const isAtendente = msg.senderType === MessageSenderType.ATENDENTE

                    return (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-lg ${
                          isIA
                            ? "bg-primary/10 border border-primary/20"
                            : isCustomer
                            ? "bg-muted"
                            : "bg-secondary"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {isIA ? (
                            <Bot className="h-5 w-5 text-primary mt-0.5" />
                          ) : isCustomer ? (
                            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                          ) : (
                            <User className="h-5 w-5 text-secondary-foreground mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-medium">
                                {isIA
                                  ? "IA"
                                  : isCustomer
                                  ? "Cliente"
                                  : "Atendente"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(msg.timestamp)}
                              </p>
                              {msg.id === feedback.messageId && (
                                <Badge variant="outline" className="text-xs">
                                  Feedback dado
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm">{msg.content}</p>
                            {msg.feedback && (
                              <div className="mt-2 flex items-center gap-1">
                                {msg.feedback.type === FeedbackType.LIKE ? (
                                  <ThumbsUp className="h-3 w-3 text-green-600" />
                                ) : (
                                  <ThumbsDown className="h-3 w-3 text-red-600" />
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {msg.feedback.type === FeedbackType.LIKE ? "LIKE" : "DISLIKE"}
                                  {msg.feedback.text && `: ${msg.feedback.text}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


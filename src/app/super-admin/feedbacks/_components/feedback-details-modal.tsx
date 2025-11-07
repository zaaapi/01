"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useData } from "@/lib/contexts/data-provider"
import { Feedback, FeedbackType, FeedbackStatus, MessageSenderType, Message } from "@/types"
import { formatDateTime } from "@/lib/formatters"
import { ThumbsUp, ThumbsDown, Bot, User, MessageSquare, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface FeedbackDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feedback: Feedback | null
  onSave?: () => void
}

export function FeedbackDetailsModal({
  open,
  onOpenChange,
  feedback,
  onSave,
}: FeedbackDetailsModalProps) {
  const { fetchConversationMessages, updateFeedback } = useData()
  const { toast } = useToast()

  const [conversationMessages, setConversationMessages] = useState<Message[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Estados editáveis
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>(
    feedback?.feedbackStatus || FeedbackStatus.EM_ABERTO
  )
  const [superAdminComment, setSuperAdminComment] = useState<string>(
    feedback?.superAdminComment || ""
  )

  // Atualizar estados quando feedback mudar
  useEffect(() => {
    if (feedback) {
      setFeedbackStatus(feedback.feedbackStatus)
      setSuperAdminComment(feedback.superAdminComment || "")
    }
  }, [feedback])

  // Buscar mensagens da conversa
  useEffect(() => {
    if (open && feedback?.conversationId) {
      const loadMessages = async () => {
        setIsLoadingMessages(true)
        try {
          const messages = await fetchConversationMessages(feedback.conversationId)
          setConversationMessages(messages)
        } catch (error) {
          console.error("Erro ao carregar mensagens da conversa:", error)
          toast({
            title: "Erro ao carregar mensagens",
            description: "Não foi possível carregar o histórico da conversa.",
            variant: "destructive",
          })
        } finally {
          setIsLoadingMessages(false)
        }
      }
      loadMessages()
    }
  }, [open, feedback?.conversationId, fetchConversationMessages, toast])

  if (!feedback) return null

  // Acessar dados relacionados que vêm do JOIN do Supabase
  const feedbackData = feedback as any
  const message = feedbackData.message
  const tenant = feedbackData.tenant
  const user = feedbackData.user
  const conversation = feedbackData.conversation

  const handleSave = async () => {
    if (!feedback) return

    setIsSaving(true)
    try {
      await updateFeedback(feedback.id, {
        feedbackStatus,
        superAdminComment,
      })

      toast({
        title: "Feedback atualizado",
        description: "O status e comentário foram salvos com sucesso.",
      })

      // Chamar callback para recarregar feedbacks
      if (onSave) {
        onSave()
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao salvar feedback:", error)
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges =
    feedbackStatus !== feedback.feedbackStatus ||
    superAdminComment !== (feedback.superAdminComment || "")

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
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium mt-1">{formatDateTime(feedback.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium mt-1">{tenant?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Usuário</p>
                  <p className="font-medium mt-1">{user?.full_name || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">ID da Conversa</p>
                  <p className="font-medium mt-1 font-mono text-xs">{feedback.conversationId}</p>
                </div>
              </div>
              {feedback.feedbackText && (
                <div>
                  <p className="text-sm text-muted-foreground">Comentário do Usuário</p>
                  <p className="mt-1 p-3 bg-muted rounded-md">{feedback.feedbackText}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Campos Editáveis: Status e Comentário do Super Admin */}
            <div className="space-y-4">
              <h3 className="font-semibold">Gestão do Feedback</h3>

              <div className="space-y-2">
                <Label htmlFor="status">Status do Feedback</Label>
                <Select
                  value={feedbackStatus}
                  onValueChange={(value) => setFeedbackStatus(value as FeedbackStatus)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FeedbackStatus.EM_ABERTO}>Em Aberto</SelectItem>
                    <SelectItem value={FeedbackStatus.SENDO_TRATADO}>Sendo Tratado</SelectItem>
                    <SelectItem value={FeedbackStatus.ENCERRADO}>Encerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Comentário do Super Admin</Label>
                <Textarea
                  id="comment"
                  placeholder="Adicione um comentário sobre este feedback..."
                  value={superAdminComment}
                  onChange={(e) => setSuperAdminComment(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Use este campo para documentar ações tomadas ou observações sobre o feedback.
                </p>
              </div>
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
            <div className="space-y-3">
              <h3 className="font-semibold">Histórico da Conversa</h3>

              {isLoadingMessages ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Carregando mensagens...
                  </span>
                </div>
              ) : conversationMessages.length > 0 ? (
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
                                {isIA ? "IA" : isCustomer ? "Cliente" : "Atendente"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(msg.timestamp)}
                              </p>
                              {msg.id === feedback.messageId && (
                                <Badge variant="outline" className="text-xs">
                                  Feedback dado aqui
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
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma mensagem encontrada para esta conversa.</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex-1">
            {hasChanges && (
              <p className="text-xs text-muted-foreground">Você tem alterações não salvas</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button type="button" onClick={handleSave} disabled={!hasChanges || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

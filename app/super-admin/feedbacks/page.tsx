"use client"

import { useState, useMemo } from "react"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ThumbsUp, ThumbsDown, Eye, MessageSquare } from "lucide-react"
import { useData } from "@/lib/contexts/data-provider"
import { useToast } from "@/hooks/use-toast"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useRouter } from "next/navigation"
import { Feedback, FeedbackType, FeedbackStatus } from "@/types"
import { formatDateTime } from "@/lib/formatters"
import { FeedbackDetailsModal } from "./_components/feedback-details-modal"
import { ChangeStatusModal } from "./_components/change-status-modal"

export default function FeedbacksPage() {
  const router = useRouter()
  const { state, isLoading, updateFeedback } = useData()
  const { toast } = useToast()

  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<FeedbackType | "all">("all")

  const [detailsModal, setDetailsModal] = useState<{
    open: boolean
    feedback: Feedback | null
  }>({
    open: false,
    feedback: null,
  })

  const [changeStatusModal, setChangeStatusModal] = useState<{
    open: boolean
    feedback: Feedback | null
  }>({
    open: false,
    feedback: null,
  })

  // Atalhos de teclado
  useKeyboardShortcuts({
    onNavigate1: () => router.push("/super-admin"),
    onNavigate2: () => router.push("/super-admin/feedbacks"),
    onNavigate3: () => router.push("/super-admin/perfil"),
  })

  // Filtrar feedbacks
  const filteredFeedbacks = useMemo(() => {
    let feedbacks = state.feedbacks

    if (statusFilter !== "all") {
      feedbacks = feedbacks.filter((f) => f.feedbackStatus === statusFilter)
    }

    if (typeFilter !== "all") {
      feedbacks = feedbacks.filter((f) => f.feedbackType === typeFilter)
    }

    return feedbacks.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA // Mais recentes primeiro
    })
  }, [state.feedbacks, statusFilter, typeFilter])

  // Enriquecer feedbacks com dados de tenant e usuário
  const enrichedFeedbacks = useMemo(() => {
    return filteredFeedbacks.map((feedback) => {
      const message = state.messages.find((m) => m.id === feedback.messageId)
      const conversation = message
        ? state.conversations.find((c) => c.id === message.conversationId)
        : null
      const tenant = conversation
        ? state.tenants.find((t) => t.id === conversation.tenantId)
        : null
      const user = feedback.userId
        ? state.users.find((u) => u.id === feedback.userId)
        : null

      return {
        ...feedback,
        messageContent: message?.content || "N/A",
        tenantName: tenant?.name || "N/A",
        userName: user?.fullName || "N/A",
        conversationId: conversation?.id || null,
        type: feedback.feedbackType,
        status: feedback.feedbackStatus,
        text: feedback.feedbackText,
      }
    })
  }, [filteredFeedbacks, state.messages, state.conversations, state.tenants, state.users])

  const handleViewDetails = (feedbackEnriched: typeof enrichedFeedbacks[0]) => {
    // Buscar o feedback original do state
    const originalFeedback = state.feedbacks.find((f) => f.id === feedbackEnriched.id)
    if (originalFeedback) {
      setDetailsModal({ open: true, feedback: originalFeedback })
    }
  }

  const handleChangeStatus = (feedbackEnriched: typeof enrichedFeedbacks[0]) => {
    // Buscar o feedback original do state
    const originalFeedback = state.feedbacks.find((f) => f.id === feedbackEnriched.id)
    if (originalFeedback) {
      setChangeStatusModal({ open: true, feedback: originalFeedback })
    }
  }

  const handleConfirmStatusChange = async (newStatus: FeedbackStatus) => {
    if (changeStatusModal.feedback) {
      try {
        await updateFeedback(changeStatusModal.feedback.id, { feedbackStatus: newStatus })
        toast({
          title: "Status atualizado",
          description: "O status do feedback foi atualizado com sucesso.",
        })
        setChangeStatusModal({ open: false, feedback: null })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status.",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Gerenciar Feedbacks" description="Visualize e gerencie os feedbacks de IA dos clientes" />
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 mb-6">
              <Skeleton className="h-10 w-[200px]" />
              <Skeleton className="h-10 w-[200px]" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Gerenciar Feedbacks"
        description="Visualize e gerencie os feedbacks de IA dos clientes"
      />

      <Card>
        <CardContent className="pt-6">
          {/* Filtros */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Status:</label>
              <Select
                value={statusFilter}
                onValueChange={(value: FeedbackStatus | "all") => setStatusFilter(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value={FeedbackStatus.EM_ABERTO}>Em Aberto</SelectItem>
                  <SelectItem value={FeedbackStatus.SENDO_TRATADO}>Sendo Tratado</SelectItem>
                  <SelectItem value={FeedbackStatus.ENCERRADO}>Encerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Tipo:</label>
              <Select
                value={typeFilter}
                onValueChange={(value: FeedbackType | "all") => setTypeFilter(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value={FeedbackType.LIKE}>Like</SelectItem>
                  <SelectItem value={FeedbackType.DISLIKE}>Dislike</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela */}
          {enrichedFeedbacks.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Nenhum feedback encontrado"
              description={
                statusFilter !== "all" || typeFilter !== "all"
                  ? "Não há feedbacks com os filtros selecionados"
                  : "Não há feedbacks cadastrados"
              }
              actionLabel={
                statusFilter !== "all" || typeFilter !== "all"
                  ? "Limpar filtros"
                  : undefined
              }
              onAction={
                statusFilter !== "all" || typeFilter !== "all"
                  ? () => {
                      setStatusFilter("all")
                      setTypeFilter("all")
                    }
                  : undefined
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Mensagem da IA</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrichedFeedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(feedback.createdAt)}
                      </TableCell>
                      <TableCell>
                        {feedback.type === FeedbackType.LIKE ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <ThumbsUp className="h-4 w-4" />
                            <span className="text-xs">LIKE</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600">
                            <ThumbsDown className="h-4 w-4" />
                            <span className="text-xs">DISLIKE</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {feedback.messageContent}
                      </TableCell>
                      <TableCell>{feedback.tenantName}</TableCell>
                      <TableCell>{feedback.userName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            feedback.status === FeedbackStatus.EM_ABERTO
                              ? "destructive"
                              : feedback.status === FeedbackStatus.SENDO_TRATADO
                              ? "secondary"
                              : "default"
                          }
                        >
                          {feedback.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleChangeStatus(feedback)}
                          >
                            Alterar Status
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(feedback)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalhes
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Rodapé com contadores */}
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <p>
                  Mostrando {enrichedFeedbacks.length} de {state.feedbacks.length} feedbacks
                </p>
                <p>
                  {state.feedbacks.filter((f) => f.feedbackStatus === FeedbackStatus.EM_ABERTO).length} em aberto •{" "}
                  {state.feedbacks.filter((f) => f.feedbackStatus === FeedbackStatus.SENDO_TRATADO).length} sendo tratados •{" "}
                  {state.feedbacks.filter((f) => f.feedbackStatus === FeedbackStatus.ENCERRADO).length} encerrados
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modais */}
      <FeedbackDetailsModal
        open={detailsModal.open}
        onOpenChange={(open) => setDetailsModal({ ...detailsModal, open })}
        feedback={detailsModal.feedback}
      />

      <ChangeStatusModal
        open={changeStatusModal.open}
        onOpenChange={(open) => setChangeStatusModal({ ...changeStatusModal, open })}
        feedback={changeStatusModal.feedback}
        onConfirm={handleConfirmStatusChange}
      />
    </PageContainer>
  )
}

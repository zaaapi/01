"use client"

import { useState, useMemo, useEffect } from "react"
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

// Tipo enriquecido para feedbacks com dados relacionados
interface EnrichedFeedback extends Feedback {
  messageContent: string
  tenantName: string
  userName: string
  contactName: string
}

export default function FeedbacksPage() {
  const router = useRouter()
  const { fetchFeedbacks, updateFeedback } = useData()
  const { toast } = useToast()

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  // Buscar feedbacks do Supabase
  useEffect(() => {
    const loadFeedbacks = async () => {
      setIsLoading(true)
      try {
        const data = await fetchFeedbacks()
        setFeedbacks(data)
      } catch (error) {
        console.error("Erro ao carregar feedbacks:", error)
        toast({
          title: "Erro ao carregar feedbacks",
          description: "Não foi possível carregar os feedbacks. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadFeedbacks()
  }, [fetchFeedbacks, toast])

  // Atalhos de teclado
  useKeyboardShortcuts({
    onNavigate1: () => router.push("/super-admin"),
    onNavigate2: () => router.push("/super-admin/feedbacks"),
    onNavigate3: () => router.push("/super-admin/perfil"),
  })

  // Filtrar e enriquecer feedbacks
  const enrichedFeedbacks = useMemo(() => {
    let filtered = feedbacks

    if (statusFilter !== "all") {
      filtered = filtered.filter((f) => f.feedbackStatus === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((f) => f.feedbackType === typeFilter)
    }

    // Ordenar por data (mais recentes primeiro)
    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })

    // Os dados relacionados já vêm do Supabase através dos JOINs
    // Vamos processar e enriquecer os feedbacks
    return sorted.map(
      (feedback: any): EnrichedFeedback => ({
        ...feedback,
        messageContent: feedback.message?.content || "Feedback geral da conversa",
        tenantName: feedback.tenant?.name || "N/A",
        userName: feedback.user?.full_name || "N/A",
        contactName: "N/A", // Precisaremos buscar do contact se necessário
      })
    )
  }, [feedbacks, statusFilter, typeFilter])

  const handleViewDetails = (feedbackEnriched: EnrichedFeedback) => {
    // Usar o feedback enriquecido diretamente
    setDetailsModal({ open: true, feedback: feedbackEnriched })
  }

  const handleChangeStatus = (feedbackEnriched: EnrichedFeedback) => {
    // Usar o feedback enriquecido diretamente
    setChangeStatusModal({ open: true, feedback: feedbackEnriched })
  }

  const handleConfirmStatusChange = async (newStatus: FeedbackStatus) => {
    if (changeStatusModal.feedback) {
      try {
        await updateFeedback(changeStatusModal.feedback.id, { feedbackStatus: newStatus })

        // Recarregar feedbacks
        const updatedFeedbacks = await fetchFeedbacks()
        setFeedbacks(updatedFeedbacks)

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
        <PageHeader
          title="Gerenciar Feedbacks"
          description="Visualize e gerencie os feedbacks de IA dos clientes"
        />
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
                statusFilter !== "all" || typeFilter !== "all" ? "Limpar filtros" : undefined
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
                        {feedback.feedbackType === FeedbackType.LIKE ? (
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
                      <TableCell className="max-w-xs truncate">{feedback.messageContent}</TableCell>
                      <TableCell>{feedback.tenantName}</TableCell>
                      <TableCell>{feedback.userName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            feedback.feedbackStatus === FeedbackStatus.EM_ABERTO
                              ? "destructive"
                              : feedback.feedbackStatus === FeedbackStatus.SENDO_TRATADO
                                ? "secondary"
                                : "default"
                          }
                        >
                          {feedback.feedbackStatus}
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
                  Mostrando {enrichedFeedbacks.length} de {feedbacks.length} feedbacks
                </p>
                <p>
                  {feedbacks.filter((f) => f.feedbackStatus === FeedbackStatus.EM_ABERTO).length} em
                  aberto •{" "}
                  {
                    feedbacks.filter((f) => f.feedbackStatus === FeedbackStatus.SENDO_TRATADO)
                      .length
                  }{" "}
                  sendo tratados •{" "}
                  {feedbacks.filter((f) => f.feedbackStatus === FeedbackStatus.ENCERRADO).length}{" "}
                  encerrados
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
        onSave={async () => {
          // Recarregar feedbacks após salvar
          const updatedFeedbacks = await fetchFeedbacks()
          setFeedbacks(updatedFeedbacks)
        }}
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

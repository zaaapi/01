"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/hooks/data/query-keys"
import {
  fetchQuickRepliesByTenant,
  fetchQuickReplyById,
  createQuickReply,
  updateQuickReply,
  deleteQuickReply,
  incrementQuickReplyUsage,
  type CreateQuickReplyTemplateDTO,
  type UpdateQuickReplyTemplateDTO,
} from "@/lib/services/quick-replies.service"
import { useToast } from "@/hooks/use-toast"
import { QuickReplyTemplate } from "@/types"
import { ApiError } from "@/types/react-query"
import { handleApiError, formatErrorMessage } from "@/lib/error-handler"

/**
 * Hook para buscar quick replies por tenant
 */
export function useQuickReplies(tenantId: string) {
  return useQuery<QuickReplyTemplate[], ApiError>({
    queryKey: queryKeys.quickReplies.list(tenantId),
    queryFn: () => fetchQuickRepliesByTenant(tenantId),
    enabled: !!tenantId,
  })
}

/**
 * Hook para buscar quick reply por ID
 */
export function useQuickReply(id: string) {
  return useQuery<QuickReplyTemplate | null, ApiError>({
    queryKey: queryKeys.quickReplies.detail(id),
    queryFn: () => fetchQuickReplyById(id),
    enabled: !!id,
  })
}

/**
 * Hook para criar novo quick reply
 */
export function useCreateQuickReply() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<QuickReplyTemplate, ApiError, CreateQuickReplyTemplateDTO>({
    mutationFn: createQuickReply,
    onSuccess: (_, variables) => {
      if (variables.tenantId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.quickReplies.list(variables.tenantId) })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.quickReplies.all })
      toast({
        title: "Sucesso",
        description: "Resposta rápida criada com sucesso!",
      })
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      toast({
        title: "Erro",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    },
  })
}

/**
 * Hook para atualizar quick reply existente
 */
export function useUpdateQuickReply() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<
    QuickReplyTemplate,
    ApiError,
    { id: string; data: UpdateQuickReplyTemplateDTO }
  >({
    mutationFn: ({ id, data }) => updateQuickReply(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.quickReplies.all })
      const previousQuickReply = queryClient.getQueryData(queryKeys.quickReplies.detail(id))

      queryClient.setQueryData<QuickReplyTemplate>(queryKeys.quickReplies.detail(id), (old) =>
        old ? { ...old, ...data } : old
      )

      return { previousQuickReply, id }
    },
    onError: (error, variables, context: any) => {
      if (context?.previousQuickReply) {
        queryClient.setQueryData(
          queryKeys.quickReplies.detail(context.id),
          context.previousQuickReply
        )
      }
      const apiError = handleApiError(error)
      toast({
        title: "Erro",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quickReplies.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.quickReplies.detail(variables.id) })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Resposta rápida atualizada com sucesso!",
      })
    },
  })
}

/**
 * Hook para deletar quick reply
 */
export function useDeleteQuickReply() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<void, ApiError, string>({
    mutationFn: deleteQuickReply,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.quickReplies.all })
      const previousQuickReplies = queryClient.getQueryData(queryKeys.quickReplies.all)
      return { previousQuickReplies, id }
    },
    onError: (error, _, context: any) => {
      if (context?.previousQuickReplies) {
        queryClient.setQueryData(queryKeys.quickReplies.all, context.previousQuickReplies)
      }
      const apiError = handleApiError(error)
      toast({
        title: "Erro",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quickReplies.all })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Resposta rápida removida com sucesso!",
      })
    },
  })
}

/**
 * Hook para incrementar uso de quick reply
 */
export function useIncrementQuickReplyUsage() {
  const queryClient = useQueryClient()

  return useMutation<void, ApiError, string>({
    mutationFn: incrementQuickReplyUsage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quickReplies.all })
    },
  })
}

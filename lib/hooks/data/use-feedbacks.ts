"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/hooks/data/query-keys"
import {
  fetchFeedbacksByTenant,
  fetchAllFeedbacks,
  fetchFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  type CreateFeedbackDTO,
  type UpdateFeedbackDTO,
} from "@/lib/services/feedbacks.service"
import { useToast } from "@/hooks/use-toast"
import { Feedback } from "@/types"
import { ApiError } from "@/types/react-query"
import { handleApiError, formatErrorMessage } from "@/lib/error-handler"

/**
 * Hook para buscar feedbacks por tenant
 */
export function useFeedbacksByTenant(tenantId: string) {
  return useQuery<Feedback[], ApiError>({
    queryKey: queryKeys.feedbacks.listByTenant(tenantId),
    queryFn: () => fetchFeedbacksByTenant(tenantId),
    enabled: !!tenantId,
  })
}

/**
 * Hook para buscar todos os feedbacks (super admin)
 */
export function useAllFeedbacks() {
  return useQuery<Feedback[], ApiError>({
    queryKey: queryKeys.feedbacks.listAll(),
    queryFn: fetchAllFeedbacks,
  })
}

/**
 * Hook para buscar feedback por ID
 */
export function useFeedback(id: string) {
  return useQuery<Feedback | null, ApiError>({
    queryKey: queryKeys.feedbacks.detail(id),
    queryFn: () => fetchFeedbackById(id),
    enabled: !!id,
  })
}

/**
 * Hook para criar novo feedback
 */
export function useCreateFeedback() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<Feedback, ApiError, CreateFeedbackDTO>({
    mutationFn: createFeedback,
    onSuccess: (_, variables) => {
      if (variables.tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.feedbacks.listByTenant(variables.tenantId),
        })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.feedbacks.all })
      toast({
        title: "Sucesso",
        description: "Feedback enviado com sucesso!",
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
 * Hook para atualizar feedback existente
 */
export function useUpdateFeedback() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<Feedback, ApiError, { id: string; data: UpdateFeedbackDTO }>({
    mutationFn: ({ id, data }) => updateFeedback(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.feedbacks.all })
      const previousFeedback = queryClient.getQueryData(queryKeys.feedbacks.detail(id))

      queryClient.setQueryData<Feedback>(queryKeys.feedbacks.detail(id), (old) =>
        old ? { ...old, ...data } : old
      )

      return { previousFeedback, id }
    },
    onError: (error, variables, context: any) => {
      if (context?.previousFeedback) {
        queryClient.setQueryData(queryKeys.feedbacks.detail(context.id), context.previousFeedback)
      }
      const apiError = handleApiError(error)
      toast({
        title: "Erro",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feedbacks.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.feedbacks.detail(variables.id) })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Feedback atualizado com sucesso!",
      })
    },
  })
}

/**
 * Hook para deletar feedback
 */
export function useDeleteFeedback() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<void, ApiError, string>({
    mutationFn: deleteFeedback,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.feedbacks.all })
      const previousFeedbacks = queryClient.getQueryData(queryKeys.feedbacks.all)
      return { previousFeedbacks, id }
    },
    onError: (error, _, context: any) => {
      if (context?.previousFeedbacks) {
        queryClient.setQueryData(queryKeys.feedbacks.all, context.previousFeedbacks)
      }
      const apiError = handleApiError(error)
      toast({
        title: "Erro",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feedbacks.all })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Feedback removido com sucesso!",
      })
    },
  })
}

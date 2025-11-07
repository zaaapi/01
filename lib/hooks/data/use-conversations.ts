"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/hooks/data/query-keys"
import {
  fetchConversationsByTenant,
  fetchConversationsByContact,
  fetchConversationById,
  createConversation,
  updateConversation,
  deleteConversation,
  type CreateConversationDTO,
  type UpdateConversationDTO,
} from "@/lib/services/conversations.service"
import { useToast } from "@/hooks/use-toast"
import { Conversation } from "@/types"
import { ApiError } from "@/types/react-query"
import { handleApiError, formatErrorMessage } from "@/lib/error-handler"

/**
 * Hook para buscar conversas por tenant
 */
export function useConversationsByTenant(tenantId: string) {
  return useQuery<Conversation[], ApiError>({
    queryKey: queryKeys.conversations.listByTenant(tenantId),
    queryFn: () => fetchConversationsByTenant(tenantId),
    enabled: !!tenantId,
  })
}

/**
 * Hook para buscar conversas por contato
 */
export function useConversationsByContact(contactId: string) {
  return useQuery<Conversation[], ApiError>({
    queryKey: queryKeys.conversations.listByContact(contactId),
    queryFn: () => fetchConversationsByContact(contactId),
    enabled: !!contactId,
  })
}

/**
 * Hook para buscar conversa por ID
 */
export function useConversation(id: string) {
  return useQuery<Conversation | null, ApiError>({
    queryKey: queryKeys.conversations.detail(id),
    queryFn: () => fetchConversationById(id),
    enabled: !!id,
  })
}

/**
 * Hook para criar nova conversa
 */
export function useCreateConversation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<Conversation, ApiError, CreateConversationDTO>({
    mutationFn: createConversation,
    onSuccess: (_, variables) => {
      if (variables.tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.conversations.listByTenant(variables.tenantId),
        })
      }
      if (variables.contactId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.conversations.listByContact(variables.contactId),
        })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all })
      toast({
        title: "Sucesso",
        description: "Conversa criada com sucesso!",
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
 * Hook para atualizar conversa existente com optimistic update
 */
export function useUpdateConversation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<Conversation, ApiError, { id: string; data: UpdateConversationDTO }>({
    mutationFn: ({ id, data }) => updateConversation(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.conversations.all })
      const previousConversation = queryClient.getQueryData(queryKeys.conversations.detail(id))

      queryClient.setQueryData<Conversation>(queryKeys.conversations.detail(id), (old) =>
        old ? { ...old, ...data } : old
      )

      return { previousConversation, id }
    },
    onError: (error, variables, context: any) => {
      if (context?.previousConversation) {
        queryClient.setQueryData(
          queryKeys.conversations.detail(context.id),
          context.previousConversation
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
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.detail(variables.id) })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Conversa atualizada com sucesso!",
      })
    },
  })
}

/**
 * Hook para deletar conversa
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<void, ApiError, string>({
    mutationFn: deleteConversation,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.conversations.all })
      const previousConversations = queryClient.getQueryData(queryKeys.conversations.all)
      return { previousConversations, id }
    },
    onError: (error, _, context: any) => {
      if (context?.previousConversations) {
        queryClient.setQueryData(queryKeys.conversations.all, context.previousConversations)
      }
      const apiError = handleApiError(error)
      toast({
        title: "Erro",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Conversa removida com sucesso!",
      })
    },
  })
}

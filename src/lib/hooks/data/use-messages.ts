"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "./query-keys"
import {
  fetchMessagesByConversation,
  fetchMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
  type CreateMessageDTO,
  type UpdateMessageDTO,
} from "@/lib/services/messages.service"
import { useToast } from "@/hooks/use-toast"
import { Message } from "@/types"
import { ApiError } from "@/types/react-query"
import { handleApiError, formatErrorMessage } from "@/lib/error-handler"

/**
 * Hook para buscar mensagens de uma conversa
 */
export function useMessages(conversationId: string) {
  return useQuery<Message[], ApiError>({
    queryKey: queryKeys.messages.list(conversationId),
    queryFn: () => fetchMessagesByConversation(conversationId),
    enabled: !!conversationId,
  })
}

/**
 * Hook para buscar mensagem por ID
 */
export function useMessage(id: string) {
  return useQuery<Message, ApiError>({
    queryKey: queryKeys.messages.detail(id),
    queryFn: () => fetchMessageById(id),
    enabled: !!id,
  })
}

/**
 * Hook para criar nova mensagem com optimistic update
 */
export function useCreateMessage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<Message, ApiError, CreateMessageDTO>({
    mutationFn: createMessage,
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.messages.list(newMessage.conversationId),
      })

      const previousMessages = queryClient.getQueryData<Message[]>(
        queryKeys.messages.list(newMessage.conversationId)
      )

      const optimisticMessage: Message = {
        ...newMessage,
        id: `temp-${Date.now()}`,
        timestamp: newMessage.timestamp || new Date().toISOString(),
        feedback: null,
      } as Message

      queryClient.setQueryData<Message[]>(
        queryKeys.messages.list(newMessage.conversationId),
        (old) => [...(old || []), optimisticMessage]
      )

      return { previousMessages, conversationId: newMessage.conversationId }
    },
    onError: (error, _, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          queryKeys.messages.list(context.conversationId),
          context.previousMessages
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.list(variables.conversationId),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all })
    },
  })
}

/**
 * Hook para atualizar mensagem existente
 */
export function useUpdateMessage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<Message, ApiError, { id: string; data: UpdateMessageDTO }>({
    mutationFn: ({ id, data }) => updateMessage(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.messages.all })
      const previousMessage = queryClient.getQueryData(queryKeys.messages.detail(id))

      queryClient.setQueryData<Message>(queryKeys.messages.detail(id), (old) =>
        old ? { ...old, ...data } : old
      )

      return { previousMessage, id }
    },
    onError: (error, variables, context) => {
      if (context?.previousMessage) {
        queryClient.setQueryData(queryKeys.messages.detail(context.id), context.previousMessage)
      }
      const apiError = handleApiError(error)
      toast({
        title: "Erro",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.detail(variables.id) })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Mensagem atualizada com sucesso!",
      })
    },
  })
}

/**
 * Hook para deletar mensagem
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<void, ApiError, string>({
    mutationFn: deleteMessage,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.messages.all })
      const previousMessages = queryClient.getQueryData(queryKeys.messages.all)
      return { previousMessages, id }
    },
    onError: (error, _, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(queryKeys.messages.all, context.previousMessages)
      }
      const apiError = handleApiError(error)
      toast({
        title: "Erro",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Mensagem removida com sucesso!",
      })
    },
  })
}

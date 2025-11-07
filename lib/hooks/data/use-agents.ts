"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/hooks/data/query-keys"
import {
  fetchAgents,
  fetchAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  type CreateAgentDTO,
  type UpdateAgentDTO,
} from "@/lib/services/agents.service"
import { useToast } from "@/hooks/use-toast"
import { Agent } from "@/types"
import { ApiError } from "@/types/react-query"
import { handleApiError, formatErrorMessage } from "@/lib/error-handler"

/**
 * Hook para buscar todos os agents
 */
export function useAgents() {
  return useQuery<Agent[], ApiError>({
    queryKey: queryKeys.agents.list(),
    queryFn: fetchAgents,
  })
}

/**
 * Hook para buscar agent por ID
 */
export function useAgent(id: string) {
  return useQuery<Agent | null, ApiError>({
    queryKey: queryKeys.agents.detail(id),
    queryFn: () => fetchAgentById(id),
    enabled: !!id,
  })
}

/**
 * Hook para criar novo agent
 */
export function useCreateAgent() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<Agent, ApiError, CreateAgentDTO>({
    mutationFn: createAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.all })
      toast({
        title: "Sucesso",
        description: "Agente criado com sucesso!",
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
 * Hook para atualizar agent existente
 */
export function useUpdateAgent() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<Agent, ApiError, { id: string; data: UpdateAgentDTO }>({
    mutationFn: ({ id, data }) => updateAgent(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.agents.all })
      const previousAgents = queryClient.getQueryData(queryKeys.agents.detail(id))

      queryClient.setQueryData<Agent>(queryKeys.agents.detail(id), (old) =>
        old ? { ...old, ...data } : old
      )

      return { previousAgents, id }
    },
    onError: (error, variables, context: any) => {
      if (context?.previousAgents) {
        queryClient.setQueryData(queryKeys.agents.detail(context.id), context.previousAgents)
      }
      const apiError = handleApiError(error)
      toast({
        title: "Erro",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.detail(variables.id) })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Agente atualizado com sucesso!",
      })
    },
  })
}

/**
 * Hook para deletar agent
 */
export function useDeleteAgent() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<void, ApiError, string>({
    mutationFn: deleteAgent,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.agents.all })
      const previousAgents = queryClient.getQueryData(queryKeys.agents.list())
      return { previousAgents, id }
    },
    onError: (error, _, context: any) => {
      if (context?.previousAgents) {
        queryClient.setQueryData(queryKeys.agents.list(), context.previousAgents)
      }
      const apiError = handleApiError(error)
      toast({
        title: "Erro",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.all })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Agente removido com sucesso!",
      })
    },
  })
}

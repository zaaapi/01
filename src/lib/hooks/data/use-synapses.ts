"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "./query-keys"
import {
  fetchSynapsesByBaseConhecimento,
  fetchSynapsesByTenant,
  fetchSynapseById,
  createSynapse,
  updateSynapse,
  deleteSynapse,
  type CreateSynapseDTO,
  type UpdateSynapseDTO,
} from "@/lib/services/synapses.service"
import { useToast } from "@/hooks/use-toast"
import { Synapse } from "@/types"
import { ApiError } from "@/types/react-query"
import { handleApiError, formatErrorMessage } from "@/lib/error-handler"

/**
 * Hook para buscar synapses por base de conhecimento
 */
export function useSynapsesByBase(baseConhecimentoId: string) {
  return useQuery<Synapse[], ApiError>({
    queryKey: queryKeys.synapses.listByBase(baseConhecimentoId),
    queryFn: () => fetchSynapsesByBaseConhecimento(baseConhecimentoId),
    enabled: !!baseConhecimentoId,
  })
}

/**
 * Hook para buscar synapses por tenant
 */
export function useSynapsesByTenant(tenantId: string) {
  return useQuery<Synapse[], ApiError>({
    queryKey: queryKeys.synapses.listByTenant(tenantId),
    queryFn: () => fetchSynapsesByTenant(tenantId),
    enabled: !!tenantId,
  })
}

/**
 * Hook para buscar synapse por ID
 */
export function useSynapse(id: string) {
  return useQuery<Synapse, ApiError>({
    queryKey: queryKeys.synapses.detail(id),
    queryFn: () => fetchSynapseById(id),
    enabled: !!id,
  })
}

/**
 * Hook para criar nova synapse
 */
export function useCreateSynapse() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<Synapse, ApiError, CreateSynapseDTO>({
    mutationFn: createSynapse,
    onSuccess: (_, variables) => {
      if (variables.baseConhecimentoId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.synapses.listByBase(variables.baseConhecimentoId),
        })
      }
      if (variables.tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.synapses.listByTenant(variables.tenantId),
        })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.synapses.all })
      toast({
        title: "Sucesso",
        description: "Synapse criada com sucesso!",
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
 * Hook para atualizar synapse existente
 */
export function useUpdateSynapse() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<Synapse, ApiError, { id: string; data: UpdateSynapseDTO }>({
    mutationFn: ({ id, data }) => updateSynapse(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.synapses.all })
      const previousSynapse = queryClient.getQueryData(queryKeys.synapses.detail(id))

      queryClient.setQueryData<Synapse>(queryKeys.synapses.detail(id), (old) =>
        old ? { ...old, ...data } : old
      )

      return { previousSynapse, id }
    },
    onError: (error, variables, context) => {
      if (context?.previousSynapse) {
        queryClient.setQueryData(queryKeys.synapses.detail(context.id), context.previousSynapse)
      }
      const apiError = handleApiError(error)
      toast({
        title: "Erro",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.synapses.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.synapses.detail(variables.id) })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Synapse atualizada com sucesso!",
      })
    },
  })
}

/**
 * Hook para deletar synapse
 */
export function useDeleteSynapse() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<void, ApiError, string>({
    mutationFn: deleteSynapse,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.synapses.all })
      const previousSynapses = queryClient.getQueryData(queryKeys.synapses.all)
      return { previousSynapses, id }
    },
    onError: (error, _, context) => {
      if (context?.previousSynapses) {
        queryClient.setQueryData(queryKeys.synapses.all, context.previousSynapses)
      }
      const apiError = handleApiError(error)
      toast({
        title: "Erro",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.synapses.all })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Synapse removida com sucesso!",
      })
    },
  })
}

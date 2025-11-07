"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "./query-keys"
import {
  fetchBaseConhecimentosByTenant,
  fetchBaseConhecimentoById,
  createBaseConhecimento,
  updateBaseConhecimento,
  deleteBaseConhecimento,
  type CreateBaseConhecimentoDTO,
  type UpdateBaseConhecimentoDTO,
} from "@/lib/services/base-conhecimentos.service"
import { useToast } from "@/hooks/use-toast"
import { BaseConhecimento } from "@/types"
import { ApiError } from "@/types/react-query"
import { handleApiError, formatErrorMessage } from "@/lib/error-handler"

/**
 * Hook para buscar bases de conhecimento por tenant
 */
export function useBaseConhecimentos(tenantId: string) {
  return useQuery<BaseConhecimento[], ApiError>({
    queryKey: queryKeys.baseConhecimentos.list(tenantId),
    queryFn: () => fetchBaseConhecimentosByTenant(tenantId),
    enabled: !!tenantId,
  })
}

/**
 * Hook para buscar base de conhecimento por ID
 */
export function useBaseConhecimento(id: string) {
  return useQuery<BaseConhecimento, ApiError>({
    queryKey: queryKeys.baseConhecimentos.detail(id),
    queryFn: () => fetchBaseConhecimentoById(id),
    enabled: !!id,
  })
}

/**
 * Hook para criar nova base de conhecimento
 */
export function useCreateBaseConhecimento() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<BaseConhecimento, ApiError, CreateBaseConhecimentoDTO>({
    mutationFn: createBaseConhecimento,
    onSuccess: (_, variables) => {
      if (variables.tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.baseConhecimentos.list(variables.tenantId),
        })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.baseConhecimentos.all })
      toast({
        title: "Sucesso",
        description: "Base de conhecimento criada com sucesso!",
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
 * Hook para atualizar base de conhecimento existente
 */
export function useUpdateBaseConhecimento() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<BaseConhecimento, ApiError, { id: string; data: UpdateBaseConhecimentoDTO }>({
    mutationFn: ({ id, data }) => updateBaseConhecimento(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.baseConhecimentos.all })
      const previousBase = queryClient.getQueryData(queryKeys.baseConhecimentos.detail(id))

      queryClient.setQueryData<BaseConhecimento>(queryKeys.baseConhecimentos.detail(id), (old) =>
        old ? { ...old, ...data } : old
      )

      return { previousBase, id }
    },
    onError: (error, variables, context) => {
      if (context?.previousBase) {
        queryClient.setQueryData(
          queryKeys.baseConhecimentos.detail(context.id),
          context.previousBase
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
      queryClient.invalidateQueries({ queryKey: queryKeys.baseConhecimentos.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.baseConhecimentos.detail(variables.id) })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Base de conhecimento atualizada com sucesso!",
      })
    },
  })
}

/**
 * Hook para deletar base de conhecimento
 */
export function useDeleteBaseConhecimento() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<void, ApiError, string>({
    mutationFn: deleteBaseConhecimento,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.baseConhecimentos.all })
      const previousBases = queryClient.getQueryData(queryKeys.baseConhecimentos.all)
      return { previousBases, id }
    },
    onError: (error, _, context) => {
      if (context?.previousBases) {
        queryClient.setQueryData(queryKeys.baseConhecimentos.all, context.previousBases)
      }
      const apiError = handleApiError(error)
      toast({
        title: "Erro",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.baseConhecimentos.all })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Base de conhecimento removida com sucesso!",
      })
    },
  })
}

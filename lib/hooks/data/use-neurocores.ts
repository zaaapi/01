"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "./query-keys"
import {
  fetchNeurocores,
  fetchNeurocoreById,
  createNeurocore,
  updateNeurocore,
  deleteNeurocore,
  type CreateNeuroCoreDTO,
  type UpdateNeuroCoreDTO,
} from "@/lib/services/neurocores.service"
import { useToast } from "@/hooks/use-toast"
import { NeuroCore } from "@/types"
import { ApiError } from "@/types/react-query"
import { handleApiError, formatErrorMessage } from "@/lib/error-handler"

/**
 * Hook para buscar todos os neurocores
 */
export function useNeurocores() {
  return useQuery<NeuroCore[], ApiError>({
    queryKey: queryKeys.neurocores.list(),
    queryFn: fetchNeurocores,
  })
}

/**
 * Hook para buscar neurocore por ID
 */
export function useNeurocore(id: string) {
  return useQuery<NeuroCore, ApiError>({
    queryKey: queryKeys.neurocores.detail(id),
    queryFn: () => fetchNeurocoreById(id),
    enabled: !!id,
  })
}

/**
 * Hook para criar novo neurocore
 */
export function useCreateNeurocore() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<NeuroCore, ApiError, CreateNeuroCoreDTO>({
    mutationFn: createNeurocore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.neurocores.all })
      toast({
        title: "Sucesso",
        description: "NeuroCore criado com sucesso!",
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
 * Hook para atualizar neurocore existente
 */
export function useUpdateNeurocore() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<NeuroCore, ApiError, { id: string; data: UpdateNeuroCoreDTO }>({
    mutationFn: ({ id, data }) => updateNeurocore(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.neurocores.all })
      const previousNeurocore = queryClient.getQueryData(queryKeys.neurocores.detail(id))

      queryClient.setQueryData<NeuroCore>(queryKeys.neurocores.detail(id), (old) =>
        old ? { ...old, ...data } : old
      )

      return { previousNeurocore, id }
    },
    onError: (error, variables, context) => {
      if (context?.previousNeurocore) {
        queryClient.setQueryData(
          queryKeys.neurocores.detail(context.id),
          context.previousNeurocore
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
      queryClient.invalidateQueries({ queryKey: queryKeys.neurocores.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.neurocores.detail(variables.id) })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "NeuroCore atualizado com sucesso!",
      })
    },
  })
}

/**
 * Hook para deletar neurocore
 */
export function useDeleteNeurocore() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<void, ApiError, string>({
    mutationFn: deleteNeurocore,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.neurocores.all })
      const previousNeurocores = queryClient.getQueryData(queryKeys.neurocores.list())
      return { previousNeurocores, id }
    },
    onError: (error, _, context) => {
      if (context?.previousNeurocores) {
        queryClient.setQueryData(queryKeys.neurocores.list(), context.previousNeurocores)
      }
      const apiError = handleApiError(error)
      toast({
        title: "Erro",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.neurocores.all })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "NeuroCore removido com sucesso!",
      })
    },
  })
}

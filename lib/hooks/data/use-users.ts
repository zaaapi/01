"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "./query-keys"
import {
  fetchUsersByTenant,
  fetchUserById,
  fetchAllFeatureModules,
  createUser,
  updateUser,
  deleteUser,
  type CreateUserDTO,
  type UpdateUserDTO,
} from "@/lib/services/users.service"
import { useToast } from "@/hooks/use-toast"
import { User, FeatureModule } from "@/types"
import { ApiError } from "@/types/react-query"
import { handleApiError, formatErrorMessage } from "@/lib/error-handler"

/**
 * Hook para buscar usuários de um tenant
 */
export function useUsers(tenantId: string) {
  return useQuery<User[], ApiError>({
    queryKey: queryKeys.users.list(tenantId),
    queryFn: () => fetchUsersByTenant(tenantId),
    enabled: !!tenantId,
  })
}

/**
 * Hook para buscar usuário por ID
 */
export function useUser(id: string) {
  return useQuery<User, ApiError>({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => fetchUserById(id),
    enabled: !!id,
  })
}

/**
 * Hook para buscar todos os módulos disponíveis
 */
export function useFeatureModules() {
  return useQuery<FeatureModule[], ApiError>({
    queryKey: queryKeys.featureModules.list(),
    queryFn: fetchAllFeatureModules,
  })
}

/**
 * Hook para criar novo usuário
 */
export function useCreateUser() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<User, ApiError, CreateUserDTO>({
    mutationFn: createUser,
    onSuccess: (_, variables) => {
      if (variables.tenantId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.list(variables.tenantId) })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso!",
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
 * Hook para atualizar usuário existente
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<User, ApiError, { id: string; data: UpdateUserDTO }>({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all })
      const previousUser = queryClient.getQueryData(queryKeys.users.detail(id))

      queryClient.setQueryData<User>(queryKeys.users.detail(id), (old) =>
        old ? { ...old, ...data } : old
      )

      return { previousUser, id }
    },
    onError: (error, variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.users.detail(context.id), context.previousUser)
      }
      const apiError = handleApiError(error)
      toast({
        title: "Erro",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      })
    },
  })
}

/**
 * Hook para deletar usuário
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<void, ApiError, string>({
    mutationFn: deleteUser,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all })
      const previousUsers = queryClient.getQueryData(queryKeys.users.all)
      return { previousUsers, id }
    },
    onError: (error, _, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(queryKeys.users.all, context.previousUsers)
      }
      const apiError = handleApiError(error)
      toast({
        title: "Erro",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Usuário removido com sucesso!",
      })
    },
  })
}

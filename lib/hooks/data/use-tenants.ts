"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/hooks/data/query-keys"
import {
  fetchTenants,
  fetchTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
  type TenantFilter,
  type CreateTenantDTO,
  type UpdateTenantDTO,
} from "@/lib/services/tenants.service"
import { useToast } from "@/hooks/use-toast"
import { Tenant } from "@/types"
import { ApiError } from "@/types/react-query"
import { handleApiError, formatErrorMessage } from "@/lib/error-handler"

/**
 * Hook para buscar lista de tenants com filtro
 */
export function useTenants(filter: TenantFilter = "all") {
  return useQuery<Tenant[], ApiError>({
    queryKey: queryKeys.tenants.list(filter),
    queryFn: () => fetchTenants(filter),
  })
}

/**
 * Hook para buscar tenant por ID
 */
export function useTenant(id: string) {
  return useQuery<Tenant | null, ApiError>({
    queryKey: queryKeys.tenants.detail(id),
    queryFn: () => fetchTenantById(id),
    enabled: !!id,
  })
}

/**
 * Hook para criar novo tenant
 */
export function useCreateTenant() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<Tenant, ApiError, CreateTenantDTO>({
    mutationFn: createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all })
      toast({
        title: "Sucesso",
        description: "Empresa criada com sucesso!",
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
 * Hook para atualizar tenant existente
 */
export function useUpdateTenant() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<Tenant, ApiError, { id: string; data: UpdateTenantDTO }>({
    mutationFn: ({ id, data }) => updateTenant(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tenants.all })
      const previousTenant = queryClient.getQueryData(queryKeys.tenants.detail(id))

      queryClient.setQueryData<Tenant>(queryKeys.tenants.detail(id), (old) =>
        old ? { ...old, ...data } : old
      )

      return { previousTenant, id }
    },
    onError: (error, variables, context: any) => {
      if (context?.previousTenant) {
        queryClient.setQueryData(queryKeys.tenants.detail(context.id), context.previousTenant)
      }
      const apiError = handleApiError(error)
      toast({
        title: "Erro",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.detail(variables.id) })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Empresa atualizada com sucesso!",
      })
    },
  })
}

/**
 * Hook para deletar tenant
 */
export function useDeleteTenant() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<void, ApiError, string>({
    mutationFn: deleteTenant,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tenants.all })
      const previousTenants = queryClient.getQueryData(queryKeys.tenants.all)
      return { previousTenants, id }
    },
    onError: (error, _, context: any) => {
      if (context?.previousTenants) {
        queryClient.setQueryData(queryKeys.tenants.all, context.previousTenants)
      }
      const apiError = handleApiError(error)
      toast({
        title: "Erro",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Empresa removida com sucesso!",
      })
    },
  })
}

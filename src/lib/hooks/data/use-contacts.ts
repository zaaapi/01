"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "./query-keys"
import {
  fetchContactsByTenant,
  fetchContactById,
  createContact,
  updateContact,
  deleteContact,
  type CreateContactDTO,
  type UpdateContactDTO,
} from "@/lib/services/contacts.service"
import { useToast } from "@/hooks/use-toast"
import { Contact } from "@/types"
import { ApiError } from "@/types/react-query"
import { handleApiError, formatErrorMessage } from "@/lib/error-handler"

/**
 * Hook para buscar contatos por tenant
 */
export function useContacts(tenantId: string) {
  return useQuery<Contact[], ApiError>({
    queryKey: queryKeys.contacts.list(tenantId),
    queryFn: () => fetchContactsByTenant(tenantId),
    enabled: !!tenantId,
  })
}

/**
 * Hook para buscar contato por ID
 */
export function useContact(id: string) {
  return useQuery<Contact, ApiError>({
    queryKey: queryKeys.contacts.detail(id),
    queryFn: () => fetchContactById(id),
    enabled: !!id,
  })
}

/**
 * Hook para criar novo contato
 */
export function useCreateContact() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<Contact, ApiError, CreateContactDTO>({
    mutationFn: createContact,
    onSuccess: (_, variables) => {
      if (variables.tenantId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list(variables.tenantId) })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all })
      toast({
        title: "Sucesso",
        description: "Contato criado com sucesso!",
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
 * Hook para atualizar contato existente
 */
export function useUpdateContact() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<Contact, ApiError, { id: string; data: UpdateContactDTO }>({
    mutationFn: ({ id, data }) => updateContact(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.contacts.all })
      const previousContact = queryClient.getQueryData(queryKeys.contacts.detail(id))

      queryClient.setQueryData<Contact>(queryKeys.contacts.detail(id), (old) =>
        old ? { ...old, ...data } : old
      )

      return { previousContact, id }
    },
    onError: (error, variables, context) => {
      if (context?.previousContact) {
        queryClient.setQueryData(queryKeys.contacts.detail(context.id), context.previousContact)
      }
      const apiError = handleApiError(error)
      toast({
        title: "Erro",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.detail(variables.id) })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Contato atualizado com sucesso!",
      })
    },
  })
}

/**
 * Hook para deletar contato
 */
export function useDeleteContact() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<void, ApiError, string>({
    mutationFn: deleteContact,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.contacts.all })
      const previousContacts = queryClient.getQueryData(queryKeys.contacts.all)
      return { previousContacts, id }
    },
    onError: (error, _, context) => {
      if (context?.previousContacts) {
        queryClient.setQueryData(queryKeys.contacts.all, context.previousContacts)
      }
      const apiError = handleApiError(error)
      toast({
        title: "Erro",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all })
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Contato removido com sucesso!",
      })
    },
  })
}

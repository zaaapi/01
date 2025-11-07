"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useData } from "@/lib/contexts/data-provider"
import { Conversation, Message, ConversationStatus } from "@/types"

interface UseLiveChatDataProps {
  tenantId: string | undefined
  selectedContactId: string | null
  selectedConversationId: string | null
  searchQuery: string
  searchField: "name" | "phone" | "email"
  statusFilter: ConversationStatus | "all"
}

export function useLiveChatData({
  tenantId,
  selectedContactId,
  selectedConversationId,
  searchQuery,
  searchField,
  statusFilter,
}: UseLiveChatDataProps) {
  const { fetchContacts, fetchContact, fetchConversationsByContact, fetchMessagesByConversation } =
    useData()

  const queryClient = useQueryClient()

  // Query para contatos com busca
  const {
    data: contacts = [],
    isLoading: isLoadingContacts,
    refetch: refetchContacts,
  } = useQuery({
    queryKey: ["contacts", tenantId, searchQuery, searchField],
    queryFn: async () => {
      if (!tenantId) return []
      const filters = {
        search: searchQuery || undefined,
        searchField: searchField,
      }
      return fetchContacts(tenantId, filters)
    },
    enabled: !!tenantId,
    staleTime: 30 * 1000,
  })

  // Query para contato selecionado (detalhes)
  const { data: selectedContact = null, refetch: refetchSelectedContact } = useQuery({
    queryKey: ["contact", selectedContactId],
    queryFn: async () => {
      if (!selectedContactId) return null
      return fetchContact(selectedContactId)
    },
    enabled: !!selectedContactId,
    staleTime: 60 * 1000,
  })

  // Query para conversas do contato selecionado
  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ["conversations", selectedContactId, tenantId, statusFilter],
    queryFn: async () => {
      if (!selectedContactId || !tenantId) return []
      const filters = statusFilter !== "all" ? { status: statusFilter } : undefined
      return fetchConversationsByContact(selectedContactId, tenantId, filters)
    },
    enabled: !!selectedContactId && !!tenantId,
    staleTime: 15 * 1000,
  })

  // Query para a conversa selecionada (pega dos conversations)
  const selectedConversation =
    conversations.find((c: Conversation) => c.id === selectedConversationId) || null

  // Query para mensagens da conversa selecionada
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ["messages", selectedConversationId],
    queryFn: async () => {
      if (!selectedConversationId) return []
      return fetchMessagesByConversation(selectedConversationId)
    },
    enabled: !!selectedConversationId,
    staleTime: 5 * 1000, // 5 segundos - mais curto para mensagens
  })

  // Funções para invalidar cache
  const invalidateContacts = () => {
    queryClient.invalidateQueries({ queryKey: ["contacts", tenantId] })
  }

  const invalidateConversations = () => {
    queryClient.invalidateQueries({ queryKey: ["conversations", selectedContactId, tenantId] })
  }

  const invalidateMessages = () => {
    queryClient.invalidateQueries({ queryKey: ["messages", selectedConversationId] })
  }

  const invalidateSelectedContact = () => {
    queryClient.invalidateQueries({ queryKey: ["contact", selectedContactId] })
  }

  // Função para atualizar mensagens otimisticamente
  const addOptimisticMessage = (message: Message) => {
    queryClient.setQueryData<Message[]>(["messages", selectedConversationId], (old) =>
      old ? [...old, message] : [message]
    )
  }

  // Função para remover mensagem otimista (em caso de erro)
  const removeOptimisticMessage = (messageId: string) => {
    queryClient.setQueryData<Message[]>(["messages", selectedConversationId], (old) =>
      old ? old.filter((m) => m.id !== messageId) : []
    )
  }

  return {
    // Dados
    contacts,
    selectedContact,
    conversations,
    selectedConversation,
    messages,

    // Loading states
    isLoadingContacts,
    isLoadingConversations,
    isLoadingMessages,

    // Funções de refetch
    refetchContacts,
    refetchSelectedContact,
    refetchConversations,
    refetchMessages,

    // Funções de invalidação
    invalidateContacts,
    invalidateConversations,
    invalidateMessages,
    invalidateSelectedContact,

    // Funções otimistas
    addOptimisticMessage,
    removeOptimisticMessage,

    // Query client para uso direto
    queryClient,
  }
}

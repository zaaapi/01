"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useData } from "@/lib/contexts/data-provider"

interface UseInfiniteMessagesProps {
  conversationId: string | null
  limit?: number
}

export function useInfiniteMessages({ conversationId, limit = 50 }: UseInfiniteMessagesProps) {
  const { fetchMessagesByConversationPaginated } = useData()

  return useInfiniteQuery({
    queryKey: ["infinite-messages", conversationId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!conversationId) {
        return { messages: [], hasMore: false, total: 0 }
      }

      // Buscar mensagens paginadas do Supabase
      const result = await fetchMessagesByConversationPaginated(conversationId, {
        offset: pageParam,
        limit,
      })

      return result
    },
    getNextPageParam: (lastPage, allPages) => {
      // Se não há mais páginas, retorna undefined
      if (!lastPage.hasMore) return undefined

      // Retorna o próximo offset
      return allPages.length * limit
    },
    enabled: !!conversationId,
    initialPageParam: 0,
  })
}

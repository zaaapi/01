"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createSupabaseClient } from "@/db"
import { Message } from "@/types"

interface UseRealtimeMessagesProps {
  conversationId: string | null
  enabled?: boolean
}

export function useRealtimeMessages({ conversationId, enabled = true }: UseRealtimeMessagesProps) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!conversationId || !enabled) return

    const supabase = createSupabaseClient()

    // Criar subscription para mensagens
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Atualizar cache do React Query com nova mensagem
          queryClient.setQueryData<Message[]>(["messages", conversationId], (old) => {
            if (!old) return [payload.new as Message]

            // Evitar duplicatas
            const exists = old.some((m) => m.id === payload.new.id)
            if (exists) return old

            return [...old, payload.new as Message]
          })
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Atualizar mensagem existente no cache
          queryClient.setQueryData<Message[]>(["messages", conversationId], (old) => {
            if (!old) return []
            return old.map((m) => (m.id === payload.new.id ? (payload.new as Message) : m))
          })
        }
      )
      .subscribe()

    // Cleanup na desmontagem
    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, enabled, queryClient])
}

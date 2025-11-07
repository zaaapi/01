"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createSupabaseClient } from "@/db"
import { Conversation } from "@/types"

interface UseRealtimeConversationsProps {
  contactId: string | null
  tenantId: string | undefined
  enabled?: boolean
}

export function useRealtimeConversations({
  contactId,
  tenantId,
  enabled = true,
}: UseRealtimeConversationsProps) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!contactId || !tenantId || !enabled) return

    const supabase = createSupabaseClient()

    // Criar subscription para conversas do contato
    const channel = supabase
      .channel(`conversations:${contactId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `contact_id=eq.${contactId}`,
        },
        (payload) => {
          // Atualizar conversa no cache
          queryClient.setQueryData<Conversation[]>(
            ["conversations", contactId, tenantId],
            (old) => {
              if (!old) return []
              return old.map((c) =>
                c.id === payload.new.id
                  ? {
                      ...c,
                      status: payload.new.status,
                      iaActive: payload.new.ia_active,
                      lastMessageAt: payload.new.last_message_at,
                      overallFeedback: payload.new.overall_feedback,
                    }
                  : c
              )
            }
          )

          // Também invalidar queries com filtros diferentes
          queryClient.invalidateQueries({
            queryKey: ["conversations", contactId, tenantId],
            exact: false,
          })
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
          filter: `contact_id=eq.${contactId}`,
        },
        (payload) => {
          // Adicionar nova conversa ao cache
          queryClient.setQueryData<Conversation[]>(
            ["conversations", contactId, tenantId],
            (old) => {
              if (!old) return [payload.new as Conversation]

              // Evitar duplicatas
              const exists = old.some((c) => c.id === payload.new.id)
              if (exists) return old

              return [payload.new as Conversation, ...old]
            }
          )
        }
      )
      .subscribe()

    // Cleanup na desmontagem
    return () => {
      supabase.removeChannel(channel)
    }
  }, [contactId, tenantId, enabled, queryClient])
}

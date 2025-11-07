"use server"

import { actionClient } from "@/lib/safe-action"
import { pauseIAConversationSchema } from "./schema"
import { n8nClient } from "@/lib/n8n-client"
import { createSupabaseClient } from "@/db"
import { revalidatePath } from "next/cache"

export const pauseIAConversation = actionClient
  .schema(pauseIAConversationSchema)
  .action(async ({ parsedInput: { tenantId, conversationId } }) => {
    try {
      // Chamar N8N para pausar IA
      await n8nClient.pauseIAConversation({ tenantId, conversationId })

      // Atualizar Supabase
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from("conversations")
        .update({ ia_active: false })
        .eq("id", conversationId)

      if (error) {
        throw new Error(`Erro ao pausar IA: ${error.message}`)
      }

      // Revalidar cache
      revalidatePath("/cliente/live-chat")

      return { success: true }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Erro ao pausar IA")
    }
  })

"use server"

import { actionClient } from "@/lib/safe-action"
import { resumeIAConversationSchema } from "./schema"
import { n8nClient } from "@/lib/n8n-client"
import { createSupabaseClient } from "@/db"
import { revalidatePath } from "next/cache"

export const resumeIAConversation = actionClient
  .schema(resumeIAConversationSchema)
  .action(async ({ parsedInput: { tenantId, conversationId } }) => {
    try {
      // Chamar N8N para retomar IA
      await n8nClient.resumeIAConversation({ tenantId, conversationId })

      // Atualizar Supabase
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from("conversations")
        .update({ ia_active: true })
        .eq("id", conversationId)

      if (error) {
        throw new Error(`Erro ao retomar IA: ${error.message}`)
      }

      // Revalidar cache
      revalidatePath("/cliente/live-chat")

      return { success: true }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Erro ao retomar IA")
    }
  })

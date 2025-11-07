"use server"

import { actionClient } from "@/lib/safe-action"
import { endConversationSchema } from "./schema"
import { n8nClient } from "@/lib/n8n-client"
import { createSupabaseClient } from "@/db"
import { revalidatePath } from "next/cache"

export const endConversation = actionClient
  .schema(endConversationSchema)
  .action(async ({ parsedInput: { tenantId, conversationId, contactId } }) => {
    try {
      // Chamar N8N para encerrar conversa
      await n8nClient.endConversation({ tenantId, conversationId, contactId })

      // Atualizar Supabase
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from("conversations")
        .update({ status: "ENCERRADA" })
        .eq("id", conversationId)

      if (error) {
        throw new Error(`Erro ao encerrar conversa: ${error.message}`)
      }

      // Revalidar cache
      revalidatePath("/cliente/live-chat")

      return { success: true }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Erro ao encerrar conversa")
    }
  })

"use server"

import { actionClient } from "@/lib/safe-action"
import { sendWhatsAppMessageSchema } from "./schema"
import { n8nClient } from "@/lib/n8n-client"
import { createSupabaseClient } from "@/db"
import { revalidatePath } from "next/cache"

export const sendWhatsAppMessage = actionClient
  .schema(sendWhatsAppMessageSchema)
  .action(async ({ parsedInput: { tenantId, contactId, conversationId, message } }) => {
    try {
      // Enviar via N8N
      const result = await n8nClient.sendWhatsAppMessage({
        tenantId,
        contactId,
        conversationId,
        message,
      })

      // Atualizar lastMessageAt da conversa
      const supabase = createSupabaseClient()
      const { error: updateError } = await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId)

      if (updateError) {
        throw new Error(`Erro ao atualizar conversa: ${updateError.message}`)
      }

      // Revalidar cache
      revalidatePath("/cliente/live-chat")

      return {
        success: true,
        messageId: result?.messageId || `temp-${Date.now()}`,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Erro ao enviar mensagem")
    }
  })

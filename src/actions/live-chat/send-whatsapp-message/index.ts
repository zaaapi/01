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
      console.log("[sendWhatsAppMessage] Iniciando envio:", { tenantId, contactId, conversationId })

      // Enviar via N8N
      const result = await n8nClient.sendWhatsAppMessage({
        tenantId,
        contactId,
        conversationId,
        message,
      })

      console.log("[sendWhatsAppMessage] Resposta N8N:", result)

      // Atualizar lastMessageAt da conversa
      const supabase = createSupabaseClient()
      const { error: updateError } = await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId)

      if (updateError) {
        console.error("[sendWhatsAppMessage] Erro ao atualizar conversa:", updateError)
        throw new Error(`Erro ao atualizar conversa: ${updateError.message}`)
      }

      // Revalidar cache
      revalidatePath("/cliente/live-chat")

      console.log("[sendWhatsAppMessage] Sucesso!")

      return {
        success: true,
        messageId: result?.messageId || `temp-${Date.now()}`,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error("[sendWhatsAppMessage] Erro:", error)
      throw new Error(error instanceof Error ? error.message : "Erro ao enviar mensagem")
    }
  })

import { z } from "zod"

export const sendWhatsAppMessageSchema = z.object({
  tenantId: z.string().uuid("ID do tenant inválido"),
  contactId: z.string().uuid("ID do contato inválido"),
  conversationId: z.string().uuid("ID da conversa inválido"),
  message: z.string().min(1, "Mensagem não pode estar vazia").max(4096, "Mensagem muito longa"),
})

export type SendWhatsAppMessageInput = z.infer<typeof sendWhatsAppMessageSchema>

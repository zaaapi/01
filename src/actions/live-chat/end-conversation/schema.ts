import { z } from "zod"

export const endConversationSchema = z.object({
  tenantId: z.string().uuid("ID do tenant inválido"),
  conversationId: z.string().uuid("ID da conversa inválido"),
  contactId: z.string().uuid("ID do contato inválido"),
})

export type EndConversationInput = z.infer<typeof endConversationSchema>

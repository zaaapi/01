import { z } from "zod"

export const pauseIAConversationSchema = z.object({
  tenantId: z.string().uuid("ID do tenant inválido"),
  conversationId: z.string().uuid("ID da conversa inválido"),
})

export type PauseIAConversationInput = z.infer<typeof pauseIAConversationSchema>

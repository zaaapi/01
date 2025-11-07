import { z } from "zod"

export const resumeIAConversationSchema = z.object({
  tenantId: z.string().uuid("ID do tenant inválido"),
  conversationId: z.string().uuid("ID da conversa inválido"),
})

export type ResumeIAConversationInput = z.infer<typeof resumeIAConversationSchema>

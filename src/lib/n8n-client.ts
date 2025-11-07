/**
 * Cliente N8N para integração com LIVIA
 * Autenticação via JWT (HS256)
 */

/**
 * Faz requisição ao N8N via API Route interna
 * A API Route cuida da autenticação JWT de forma segura
 */
async function n8nFetch(endpoint: string, data: Record<string, any>) {
  console.log("[n8nFetch] Chamando endpoint:", endpoint, "com dados:", data)

  const response = await fetch("/api/n8n", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint, data }),
  })

  console.log("[n8nFetch] Status da resposta:", response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[n8nFetch] Erro:", errorText)
    throw new Error(`N8N Error: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  console.log("[n8nFetch] Resposta:", result)
  return result
}

/**
 * Cliente N8N para integração com LIVIA
 */
export const n8nClient = {
  /**
   * Envia mensagem via WhatsApp
   * @param params - tenantId, contactId, conversationId, message
   */
  sendWhatsAppMessage: async (params: {
    tenantId: string
    contactId: string
    conversationId: string
    message: string
  }) => {
    return n8nFetch("/send_whatsapp_message", params)
  },

  /**
   * Pausa IA na conversa
   * @param params - tenantId, conversationId
   */
  pauseIAConversation: async (params: { tenantId: string; conversationId: string }) => {
    return n8nFetch("/pause_ia_conversation", params)
  },

  /**
   * Retoma IA na conversa
   * @param params - tenantId, conversationId
   */
  resumeIAConversation: async (params: { tenantId: string; conversationId: string }) => {
    return n8nFetch("/resume_ia_conversation", params)
  },

  /**
   * Gerencia Synapse (CRUD)
   * @param params - action, tenantId, synapseId (opcional), data
   */
  manageSynapse: async (params: {
    action: "create" | "update" | "delete" | "publish"
    tenantId: string
    synapseId?: string
    data?: Record<string, any>
  }) => {
    return n8nFetch("/manage_synapse", params)
  },

  /**
   * Treina NeuroCore com pergunta
   * @param params - tenantId, question
   */
  trainNeuroCore: async (params: { tenantId: string; question: string }) => {
    return n8nFetch("/train_neurocore", params)
  },

  /**
   * Encerra conversa
   * @param params - tenantId, conversationId, contactId
   */
  endConversation: async (params: {
    tenantId: string
    conversationId: string
    contactId: string
  }) => {
    return n8nFetch("/end_conversation", params)
  },
}

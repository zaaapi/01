import {
  Tenant,
  User,
  NeuroCore,
  Agent,
  Contact,
  Conversation,
  Message,
  BaseConhecimento,
  Synapse,
  Feedback,
  QuickReplyTemplate,
  FeatureModule,
  AgentType,
  AgentFunction,
  AgentGender,
  ContactStatus,
  ConversationStatus,
  MessageSenderType,
  FeedbackType,
  FeedbackStatus,
  SynapseStatus,
  UserRole,
  AgentInstruction,
  AgentLimitation,
  AgentConversationRoteiro,
  AgentOtherInstruction,
} from "@/types"

// ===== TENANT MAPPERS =====

export const mapTenantFromDB = (data: any): Tenant => ({
  id: data.id,
  name: data.name,
  neurocoreId: data.neurocore_id,
  isActive: data.is_active ?? true,
  cnpj: data.cnpj || "",
  phone: data.phone || "",
  responsibleTech: {
    name: data.responsible_tech_name || "",
    whatsapp: data.responsible_tech_whatsapp || "",
    email: data.responsible_tech_email || "",
  },
  responsibleFinance: {
    name: data.responsible_finance_name || "",
    whatsapp: data.responsible_finance_whatsapp || "",
    email: data.responsible_finance_email || "",
  },
  plan: data.plan || "Basic",
  createdAt: data.created_at || new Date().toISOString(),
})

export const mapTenantToDB = (tenant: Partial<Tenant>): Record<string, unknown> => {
  const dbData: Record<string, unknown> = {}

  if (tenant.name !== undefined) dbData.name = tenant.name
  if (tenant.neurocoreId !== undefined) dbData.neurocore_id = tenant.neurocoreId
  if (tenant.isActive !== undefined) dbData.is_active = tenant.isActive
  if (tenant.cnpj !== undefined) dbData.cnpj = tenant.cnpj
  if (tenant.phone !== undefined) dbData.phone = tenant.phone
  if (tenant.responsibleTech !== undefined) {
    dbData.responsible_tech_name = tenant.responsibleTech.name
    dbData.responsible_tech_whatsapp = tenant.responsibleTech.whatsapp
    dbData.responsible_tech_email = tenant.responsibleTech.email
  }
  if (tenant.responsibleFinance !== undefined) {
    dbData.responsible_finance_name = tenant.responsibleFinance.name
    dbData.responsible_finance_whatsapp = tenant.responsibleFinance.whatsapp
    dbData.responsible_finance_email = tenant.responsibleFinance.email
  }
  if (tenant.plan !== undefined) dbData.plan = tenant.plan

  return dbData
}

// ===== USER MAPPERS =====

export const mapUserFromDB = (data: any): User => ({
  id: data.id,
  tenantId: data.tenant_id || null,
  fullName: data.full_name || data.email,
  email: data.email,
  whatsappNumber: data.whatsapp_number || "",
  role: data.role as UserRole,
  avatarUrl: data.avatar_url || "",
  modules: (data.modules || []) as User["modules"],
  isActive: data.is_active ?? true,
  lastSignInAt: data.last_sign_in_at || null,
  createdAt: data.created_at || new Date().toISOString(),
})

export const mapUserToDB = (user: Partial<User>): Record<string, unknown> => {
  const dbData: Record<string, unknown> = {}

  if (user.tenantId !== undefined) dbData.tenant_id = user.tenantId
  if (user.fullName !== undefined) dbData.full_name = user.fullName
  if (user.email !== undefined) dbData.email = user.email
  if (user.whatsappNumber !== undefined) dbData.whatsapp_number = user.whatsappNumber
  if (user.role !== undefined) dbData.role = user.role
  if (user.avatarUrl !== undefined) dbData.avatar_url = user.avatarUrl
  if (user.modules !== undefined) dbData.modules = user.modules
  if (user.isActive !== undefined) dbData.is_active = user.isActive

  return dbData
}

// ===== NEUROCORE MAPPERS =====

export const mapNeuroCoreFromDB = (data: any): NeuroCore => ({
  id: data.id,
  name: data.name,
  description: data.description || "",
  niche: data.niche || "",
  apiUrl: data.api_url,
  apiSecret: data.api_secret,
  isActive: data.is_active ?? true,
  associatedAgents: (data.associated_agents || []) as string[],
  createdAt: data.created_at || new Date().toISOString(),
})

export const mapNeuroCoreToDB = (neurocore: Partial<NeuroCore>): Record<string, unknown> => {
  const dbData: Record<string, unknown> = {}

  if (neurocore.name !== undefined) dbData.name = neurocore.name
  if (neurocore.description !== undefined) dbData.description = neurocore.description
  if (neurocore.niche !== undefined) dbData.niche = neurocore.niche
  if (neurocore.apiUrl !== undefined) dbData.api_url = neurocore.apiUrl
  if (neurocore.apiSecret !== undefined) dbData.api_secret = neurocore.apiSecret
  if (neurocore.isActive !== undefined) dbData.is_active = neurocore.isActive
  if (neurocore.associatedAgents !== undefined)
    dbData.associated_agents = neurocore.associatedAgents

  return dbData
}

// ===== AGENT MAPPERS =====

export const mapAgentFromDB = (data: any): Agent => ({
  id: data.id,
  name: data.name,
  type: data.type as AgentType,
  function: data.function as AgentFunction,
  gender: data.gender as AgentGender | null,
  persona: data.persona || "",
  personalityTone: data.personality_tone || "",
  communicationMedium: data.communication_medium || "",
  objective: data.objective || "",
  instructions: (data.instructions || []) as AgentInstruction[],
  limitations: (data.limitations || []) as AgentLimitation[],
  conversationRoteiro: (data.conversation_roteiro || []) as AgentConversationRoteiro[],
  otherInstructions: (data.other_instructions || []) as AgentOtherInstruction[],
  isIntentAgent: data.is_intent_agent ?? false,
  associatedNeuroCores: (data.associated_neurocores || []) as string[],
  createdAt: data.created_at || new Date().toISOString(),
})

export const mapAgentToDB = (agent: Partial<Agent>): Record<string, unknown> => {
  const dbData: Record<string, unknown> = {}

  if (agent.name !== undefined) dbData.name = agent.name
  if (agent.type !== undefined) dbData.type = agent.type
  if (agent.function !== undefined) dbData.function = agent.function
  if (agent.gender !== undefined) dbData.gender = agent.gender
  if (agent.persona !== undefined) dbData.persona = agent.persona
  if (agent.personalityTone !== undefined) dbData.personality_tone = agent.personalityTone
  if (agent.communicationMedium !== undefined)
    dbData.communication_medium = agent.communicationMedium
  if (agent.objective !== undefined) dbData.objective = agent.objective
  if (agent.instructions !== undefined) dbData.instructions = agent.instructions
  if (agent.limitations !== undefined) dbData.limitations = agent.limitations
  if (agent.conversationRoteiro !== undefined)
    dbData.conversation_roteiro = agent.conversationRoteiro
  if (agent.otherInstructions !== undefined) dbData.other_instructions = agent.otherInstructions
  if (agent.isIntentAgent !== undefined) dbData.is_intent_agent = agent.isIntentAgent
  if (agent.associatedNeuroCores !== undefined)
    dbData.associated_neurocores = agent.associatedNeuroCores

  return dbData
}

// ===== CONTACT MAPPERS =====

export const mapContactFromDB = (data: any): Contact => ({
  id: data.id,
  tenantId: data.tenant_id,
  name: data.name,
  phone: data.phone,
  phoneSecondary: data.phone_secondary || null,
  email: data.email || null,
  country: data.country || null,
  city: data.city || null,
  zipCode: data.zip_code || null,
  addressStreet: data.address_street || null,
  addressNumber: data.address_number || null,
  addressComplement: data.address_complement || null,
  cpf: data.cpf || null,
  rg: data.rg || null,
  lastInteraction: data.last_interaction || new Date().toISOString(),
  status: data.status as ContactStatus,
  customerDataExtracted: data.customer_data_extracted || null,
  tags: data.tags || null,
  lastNegotiation: data.last_negotiation || null,
  createdAt: data.created_at || new Date().toISOString(),
})

export const mapContactToDB = (contact: Partial<Contact>): Record<string, unknown> => {
  const dbData: Record<string, unknown> = {}

  if (contact.tenantId !== undefined) dbData.tenant_id = contact.tenantId
  if (contact.name !== undefined) dbData.name = contact.name
  if (contact.phone !== undefined) dbData.phone = contact.phone
  if (contact.phoneSecondary !== undefined) dbData.phone_secondary = contact.phoneSecondary
  if (contact.email !== undefined) dbData.email = contact.email
  if (contact.country !== undefined) dbData.country = contact.country
  if (contact.city !== undefined) dbData.city = contact.city
  if (contact.zipCode !== undefined) dbData.zip_code = contact.zipCode
  if (contact.addressStreet !== undefined) dbData.address_street = contact.addressStreet
  if (contact.addressNumber !== undefined) dbData.address_number = contact.addressNumber
  if (contact.addressComplement !== undefined) dbData.address_complement = contact.addressComplement
  if (contact.cpf !== undefined) dbData.cpf = contact.cpf
  if (contact.rg !== undefined) dbData.rg = contact.rg
  if (contact.lastInteraction !== undefined) dbData.last_interaction = contact.lastInteraction
  if (contact.status !== undefined) dbData.status = contact.status
  if (contact.customerDataExtracted !== undefined)
    dbData.customer_data_extracted = contact.customerDataExtracted
  if (contact.tags !== undefined) dbData.tags = contact.tags
  if (contact.lastNegotiation !== undefined) dbData.last_negotiation = contact.lastNegotiation

  return dbData
}

// ===== CONVERSATION MAPPERS =====

export const mapConversationFromDB = (data: any): Conversation => ({
  id: data.id,
  contactId: data.contact_id,
  tenantId: data.tenant_id,
  status: data.status as ConversationStatus,
  iaActive: data.ia_active ?? false,
  lastMessageAt: data.last_message_at || new Date().toISOString(),
  overallFeedback: data.overall_feedback_type
    ? {
        type: data.overall_feedback_type as FeedbackType,
        text: data.overall_feedback_text || null,
      }
    : null,
  overallFeedbackType: data.overall_feedback_type || null,
  overallFeedbackText: data.overall_feedback_text || null,
  createdAt: data.created_at || new Date().toISOString(),
})

export const mapConversationToDB = (
  conversation: Partial<Conversation>
): Record<string, unknown> => {
  const dbData: Record<string, unknown> = {}

  if (conversation.contactId !== undefined) dbData.contact_id = conversation.contactId
  if (conversation.tenantId !== undefined) dbData.tenant_id = conversation.tenantId
  if (conversation.status !== undefined) dbData.status = conversation.status
  if (conversation.iaActive !== undefined) dbData.ia_active = conversation.iaActive
  if (conversation.lastMessageAt !== undefined) dbData.last_message_at = conversation.lastMessageAt
  if (conversation.overallFeedback !== undefined) {
    dbData.overall_feedback_type = conversation.overallFeedback?.type || null
    dbData.overall_feedback_text = conversation.overallFeedback?.text || null
  }

  return dbData
}

// ===== MESSAGE MAPPERS =====

export const mapMessageFromDB = (data: any): Message => ({
  id: data.id,
  conversationId: data.conversation_id,
  senderType: data.sender_type as MessageSenderType,
  senderId: data.sender_id || null,
  content: data.content,
  timestamp: data.timestamp || new Date().toISOString(),
  feedback: data.feedback_type
    ? {
        type: data.feedback_type as FeedbackType,
        text: data.feedback_text || null,
      }
    : null,
})

export const mapMessageToDB = (message: Partial<Message>): Record<string, unknown> => {
  const dbData: Record<string, unknown> = {}

  if (message.conversationId !== undefined) dbData.conversation_id = message.conversationId
  if (message.senderType !== undefined) dbData.sender_type = message.senderType
  if (message.senderId !== undefined) dbData.sender_id = message.senderId
  if (message.content !== undefined) dbData.content = message.content
  if (message.timestamp !== undefined) dbData.timestamp = message.timestamp
  if (message.feedback !== undefined) {
    dbData.feedback_type = message.feedback?.type || null
    dbData.feedback_text = message.feedback?.text || null
  }

  return dbData
}

// ===== BASE CONHECIMENTO MAPPERS =====

export const mapBaseConhecimentoFromDB = (data: any): BaseConhecimento => ({
  id: data.id,
  tenantId: data.tenant_id,
  name: data.name,
  description: data.description,
  neurocoreId: data.neurocore_id,
  isActive: data.is_active ?? true,
  createdAt: data.created_at || new Date().toISOString(),
})

export const mapBaseConhecimentoToDB = (
  base: Partial<BaseConhecimento>
): Record<string, unknown> => {
  const dbData: Record<string, unknown> = {}

  if (base.tenantId !== undefined) dbData.tenant_id = base.tenantId
  if (base.name !== undefined) dbData.name = base.name
  if (base.description !== undefined) dbData.description = base.description
  if (base.neurocoreId !== undefined) dbData.neurocore_id = base.neurocoreId
  if (base.isActive !== undefined) dbData.is_active = base.isActive

  return dbData
}

// ===== SYNAPSE MAPPERS =====

export const mapSynapseFromDB = (data: any): Synapse => ({
  id: data.id,
  baseConhecimentoId: data.base_conhecimento_id,
  tenantId: data.tenant_id,
  title: data.title,
  description: data.description,
  imageUrl: data.image_url || null,
  status: data.status as SynapseStatus,
  createdAt: data.created_at || new Date().toISOString(),
})

export const mapSynapseToDB = (synapse: Partial<Synapse>): Record<string, unknown> => {
  const dbData: Record<string, unknown> = {}

  if (synapse.baseConhecimentoId !== undefined)
    dbData.base_conhecimento_id = synapse.baseConhecimentoId
  if (synapse.tenantId !== undefined) dbData.tenant_id = synapse.tenantId
  if (synapse.title !== undefined) dbData.title = synapse.title
  if (synapse.description !== undefined) dbData.description = synapse.description
  if (synapse.imageUrl !== undefined) dbData.image_url = synapse.imageUrl
  if (synapse.status !== undefined) dbData.status = synapse.status

  return dbData
}

// ===== FEEDBACK MAPPERS =====

export const mapFeedbackFromDB = (data: any): Feedback => ({
  id: data.id,
  tenantId: data.tenant_id,
  userId: data.user_id,
  conversationId: data.conversation_id,
  messageId: data.message_id || null,
  feedbackType: data.feedback_type as FeedbackType,
  feedbackText: data.feedback_text || null,
  feedbackStatus: data.feedback_status as FeedbackStatus,
  superAdminComment: data.super_admin_comment || null,
  createdAt: data.created_at || new Date().toISOString(),
})

export const mapFeedbackToDB = (feedback: Partial<Feedback>): Record<string, unknown> => {
  const dbData: Record<string, unknown> = {}

  if (feedback.tenantId !== undefined) dbData.tenant_id = feedback.tenantId
  if (feedback.userId !== undefined) dbData.user_id = feedback.userId
  if (feedback.conversationId !== undefined) dbData.conversation_id = feedback.conversationId
  if (feedback.messageId !== undefined) dbData.message_id = feedback.messageId
  if (feedback.feedbackType !== undefined) dbData.feedback_type = feedback.feedbackType
  if (feedback.feedbackText !== undefined) dbData.feedback_text = feedback.feedbackText
  if (feedback.feedbackStatus !== undefined) dbData.feedback_status = feedback.feedbackStatus
  if (feedback.superAdminComment !== undefined)
    dbData.super_admin_comment = feedback.superAdminComment

  return dbData
}

// ===== QUICK REPLY TEMPLATE MAPPERS =====

export const mapQuickReplyTemplateFromDB = (data: any): QuickReplyTemplate => ({
  id: data.id,
  tenantId: data.tenant_id,
  title: data.title,
  message: data.message,
  icon: data.icon || null,
  usageCount: data.usage_count || 0,
  createdAt: data.created_at || new Date().toISOString(),
})

export const mapQuickReplyTemplateToDB = (
  template: Partial<QuickReplyTemplate>
): Record<string, unknown> => {
  const dbData: Record<string, unknown> = {}

  if (template.tenantId !== undefined) dbData.tenant_id = template.tenantId
  if (template.title !== undefined) dbData.title = template.title
  if (template.message !== undefined) dbData.message = template.message
  if (template.icon !== undefined) dbData.icon = template.icon
  if (template.usageCount !== undefined) dbData.usage_count = template.usageCount

  return dbData
}

// ===== FEATURE MODULE MAPPERS =====

export const mapFeatureModuleFromDB = (data: any): FeatureModule => ({
  id: data.id,
  key: data.key as FeatureModule["key"],
  name: data.name,
  description: data.description || "",
  icon: data.icon || "settings",
})

// User Roles
export type UserRole = "super_admin" | "usuario_cliente"

// Feature Modules
export type FeatureModuleKey =
  | "MOD_LIVE_CHAT"
  | "MOD_BASE_CONHECIMENTO"
  | "MOD_PERSONALIZACAO_NEUROCORE"
  | "MOD_TREINAMENTO_NEUROCORE"
  | "MOD_DASHBOARD"

// Agent Types
export type AgentType = "Reativo" | "Ativo"
export type AgentFunction = "Atendimento" | "Vendas" | "Pós-Venda" | "Pesquisa"
export type AgentGender = "Masculino" | "Feminino"

// Conversation Status
export type ConversationStatus = "Conversando" | "Pausada" | "Encerrada"
export type ContactStatus = "Aberto" | "Com IA" | "Pausada" | "Encerrada"
export type SenderType = "customer" | "atendente" | "ia"

// Synapse Status
export type SynapseStatus = "RASCUNHO" | "INDEXANDO" | "PUBLICANDO" | "ERROR"

// Feedback Types
export type FeedbackType = "like" | "dislike"
export type FeedbackStatus = "Em Aberto" | "Sendo Tratado" | "Encerrado"

// Filter Types
export type PeriodFilter = "7d" | "30d" | "total"
export type ConversationSelectionFilter = "ia_now" | "paused_now" | "all"

// Entities
export interface Tenant {
  id: string
  name: string
  neurocoreId: string
  isActive: boolean
  cnpj: string
  phone: string
  responsibleTech: {
    name: string
    whatsapp: string
    email: string
  }
  responsibleFinance: {
    name: string
    whatsapp: string
    email: string
  }
  plan: string
}

export interface User {
  id: string
  tenantId: string | null
  fullName: string
  email: string
  whatsappNumber: string
  role: UserRole
  avatarUrl: string
  modules: FeatureModuleKey[]
  lastSignInAt: string | null
  isActive: boolean
}

export interface FeatureModule {
  id: string
  key: FeatureModuleKey
  name: string
  description: string
  icon: string
}

export interface NeuroCore {
  id: string
  name: string
  description: string
  niche: string
  apiUrl: string
  apiSecret: string
  isActive: boolean
  associatedAgents: string[]
}

export interface AgentInstruction {
  id: string
  title: string
  description: string
  isActive: boolean
  order: number
}

export interface AgentLimitation {
  id: string
  title: string
  description: string
  isActive: boolean
  order: number
}

export interface AgentConversationRoteiro {
  id: string
  title: string
  mainInstruction: string
  subTasks: string[] | null
  isActive: boolean
  order: number
}

export interface AgentOtherInstruction {
  id: string
  title: string
  description: string
  isActive: boolean
  order: number
}

export interface Agent {
  id: string
  name: string
  type: AgentType
  function: AgentFunction
  gender: AgentGender | null
  persona: string
  personalityTone: string
  communicationMedium: string
  objective: string
  instructions: AgentInstruction[]
  limitations: AgentLimitation[]
  conversationRoteiro: AgentConversationRoteiro[]
  otherInstructions: AgentOtherInstruction[]
  isIntentAgent: boolean
  associatedNeuroCores: string[]
}

export interface Contact {
  id: string
  tenantId: string
  name: string
  phone: string
  phoneSecondary: string | null
  email: string | null
  country: string | null
  city: string | null
  zipCode: string | null
  addressStreet: string | null
  addressNumber: string | null
  addressComplement: string | null
  cpf: string | null
  rg: string | null
  lastInteraction: string
  status: ContactStatus
  customerDataExtracted: Record<string, any>
  tags: string[] | null
  lastNegotiation: Record<string, any> | null
}

export interface Conversation {
  id: string
  contactId: string
  tenantId: string
  status: ConversationStatus
  iaActive: boolean
  lastMessageAt: string
  overallFeedback: {
    type: FeedbackType
    text: string
  } | null
}

export interface Message {
  id: string
  conversationId: string
  senderType: SenderType
  senderId: string | null
  content: string
  timestamp: string
  feedback: {
    type: FeedbackType
    text: string
  } | null
}

export interface BaseConhecimento {
  id: string
  tenantId: string
  name: string
  description: string
  neurocoreId: string
  isActive: boolean
}

export interface Synapse {
  id: string
  baseConhecimentoId: string
  tenantId: string
  title: string
  description: string
  imageUrl: string | null
  status: SynapseStatus
}

export interface Feedback {
  id: string
  tenantId: string
  userId: string
  conversationId: string
  messageId: string | null
  feedbackType: FeedbackType
  feedbackText: string | null
  feedbackStatus: FeedbackStatus
  superAdminComment: string | null
  createdAt: string
}

export interface GlobalFilters {
  period: PeriodFilter
  conversationSelection: ConversationSelectionFilter
}

export interface QuickReplyTemplate {
  id: string
  tenantId: string
  title: string
  message: string
  icon: string
  usageCount: number
}

// App State
export interface AppState {
  tenants: Tenant[]
  users: User[]
  featureModules: FeatureModule[]
  neurocores: NeuroCore[]
  agents: Agent[]
  contacts: Contact[]
  conversations: Conversation[]
  messages: Message[]
  baseConhecimento: BaseConhecimento[]
  synapses: Synapse[]
  feedbacks: Feedback[]
  quickReplyTemplates: QuickReplyTemplate[]
  currentUser: User | null
  globalFilters: GlobalFilters
}


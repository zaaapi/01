// --- ENUMS ---

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  USUARIO_CLIENTE = "usuario_cliente",
}

export enum AgentType {
  REATIVO = "Reativo",
  ATIVO = "Ativo",
}

export enum AgentFunction {
  ATENDIMENTO = "Atendimento",
  VENDAS = "Vendas",
  POS_VENDA = "Pós-Venda",
  PESQUISA = "Pesquisa",
}

export enum AgentGender {
  MASCULINO = "Masculino",
  FEMININO = "Feminino",
}

export enum ContactStatus {
  ABERTO = "Aberto",
  COM_IA = "Com IA",
  PAUSADA = "Pausada",
  ENCERRADA = "Encerrada",
}

export enum ConversationStatus {
  CONVERSANDO = "Conversando",
  PAUSADA = "Pausada",
  ENCERRADA = "Encerrada",
}

export enum MessageSenderType {
  CUSTOMER = "customer",
  ATENDENTE = "atendente",
  IA = "ia",
}

export enum FeedbackType {
  LIKE = "like",
  DISLIKE = "dislike",
}

export enum FeedbackStatus {
  EM_ABERTO = "Em Aberto",
  SENDO_TRATADO = "Sendo Tratado",
  ENCERRADO = "Encerrado",
}

export enum SynapseStatus {
  RASCUNHO = "RASCUNHO",
  INDEXANDO = "INDEXANDO",
  PUBLICANDO = "PUBLICANDO",
  ERROR = "ERROR",
}

export enum GlobalFilterPeriod {
  SEVEN_DAYS = "7d",
  THIRTY_DAYS = "30d",
  TOTAL = "total",
}

export enum GlobalFilterConversationSelection {
  IA_NOW = "ia_now",
  PAUSED_NOW = "paused_now",
  ALL = "all",
}

// Feature Modules
export type FeatureModuleKey =
  | "MOD_LIVE_CHAT"
  | "MOD_BASE_CONHECIMENTO"
  | "MOD_PERSONALIZACAO_NEUROCORE"
  | "MOD_TREINAMENTO_NEUROCORE"
  | "MOD_DASHBOARD"

// --- INTERFACES ---

export interface ResponsibleContact {
  name: string
  whatsapp: string
  email: string
}

export interface Tenant {
  id: string
  name: string
  neurocoreId: string // ID do NeuroCore principal associado a este tenant
  isActive: boolean
  cnpj: string
  phone: string
  responsibleTech: ResponsibleContact
  responsibleFinance: ResponsibleContact
  plan: string // Ex: "Starter", "Pro", "Enterprise"
  createdAt: string // ISO Date
}

export interface FeatureModule {
  id: string
  key: FeatureModuleKey // ex: 'MOD_LIVE_CHAT'
  name: string
  description: string
  icon: string // Lucide Icon name
}

export interface User {
  id: string
  tenantId: string | null // null for super_admin
  fullName: string
  email: string
  whatsappNumber: string
  role: UserRole
  avatarUrl: string
  modules: FeatureModuleKey[] // Array of FeatureModule.key
  isActive: boolean // Add isActive to user entity
  lastSignInAt: string | null // ISO Date, null if never signed in
  createdAt: string // ISO Date
}

export interface NeuroCore {
  id: string
  name: string
  description: string
  niche: string
  apiUrl: string
  apiSecret: string
  isActive: boolean
  associatedAgents: string[] // Array of Agent.id
  createdAt: string // ISO Date
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
  isIntentAgent: boolean // Flag para identificar o Agente de Intenções
  associatedNeuroCores: string[] // Array of NeuroCore.id
  createdAt: string // ISO Date
}

export interface ContactCustomerDataExtracted {
  [key: string]: string // ex: { "tipoServico": "consultoria", "valorEstimado": "R$ 5000" }
}

export interface ContactLastNegotiation {
  [key: string]: any // JSON dinâmico
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
  lastInteraction: string // ISO Date
  status: ContactStatus
  customerDataExtracted: ContactCustomerDataExtracted | null
  tags: string[] | null
  lastNegotiation: ContactLastNegotiation | null
  createdAt: string // ISO Date
}

export interface ConversationOverallFeedback {
  type: FeedbackType
  text: string | null
}

export interface Conversation {
  id: string
  contactId: string
  tenantId: string
  status: ConversationStatus
  iaActive: boolean
  lastMessageAt: string // ISO Date
  overallFeedback: ConversationOverallFeedback | null
  overallFeedbackType?: FeedbackType | null // Compatibilidade com DB
  overallFeedbackText?: string | null // Compatibilidade com DB
  createdAt: string // ISO Date
}

export interface MessageFeedback {
  type: FeedbackType
  text: string | null
}

export interface Message {
  id: string
  conversationId: string
  senderType: MessageSenderType
  senderId: string | null // user.id if atendente, agent.id if ia, null if customer
  content: string
  timestamp: string // ISO Date
  feedback: MessageFeedback | null // Apenas para mensagens de IA
}

export interface BaseConhecimento {
  id: string
  tenantId: string
  name: string
  description: string
  neurocoreId: string // ID do NeuroCore associado (desabilitado para edição pelo cliente)
  isActive: boolean
  createdAt: string // ISO Date
}

export interface Synapse {
  id: string
  baseConhecimentoId: string
  tenantId: string // Para facilitar filtros e RLS posterior
  title: string
  description: string
  imageUrl: string | null
  status: SynapseStatus
  createdAt: string // ISO Date
}

export interface Feedback {
  id: string
  tenantId: string
  userId: string // Quem deu o feedback
  conversationId: string
  messageId: string | null // se for feedback de mensagem específica
  feedbackType: FeedbackType
  feedbackText: string | null
  feedbackStatus: FeedbackStatus
  superAdminComment: string | null
  createdAt: string // ISO Date
}

export interface QuickReplyTemplate {
  id: string
  tenantId: string
  title: string
  message: string
  icon: string | null // Emoji ou nome de ícone, ex: '🥳', '💡', '💰'
  usageCount: number // Para ordenar as 10 mais usadas
  createdAt: string // ISO Date
}

// --- GLOBAL STATE ---

export interface GlobalFilters {
  period: GlobalFilterPeriod
  conversationSelection: GlobalFilterConversationSelection
}

export interface MockAppState {
  tenants: Tenant[]
  users: User[]
  featureModules: FeatureModule[]
  neurocores: NeuroCore[]
  agents: Agent[]
  contacts: Contact[]
  conversations: Conversation[]
  messages: Message[]
  baseConhecimentos: BaseConhecimento[] // Plural conforme prompt
  synapses: Synapse[]
  feedbacks: Feedback[]
  quickReplyTemplates: QuickReplyTemplate[]
  globalFilters: GlobalFilters // Filters for dashboards
  currentAuthUser: User | null // Currently logged-in user (renomeado de currentUser)
}

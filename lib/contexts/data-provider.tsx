"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import {
  MockAppState,
  Tenant,
  User,
  NeuroCore,
  Agent,
  AgentInstruction,
  AgentLimitation,
  AgentConversationRoteiro,
  AgentOtherInstruction,
  Contact,
  Conversation,
  Message,
  BaseConhecimento,
  Synapse,
  Feedback,
  QuickReplyTemplate,
  GlobalFilters,
  GlobalFilterPeriod,
  GlobalFilterConversationSelection,
  ConversationStatus,
  FeedbackType,
  SynapseStatus,
} from "@/types"
import { getLocalData, setLocalData } from "@/lib/local-storage"
import { seedData } from "@/lib/seed-data"
import { createSupabaseClient } from "@/db"
import { FeatureModule } from "@/types"
import dayjs from "dayjs"

interface DataContextType {
  state: MockAppState
  isLoading: boolean
  
  // Tenants - Fetch Functions (Task 6)
  fetchTenants: (filter?: "all" | "active" | "inactive") => Promise<Tenant[]>
  createTenant: (tenant: Omit<Tenant, "id" | "createdAt">) => Promise<void>
  updateTenant: (id: string, updates: Partial<Tenant>) => Promise<void>
  deleteTenant: (id: string) => Promise<void>
  
  // Users - Fetch Functions (Task 6)
  fetchUsersByTenant: (tenantId: string) => Promise<User[]>
  fetchAllFeatureModules: () => Promise<FeatureModule[]>
  createUser: (user: Omit<User, "id" | "createdAt">) => Promise<void>
  updateUser: (id: string, updates: Partial<User>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  
  // Supabase Profile Functions (Task 5)
  fetchUserProfile: (userId: string) => Promise<User | null>
  fetchTenantProfile: (tenantId: string) => Promise<Tenant | null>
  updateUserProfile: (userId: string, data: Partial<User>) => Promise<void>
  updateTenantProfile: (tenantId: string, data: Partial<Tenant>) => Promise<void>
  
  // NeuroCores - Fetch Functions (Task 7)
  fetchNeurocores: () => Promise<NeuroCore[]>
  createNeuroCore: (neurocore: Omit<NeuroCore, "id" | "createdAt">) => Promise<void>
  updateNeuroCore: (id: string, updates: Partial<NeuroCore>) => Promise<void>
  deleteNeuroCore: (id: string) => Promise<void>
  
  // Agents - Fetch Functions (Task 7, Task 12)
  fetchAgents: () => Promise<Agent[]>
  fetchAgentsByTenantNeurocore: (tenantId: string, neurocoreId: string) => Promise<Agent[]>
  createAgent: (agent: Omit<Agent, "id" | "createdAt">) => Promise<void>
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>
  deleteAgent: (id: string) => Promise<void>
  
  // Contacts - Fetch Functions (Task 13)
  fetchContacts: (tenantId: string, filters?: { status?: string, search?: string, searchField?: 'name' | 'phone' | 'email' }) => Promise<Contact[]>
  fetchContact: (id: string) => Promise<Contact | null>
  createContact: (contact: Omit<Contact, "id" | "createdAt">) => Promise<void>
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>
  deleteContact: (id: string) => Promise<void>
  
  // Conversations - Fetch Functions (Task 13)
  fetchConversationsByContact: (contactId: string, tenantId: string, filters?: { status?: string }) => Promise<Conversation[]>
  createConversation: (conversation: Omit<Conversation, "id" | "createdAt">) => Promise<void>
  updateConversation: (id: string, updates: Partial<Conversation>) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  
  // Messages - Fetch Functions (Task 13)
  fetchMessagesByConversation: (conversationId: string) => Promise<Message[]>
  createMessage: (message: Omit<Message, "id">) => Promise<void>
  updateMessage: (id: string, updates: Partial<Message>) => Promise<void>
  updateMessageFeedback: (id: string, data: { feedback_type: 'like' | 'dislike', feedback_text?: string }) => Promise<void>
  deleteMessage: (id: string) => Promise<void>
  
  // BaseConhecimento - Fetch Functions (Task 11)
  fetchBaseConhecimentos: (tenantId: string) => Promise<BaseConhecimento[]>
  createBaseConhecimento: (base: Omit<BaseConhecimento, "id" | "createdAt">) => Promise<void>
  updateBaseConhecimento: (id: string, updates: Partial<BaseConhecimento>) => Promise<void>
  deleteBaseConhecimento: (id: string) => Promise<void>
  
  // Synapses - Fetch Functions (Task 11)
  fetchSynapsesByBase: (baseConhecimentoId: string, tenantId: string) => Promise<Synapse[]>
  createSynapse: (synapse: Omit<Synapse, "id" | "createdAt">) => Promise<void>
  updateSynapse: (id: string, updates: Partial<Synapse>) => Promise<void>
  deleteSynapse: (id: string) => Promise<void>
  
  // Feedbacks - Fetch Functions (Task 9)
  fetchFeedbacks: () => Promise<Feedback[]>
  fetchConversationMessages: (conversationId: string) => Promise<Message[]>
  createFeedback: (feedback: Omit<Feedback, "id" | "createdAt">) => Promise<void>
  updateFeedback: (id: string, updates: Partial<Feedback>) => Promise<void>
  deleteFeedback: (id: string) => Promise<void>
  
  // QuickReplyTemplates - Fetch Functions (Task 13)
  fetchQuickReplyTemplates: (tenantId: string, orderByUsage?: boolean) => Promise<QuickReplyTemplate[]>
  createQuickReplyTemplate: (template: Omit<QuickReplyTemplate, "id" | "createdAt">) => Promise<void>
  updateQuickReplyTemplate: (id: string, updates: Partial<QuickReplyTemplate>) => Promise<void>
  deleteQuickReplyTemplate: (id: string) => Promise<void>
  incrementQuickReplyUsage: (id: string) => Promise<void>
  
  // Global Filters
  updateGlobalFilters: (filters: Partial<GlobalFilters>) => Promise<void>
  
  // Reset data
  resetData: () => Promise<void>
  
  // Dashboard - Fetch Functions (Task 10)
  fetchDashboardKpis: (filters: { period: string; conversationSelection: string }) => Promise<{
    activeTenants: number
    totalTenants: number
    conversationsWithIA: number
    pausedConversations: number
  }>
  fetchConversationsByHour: (filters: { period: string; conversationSelection: string }) => Promise<{
    hora: string
    conversas: number
  }[]>
  fetchConversationKeywords: (filters: { period: string; conversationSelection: string }) => Promise<{
    word: string
    count: number
  }[]>
  fetchTenantListWithConversationCounts: (filters: { period: string; conversationSelection: string }) => Promise<Array<{
    id: string
    name: string
    neurocoreName: string
    userCount: number
    openConversations: number
    pausedConversations: number
    closedConversations: number
    isActive: boolean
  }>>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Simular delay de API (300-500ms)
const simulateDelay = () => new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))

// Helper para gerar UUID simples (para uso no cliente)
function generateUUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MockAppState>(seedData)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Carregar dados do localStorage e Supabase na inicialização
    const loadData = async () => {
      await simulateDelay()
      const localData = getLocalData()
      const supabase = createSupabaseClient()

      // Buscar featureModules do Supabase
      let featureModules: FeatureModule[] = localData.featureModules
      try {
        const { data: featureModulesData, error: featureModulesError } = await supabase
          .from("feature_modules")
          .select("*")
          .order("name")

        if (featureModulesData && !featureModulesError) {
          featureModules = featureModulesData.map((fm) => ({
            id: fm.id,
            key: fm.key as FeatureModule["key"],
            name: fm.name,
            description: fm.description || "",
            icon: fm.icon || "settings",
          }))
        } else if (featureModulesError) {
          console.warn("Erro ao buscar featureModules do Supabase, usando dados mock:", featureModulesError)
        }
      } catch (error) {
        console.warn("Erro ao buscar featureModules do Supabase, usando dados mock:", error)
      }

      // Buscar channelProviders do Supabase (se a tabela existir)
      // Por enquanto, manteremos como mock se não existir
      // Nota: channelProviders não está no MockAppState ainda
      let channelProviders: any[] = []
      try {
        const { data: channelProvidersData, error: channelProvidersError } = await supabase
          .from("channel_providers")
          .select("*")
          .order("name")

        if (channelProvidersData && !channelProvidersError) {
          channelProviders = channelProvidersData.map((cp) => ({
            id: cp.id,
            key: cp.key,
            name: cp.name,
            description: cp.description || "",
            icon: cp.icon || "settings",
            isActive: cp.is_active ?? true,
          }))
        } else if (channelProvidersError) {
          // Se a tabela não existir, não é um erro crítico
          console.debug("Tabela channel_providers não encontrada ou erro:", channelProvidersError)
        }
      } catch (error) {
        console.debug("Erro ao buscar channelProviders do Supabase, usando dados mock:", error)
      }

      // Combinar dados: Supabase para featureModules, localStorage para o resto
      const combinedState: MockAppState = {
        ...localData,
        featureModules,
        // channelProviders será adicionado ao MockAppState quando necessário
      }

      setState(combinedState)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const persistState = useCallback((newState: MockAppState) => {
    setState(newState)
    setLocalData(newState)
  }, [])

  // Generic CRUD helpers
  const createEntity = useCallback(async <T extends { id: string }>(
    entity: Omit<T, "id">,
    arrayKey: keyof MockAppState,
    createdAt?: string
  ) => {
    await simulateDelay()
    const newEntity = {
      ...entity,
      id: generateUUID(),
      ...(createdAt && { createdAt }),
    } as T
    
    const newState = {
      ...state,
      [arrayKey]: [...(state[arrayKey] as unknown as T[]), newEntity],
    } as MockAppState
    
    persistState(newState)
    return newEntity
  }, [state, persistState])

  const updateEntity = useCallback(async <T extends { id: string }>(
    id: string,
    updates: Partial<T>,
    arrayKey: keyof MockAppState
  ) => {
    await simulateDelay()
    const array = state[arrayKey] as unknown as T[]
    const newState = {
      ...state,
      [arrayKey]: array.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    } as MockAppState
    
    persistState(newState)
  }, [state, persistState])

  const deleteEntity = useCallback(async <T extends { id: string }>(
    id: string,
    arrayKey: keyof MockAppState
  ) => {
    await simulateDelay()
    const array = state[arrayKey] as unknown as T[]
    const newState = {
      ...state,
      [arrayKey]: array.filter((item) => item.id !== id),
    } as MockAppState
    
    persistState(newState)
  }, [state, persistState])

  // Tenants - Fetch Functions (Task 6)
  const fetchTenants = useCallback(async (filter: "all" | "active" | "inactive" = "all"): Promise<Tenant[]> => {
    try {
      const supabase = createSupabaseClient()
      let query = supabase.from("tenants").select("*")

      if (filter === "active") {
        query = query.eq("is_active", true)
      } else if (filter === "inactive") {
        query = query.eq("is_active", false)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar tenants:", error)
        return []
      }

      if (!data) {
        return []
      }

      // Mapear dados do Supabase para o tipo Tenant
      return data.map((t) => ({
        id: t.id,
        name: t.name,
        neurocoreId: t.neurocore_id,
        isActive: t.is_active ?? true,
        cnpj: t.cnpj || "",
        phone: t.phone || "",
        responsibleTech: {
          name: t.responsible_tech_name || "",
          whatsapp: t.responsible_tech_whatsapp || "",
          email: t.responsible_tech_email || "",
        },
        responsibleFinance: {
          name: t.responsible_finance_name || "",
          whatsapp: t.responsible_finance_whatsapp || "",
          email: t.responsible_finance_email || "",
        },
        plan: t.plan || "Basic",
        createdAt: t.created_at || new Date().toISOString(),
      }))
    } catch (error) {
      console.error("Exceção ao buscar tenants:", error)
      return []
    }
  }, [])

  const createTenant = useCallback(async (tenant: Omit<Tenant, "id" | "createdAt">) => {
    try {
      const supabase = createSupabaseClient()
      
      // Preparar dados para inserção no Supabase
      const insertData = {
        name: tenant.name,
        neurocore_id: tenant.neurocoreId,
        is_active: tenant.isActive,
        cnpj: tenant.cnpj,
        phone: tenant.phone,
        responsible_tech_name: tenant.responsibleTech.name,
        responsible_tech_whatsapp: tenant.responsibleTech.whatsapp,
        responsible_tech_email: tenant.responsibleTech.email,
        responsible_finance_name: tenant.responsibleFinance.name,
        responsible_finance_whatsapp: tenant.responsibleFinance.whatsapp,
        responsible_finance_email: tenant.responsibleFinance.email,
        plan: tenant.plan,
        master_integration_url: (tenant as any).masterIntegrationUrl || null,
        master_integration_active: (tenant as any).masterIntegrationActive ?? false,
      }

      const { error } = await supabase.from("tenants").insert(insertData)

      if (error) {
        throw new Error(`Erro ao criar tenant: ${error.message}`)
      }

      // Atualizar também no estado local (para sincronização)
      await createEntity({ ...tenant, createdAt: new Date().toISOString() }, "tenants")
    } catch (error) {
      console.error("Erro ao criar tenant:", error)
      throw error
    }
  }, [createEntity])

  const updateTenant = useCallback(async (id: string, updates: Partial<Tenant>) => {
    try {
      const supabase = createSupabaseClient()
      
      // Preparar dados para atualização no Supabase
      const updateData: Record<string, unknown> = {}
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.neurocoreId !== undefined) updateData.neurocore_id = updates.neurocoreId
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive
      if (updates.cnpj !== undefined) updateData.cnpj = updates.cnpj
      if (updates.phone !== undefined) updateData.phone = updates.phone
      if (updates.responsibleTech !== undefined) {
        updateData.responsible_tech_name = updates.responsibleTech.name
        updateData.responsible_tech_whatsapp = updates.responsibleTech.whatsapp
        updateData.responsible_tech_email = updates.responsibleTech.email
      }
      if (updates.responsibleFinance !== undefined) {
        updateData.responsible_finance_name = updates.responsibleFinance.name
        updateData.responsible_finance_whatsapp = updates.responsibleFinance.whatsapp
        updateData.responsible_finance_email = updates.responsibleFinance.email
      }
      if (updates.plan !== undefined) updateData.plan = updates.plan
      if ((updates as any).masterIntegrationUrl !== undefined) updateData.master_integration_url = (updates as any).masterIntegrationUrl
      if ((updates as any).masterIntegrationActive !== undefined) updateData.master_integration_active = (updates as any).masterIntegrationActive

      const { error } = await supabase
        .from("tenants")
        .update(updateData)
        .eq("id", id)

      if (error) {
        throw new Error(`Erro ao atualizar tenant: ${error.message}`)
      }

      // Atualizar também no estado local (para sincronização)
      await updateEntity(id, updates, "tenants")
    } catch (error) {
      console.error("Erro ao atualizar tenant:", error)
      throw error
    }
  }, [updateEntity])

  const deleteTenant = useCallback(async (id: string) => {
    try {
      const supabase = createSupabaseClient()
      
      const { error } = await supabase
        .from("tenants")
        .delete()
        .eq("id", id)

      if (error) {
        throw new Error(`Erro ao excluir tenant: ${error.message}`)
      }

      // Atualizar também no estado local (para sincronização)
      await deleteEntity(id, "tenants")
    } catch (error) {
      console.error("Erro ao excluir tenant:", error)
      throw error
    }
  }, [deleteEntity])

  // Users - Fetch Functions (Task 6)
  const fetchUsersByTenant = useCallback(async (tenantId: string): Promise<User[]> => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar usuários do tenant:", error)
        return []
      }

      if (!data) {
        return []
      }

      // Mapear dados do Supabase para o tipo User
      return data.map((u) => ({
        id: u.id,
        tenantId: u.tenant_id || null,
        fullName: u.full_name || u.email,
        email: u.email,
        whatsappNumber: u.whatsapp_number || "",
        role: u.role as User["role"],
        avatarUrl: u.avatar_url || "",
        modules: (u.modules || []) as User["modules"],
        isActive: u.is_active ?? true,
        lastSignInAt: u.last_sign_in_at || null,
        createdAt: u.created_at || new Date().toISOString(),
      }))
    } catch (error) {
      console.error("Exceção ao buscar usuários do tenant:", error)
      return []
    }
  }, [])

  const fetchAllFeatureModules = useCallback(async (): Promise<FeatureModule[]> => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from("feature_modules")
        .select("*")
        .order("name")

      if (error) {
        console.error("Erro ao buscar feature modules:", error)
        return state.featureModules
      }

      if (!data) {
        return state.featureModules
      }

      return data.map((fm) => ({
        id: fm.id,
        key: fm.key as FeatureModule["key"],
        name: fm.name,
        description: fm.description || "",
        icon: fm.icon || "settings",
      }))
    } catch (error) {
      console.error("Exceção ao buscar feature modules:", error)
      return state.featureModules
    }
  }, [state.featureModules])

  const createUser = useCallback(async (user: Omit<User, "id" | "createdAt">) => {
    try {
      const supabase = createSupabaseClient()
      
      // Preparar dados para inserção no Supabase
      const insertData = {
        tenant_id: user.tenantId,
        full_name: user.fullName,
        email: user.email,
        whatsapp_number: user.whatsappNumber,
        role: user.role,
        avatar_url: user.avatarUrl,
        modules: user.modules,
        is_active: user.isActive,
      }

      const { error } = await supabase.from("users").insert(insertData)

      if (error) {
        throw new Error(`Erro ao criar usuário: ${error.message}`)
      }

      // Atualizar também no estado local (para sincronização)
      await createEntity({ ...user, createdAt: new Date().toISOString() }, "users")
    } catch (error) {
      console.error("Erro ao criar usuário:", error)
      throw error
    }
  }, [createEntity])

  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    try {
      const supabase = createSupabaseClient()
      
      // Preparar dados para atualização no Supabase
      const updateData: Record<string, unknown> = {}
      if (updates.fullName !== undefined) updateData.full_name = updates.fullName
      if (updates.whatsappNumber !== undefined) updateData.whatsapp_number = updates.whatsappNumber
      if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl
      if (updates.modules !== undefined) updateData.modules = updates.modules
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive
      // Nota: email não deve ser atualizado aqui, pois está no auth.users do Supabase
      // Se necessário atualizar email, isso deve ser feito via Supabase Auth Admin API

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", id)

      if (error) {
        throw new Error(`Erro ao atualizar usuário: ${error.message}`)
      }

      // Atualizar também no estado local (para sincronização)
      await updateEntity(id, updates, "users")
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error)
      throw error
    }
  }, [updateEntity])

  const deleteUser = useCallback(async (id: string) => {
    try {
      const supabase = createSupabaseClient()
      
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", id)

      if (error) {
        throw new Error(`Erro ao excluir usuário: ${error.message}`)
      }

      // Atualizar também no estado local (para sincronização)
      await deleteEntity(id, "users")
    } catch (error) {
      console.error("Erro ao excluir usuário:", error)
      throw error
    }
  }, [deleteEntity])

  // NeuroCores - Fetch Functions (Task 7)
  const fetchNeurocores = useCallback(async (): Promise<NeuroCore[]> => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from("neurocores")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar neurocores:", error)
        return []
      }

      if (!data) {
        return []
      }

      // Mapear dados do Supabase para o tipo NeuroCore
      return data.map((nc) => ({
        id: nc.id,
        name: nc.name,
        description: nc.description || "",
        niche: nc.niche || "",
        apiUrl: nc.api_url,
        apiSecret: nc.api_secret,
        isActive: nc.is_active ?? true,
        associatedAgents: (nc.associated_agents || []) as string[],
        createdAt: nc.created_at || new Date().toISOString(),
      }))
    } catch (error) {
      console.error("Exceção ao buscar neurocores:", error)
      return []
    }
  }, [])

  const createNeuroCore = useCallback(async (neurocore: Omit<NeuroCore, "id" | "createdAt">) => {
    try {
      const supabase = createSupabaseClient()
      
      // Preparar dados para inserção no Supabase
      const insertData = {
        name: neurocore.name,
        description: neurocore.description,
        niche: neurocore.niche,
        api_url: neurocore.apiUrl,
        api_secret: neurocore.apiSecret,
        is_active: neurocore.isActive ?? true,
        associated_agents: neurocore.associatedAgents || [],
      }

      const { error } = await supabase.from("neurocores").insert(insertData)

      if (error) {
        throw new Error(`Erro ao criar neurocore: ${error.message}`)
      }

      // Atualizar também no estado local (para sincronização)
      await createEntity({ ...neurocore, createdAt: new Date().toISOString() }, "neurocores")
    } catch (error) {
      console.error("Erro ao criar neurocore:", error)
      throw error
    }
  }, [createEntity])

  const updateNeuroCore = useCallback(async (id: string, updates: Partial<NeuroCore>) => {
    try {
      const supabase = createSupabaseClient()
      
      // Preparar dados para atualização no Supabase
      const updateData: Record<string, unknown> = {}
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.niche !== undefined) updateData.niche = updates.niche
      if (updates.apiUrl !== undefined) updateData.api_url = updates.apiUrl
      if (updates.apiSecret !== undefined) updateData.api_secret = updates.apiSecret
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive
      if (updates.associatedAgents !== undefined) updateData.associated_agents = updates.associatedAgents

      const { error } = await supabase
        .from("neurocores")
        .update(updateData)
        .eq("id", id)

      if (error) {
        throw new Error(`Erro ao atualizar neurocore: ${error.message}`)
      }

      // Atualizar também no estado local (para sincronização)
      await updateEntity(id, updates, "neurocores")
    } catch (error) {
      console.error("Erro ao atualizar neurocore:", error)
      throw error
    }
  }, [updateEntity])

  const deleteNeuroCore = useCallback(async (id: string) => {
    await deleteEntity(id, "neurocores")
  }, [deleteEntity])

  // Agents - Fetch Functions (Task 7)
  const fetchAgents = useCallback(async (): Promise<Agent[]> => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar agents:", error)
        return []
      }

      if (!data) {
        return []
      }

      // Mapear dados do Supabase para o tipo Agent
      return data.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type as Agent["type"],
        function: a.function as Agent["function"],
        gender: a.gender as Agent["gender"],
        persona: a.persona || "",
        personalityTone: a.personality_tone || "",
        communicationMedium: a.communication_medium || "",
        objective: a.objective || "",
        instructions: (a.instructions || []) as AgentInstruction[],
        limitations: (a.limitations || []) as AgentLimitation[],
        conversationRoteiro: (a.conversation_roteiro || []) as AgentConversationRoteiro[],
        otherInstructions: (a.other_instructions || []) as AgentOtherInstruction[],
        isIntentAgent: a.is_intent_agent ?? false,
        associatedNeuroCores: (a.associated_neurocores || []) as string[],
        createdAt: a.created_at || new Date().toISOString(),
      }))
    } catch (error) {
      console.error("Exceção ao buscar agents:", error)
      return []
    }
  }, [])

  // Agents - Task 12: Fetch agents by tenant neurocore
  const fetchAgentsByTenantNeurocore = useCallback(async (tenantId: string, neurocoreId: string): Promise<Agent[]> => {
    try {
      const supabase = createSupabaseClient()
      
      // Buscar agentes que estão associados ao neurocore do tenant
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .contains("associated_neurocores", [neurocoreId])
        .order("is_intent_agent", { ascending: false })
        .order("name")

      if (error) {
        console.error("Erro ao buscar agents do tenant:", error)
        return []
      }

      if (!data) {
        return []
      }

      // Mapear dados do Supabase para o tipo Agent
      return data.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type as Agent["type"],
        function: a.function as Agent["function"],
        gender: a.gender as Agent["gender"],
        persona: a.persona || "",
        personalityTone: a.personality_tone || "",
        communicationMedium: a.communication_medium || "",
        objective: a.objective || "",
        instructions: (a.instructions || []) as AgentInstruction[],
        limitations: (a.limitations || []) as AgentLimitation[],
        conversationRoteiro: (a.conversation_roteiro || []) as AgentConversationRoteiro[],
        otherInstructions: (a.other_instructions || []) as AgentOtherInstruction[],
        isIntentAgent: a.is_intent_agent ?? false,
        associatedNeuroCores: (a.associated_neurocores || []) as string[],
        createdAt: a.created_at || new Date().toISOString(),
      }))
    } catch (error) {
      console.error("Exceção ao buscar agents do tenant:", error)
      return []
    }
  }, [])

  // Agents
  const createAgent = useCallback(async (agent: Omit<Agent, "id" | "createdAt">) => {
    await createEntity({ ...agent, createdAt: new Date().toISOString() }, "agents")
  }, [createEntity])

  const updateAgent = useCallback(async (id: string, updates: Partial<Agent>) => {
    try {
      const supabase = createSupabaseClient()
      
      // Preparar dados para atualização no Supabase
      const updateData: Record<string, unknown> = {}
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.type !== undefined) updateData.type = updates.type
      if (updates.function !== undefined) updateData.function = updates.function
      if (updates.gender !== undefined) updateData.gender = updates.gender
      if (updates.persona !== undefined) updateData.persona = updates.persona
      if (updates.personalityTone !== undefined) updateData.personality_tone = updates.personalityTone
      if (updates.communicationMedium !== undefined) updateData.communication_medium = updates.communicationMedium
      if (updates.objective !== undefined) updateData.objective = updates.objective
      if (updates.instructions !== undefined) updateData.instructions = updates.instructions
      if (updates.limitations !== undefined) updateData.limitations = updates.limitations
      if (updates.conversationRoteiro !== undefined) updateData.conversation_roteiro = updates.conversationRoteiro
      if (updates.otherInstructions !== undefined) updateData.other_instructions = updates.otherInstructions
      if (updates.isIntentAgent !== undefined) updateData.is_intent_agent = updates.isIntentAgent
      if (updates.associatedNeuroCores !== undefined) updateData.associated_neurocores = updates.associatedNeuroCores

      const { error } = await supabase
        .from("agents")
        .update(updateData)
        .eq("id", id)

      if (error) {
        throw new Error(`Erro ao atualizar agente: ${error.message}`)
      }

      // Atualizar também no estado local (para sincronização)
      await updateEntity(id, updates, "agents")
    } catch (error) {
      console.error("Erro ao atualizar agente:", error)
      throw error
    }
  }, [updateEntity])

  const deleteAgent = useCallback(async (id: string) => {
    await deleteEntity(id, "agents")
  }, [deleteEntity])

  // Contacts - Task 13: Fetch with filters
  const fetchContacts = useCallback(async (
    tenantId: string, 
    filters?: { status?: string, search?: string, searchField?: 'name' | 'phone' | 'email' }
  ): Promise<Contact[]> => {
    try {
      const supabase = createSupabaseClient()
      let query = supabase
        .from("contacts")
        .select("*")
        .eq("tenant_id", tenantId)

      // Apply status filter
      if (filters?.status) {
        query = query.eq("status", filters.status)
      }

      // Apply search filter
      if (filters?.search && filters?.searchField) {
        const searchField = filters.searchField === 'name' ? 'name' : 
                           filters.searchField === 'phone' ? 'phone' : 'email'
        query = query.ilike(searchField, `%${filters.search}%`)
      }

      const { data, error } = await query.order("last_interaction_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar contatos:", error)
        return []
      }

      if (!data) {
        return []
      }

      // Map Supabase data to Contact type
      return data.map((c) => ({
        id: c.id,
        tenantId: c.tenant_id,
        name: c.name,
        phone: c.phone,
        phoneSecondary: c.phone_secondary || null,
        email: c.email || null,
        country: c.country || null,
        city: c.city || null,
        zipCode: c.zip_code || null,
        addressStreet: c.address_street || null,
        addressNumber: c.address_number || null,
        addressComplement: c.address_complement || null,
        cpf: c.cpf || null,
        rg: c.rg || null,
        lastInteraction: c.last_interaction_at || new Date().toISOString(),
        status: c.status as Contact["status"],
        customerDataExtracted: c.customer_data_extracted as Contact["customerDataExtracted"] || null,
        tags: c.tags || null,
        lastNegotiation: c.last_negotiation as Contact["lastNegotiation"] || null,
        createdAt: c.created_at || new Date().toISOString(),
      }))
    } catch (error) {
      console.error("Exceção ao buscar contatos:", error)
      return []
    }
  }, [])

  const fetchContact = useCallback(async (id: string): Promise<Contact | null> => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        console.error("Erro ao buscar contato:", error)
        return null
      }

      if (!data) {
        return null
      }

      // Map Supabase data to Contact type
      return {
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
        lastInteraction: data.last_interaction_at || new Date().toISOString(),
        status: data.status as Contact["status"],
        customerDataExtracted: data.customer_data_extracted as Contact["customerDataExtracted"] || null,
        tags: data.tags || null,
        lastNegotiation: data.last_negotiation as Contact["lastNegotiation"] || null,
        createdAt: data.created_at || new Date().toISOString(),
      }
    } catch (error) {
      console.error("Exceção ao buscar contato:", error)
      return null
    }
  }, [])

  const createContact = useCallback(async (contact: Omit<Contact, "id" | "createdAt">) => {
    await createEntity({ ...contact, createdAt: new Date().toISOString() }, "contacts")
  }, [createEntity])

  const updateContact = useCallback(async (id: string, updates: Partial<Contact>) => {
    try {
      const supabase = createSupabaseClient()
      
      // Prepare data for Supabase update
      const updateData: Record<string, unknown> = {}
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.phone !== undefined) updateData.phone = updates.phone
      if (updates.phoneSecondary !== undefined) updateData.phone_secondary = updates.phoneSecondary
      if (updates.email !== undefined) updateData.email = updates.email
      if (updates.country !== undefined) updateData.country = updates.country
      if (updates.city !== undefined) updateData.city = updates.city
      if (updates.zipCode !== undefined) updateData.zip_code = updates.zipCode
      if (updates.addressStreet !== undefined) updateData.address_street = updates.addressStreet
      if (updates.addressNumber !== undefined) updateData.address_number = updates.addressNumber
      if (updates.addressComplement !== undefined) updateData.address_complement = updates.addressComplement
      if (updates.cpf !== undefined) updateData.cpf = updates.cpf
      if (updates.rg !== undefined) updateData.rg = updates.rg
      if (updates.status !== undefined) updateData.status = updates.status
      if (updates.customerDataExtracted !== undefined) updateData.customer_data_extracted = updates.customerDataExtracted
      if (updates.tags !== undefined) updateData.tags = updates.tags
      if (updates.lastNegotiation !== undefined) updateData.last_negotiation = updates.lastNegotiation
      if (updates.lastInteraction !== undefined) updateData.last_interaction_at = updates.lastInteraction

      const { error } = await supabase
        .from("contacts")
        .update(updateData)
        .eq("id", id)

      if (error) {
        throw new Error(`Erro ao atualizar contato: ${error.message}`)
      }

      // Update local state for synchronization
      await updateEntity(id, updates, "contacts")
    } catch (error) {
      console.error("Erro ao atualizar contato:", error)
      throw error
    }
  }, [updateEntity])

  const deleteContact = useCallback(async (id: string) => {
    await deleteEntity(id, "contacts")
  }, [deleteEntity])

  // Conversations - Task 13: Fetch by contact
  const fetchConversationsByContact = useCallback(async (
    contactId: string, 
    tenantId: string, 
    filters?: { status?: string }
  ): Promise<Conversation[]> => {
    try {
      const supabase = createSupabaseClient()
      let query = supabase
        .from("conversations")
        .select("*")
        .eq("contact_id", contactId)
        .eq("tenant_id", tenantId)

      // Apply status filter
      if (filters?.status) {
        query = query.eq("status", filters.status)
      }

      const { data, error } = await query.order("last_message_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar conversas:", error)
        return []
      }

      if (!data) {
        return []
      }

      // Map Supabase data to Conversation type
      return data.map((c) => ({
        id: c.id,
        contactId: c.contact_id,
        tenantId: c.tenant_id,
        status: c.status as Conversation["status"],
        iaActive: c.ia_active ?? true,
        lastMessageAt: c.last_message_at || new Date().toISOString(),
        overallFeedback: c.overall_feedback ? {
          type: c.overall_feedback.type as FeedbackType,
          text: c.overall_feedback.text || null,
        } : null,
        createdAt: c.created_at || new Date().toISOString(),
      }))
    } catch (error) {
      console.error("Exceção ao buscar conversas:", error)
      return []
    }
  }, [])

  const createConversation = useCallback(async (conversation: Omit<Conversation, "id" | "createdAt">) => {
    await createEntity({ ...conversation, createdAt: new Date().toISOString() }, "conversations")
  }, [createEntity])

  const updateConversation = useCallback(async (id: string, updates: Partial<Conversation>) => {
    try {
      const supabase = createSupabaseClient()
      
      // Prepare data for Supabase update
      const updateData: Record<string, unknown> = {}
      if (updates.status !== undefined) updateData.status = updates.status
      if (updates.iaActive !== undefined) updateData.ia_active = updates.iaActive
      if (updates.lastMessageAt !== undefined) updateData.last_message_at = updates.lastMessageAt
      if (updates.overallFeedback !== undefined) updateData.overall_feedback = updates.overallFeedback

      const { error } = await supabase
        .from("conversations")
        .update(updateData)
        .eq("id", id)

      if (error) {
        throw new Error(`Erro ao atualizar conversa: ${error.message}`)
      }

      // Update local state for synchronization
      await updateEntity(id, updates, "conversations")
    } catch (error) {
      console.error("Erro ao atualizar conversa:", error)
      throw error
    }
  }, [updateEntity])

  const deleteConversation = useCallback(async (id: string) => {
    await deleteEntity(id, "conversations")
  }, [deleteEntity])

  // Messages - Task 13: Fetch by conversation and update feedback
  const fetchMessagesByConversation = useCallback(async (conversationId: string): Promise<Message[]> => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("timestamp", { ascending: true })

      if (error) {
        console.error("Erro ao buscar mensagens:", error)
        return []
      }

      if (!data) {
        return []
      }

      // Map Supabase data to Message type
      return data.map((m) => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderType: m.sender_type as Message["senderType"],
        senderId: m.sender_id,
        content: m.content,
        timestamp: m.timestamp || new Date().toISOString(),
        feedback: m.feedback ? {
          type: m.feedback.type as FeedbackType,
          text: m.feedback.text || null,
        } : null,
      }))
    } catch (error) {
      console.error("Exceção ao buscar mensagens:", error)
      return []
    }
  }, [])

  const createMessage = useCallback(async (message: Omit<Message, "id">) => {
    try {
      const supabase = createSupabaseClient()
      
      // Prepare data for Supabase insert
      const insertData = {
        conversation_id: message.conversationId,
        sender_type: message.senderType,
        sender_id: message.senderId,
        content: message.content,
        timestamp: message.timestamp,
        feedback: message.feedback,
      }

      const { error } = await supabase.from("messages").insert(insertData)

      if (error) {
        throw new Error(`Erro ao criar mensagem: ${error.message}`)
      }

      // Update local state for synchronization
      await createEntity(message, "messages")
    } catch (error) {
      console.error("Erro ao criar mensagem:", error)
      throw error
    }
  }, [createEntity])

  const updateMessage = useCallback(async (id: string, updates: Partial<Message>) => {
    await updateEntity(id, updates, "messages")
  }, [updateEntity])

  const updateMessageFeedback = useCallback(async (
    id: string, 
    data: { feedback_type: 'like' | 'dislike', feedback_text?: string }
  ): Promise<void> => {
    try {
      const supabase = createSupabaseClient()
      
      const feedbackData = {
        type: data.feedback_type,
        text: data.feedback_text || null,
      }

      const { error } = await supabase
        .from("messages")
        .update({ feedback: feedbackData })
        .eq("id", id)

      if (error) {
        throw new Error(`Erro ao atualizar feedback da mensagem: ${error.message}`)
      }

      // Update local state for synchronization
      await updateEntity(id, { feedback: feedbackData as MessageFeedback }, "messages")
    } catch (error) {
      console.error("Erro ao atualizar feedback da mensagem:", error)
      throw error
    }
  }, [updateEntity])

  const deleteMessage = useCallback(async (id: string) => {
    await deleteEntity(id, "messages")
  }, [deleteEntity])

  // BaseConhecimento - Fetch Functions (Task 11)
  const fetchBaseConhecimentos = useCallback(async (tenantId: string): Promise<BaseConhecimento[]> => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from("base_conhecimentos")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar bases de conhecimento:", error)
        return []
      }

      if (!data) {
        return []
      }

      // Mapear dados do Supabase para o tipo BaseConhecimento
      return data.map((b) => ({
        id: b.id,
        tenantId: b.tenant_id,
        name: b.name,
        description: b.description || "",
        neurocoreId: b.neurocore_id,
        isActive: b.is_active ?? true,
        createdAt: b.created_at || new Date().toISOString(),
      }))
    } catch (error) {
      console.error("Exceção ao buscar bases de conhecimento:", error)
      return []
    }
  }, [])

  const createBaseConhecimento = useCallback(async (base: Omit<BaseConhecimento, "id" | "createdAt">) => {
    try {
      const supabase = createSupabaseClient()
      
      // Preparar dados para inserção no Supabase
      const insertData = {
        tenant_id: base.tenantId,
        name: base.name,
        description: base.description,
        neurocore_id: base.neurocoreId,
        is_active: base.isActive ?? true,
      }

      const { error } = await supabase.from("base_conhecimentos").insert(insertData)

      if (error) {
        throw new Error(`Erro ao criar base de conhecimento: ${error.message}`)
      }

      // Atualizar também no estado local (para sincronização)
      await createEntity({ ...base, createdAt: new Date().toISOString() }, "baseConhecimentos")
    } catch (error) {
      console.error("Erro ao criar base de conhecimento:", error)
      throw error
    }
  }, [createEntity])

  const updateBaseConhecimento = useCallback(async (id: string, updates: Partial<BaseConhecimento>) => {
    try {
      const supabase = createSupabaseClient()
      
      // Preparar dados para atualização no Supabase
      const updateData: Record<string, unknown> = {}
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive
      if (updates.neurocoreId !== undefined) updateData.neurocore_id = updates.neurocoreId

      const { error } = await supabase
        .from("base_conhecimentos")
        .update(updateData)
        .eq("id", id)

      if (error) {
        throw new Error(`Erro ao atualizar base de conhecimento: ${error.message}`)
      }

      // Atualizar também no estado local (para sincronização)
      await updateEntity(id, updates, "baseConhecimentos")
    } catch (error) {
      console.error("Erro ao atualizar base de conhecimento:", error)
      throw error
    }
  }, [updateEntity])

  const deleteBaseConhecimento = useCallback(async (id: string) => {
    try {
      const supabase = createSupabaseClient()
      
      const { error } = await supabase
        .from("base_conhecimentos")
        .delete()
        .eq("id", id)

      if (error) {
        throw new Error(`Erro ao excluir base de conhecimento: ${error.message}`)
      }

      // Atualizar também no estado local (para sincronização)
      await deleteEntity(id, "baseConhecimentos")
    } catch (error) {
      console.error("Erro ao excluir base de conhecimento:", error)
      throw error
    }
  }, [deleteEntity])

  // Synapses - Fetch Functions (Task 11)
  const fetchSynapsesByBase = useCallback(async (baseConhecimentoId: string, tenantId: string): Promise<Synapse[]> => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from("synapses")
        .select("*")
        .eq("base_conhecimento_id", baseConhecimentoId)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar synapses:", error)
        return []
      }

      if (!data) {
        return []
      }

      // Mapear dados do Supabase para o tipo Synapse
      return data.map((s) => ({
        id: s.id,
        baseConhecimentoId: s.base_conhecimento_id,
        tenantId: s.tenant_id,
        title: s.title,
        description: s.description || "",
        imageUrl: s.image_url || null,
        status: s.status as SynapseStatus,
        createdAt: s.created_at || new Date().toISOString(),
      }))
    } catch (error) {
      console.error("Exceção ao buscar synapses:", error)
      return []
    }
  }, [])

  const createSynapse = useCallback(async (synapse: Omit<Synapse, "id" | "createdAt">) => {
    try {
      const supabase = createSupabaseClient()
      
      // Preparar dados para inserção no Supabase
      const insertData = {
        base_conhecimento_id: synapse.baseConhecimentoId,
        tenant_id: synapse.tenantId,
        title: synapse.title,
        description: synapse.description,
        image_url: synapse.imageUrl,
        status: synapse.status,
      }

      const { error } = await supabase.from("synapses").insert(insertData)

      if (error) {
        throw new Error(`Erro ao criar synapse: ${error.message}`)
      }

      // Atualizar também no estado local (para sincronização)
      await createEntity({ ...synapse, createdAt: new Date().toISOString() }, "synapses")
    } catch (error) {
      console.error("Erro ao criar synapse:", error)
      throw error
    }
  }, [createEntity])

  const updateSynapse = useCallback(async (id: string, updates: Partial<Synapse>) => {
    try {
      const supabase = createSupabaseClient()
      
      // Preparar dados para atualização no Supabase
      const updateData: Record<string, unknown> = {}
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl
      if (updates.status !== undefined) updateData.status = updates.status

      const { error } = await supabase
        .from("synapses")
        .update(updateData)
        .eq("id", id)

      if (error) {
        throw new Error(`Erro ao atualizar synapse: ${error.message}`)
      }

      // Atualizar também no estado local (para sincronização)
      await updateEntity(id, updates, "synapses")
    } catch (error) {
      console.error("Erro ao atualizar synapse:", error)
      throw error
    }
  }, [updateEntity])

  const deleteSynapse = useCallback(async (id: string) => {
    try {
      const supabase = createSupabaseClient()
      
      const { error } = await supabase
        .from("synapses")
        .delete()
        .eq("id", id)

      if (error) {
        throw new Error(`Erro ao excluir synapse: ${error.message}`)
      }

      // Atualizar também no estado local (para sincronização)
      await deleteEntity(id, "synapses")
    } catch (error) {
      console.error("Erro ao excluir synapse:", error)
      throw error
    }
  }, [deleteEntity])

  // Feedbacks - Fetch Functions (Task 9)
  const fetchFeedbacks = useCallback(async (): Promise<Feedback[]> => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from("feedbacks")
        .select(`
          *,
          tenant:tenants!fk_feedbacks_tenant(id, name),
          user:users!fk_feedbacks_user(id, full_name, email),
          conversation:conversations!fk_feedbacks_conversation(id, contact_id, tenant_id),
          message:messages!fk_feedbacks_message(id, content, timestamp, sender_type)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar feedbacks:", error)
        return []
      }

      if (!data) {
        return []
      }

      // Mapear dados do Supabase para o tipo Feedback
      return data.map((f) => ({
        id: f.id,
        tenantId: f.tenant_id,
        userId: f.user_id,
        conversationId: f.conversation_id,
        messageId: f.message_id,
        feedbackType: f.feedback_type as Feedback["feedbackType"],
        feedbackText: f.feedback_text,
        feedbackStatus: f.feedback_status as Feedback["feedbackStatus"],
        superAdminComment: f.super_admin_comment,
        createdAt: f.created_at || new Date().toISOString(),
      }))
    } catch (error) {
      console.error("Exceção ao buscar feedbacks:", error)
      return []
    }
  }, [])

  const fetchConversationMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("timestamp", { ascending: true })

      if (error) {
        console.error("Erro ao buscar mensagens da conversa:", error)
        return []
      }

      if (!data) {
        return []
      }

      // Mapear dados do Supabase para o tipo Message
      return data.map((m) => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderType: m.sender_type as Message["senderType"],
        senderId: m.sender_id,
        content: m.content,
        timestamp: m.timestamp || new Date().toISOString(),
        feedback: m.feedback ? {
          type: m.feedback.type as FeedbackType,
          text: m.feedback.text || null,
        } : null,
      }))
    } catch (error) {
      console.error("Exceção ao buscar mensagens da conversa:", error)
      return []
    }
  }, [])

  const createFeedback = useCallback(async (feedback: Omit<Feedback, "id" | "createdAt">) => {
    await createEntity({ ...feedback, createdAt: new Date().toISOString() }, "feedbacks")
  }, [createEntity])

  const updateFeedback = useCallback(async (id: string, updates: Partial<Feedback>) => {
    try {
      const supabase = createSupabaseClient()
      
      // Preparar dados para atualização no Supabase
      const updateData: Record<string, unknown> = {}
      if (updates.feedbackStatus !== undefined) updateData.feedback_status = updates.feedbackStatus
      if (updates.superAdminComment !== undefined) updateData.super_admin_comment = updates.superAdminComment
      if (updates.feedbackText !== undefined) updateData.feedback_text = updates.feedbackText
      if (updates.feedbackType !== undefined) updateData.feedback_type = updates.feedbackType

      const { error } = await supabase
        .from("feedbacks")
        .update(updateData)
        .eq("id", id)

      if (error) {
        throw new Error(`Erro ao atualizar feedback: ${error.message}`)
      }

      // Atualizar também no estado local (para sincronização)
      await updateEntity(id, updates, "feedbacks")
    } catch (error) {
      console.error("Erro ao atualizar feedback:", error)
      throw error
    }
  }, [updateEntity])

  const deleteFeedback = useCallback(async (id: string) => {
    await deleteEntity(id, "feedbacks")
  }, [deleteEntity])

  // QuickReplyTemplates - Task 13: Fetch with usage ordering
  const fetchQuickReplyTemplates = useCallback(async (
    tenantId: string, 
    orderByUsage: boolean = false
  ): Promise<QuickReplyTemplate[]> => {
    try {
      const supabase = createSupabaseClient()
      let query = supabase
        .from("quick_reply_templates")
        .select("*")
        .eq("tenant_id", tenantId)

      if (orderByUsage) {
        query = query.order("usage_count", { ascending: false })
      } else {
        query = query.order("created_at", { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        console.error("Erro ao buscar respostas rápidas:", error)
        return []
      }

      if (!data) {
        return []
      }

      // Map Supabase data to QuickReplyTemplate type
      return data.map((qrt) => ({
        id: qrt.id,
        tenantId: qrt.tenant_id,
        title: qrt.title,
        message: qrt.message,
        icon: qrt.icon || null,
        usageCount: qrt.usage_count || 0,
        createdAt: qrt.created_at || new Date().toISOString(),
      }))
    } catch (error) {
      console.error("Exceção ao buscar respostas rápidas:", error)
      return []
    }
  }, [])

  const createQuickReplyTemplate = useCallback(async (template: Omit<QuickReplyTemplate, "id" | "createdAt">) => {
    try {
      const supabase = createSupabaseClient()
      
      // Prepare data for Supabase insert
      const insertData = {
        tenant_id: template.tenantId,
        title: template.title,
        message: template.message,
        icon: template.icon,
        usage_count: template.usageCount || 0,
      }

      const { error } = await supabase.from("quick_reply_templates").insert(insertData)

      if (error) {
        throw new Error(`Erro ao criar resposta rápida: ${error.message}`)
      }

      // Update local state for synchronization
      await createEntity({ ...template, createdAt: new Date().toISOString() }, "quickReplyTemplates")
    } catch (error) {
      console.error("Erro ao criar resposta rápida:", error)
      throw error
    }
  }, [createEntity])

  const updateQuickReplyTemplate = useCallback(async (id: string, updates: Partial<QuickReplyTemplate>) => {
    try {
      const supabase = createSupabaseClient()
      
      // Prepare data for Supabase update
      const updateData: Record<string, unknown> = {}
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.message !== undefined) updateData.message = updates.message
      if (updates.icon !== undefined) updateData.icon = updates.icon
      if (updates.usageCount !== undefined) updateData.usage_count = updates.usageCount

      const { error } = await supabase
        .from("quick_reply_templates")
        .update(updateData)
        .eq("id", id)

      if (error) {
        throw new Error(`Erro ao atualizar resposta rápida: ${error.message}`)
      }

      // Update local state for synchronization
      await updateEntity(id, updates, "quickReplyTemplates")
    } catch (error) {
      console.error("Erro ao atualizar resposta rápida:", error)
      throw error
    }
  }, [updateEntity])

  const deleteQuickReplyTemplate = useCallback(async (id: string) => {
    try {
      const supabase = createSupabaseClient()
      
      const { error } = await supabase
        .from("quick_reply_templates")
        .delete()
        .eq("id", id)

      if (error) {
        throw new Error(`Erro ao excluir resposta rápida: ${error.message}`)
      }

      // Update local state for synchronization
      await deleteEntity(id, "quickReplyTemplates")
    } catch (error) {
      console.error("Erro ao excluir resposta rápida:", error)
      throw error
    }
  }, [deleteEntity])

  const incrementQuickReplyUsage = useCallback(async (id: string): Promise<void> => {
    try {
      const supabase = createSupabaseClient()
      
      // Increment usage_count in Supabase using RPC or raw update
      const { error } = await supabase.rpc("increment_quick_reply_usage", { quick_reply_id: id })

      if (error) {
        // If RPC doesn't exist, fallback to manual increment
        console.warn("RPC não disponível, usando fallback manual:", error)
        
        // Get current usage count
        const { data: currentData, error: fetchError } = await supabase
          .from("quick_reply_templates")
          .select("usage_count")
          .eq("id", id)
          .single()

        if (fetchError) {
          throw new Error(`Erro ao buscar resposta rápida: ${fetchError.message}`)
        }

        const currentCount = currentData?.usage_count || 0

        // Update with incremented value
        const { error: updateError } = await supabase
          .from("quick_reply_templates")
          .update({ usage_count: currentCount + 1 })
          .eq("id", id)

        if (updateError) {
          throw new Error(`Erro ao incrementar uso: ${updateError.message}`)
        }
      }

      // Update local state
      const quickReply = state.quickReplyTemplates.find(qr => qr.id === id)
      if (quickReply) {
        await updateEntity(id, { usageCount: (quickReply.usageCount || 0) + 1 }, "quickReplyTemplates")
      }
    } catch (error) {
      console.error("Erro ao incrementar uso de resposta rápida:", error)
      throw error
    }
  }, [state.quickReplyTemplates, updateEntity])

  // Global Filters
  const updateGlobalFilters = useCallback(async (filters: Partial<GlobalFilters>) => {
    await simulateDelay()
    const newState = {
      ...state,
      globalFilters: { ...state.globalFilters, ...filters },
    }
    persistState(newState)
  }, [state, persistState])

  // Reset data
  const resetData = useCallback(async () => {
    await simulateDelay()
    persistState(seedData)
  }, [persistState])

  // Supabase Profile Functions (Task 5)
  const fetchUserProfile = useCallback(async (userId: string): Promise<User | null> => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("Erro ao buscar perfil do usuário:", error)
        return null
      }

      if (!data) {
        return null
      }

      // Mapear dados do Supabase para o tipo User
      return {
        id: data.id,
        tenantId: data.tenant_id || null,
        fullName: data.full_name || data.email,
        email: data.email,
        whatsappNumber: data.whatsapp_number || "",
        role: data.role as User["role"],
        avatarUrl: data.avatar_url || "",
        modules: (data.modules || []) as User["modules"],
        isActive: data.is_active ?? true,
        lastSignInAt: data.last_sign_in_at || null,
        createdAt: data.created_at || new Date().toISOString(),
      }
    } catch (error) {
      console.error("Exceção ao buscar perfil do usuário:", error)
      return null
    }
  }, [])

  const fetchTenantProfile = useCallback(async (tenantId: string): Promise<Tenant | null> => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantId)
        .single()

      if (error) {
        console.error("Erro ao buscar perfil do tenant:", error)
        return null
      }

      if (!data) {
        return null
      }

      // Mapear dados do Supabase para o tipo Tenant
      return {
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
      }
    } catch (error) {
      console.error("Exceção ao buscar perfil do tenant:", error)
      return null
    }
  }, [])

  const updateUserProfile = useCallback(async (userId: string, data: Partial<User>): Promise<void> => {
    try {
      const supabase = createSupabaseClient()
      
      // Preparar dados para atualização no Supabase
      const updateData: Record<string, unknown> = {}
      if (data.fullName !== undefined) updateData.full_name = data.fullName
      if (data.whatsappNumber !== undefined) updateData.whatsapp_number = data.whatsappNumber
      if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", userId)

      if (error) {
        throw new Error(`Erro ao atualizar perfil do usuário: ${error.message}`)
      }

      // Atualizar também no estado local (para sincronização)
      await updateUser(userId, data)
    } catch (error) {
      console.error("Erro ao atualizar perfil do usuário:", error)
      throw error
    }
  }, [updateUser])

  const updateTenantProfile = useCallback(async (tenantId: string, data: Partial<Tenant>): Promise<void> => {
    try {
      const supabase = createSupabaseClient()
      
      // Preparar dados para atualização no Supabase
      const updateData: Record<string, unknown> = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.cnpj !== undefined) updateData.cnpj = data.cnpj
      if (data.phone !== undefined) updateData.phone = data.phone
      if (data.responsibleTech !== undefined) {
        updateData.responsible_tech_name = data.responsibleTech.name
        updateData.responsible_tech_whatsapp = data.responsibleTech.whatsapp
        updateData.responsible_tech_email = data.responsibleTech.email
      }
      if (data.responsibleFinance !== undefined) {
        updateData.responsible_finance_name = data.responsibleFinance.name
        updateData.responsible_finance_whatsapp = data.responsibleFinance.whatsapp
        updateData.responsible_finance_email = data.responsibleFinance.email
      }

      const { error } = await supabase
        .from("tenants")
        .update(updateData)
        .eq("id", tenantId)

      if (error) {
        throw new Error(`Erro ao atualizar perfil do tenant: ${error.message}`)
      }

      // Atualizar também no estado local (para sincronização)
      await updateTenant(tenantId, data)
    } catch (error) {
      console.error("Erro ao atualizar perfil do tenant:", error)
      throw error
    }
  }, [updateTenant])

  // Dashboard - Fetch Functions (Task 10)
  const fetchDashboardKpis = useCallback(async (filters: { period: string; conversationSelection: string }) => {
    try {
      const supabase = createSupabaseClient()
      
      // Calcular data de início baseada no período
      let periodStart: string | null = null
      if (filters.period === GlobalFilterPeriod.SEVEN_DAYS) {
        periodStart = dayjs().subtract(7, "days").toISOString()
      } else if (filters.period === GlobalFilterPeriod.THIRTY_DAYS) {
        periodStart = dayjs().subtract(30, "days").toISOString()
      }
      
      // Buscar contagem de tenants (apenas para Super Admin)
      const { data: tenantsData, error: tenantsError } = await supabase
        .from("tenants")
        .select("id, is_active", { count: "exact", head: false })
      
      const activeTenants = tenantsData?.filter(t => t.is_active).length || 0
      const totalTenants = tenantsData?.length || 0
      
      // Construir query de conversas
      let conversationsQuery = supabase
        .from("conversations")
        .select("id, status, ia_active, last_message_at", { count: "exact", head: false })
      
      // Aplicar filtro de período
      if (periodStart) {
        conversationsQuery = conversationsQuery.gte("last_message_at", periodStart)
      }
      
      const { data: conversationsData, error: conversationsError } = await conversationsQuery
      
      if (conversationsError) {
        console.error("Erro ao buscar conversas para KPIs:", conversationsError)
      }
      
      // Filtrar conversas baseado na seleção
      let filteredConversations = conversationsData || []
      
      if (filters.conversationSelection === GlobalFilterConversationSelection.IA_NOW) {
        filteredConversations = filteredConversations.filter(
          c => c.status === ConversationStatus.CONVERSANDO && c.ia_active === true
        )
      } else if (filters.conversationSelection === GlobalFilterConversationSelection.PAUSED_NOW) {
        filteredConversations = filteredConversations.filter(
          c => c.status === ConversationStatus.PAUSADA
        )
      }
      
      // Calcular KPIs
      const conversationsWithIA = filteredConversations.filter(
        c => c.status === ConversationStatus.CONVERSANDO && c.ia_active === true
      ).length
      
      const pausedConversations = filteredConversations.filter(
        c => c.status === ConversationStatus.PAUSADA
      ).length
      
      return {
        activeTenants,
        totalTenants,
        conversationsWithIA,
        pausedConversations,
      }
    } catch (error) {
      console.error("Erro ao buscar KPIs do Dashboard:", error)
      return {
        activeTenants: 0,
        totalTenants: 0,
        conversationsWithIA: 0,
        pausedConversations: 0,
      }
    }
  }, [])

  const fetchConversationsByHour = useCallback(async (filters: { period: string; conversationSelection: string }) => {
    try {
      const supabase = createSupabaseClient()
      
      // Calcular data de início baseada no período
      let periodStart: string | null = null
      if (filters.period === GlobalFilterPeriod.SEVEN_DAYS) {
        periodStart = dayjs().subtract(7, "days").toISOString()
      } else if (filters.period === GlobalFilterPeriod.THIRTY_DAYS) {
        periodStart = dayjs().subtract(30, "days").toISOString()
      }
      
      // Construir query de conversas
      let conversationsQuery = supabase
        .from("conversations")
        .select("id, status, ia_active, last_message_at")
      
      // Aplicar filtro de período
      if (periodStart) {
        conversationsQuery = conversationsQuery.gte("last_message_at", periodStart)
      }
      
      const { data: conversationsData, error: conversationsError } = await conversationsQuery
      
      if (conversationsError) {
        console.error("Erro ao buscar conversas por hora:", conversationsError)
        return []
      }
      
      // Filtrar conversas baseado na seleção
      let filteredConversations = conversationsData || []
      
      if (filters.conversationSelection === GlobalFilterConversationSelection.IA_NOW) {
        filteredConversations = filteredConversations.filter(
          c => c.status === ConversationStatus.CONVERSANDO && c.ia_active === true
        )
      } else if (filters.conversationSelection === GlobalFilterConversationSelection.PAUSED_NOW) {
        filteredConversations = filteredConversations.filter(
          c => c.status === ConversationStatus.PAUSADA
        )
      }
      
      // Agrupar por hora do dia
      const hourCounts: Record<number, number> = {}
      for (let i = 0; i < 24; i++) {
        hourCounts[i] = 0
      }
      
      filteredConversations.forEach((conv) => {
        const hour = dayjs(conv.last_message_at).hour()
        hourCounts[hour] = (hourCounts[hour] || 0) + 1
      })
      
      // Formatar dados para o gráfico
      return Array.from({ length: 24 }, (_, i) => ({
        hora: `${i.toString().padStart(2, "0")}h`,
        conversas: hourCounts[i] || 0,
      }))
    } catch (error) {
      console.error("Erro ao buscar conversas por hora:", error)
      return []
    }
  }, [])

  const fetchConversationKeywords = useCallback(async (filters: { period: string; conversationSelection: string }) => {
    try {
      const supabase = createSupabaseClient()
      
      // Calcular data de início baseada no período
      let periodStart: string | null = null
      if (filters.period === GlobalFilterPeriod.SEVEN_DAYS) {
        periodStart = dayjs().subtract(7, "days").toISOString()
      } else if (filters.period === GlobalFilterPeriod.THIRTY_DAYS) {
        periodStart = dayjs().subtract(30, "days").toISOString()
      }
      
      // Buscar conversas filtradas
      let conversationsQuery = supabase
        .from("conversations")
        .select("id, status, ia_active, last_message_at")
      
      if (periodStart) {
        conversationsQuery = conversationsQuery.gte("last_message_at", periodStart)
      }
      
      const { data: conversationsData, error: conversationsError } = await conversationsQuery
      
      if (conversationsError) {
        console.error("Erro ao buscar conversas para keywords:", conversationsError)
        return []
      }
      
      // Filtrar conversas baseado na seleção
      let filteredConversations = conversationsData || []
      
      if (filters.conversationSelection === GlobalFilterConversationSelection.IA_NOW) {
        filteredConversations = filteredConversations.filter(
          c => c.status === ConversationStatus.CONVERSANDO && c.ia_active === true
        )
      } else if (filters.conversationSelection === GlobalFilterConversationSelection.PAUSED_NOW) {
        filteredConversations = filteredConversations.filter(
          c => c.status === ConversationStatus.PAUSADA
        )
      }
      
      if (filteredConversations.length === 0) {
        return []
      }
      
      // Buscar mensagens dessas conversas
      const conversationIds = filteredConversations.map(c => c.id)
      
      // Fazer requisição em batches de 100 IDs por vez (limite do Supabase)
      const allMessages: any[] = []
      for (let i = 0; i < conversationIds.length; i += 100) {
        const batchIds = conversationIds.slice(i, i + 100)
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("content")
          .in("conversation_id", batchIds)
          .limit(1000) // Limitar para não sobrecarregar
        
        if (messagesError) {
          console.error("Erro ao buscar mensagens para keywords:", messagesError)
        } else if (messagesData) {
          allMessages.push(...messagesData)
        }
      }
      
      // Processar palavras-chave
      const wordCounts: Record<string, number> = {}
      allMessages.forEach((msg: any) => {
        if (!msg.content) return
        const words = msg.content.toLowerCase().split(/\s+/)
        words.forEach((word: string) => {
          // Limpar palavra de caracteres especiais
          const cleanWord = word.replace(/[^\wáàâãéèêíìîóòôõúùûç]/g, "")
          // Apenas palavras com mais de 3 caracteres
          if (cleanWord.length > 3) {
            wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1
          }
        })
      })
      
      // Ordenar e retornar top 30 palavras
      return Object.entries(wordCounts)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 30)
    } catch (error) {
      console.error("Erro ao buscar keywords:", error)
      return []
    }
  }, [])

  const fetchTenantListWithConversationCounts = useCallback(async (filters: { period: string; conversationSelection: string }) => {
    try {
      const supabase = createSupabaseClient()
      
      // Calcular data de início baseada no período
      let periodStart: string | null = null
      if (filters.period === GlobalFilterPeriod.SEVEN_DAYS) {
        periodStart = dayjs().subtract(7, "days").toISOString()
      } else if (filters.period === GlobalFilterPeriod.THIRTY_DAYS) {
        periodStart = dayjs().subtract(30, "days").toISOString()
      }
      
      // Buscar tenants
      const { data: tenantsData, error: tenantsError } = await supabase
        .from("tenants")
        .select("id, name, neurocore_id, is_active")
        .order("name")
      
      if (tenantsError) {
        console.error("Erro ao buscar tenants:", tenantsError)
        return []
      }
      
      if (!tenantsData) {
        return []
      }
      
      // Buscar NeuroCores
      const { data: neuroCoresData } = await supabase
        .from("neurocores")
        .select("id, name")
      
      // Buscar usuários por tenant
      const { data: usersData } = await supabase
        .from("users")
        .select("id, tenant_id")
      
      // Buscar conversas
      let conversationsQuery = supabase
        .from("conversations")
        .select("id, tenant_id, status, last_message_at")
      
      if (periodStart) {
        conversationsQuery = conversationsQuery.gte("last_message_at", periodStart)
      }
      
      const { data: conversationsData } = await conversationsQuery
      
      // Mapear dados
      return tenantsData.map((tenant) => {
        const neurocore = neuroCoresData?.find(nc => nc.id === tenant.neurocore_id)
        const userCount = usersData?.filter(u => u.tenant_id === tenant.id).length || 0
        
        // Filtrar conversas do tenant
        const tenantConversations = conversationsData?.filter(c => c.tenant_id === tenant.id) || []
        
        const openConversations = tenantConversations.filter(
          c => c.status === ConversationStatus.CONVERSANDO
        ).length
        
        const pausedConversations = tenantConversations.filter(
          c => c.status === ConversationStatus.PAUSADA
        ).length
        
        const closedConversations = tenantConversations.filter(
          c => c.status === ConversationStatus.ENCERRADA
        ).length
        
        return {
          id: tenant.id,
          name: tenant.name,
          neurocoreName: neurocore?.name || "N/A",
          userCount,
          openConversations,
          pausedConversations,
          closedConversations,
          isActive: tenant.is_active ?? true,
        }
      })
    } catch (error) {
      console.error("Erro ao buscar lista de tenants com contagens:", error)
      return []
    }
  }, [])

  const value: DataContextType = {
    state,
    isLoading,
    fetchTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    fetchUsersByTenant,
    fetchAllFeatureModules,
    createUser,
    updateUser,
    deleteUser,
    fetchNeurocores,
    createNeuroCore,
    updateNeuroCore,
    deleteNeuroCore,
    fetchAgents,
    fetchAgentsByTenantNeurocore,
    createAgent,
    updateAgent,
    deleteAgent,
    fetchContacts,
    fetchContact,
    createContact,
    updateContact,
    deleteContact,
    fetchConversationsByContact,
    createConversation,
    updateConversation,
    deleteConversation,
    fetchMessagesByConversation,
    createMessage,
    updateMessage,
    updateMessageFeedback,
    deleteMessage,
    fetchBaseConhecimentos,
    createBaseConhecimento,
    updateBaseConhecimento,
    deleteBaseConhecimento,
    fetchSynapsesByBase,
    createSynapse,
    updateSynapse,
    deleteSynapse,
    fetchFeedbacks,
    fetchConversationMessages,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    fetchQuickReplyTemplates,
    createQuickReplyTemplate,
    updateQuickReplyTemplate,
    deleteQuickReplyTemplate,
    incrementQuickReplyUsage,
    updateGlobalFilters,
    resetData,
    fetchUserProfile,
    fetchTenantProfile,
    updateUserProfile,
    updateTenantProfile,
    fetchDashboardKpis,
    fetchConversationsByHour,
    fetchConversationKeywords,
    fetchTenantListWithConversationCounts,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData deve ser usado dentro de um DataProvider")
  }
  return context
}


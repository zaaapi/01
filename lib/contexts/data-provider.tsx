"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import {
  MockAppState,
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
  GlobalFilters,
} from "@/types"
import { getLocalData, setLocalData } from "@/lib/local-storage"
import { seedData } from "@/lib/seed-data"
import { createSupabaseClient } from "@/db"
import { FeatureModule } from "@/types"

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
  
  // NeuroCores
  createNeuroCore: (neurocore: Omit<NeuroCore, "id" | "createdAt">) => Promise<void>
  updateNeuroCore: (id: string, updates: Partial<NeuroCore>) => Promise<void>
  deleteNeuroCore: (id: string) => Promise<void>
  
  // Agents
  createAgent: (agent: Omit<Agent, "id" | "createdAt">) => Promise<void>
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>
  deleteAgent: (id: string) => Promise<void>
  
  // Contacts
  createContact: (contact: Omit<Contact, "id" | "createdAt">) => Promise<void>
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>
  deleteContact: (id: string) => Promise<void>
  
  // Conversations
  createConversation: (conversation: Omit<Conversation, "id" | "createdAt">) => Promise<void>
  updateConversation: (id: string, updates: Partial<Conversation>) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  
  // Messages
  createMessage: (message: Omit<Message, "id">) => Promise<void>
  updateMessage: (id: string, updates: Partial<Message>) => Promise<void>
  deleteMessage: (id: string) => Promise<void>
  
  // BaseConhecimento
  createBaseConhecimento: (base: Omit<BaseConhecimento, "id" | "createdAt">) => Promise<void>
  updateBaseConhecimento: (id: string, updates: Partial<BaseConhecimento>) => Promise<void>
  deleteBaseConhecimento: (id: string) => Promise<void>
  
  // Synapses
  createSynapse: (synapse: Omit<Synapse, "id" | "createdAt">) => Promise<void>
  updateSynapse: (id: string, updates: Partial<Synapse>) => Promise<void>
  deleteSynapse: (id: string) => Promise<void>
  
  // Feedbacks
  createFeedback: (feedback: Omit<Feedback, "id" | "createdAt">) => Promise<void>
  updateFeedback: (id: string, updates: Partial<Feedback>) => Promise<void>
  deleteFeedback: (id: string) => Promise<void>
  
  // QuickReplyTemplates
  createQuickReplyTemplate: (template: Omit<QuickReplyTemplate, "id" | "createdAt">) => Promise<void>
  updateQuickReplyTemplate: (id: string, updates: Partial<QuickReplyTemplate>) => Promise<void>
  deleteQuickReplyTemplate: (id: string) => Promise<void>
  
  // Global Filters
  updateGlobalFilters: (filters: Partial<GlobalFilters>) => Promise<void>
  
  // Reset data
  resetData: () => Promise<void>
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
        responsibleTech: t.responsible_tech || {
          name: "",
          whatsapp: "",
          email: "",
        },
        responsibleFinance: t.responsible_finance || {
          name: "",
          whatsapp: "",
          email: "",
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
        responsible_tech: tenant.responsibleTech,
        responsible_finance: tenant.responsibleFinance,
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
      if (updates.responsibleTech !== undefined) updateData.responsible_tech = updates.responsibleTech
      if (updates.responsibleFinance !== undefined) updateData.responsible_finance = updates.responsibleFinance
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

  // NeuroCores
  const createNeuroCore = useCallback(async (neurocore: Omit<NeuroCore, "id" | "createdAt">) => {
    await createEntity({ ...neurocore, createdAt: new Date().toISOString() }, "neurocores")
  }, [createEntity])

  const updateNeuroCore = useCallback(async (id: string, updates: Partial<NeuroCore>) => {
    await updateEntity(id, updates, "neurocores")
  }, [updateEntity])

  const deleteNeuroCore = useCallback(async (id: string) => {
    await deleteEntity(id, "neurocores")
  }, [deleteEntity])

  // Agents
  const createAgent = useCallback(async (agent: Omit<Agent, "id" | "createdAt">) => {
    await createEntity({ ...agent, createdAt: new Date().toISOString() }, "agents")
  }, [createEntity])

  const updateAgent = useCallback(async (id: string, updates: Partial<Agent>) => {
    await updateEntity(id, updates, "agents")
  }, [updateEntity])

  const deleteAgent = useCallback(async (id: string) => {
    await deleteEntity(id, "agents")
  }, [deleteEntity])

  // Contacts
  const createContact = useCallback(async (contact: Omit<Contact, "id" | "createdAt">) => {
    await createEntity({ ...contact, createdAt: new Date().toISOString() }, "contacts")
  }, [createEntity])

  const updateContact = useCallback(async (id: string, updates: Partial<Contact>) => {
    await updateEntity(id, updates, "contacts")
  }, [updateEntity])

  const deleteContact = useCallback(async (id: string) => {
    await deleteEntity(id, "contacts")
  }, [deleteEntity])

  // Conversations
  const createConversation = useCallback(async (conversation: Omit<Conversation, "id" | "createdAt">) => {
    await createEntity({ ...conversation, createdAt: new Date().toISOString() }, "conversations")
  }, [createEntity])

  const updateConversation = useCallback(async (id: string, updates: Partial<Conversation>) => {
    await updateEntity(id, updates, "conversations")
  }, [updateEntity])

  const deleteConversation = useCallback(async (id: string) => {
    await deleteEntity(id, "conversations")
  }, [deleteEntity])

  // Messages
  const createMessage = useCallback(async (message: Omit<Message, "id">) => {
    await createEntity(message, "messages")
  }, [createEntity])

  const updateMessage = useCallback(async (id: string, updates: Partial<Message>) => {
    await updateEntity(id, updates, "messages")
  }, [updateEntity])

  const deleteMessage = useCallback(async (id: string) => {
    await deleteEntity(id, "messages")
  }, [deleteEntity])

  // BaseConhecimento
  const createBaseConhecimento = useCallback(async (base: Omit<BaseConhecimento, "id" | "createdAt">) => {
    await createEntity({ ...base, createdAt: new Date().toISOString() }, "baseConhecimentos")
  }, [createEntity])

  const updateBaseConhecimento = useCallback(async (id: string, updates: Partial<BaseConhecimento>) => {
    await updateEntity(id, updates, "baseConhecimentos")
  }, [updateEntity])

  const deleteBaseConhecimento = useCallback(async (id: string) => {
    await deleteEntity(id, "baseConhecimentos")
  }, [deleteEntity])

  // Synapses
  const createSynapse = useCallback(async (synapse: Omit<Synapse, "id" | "createdAt">) => {
    await createEntity({ ...synapse, createdAt: new Date().toISOString() }, "synapses")
  }, [createEntity])

  const updateSynapse = useCallback(async (id: string, updates: Partial<Synapse>) => {
    await updateEntity(id, updates, "synapses")
  }, [updateEntity])

  const deleteSynapse = useCallback(async (id: string) => {
    await deleteEntity(id, "synapses")
  }, [deleteEntity])

  // Feedbacks
  const createFeedback = useCallback(async (feedback: Omit<Feedback, "id" | "createdAt">) => {
    await createEntity({ ...feedback, createdAt: new Date().toISOString() }, "feedbacks")
  }, [createEntity])

  const updateFeedback = useCallback(async (id: string, updates: Partial<Feedback>) => {
    await updateEntity(id, updates, "feedbacks")
  }, [updateEntity])

  const deleteFeedback = useCallback(async (id: string) => {
    await deleteEntity(id, "feedbacks")
  }, [deleteEntity])

  // QuickReplyTemplates
  const createQuickReplyTemplate = useCallback(async (template: Omit<QuickReplyTemplate, "id" | "createdAt">) => {
    await createEntity({ ...template, createdAt: new Date().toISOString() }, "quickReplyTemplates")
  }, [createEntity])

  const updateQuickReplyTemplate = useCallback(async (id: string, updates: Partial<QuickReplyTemplate>) => {
    await updateEntity(id, updates, "quickReplyTemplates")
  }, [updateEntity])

  const deleteQuickReplyTemplate = useCallback(async (id: string) => {
    await deleteEntity(id, "quickReplyTemplates")
  }, [deleteEntity])

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
        responsibleTech: data.responsible_tech || {
          name: "",
          whatsapp: "",
          email: "",
        },
        responsibleFinance: data.responsible_finance || {
          name: "",
          whatsapp: "",
          email: "",
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
      if (data.responsibleTech !== undefined) updateData.responsible_tech = data.responsibleTech
      if (data.responsibleFinance !== undefined) updateData.responsible_finance = data.responsibleFinance

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
    createNeuroCore,
    updateNeuroCore,
    deleteNeuroCore,
    createAgent,
    updateAgent,
    deleteAgent,
    createContact,
    updateContact,
    deleteContact,
    createConversation,
    updateConversation,
    deleteConversation,
    createMessage,
    updateMessage,
    deleteMessage,
    createBaseConhecimento,
    updateBaseConhecimento,
    deleteBaseConhecimento,
    createSynapse,
    updateSynapse,
    deleteSynapse,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    createQuickReplyTemplate,
    updateQuickReplyTemplate,
    deleteQuickReplyTemplate,
    updateGlobalFilters,
    resetData,
    fetchUserProfile,
    fetchTenantProfile,
    updateUserProfile,
    updateTenantProfile,
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


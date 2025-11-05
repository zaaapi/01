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

interface DataContextType {
  state: MockAppState
  isLoading: boolean
  
  // Tenants
  createTenant: (tenant: Omit<Tenant, "id" | "createdAt">) => Promise<void>
  updateTenant: (id: string, updates: Partial<Tenant>) => Promise<void>
  deleteTenant: (id: string) => Promise<void>
  
  // Users
  createUser: (user: Omit<User, "id" | "createdAt">) => Promise<void>
  updateUser: (id: string, updates: Partial<User>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  
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
    // Carregar dados do localStorage na inicialização
    const loadData = async () => {
      await simulateDelay()
      const data = getLocalData()
      setState(data)
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

  // Tenants
  const createTenant = useCallback(async (tenant: Omit<Tenant, "id" | "createdAt">) => {
    await createEntity({ ...tenant, createdAt: new Date().toISOString() }, "tenants")
  }, [createEntity])

  const updateTenant = useCallback(async (id: string, updates: Partial<Tenant>) => {
    await updateEntity(id, updates, "tenants")
  }, [updateEntity])

  const deleteTenant = useCallback(async (id: string) => {
    await deleteEntity(id, "tenants")
  }, [deleteEntity])

  // Users
  const createUser = useCallback(async (user: Omit<User, "id" | "createdAt">) => {
    await createEntity({ ...user, createdAt: new Date().toISOString() }, "users")
  }, [createEntity])

  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    await updateEntity(id, updates, "users")
  }, [updateEntity])

  const deleteUser = useCallback(async (id: string) => {
    await deleteEntity(id, "users")
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

  const value: DataContextType = {
    state,
    isLoading,
    createTenant,
    updateTenant,
    deleteTenant,
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


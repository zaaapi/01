"use client"

import { createContext, useContext, ReactNode } from "react"

/**
 * DEPRECATED: Este contexto foi substituído pelos hooks React Query em lib/hooks/data
 * Mantido temporariamente para compatibilidade com código legado
 *
 * TODO: Remover este arquivo após migrar todos os componentes para React Query hooks
 */

type DataContextType = Record<string, never>

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  console.warn(
    "DataProvider is deprecated. Please use React Query hooks from lib/hooks/data instead."
  )

  return <DataContext.Provider value={{}}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)

  if (!context) {
    console.warn("useData is deprecated. Please use React Query hooks from lib/hooks/data instead.")
  }

  // Retorna stubs temporários para permitir build
  // TODO: Remover após migrar todos componentes para React Query
  return {
    // Stubs para compatibilidade temporária
    fetchBaseConhecimentos: async () => [],
    fetchSynapsesByBase: async () => [],
    createBaseConhecimento: async () => ({}),
    updateBaseConhecimento: async () => {},
    deleteBaseConhecimento: async () => {},
    fetchTenantProfile: async () => null,
    fetchNeurocores: async () => [],
    createSynapse: async () => ({}),
    updateSynapse: async () => {},
    deleteSynapse: async () => {},
    updateConversation: async () => {},
    updateMessageFeedback: async () => {},
    state: {} as any,
    fetchDashboardKpis: async () => ({}),
    fetchConversationsByHour: async () => [],
    fetchConversationKeywords: async () => [],
    fetchTenantListWithConversationCounts: async () => [],
    updateGlobalFilters: () => {},
    seedData: async () => {},
    isLoading: false,
  } as any
}

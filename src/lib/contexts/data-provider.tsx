"use client"

import { createContext, useContext, ReactNode } from "react"

/**
 * DEPRECATED: Este contexto foi substituído pelos hooks React Query em lib/hooks/data
 * Mantido temporariamente para compatibilidade com código legado
 *
 * TODO: Remover este arquivo após migrar todos os componentes para React Query hooks
 */

interface DataContextType {
  // Stub vazio - os componentes devem migrar para hooks React Query
}

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

  // Retorna objeto vazio - componentes devem migrar para React Query
  return {}
}

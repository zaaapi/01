"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { User } from "@/types"
import { getLocalData, setLocalData } from "@/lib/local-storage"

interface AuthContextType {
  currentAuthUser: User | null
  login: (user: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentAuthUser, setCurrentAuthUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Carregar usuário do localStorage na inicialização
    const data = getLocalData()
    if (data.currentAuthUser) {
      setCurrentAuthUser(data.currentAuthUser)
    }
    setIsLoading(false)
  }, [])

  const login = (user: User) => {
    setCurrentAuthUser(user)
    const data = getLocalData()
    const updatedData = { ...data, currentAuthUser: user }
    setLocalData(updatedData)
  }

  const logout = () => {
    setCurrentAuthUser(null)
    const data = getLocalData()
    const updatedData = { ...data, currentAuthUser: null }
    setLocalData(updatedData)
  }

  return (
    <AuthContext.Provider value={{ currentAuthUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}


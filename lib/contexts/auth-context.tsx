"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { useRouter } from "next/navigation"
import { User, UserRole } from "@/types"
import { createSupabaseClient } from "@/db"
import type { AuthError } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null // Perfil completo de public.users
  isLoadingAuth: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const router = useRouter()
  const supabase = createSupabaseClient()

  // Função para buscar perfil completo do usuário em public.users
  const fetchUserProfile = useCallback(async (userId: string): Promise<User | null> => {
    try {
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
        role: data.role as UserRole,
        avatarUrl: data.avatar_url || "",
        modules: data.modules || [],
        isActive: data.is_active ?? true,
        lastSignInAt: data.last_sign_in_at || null,
        createdAt: data.created_at || new Date().toISOString(),
      }
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error)
      return null
    }
  }, [supabase])

  // Função para redirecionar baseado na role do usuário
  const redirectByRole = useCallback((userRole: UserRole) => {
    if (typeof window === "undefined") return
    
    const targetPath = userRole === "super_admin" ? "/super-admin" : "/cliente"
    const currentPath = window.location.pathname
    
    // Verificar se já estamos na rota correta
    if (currentPath.startsWith(targetPath)) {
      return // Já está na rota correta
    }
    
    // Usar window.location.href para garantir o redirecionamento
    window.location.href = targetPath
  }, [])

  // Escutar mudanças de autenticação
  useEffect(() => {
    // Verificar sessão inicial
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id)
          setUser(userProfile)
          
          // Se o usuário está na página de login/signup e já está autenticado, redirecionar
          if (userProfile && typeof window !== "undefined") {
            const currentPath = window.location.pathname
            if (currentPath === "/login" || currentPath === "/signup") {
              redirectByRole(userProfile.role)
            }
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error)
        setUser(null)
      } finally {
        setIsLoadingAuth(false)
      }
    }

    checkSession()

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const userProfile = await fetchUserProfile(session.user.id)
        setUser(userProfile)

        // Redirecionar baseado na role
        if (userProfile) {
          redirectByRole(userProfile.role)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        router.replace("/login")
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // Atualizar perfil quando o token é renovado
        const userProfile = await fetchUserProfile(session.user.id)
        setUser(userProfile)
      }

      setIsLoadingAuth(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchUserProfile, router, redirectByRole])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Buscar perfil imediatamente após login bem-sucedido
      if (data.user) {
        const userProfile = await fetchUserProfile(data.user.id)
        setUser(userProfile)
        
        // Redirecionar imediatamente após buscar o perfil
        if (userProfile) {
          redirectByRole(userProfile.role)
        } else {
          // Se o perfil não foi encontrado, tentar novamente após um delay
          // Isso pode acontecer se o trigger ainda não executou
          setTimeout(() => {
            const retryProfile = async () => {
              const retry = await fetchUserProfile(data.user.id)
              if (retry) {
                setUser(retry)
                redirectByRole(retry.role)
              }
            }
            retryProfile()
          }, 1000)
        }
      }
    } catch (error) {
      const authError = error as AuthError
      throw new Error(authError.message || "Erro ao fazer login")
    }
  }, [supabase, fetchUserProfile, redirectByRole])

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        throw error
      }

      // O usuário será criado em public.users pelo trigger handle_new_user
      // Após confirmação de email, o onAuthStateChange será disparado
    } catch (error) {
      const authError = error as AuthError
      throw new Error(authError.message || "Erro ao criar conta")
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      setUser(null)
      router.replace("/login")
    } catch (error) {
      const authError = error as AuthError
      throw new Error(authError.message || "Erro ao fazer logout")
    }
  }, [supabase, router])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoadingAuth,
        signIn,
        signUp,
        signOut,
      }}
    >
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

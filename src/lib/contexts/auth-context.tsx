"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react"
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
  refreshUser: () => Promise<void> // Atualizar perfil do usuário após alterações
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const router = useRouter()
  const supabase = createSupabaseClient()
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Função para buscar perfil completo do usuário em public.users
  const fetchUserProfile = useCallback(
    async (userId: string): Promise<User | null> => {
      try {
        const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

        if (error) {
          // Se for erro de permissão RLS, pode ser que o usuário ainda não tenha o perfil criado
          // Ou que a política RLS não esteja configurada corretamente
          console.error("Erro ao buscar perfil do usuário:", error)
          // Não lançar erro, apenas retornar null para não bloquear o fluxo
          return null
        }

        if (!data) {
          console.warn("Perfil do usuário não encontrado na tabela public.users")
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
        console.error("Exceção ao buscar perfil do usuário:", error)
        return null
      }
    },
    [supabase]
  )

  // Função para redirecionar baseado na role do usuário
  const redirectByRole = useCallback(
    (userRole: UserRole) => {
      const targetPath = userRole === "super_admin" ? "/super-admin" : "/cliente"

      // Usar router.replace() para navegação SPA (sem recarregar página)
      router.replace(targetPath)
    },
    [router]
  )

  // Escutar mudanças de autenticação
  useEffect(() => {
    let isMounted = true

    // Timeout de segurança para garantir que o loading sempre seja desativado
    loadingTimeoutRef.current = setTimeout(() => {
      if (isMounted) {
        console.warn("Timeout de segurança: desativando loading após 3 segundos")
        setIsLoadingAuth(false)
      }
    }, 3000) // Máximo 3 segundos de loading

    // Verificar sessão inicial
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (!isMounted) return

        if (sessionError) {
          console.error("Erro ao obter sessão:", sessionError)
          if (isMounted) {
            setUser(null)
            setIsLoadingAuth(false)
          }
          return
        }

        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id)
          if (isMounted) {
            // Verificar se o usuário tem perfil e está ativo
            if (!userProfile) {
              console.error("Perfil do usuário não encontrado na sessão inicial")
              setUser(null)
              setIsLoadingAuth(false)
              return
            }

            // Verificar se o usuário está ativo
            if (!userProfile.isActive) {
              console.warn("Usuário inativo na sessão inicial")
              await supabase.auth.signOut()
              setUser(null)
              setIsLoadingAuth(false)
              return
            }

            setUser(userProfile)

            // Se o usuário está na página de login/signup e já está autenticado, redirecionar
            if (typeof window !== "undefined") {
              const currentPath = window.location.pathname
              if (currentPath === "/login" || currentPath === "/signup") {
                redirectByRole(userProfile.role)
              }
            }
          }
        } else {
          if (isMounted) {
            setUser(null)
          }
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error)
        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
          loadingTimeoutRef.current = null
        }
        if (isMounted) {
          setIsLoadingAuth(false)
        }
      }
    }

    checkSession()

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      // Limpar timeout de segurança quando há mudança de autenticação
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }

      if (event === "SIGNED_IN" && session?.user) {
        const userProfile = await fetchUserProfile(session.user.id)
        if (isMounted) {
          // Verificar se o usuário tem perfil e está ativo
          if (!userProfile) {
            console.error("Perfil do usuário não encontrado após login")
            // Fazer logout se o perfil não foi encontrado
            await supabase.auth.signOut()
            setUser(null)
            router.replace("/login")
            return
          }

          // Verificar se o usuário está ativo
          if (!userProfile.isActive) {
            console.warn("Usuário inativo tentando fazer login")
            // Fazer logout se o usuário está inativo
            await supabase.auth.signOut()
            setUser(null)
            router.replace("/login")
            return
          }

          setUser(userProfile)

          // Redirecionar baseado na role
          redirectByRole(userProfile.role)
        }
      } else if (event === "SIGNED_OUT") {
        if (isMounted) {
          setUser(null)
          router.replace("/login")
        }
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // Atualizar perfil quando o token é renovado
        const userProfile = await fetchUserProfile(session.user.id)
        if (isMounted) {
          // Verificar se o usuário tem perfil e está ativo
          if (!userProfile || !userProfile.isActive) {
            console.warn("Usuário sem perfil ou inativo durante refresh do token")
            await supabase.auth.signOut()
            setUser(null)
            router.replace("/login")
            return
          }
          setUser(userProfile)
        }
      } else if (event === "INITIAL_SESSION") {
        // Evento inicial - já tratado pelo checkSession acima
        // Mas garantimos que o loading seja desativado
      }

      if (isMounted) {
        setIsLoadingAuth(false)
      }
    })

    return () => {
      isMounted = false
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
      subscription.unsubscribe()
    }
  }, [supabase, fetchUserProfile, router, redirectByRole])

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw error
        }

        // Verificar se o usuário tem perfil e está ativo após login bem-sucedido
        if (data?.user) {
          const userProfile = await fetchUserProfile(data.user.id)

          if (!userProfile) {
            // Fazer logout se o perfil não foi encontrado
            await supabase.auth.signOut()
            throw new Error("Perfil do usuário não encontrado. Entre em contato com o suporte.")
          }

          if (!userProfile.isActive) {
            // Fazer logout se o usuário está inativo
            await supabase.auth.signOut()
            throw new Error("Sua conta está inativa. Entre em contato com o administrador.")
          }
        }

        // O redirecionamento será feito automaticamente pelo onAuthStateChange
        // quando o evento SIGNED_IN for disparado
      } catch (error) {
        const authError = error as AuthError
        // Se já é um Error, usar a mensagem existente
        if (error instanceof Error) {
          throw error
        }
        throw new Error(authError.message || "Erro ao fazer login")
      }
    },
    [supabase, fetchUserProfile]
  )

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
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
    },
    [supabase]
  )

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      // O redirecionamento será feito automaticamente pelo onAuthStateChange
      // quando o evento SIGNED_OUT for disparado
      // Não precisamos fazer nada aqui além de garantir que o logout foi bem-sucedido
    } catch (error) {
      const authError = error as AuthError
      throw new Error(authError.message || "Erro ao fazer logout")
    }
  }, [supabase])

  const refreshUser = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id)
        if (userProfile) {
          setUser(userProfile)
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil do usuário:", error)
    }
  }, [supabase, fetchUserProfile])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoadingAuth,
        signIn,
        signUp,
        signOut,
        refreshUser,
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

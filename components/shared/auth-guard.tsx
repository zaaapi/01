"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: ("super_admin" | "usuario_cliente")[]
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, isLoadingAuth } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoadingAuth) return

    // Se não está logado, redirecionar para login
    if (!user) {
      router.replace("/login")
      return
    }

    // Se há roles permitidas e o usuário não tem permissão
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Redirecionar para o dashboard apropriado baseado na role do usuário
      if (user.role === "super_admin") {
        router.replace("/super-admin")
      } else if (user.role === "usuario_cliente") {
        router.replace("/cliente")
      } else {
        router.replace("/login")
      }
      return
    }

    // Proteção de rotas específicas por role
    if (pathname.startsWith("/super-admin") && user.role !== "super_admin") {
      router.replace("/cliente")
      return
    }

    if (pathname.startsWith("/cliente") && user.role !== "usuario_cliente") {
      router.replace("/super-admin")
      return
    }
  }, [user, isLoadingAuth, allowedRoles, router, pathname])

  // Se ainda está carregando, não renderizar nada (evitar flash de loading)
  if (isLoadingAuth) {
    return null
  }

  // Se não está logado, não renderizar children (o redirecionamento já foi feito no useEffect)
  if (!user) {
    return null
  }

  // Se há roles permitidas e o usuário não tem permissão, não renderizar children
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}


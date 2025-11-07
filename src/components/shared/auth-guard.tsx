"use client"

import { useAuth } from "@/lib/contexts/auth-context"
import { LoadingScreen } from "@/components/shared/loading-screen"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: ("super_admin" | "usuario_cliente")[]
}

/**
 * AuthGuard
 *
 * Componente de proteção de rotas no cliente (Camada 2 de Defesa).
 * Complementa o Middleware (Camada 1) garantindo sincronização com AuthContext.
 *
 * Responsabilidades:
 * - Gerenciar estados de loading (isLoadingAuth)
 * - Garantir que user está disponível antes de renderizar
 * - Verificar permissões de role como backup de segurança
 * - Prevenir race conditions entre middleware e AuthContext
 *
 * Nota: O Middleware já faz redirecionamentos. Este componente foca em UX
 * e sincronização com o estado do AuthContext.
 */
export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, isLoadingAuth } = useAuth()

  // Mostrar loading enquanto o AuthContext está carregando
  if (isLoadingAuth) {
    return <LoadingScreen />
  }

  // Se não há usuário (middleware já redirecionou, mas protege contra race condition)
  if (!user) {
    return <LoadingScreen />
  }

  // Verificar se o usuário está ativo (backup de segurança)
  if (!user.isActive) {
    return <LoadingScreen />
  }

  // Verificar permissões de role (backup de segurança - middleware já validou)
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <LoadingScreen />
  }

  // Tudo OK, renderizar conteúdo protegido
  return <>{children}</>
}

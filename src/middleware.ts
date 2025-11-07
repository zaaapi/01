import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

/**
 * Middleware de Autenticação
 *
 * Intercepta requisições no Edge Runtime (servidor) para:
 * - Verificar autenticação Supabase
 * - Validar perfil e status do usuário (isActive)
 * - Controlar acesso baseado em role (super_admin vs usuario_cliente)
 * - Redirecionar para rotas apropriadas
 *
 * Camada 1 de Defesa (Servidor) - Complementa AuthGuard (Cliente)
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname

  // Criar resposta que pode ser modificada
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Criar cliente Supabase SSR
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verificar sessão do usuário
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  // Rotas públicas que sempre devem ser acessíveis
  const publicRoutes = ["/", "/logged-out"]

  // Rotas de autenticação (login/signup)
  const authRoutes = ["/login", "/signup"]

  // Se a rota é totalmente pública (não precisa verificar sessão)
  if (publicRoutes.includes(url)) {
    // Se está logado e acessa a home, redirecionar para dashboard apropriado
    if (url === "/" && session?.user) {
      const userProfile = await fetchUserProfile(session.user.id, supabase)
      if (userProfile && userProfile.is_active) {
        const dashboardPath = userProfile.role === "super_admin" ? "/super-admin" : "/cliente"
        return NextResponse.redirect(new URL(dashboardPath, request.url))
      }
    }
    return response
  }

  // Se é rota de autenticação (login/signup)
  if (authRoutes.includes(url)) {
    // Se já está logado, redirecionar para dashboard
    if (session?.user) {
      const userProfile = await fetchUserProfile(session.user.id, supabase)
      if (userProfile && userProfile.is_active) {
        const dashboardPath = userProfile.role === "super_admin" ? "/super-admin" : "/cliente"
        return NextResponse.redirect(new URL(dashboardPath, request.url))
      }
    }
    // Se não está logado, permitir acesso
    return response
  }

  // Rotas protegidas - verificar autenticação
  if (url.startsWith("/cliente") || url.startsWith("/super-admin")) {
    // Verificar se tem sessão
    if (!session || sessionError) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Buscar perfil completo do usuário
    const userProfile = await fetchUserProfile(session.user.id, supabase)

    // Se não encontrou perfil, fazer logout e redirecionar
    if (!userProfile) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Verificar se o usuário está ativo
    if (!userProfile.is_active) {
      // Fazer logout de usuário inativo
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Verificar permissões baseadas em role
    if (url.startsWith("/super-admin") && userProfile.role !== "super_admin") {
      // Usuario_cliente tentando acessar super-admin
      return NextResponse.redirect(new URL("/cliente", request.url))
    }

    if (url.startsWith("/cliente") && userProfile.role !== "usuario_cliente") {
      // Super_admin tentando acessar cliente
      return NextResponse.redirect(new URL("/super-admin", request.url))
    }

    // Tudo OK, permitir acesso
    return response
  }

  // Outras rotas não especificadas - permitir acesso
  return response
}

/**
 * Helper: Buscar perfil do usuário da tabela public.users
 */
async function fetchUserProfile(userId: string, supabase: any) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, role, is_active, tenant_id")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Middleware - Erro ao buscar perfil:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Middleware - Exceção ao buscar perfil:", error)
    return null
  }
}

/**
 * Configuração do Matcher
 * Define quais rotas o middleware deve interceptar
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

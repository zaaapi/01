import { createBrowserClient, createServerClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Cliente para uso no servidor (Server Components, Server Actions)
// IMPORTANTE: Use createSupabaseServerClient() em Server Components/Actions
export function createSupabaseServerClient(): SupabaseClient {
  // Import dinâmico para evitar erro em Client Components
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { cookies } = require("next/headers")
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

// Cliente para uso no cliente (Client Components)
// Esta função pode ser chamada em Client Components sem problemas
export function createSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Para helpers de autenticação, use os arquivos em db/auth-helpers.ts
// que são otimizados para Server Components e Server Actions

import { createClient } from '@supabase/supabase-js';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Cliente para uso no servidor (Server Components, Server Actions)
// IMPORTANTE: Use createSupabaseServerClient() em Server Components/Actions
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

// Cliente para uso no cliente (Client Components)
export function createSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Cliente simples para uso quando não há necessidade de cookies (use com cuidado)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Para helpers de autenticação, use os arquivos em db/auth-helpers.ts
// que são otimizados para Server Components e Server Actions

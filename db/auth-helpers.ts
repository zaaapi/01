import { createSupabaseServerClient } from '@/db';
import { cookies } from 'next/headers';

/**
 * Helper para obter usuário atual no servidor
 * Use em Server Components e Server Actions
 */
export async function getCurrentUser() {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    throw new Error(`Erro ao obter usuário: ${error.message}`);
  }
  
  return user;
}

/**
 * Helper para obter usuário com dados da tabela users
 * Use em Server Components e Server Actions
 */
export async function getCurrentUserWithProfile() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) {
    throw new Error(`Erro ao obter perfil do usuário: ${error.message}`);
  }
  
  return data;
}

/**
 * Helper para verificar se usuário é super admin
 * Use em Server Components e Server Actions
 */
export async function isSuperAdmin() {
  const userProfile = await getCurrentUserWithProfile();
  return userProfile?.role === 'super_admin';
}

/**
 * Helper para obter tenant_id do usuário atual
 * Use em Server Components e Server Actions
 */
export async function getCurrentUserTenantId() {
  const userProfile = await getCurrentUserWithProfile();
  return userProfile?.tenant_id ?? null;
}

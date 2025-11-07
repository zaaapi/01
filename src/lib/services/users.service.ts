import { createSupabaseClient } from "@/db"
import { User, FeatureModule } from "@/types"
import { mapUserFromDB, mapUserToDB, mapFeatureModuleFromDB } from "./mappers"

export interface CreateUserDTO extends Omit<User, "id" | "createdAt"> {}
export interface UpdateUserDTO extends Partial<Omit<User, "id" | "createdAt">> {}

/**
 * Buscar usuários por tenant
 */
export async function fetchUsersByTenant(tenantId: string): Promise<User[]> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar usuários: ${error.message}`)
    }

    return (data || []).map(mapUserFromDB)
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    throw error
  }
}

/**
 * Buscar usuário por ID
 */
export async function fetchUserById(id: string): Promise<User | null> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

    if (error) {
      throw new Error(`Erro ao buscar usuário: ${error.message}`)
    }

    return data ? mapUserFromDB(data) : null
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    throw error
  }
}

/**
 * Buscar todos os módulos de features disponíveis
 */
export async function fetchAllFeatureModules(): Promise<FeatureModule[]> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase.from("feature_modules").select("*").order("name")

    if (error) {
      throw new Error(`Erro ao buscar feature modules: ${error.message}`)
    }

    return (data || []).map(mapFeatureModuleFromDB)
  } catch (error) {
    console.error("Erro ao buscar feature modules:", error)
    throw error
  }
}

/**
 * Criar novo usuário
 */
export async function createUser(data: CreateUserDTO): Promise<User> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapUserToDB(data)

    const { data: createdData, error } = await supabase
      .from("users")
      .insert(dbData)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar usuário: ${error.message}`)
    }

    return mapUserFromDB(createdData)
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    throw error
  }
}

/**
 * Atualizar usuário existente
 */
export async function updateUser(id: string, data: UpdateUserDTO): Promise<User> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapUserToDB(data)

    const { data: updatedData, error } = await supabase
      .from("users")
      .update(dbData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`)
    }

    return mapUserFromDB(updatedData)
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error)
    throw error
  }
}

/**
 * Deletar usuário
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase.from("users").delete().eq("id", id)

    if (error) {
      throw new Error(`Erro ao deletar usuário: ${error.message}`)
    }
  } catch (error) {
    console.error("Erro ao deletar usuário:", error)
    throw error
  }
}

import { createSupabaseClient } from "@/db"
import { Tenant } from "@/types"
import { mapTenantFromDB, mapTenantToDB } from "./mappers"

export type TenantFilter = "all" | "active" | "inactive"

export interface CreateTenantDTO extends Omit<Tenant, "id" | "createdAt"> {}
export interface UpdateTenantDTO extends Partial<Omit<Tenant, "id" | "createdAt">> {}

/**
 * Buscar tenants com filtro opcional
 */
export async function fetchTenants(filter: TenantFilter = "all"): Promise<Tenant[]> {
  try {
    const supabase = createSupabaseClient()
    let query = supabase.from("tenants").select("*")

    if (filter === "active") {
      query = query.eq("is_active", true)
    } else if (filter === "inactive") {
      query = query.eq("is_active", false)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar tenants: ${error.message}`)
    }

    return (data || []).map(mapTenantFromDB)
  } catch (error) {
    console.error("Erro ao buscar tenants:", error)
    throw error
  }
}

/**
 * Buscar tenant por ID
 */
export async function fetchTenantById(id: string): Promise<Tenant | null> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase.from("tenants").select("*").eq("id", id).single()

    if (error) {
      throw new Error(`Erro ao buscar tenant: ${error.message}`)
    }

    return data ? mapTenantFromDB(data) : null
  } catch (error) {
    console.error("Erro ao buscar tenant:", error)
    throw error
  }
}

/**
 * Criar novo tenant
 */
export async function createTenant(data: CreateTenantDTO): Promise<Tenant> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapTenantToDB(data)

    const { data: createdData, error } = await supabase
      .from("tenants")
      .insert(dbData)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar tenant: ${error.message}`)
    }

    return mapTenantFromDB(createdData)
  } catch (error) {
    console.error("Erro ao criar tenant:", error)
    throw error
  }
}

/**
 * Atualizar tenant existente
 */
export async function updateTenant(id: string, data: UpdateTenantDTO): Promise<Tenant> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapTenantToDB(data)

    const { data: updatedData, error } = await supabase
      .from("tenants")
      .update(dbData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar tenant: ${error.message}`)
    }

    return mapTenantFromDB(updatedData)
  } catch (error) {
    console.error("Erro ao atualizar tenant:", error)
    throw error
  }
}

/**
 * Deletar tenant
 */
export async function deleteTenant(id: string): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase.from("tenants").delete().eq("id", id)

    if (error) {
      throw new Error(`Erro ao deletar tenant: ${error.message}`)
    }
  } catch (error) {
    console.error("Erro ao deletar tenant:", error)
    throw error
  }
}

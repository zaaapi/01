import { createSupabaseClient } from "@/db"
import { BaseConhecimento } from "@/types"
import { mapBaseConhecimentoFromDB, mapBaseConhecimentoToDB } from "./mappers"

export type CreateBaseConhecimentoDTO = Omit<BaseConhecimento, "id" | "createdAt">
export type UpdateBaseConhecimentoDTO = Partial<Omit<BaseConhecimento, "id" | "createdAt">>

/**
 * Buscar bases de conhecimento por tenant
 */
export async function fetchBaseConhecimentosByTenant(
  tenantId: string
): Promise<BaseConhecimento[]> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("base_conhecimentos")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar bases de conhecimento: ${error.message}`)
    }

    return (data || []).map(mapBaseConhecimentoFromDB)
  } catch (error) {
    console.error("Erro ao buscar bases de conhecimento:", error)
    throw error
  }
}

/**
 * Buscar base de conhecimento por ID
 */
export async function fetchBaseConhecimentoById(id: string): Promise<BaseConhecimento | null> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("base_conhecimentos")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      throw new Error(`Erro ao buscar base de conhecimento: ${error.message}`)
    }

    return data ? mapBaseConhecimentoFromDB(data) : null
  } catch (error) {
    console.error("Erro ao buscar base de conhecimento:", error)
    throw error
  }
}

/**
 * Criar nova base de conhecimento
 */
export async function createBaseConhecimento(
  data: CreateBaseConhecimentoDTO
): Promise<BaseConhecimento> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapBaseConhecimentoToDB(data)

    const { data: createdData, error } = await supabase
      .from("base_conhecimentos")
      .insert(dbData)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar base de conhecimento: ${error.message}`)
    }

    return mapBaseConhecimentoFromDB(createdData)
  } catch (error) {
    console.error("Erro ao criar base de conhecimento:", error)
    throw error
  }
}

/**
 * Atualizar base de conhecimento existente
 */
export async function updateBaseConhecimento(
  id: string,
  data: UpdateBaseConhecimentoDTO
): Promise<BaseConhecimento> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapBaseConhecimentoToDB(data)

    const { data: updatedData, error } = await supabase
      .from("base_conhecimentos")
      .update(dbData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar base de conhecimento: ${error.message}`)
    }

    return mapBaseConhecimentoFromDB(updatedData)
  } catch (error) {
    console.error("Erro ao atualizar base de conhecimento:", error)
    throw error
  }
}

/**
 * Deletar base de conhecimento
 */
export async function deleteBaseConhecimento(id: string): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase.from("base_conhecimentos").delete().eq("id", id)

    if (error) {
      throw new Error(`Erro ao deletar base de conhecimento: ${error.message}`)
    }
  } catch (error) {
    console.error("Erro ao deletar base de conhecimento:", error)
    throw error
  }
}

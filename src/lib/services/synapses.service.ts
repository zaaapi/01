import { createSupabaseClient } from "@/db"
import { Synapse } from "@/types"
import { mapSynapseFromDB, mapSynapseToDB } from "./mappers"

export type CreateSynapseDTO = Omit<Synapse, "id" | "createdAt">
export type UpdateSynapseDTO = Partial<Omit<Synapse, "id" | "createdAt">>

/**
 * Buscar synapses por base de conhecimento
 */
export async function fetchSynapsesByBaseConhecimento(
  baseConhecimentoId: string
): Promise<Synapse[]> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("synapses")
      .select("*")
      .eq("base_conhecimento_id", baseConhecimentoId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar synapses: ${error.message}`)
    }

    return (data || []).map(mapSynapseFromDB)
  } catch (error) {
    console.error("Erro ao buscar synapses:", error)
    throw error
  }
}

/**
 * Buscar synapses por tenant
 */
export async function fetchSynapsesByTenant(tenantId: string): Promise<Synapse[]> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("synapses")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar synapses: ${error.message}`)
    }

    return (data || []).map(mapSynapseFromDB)
  } catch (error) {
    console.error("Erro ao buscar synapses:", error)
    throw error
  }
}

/**
 * Buscar synapse por ID
 */
export async function fetchSynapseById(id: string): Promise<Synapse | null> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase.from("synapses").select("*").eq("id", id).single()

    if (error) {
      throw new Error(`Erro ao buscar synapse: ${error.message}`)
    }

    return data ? mapSynapseFromDB(data) : null
  } catch (error) {
    console.error("Erro ao buscar synapse:", error)
    throw error
  }
}

/**
 * Criar nova synapse
 */
export async function createSynapse(data: CreateSynapseDTO): Promise<Synapse> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapSynapseToDB(data)

    const { data: createdData, error } = await supabase
      .from("synapses")
      .insert(dbData)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar synapse: ${error.message}`)
    }

    return mapSynapseFromDB(createdData)
  } catch (error) {
    console.error("Erro ao criar synapse:", error)
    throw error
  }
}

/**
 * Atualizar synapse existente
 */
export async function updateSynapse(id: string, data: UpdateSynapseDTO): Promise<Synapse> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapSynapseToDB(data)

    const { data: updatedData, error } = await supabase
      .from("synapses")
      .update(dbData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar synapse: ${error.message}`)
    }

    return mapSynapseFromDB(updatedData)
  } catch (error) {
    console.error("Erro ao atualizar synapse:", error)
    throw error
  }
}

/**
 * Deletar synapse
 */
export async function deleteSynapse(id: string): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase.from("synapses").delete().eq("id", id)

    if (error) {
      throw new Error(`Erro ao deletar synapse: ${error.message}`)
    }
  } catch (error) {
    console.error("Erro ao deletar synapse:", error)
    throw error
  }
}

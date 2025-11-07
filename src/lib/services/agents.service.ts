import { createSupabaseClient } from "@/db"
import { Agent } from "@/types"
import { mapAgentFromDB, mapAgentToDB } from "./mappers"

export interface CreateAgentDTO extends Omit<Agent, "id" | "createdAt"> {}
export interface UpdateAgentDTO extends Partial<Omit<Agent, "id" | "createdAt">> {}

/**
 * Buscar todos os agents
 */
export async function fetchAgents(): Promise<Agent[]> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar agents: ${error.message}`)
    }

    return (data || []).map(mapAgentFromDB)
  } catch (error) {
    console.error("Erro ao buscar agents:", error)
    throw error
  }
}

/**
 * Buscar agent por ID
 */
export async function fetchAgentById(id: string): Promise<Agent | null> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase.from("agents").select("*").eq("id", id).single()

    if (error) {
      throw new Error(`Erro ao buscar agent: ${error.message}`)
    }

    return data ? mapAgentFromDB(data) : null
  } catch (error) {
    console.error("Erro ao buscar agent:", error)
    throw error
  }
}

/**
 * Criar novo agent
 */
export async function createAgent(data: CreateAgentDTO): Promise<Agent> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapAgentToDB(data)

    const { data: createdData, error } = await supabase
      .from("agents")
      .insert(dbData)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar agent: ${error.message}`)
    }

    return mapAgentFromDB(createdData)
  } catch (error) {
    console.error("Erro ao criar agent:", error)
    throw error
  }
}

/**
 * Atualizar agent existente
 */
export async function updateAgent(id: string, data: UpdateAgentDTO): Promise<Agent> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapAgentToDB(data)

    const { data: updatedData, error } = await supabase
      .from("agents")
      .update(dbData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar agent: ${error.message}`)
    }

    return mapAgentFromDB(updatedData)
  } catch (error) {
    console.error("Erro ao atualizar agent:", error)
    throw error
  }
}

/**
 * Deletar agent
 */
export async function deleteAgent(id: string): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase.from("agents").delete().eq("id", id)

    if (error) {
      throw new Error(`Erro ao deletar agent: ${error.message}`)
    }
  } catch (error) {
    console.error("Erro ao deletar agent:", error)
    throw error
  }
}

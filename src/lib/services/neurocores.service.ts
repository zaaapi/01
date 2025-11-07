import { createSupabaseClient } from "@/db"
import { NeuroCore } from "@/types"
import { mapNeuroCoreFromDB, mapNeuroCoreToDB } from "./mappers"

export interface CreateNeuroCoreDTO extends Omit<NeuroCore, "id" | "createdAt"> {}
export interface UpdateNeuroCoreDTO extends Partial<Omit<NeuroCore, "id" | "createdAt">> {}

/**
 * Buscar todos os neurocores
 */
export async function fetchNeurocores(): Promise<NeuroCore[]> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("neurocores")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar neurocores: ${error.message}`)
    }

    return (data || []).map(mapNeuroCoreFromDB)
  } catch (error) {
    console.error("Erro ao buscar neurocores:", error)
    throw error
  }
}

/**
 * Buscar neurocore por ID
 */
export async function fetchNeurocoreById(id: string): Promise<NeuroCore | null> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase.from("neurocores").select("*").eq("id", id).single()

    if (error) {
      throw new Error(`Erro ao buscar neurocore: ${error.message}`)
    }

    return data ? mapNeuroCoreFromDB(data) : null
  } catch (error) {
    console.error("Erro ao buscar neurocore:", error)
    throw error
  }
}

/**
 * Criar novo neurocore
 */
export async function createNeurocore(data: CreateNeuroCoreDTO): Promise<NeuroCore> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapNeuroCoreToDB(data)

    const { data: createdData, error } = await supabase
      .from("neurocores")
      .insert(dbData)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar neurocore: ${error.message}`)
    }

    return mapNeuroCoreFromDB(createdData)
  } catch (error) {
    console.error("Erro ao criar neurocore:", error)
    throw error
  }
}

/**
 * Atualizar neurocore existente
 */
export async function updateNeurocore(id: string, data: UpdateNeuroCoreDTO): Promise<NeuroCore> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapNeuroCoreToDB(data)

    const { data: updatedData, error } = await supabase
      .from("neurocores")
      .update(dbData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar neurocore: ${error.message}`)
    }

    return mapNeuroCoreFromDB(updatedData)
  } catch (error) {
    console.error("Erro ao atualizar neurocore:", error)
    throw error
  }
}

/**
 * Deletar neurocore
 */
export async function deleteNeurocore(id: string): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase.from("neurocores").delete().eq("id", id)

    if (error) {
      throw new Error(`Erro ao deletar neurocore: ${error.message}`)
    }
  } catch (error) {
    console.error("Erro ao deletar neurocore:", error)
    throw error
  }
}

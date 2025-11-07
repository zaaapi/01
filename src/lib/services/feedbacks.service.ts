import { createSupabaseClient } from "@/db"
import { Feedback } from "@/types"
import { mapFeedbackFromDB, mapFeedbackToDB } from "./mappers"

export interface CreateFeedbackDTO extends Omit<Feedback, "id" | "createdAt"> {}
export interface UpdateFeedbackDTO extends Partial<Omit<Feedback, "id" | "createdAt">> {}

/**
 * Buscar feedbacks por tenant
 */
export async function fetchFeedbacksByTenant(tenantId: string): Promise<Feedback[]> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("feedbacks")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar feedbacks: ${error.message}`)
    }

    return (data || []).map(mapFeedbackFromDB)
  } catch (error) {
    console.error("Erro ao buscar feedbacks:", error)
    throw error
  }
}

/**
 * Buscar todos os feedbacks (para super admin)
 */
export async function fetchAllFeedbacks(): Promise<Feedback[]> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("feedbacks")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar feedbacks: ${error.message}`)
    }

    return (data || []).map(mapFeedbackFromDB)
  } catch (error) {
    console.error("Erro ao buscar feedbacks:", error)
    throw error
  }
}

/**
 * Buscar feedback por ID
 */
export async function fetchFeedbackById(id: string): Promise<Feedback | null> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase.from("feedbacks").select("*").eq("id", id).single()

    if (error) {
      throw new Error(`Erro ao buscar feedback: ${error.message}`)
    }

    return data ? mapFeedbackFromDB(data) : null
  } catch (error) {
    console.error("Erro ao buscar feedback:", error)
    throw error
  }
}

/**
 * Criar novo feedback
 */
export async function createFeedback(data: CreateFeedbackDTO): Promise<Feedback> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapFeedbackToDB(data)

    const { data: createdData, error } = await supabase
      .from("feedbacks")
      .insert(dbData)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar feedback: ${error.message}`)
    }

    return mapFeedbackFromDB(createdData)
  } catch (error) {
    console.error("Erro ao criar feedback:", error)
    throw error
  }
}

/**
 * Atualizar feedback existente
 */
export async function updateFeedback(id: string, data: UpdateFeedbackDTO): Promise<Feedback> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapFeedbackToDB(data)

    const { data: updatedData, error } = await supabase
      .from("feedbacks")
      .update(dbData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar feedback: ${error.message}`)
    }

    return mapFeedbackFromDB(updatedData)
  } catch (error) {
    console.error("Erro ao atualizar feedback:", error)
    throw error
  }
}

/**
 * Deletar feedback
 */
export async function deleteFeedback(id: string): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase.from("feedbacks").delete().eq("id", id)

    if (error) {
      throw new Error(`Erro ao deletar feedback: ${error.message}`)
    }
  } catch (error) {
    console.error("Erro ao deletar feedback:", error)
    throw error
  }
}

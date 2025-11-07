import { createSupabaseClient } from "@/db"
import { Conversation } from "@/types"
import { mapConversationFromDB, mapConversationToDB } from "./mappers"

export interface CreateConversationDTO extends Omit<Conversation, "id" | "createdAt"> {}
export interface UpdateConversationDTO extends Partial<Omit<Conversation, "id" | "createdAt">> {}

/**
 * Buscar conversas por tenant
 */
export async function fetchConversationsByTenant(tenantId: string): Promise<Conversation[]> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("last_message_at", { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar conversas: ${error.message}`)
    }

    return (data || []).map(mapConversationFromDB)
  } catch (error) {
    console.error("Erro ao buscar conversas:", error)
    throw error
  }
}

/**
 * Buscar conversas por contato
 */
export async function fetchConversationsByContact(contactId: string): Promise<Conversation[]> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("contact_id", contactId)
      .order("last_message_at", { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar conversas do contato: ${error.message}`)
    }

    return (data || []).map(mapConversationFromDB)
  } catch (error) {
    console.error("Erro ao buscar conversas do contato:", error)
    throw error
  }
}

/**
 * Buscar conversa por ID
 */
export async function fetchConversationById(id: string): Promise<Conversation | null> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase.from("conversations").select("*").eq("id", id).single()

    if (error) {
      throw new Error(`Erro ao buscar conversa: ${error.message}`)
    }

    return data ? mapConversationFromDB(data) : null
  } catch (error) {
    console.error("Erro ao buscar conversa:", error)
    throw error
  }
}

/**
 * Criar nova conversa
 */
export async function createConversation(data: CreateConversationDTO): Promise<Conversation> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapConversationToDB(data)

    const { data: createdData, error } = await supabase
      .from("conversations")
      .insert(dbData)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar conversa: ${error.message}`)
    }

    return mapConversationFromDB(createdData)
  } catch (error) {
    console.error("Erro ao criar conversa:", error)
    throw error
  }
}

/**
 * Atualizar conversa existente
 */
export async function updateConversation(
  id: string,
  data: UpdateConversationDTO
): Promise<Conversation> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapConversationToDB(data)

    const { data: updatedData, error } = await supabase
      .from("conversations")
      .update(dbData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar conversa: ${error.message}`)
    }

    return mapConversationFromDB(updatedData)
  } catch (error) {
    console.error("Erro ao atualizar conversa:", error)
    throw error
  }
}

/**
 * Deletar conversa
 */
export async function deleteConversation(id: string): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase.from("conversations").delete().eq("id", id)

    if (error) {
      throw new Error(`Erro ao deletar conversa: ${error.message}`)
    }
  } catch (error) {
    console.error("Erro ao deletar conversa:", error)
    throw error
  }
}

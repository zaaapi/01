import { createSupabaseClient } from "@/db"
import { Message } from "@/types"
import { mapMessageFromDB, mapMessageToDB } from "./mappers"

export interface CreateMessageDTO extends Omit<Message, "id"> {}
export interface UpdateMessageDTO extends Partial<Omit<Message, "id">> {}

/**
 * Buscar mensagens por conversa
 */
export async function fetchMessagesByConversation(conversationId: string): Promise<Message[]> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("timestamp", { ascending: true })

    if (error) {
      throw new Error(`Erro ao buscar mensagens: ${error.message}`)
    }

    return (data || []).map(mapMessageFromDB)
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error)
    throw error
  }
}

/**
 * Buscar mensagem por ID
 */
export async function fetchMessageById(id: string): Promise<Message | null> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase.from("messages").select("*").eq("id", id).single()

    if (error) {
      throw new Error(`Erro ao buscar mensagem: ${error.message}`)
    }

    return data ? mapMessageFromDB(data) : null
  } catch (error) {
    console.error("Erro ao buscar mensagem:", error)
    throw error
  }
}

/**
 * Criar nova mensagem
 */
export async function createMessage(data: CreateMessageDTO): Promise<Message> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapMessageToDB(data)

    const { data: createdData, error } = await supabase
      .from("messages")
      .insert(dbData)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar mensagem: ${error.message}`)
    }

    return mapMessageFromDB(createdData)
  } catch (error) {
    console.error("Erro ao criar mensagem:", error)
    throw error
  }
}

/**
 * Atualizar mensagem existente
 */
export async function updateMessage(id: string, data: UpdateMessageDTO): Promise<Message> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapMessageToDB(data)

    const { data: updatedData, error } = await supabase
      .from("messages")
      .update(dbData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar mensagem: ${error.message}`)
    }

    return mapMessageFromDB(updatedData)
  } catch (error) {
    console.error("Erro ao atualizar mensagem:", error)
    throw error
  }
}

/**
 * Deletar mensagem
 */
export async function deleteMessage(id: string): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase.from("messages").delete().eq("id", id)

    if (error) {
      throw new Error(`Erro ao deletar mensagem: ${error.message}`)
    }
  } catch (error) {
    console.error("Erro ao deletar mensagem:", error)
    throw error
  }
}

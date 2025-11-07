import { createSupabaseClient } from "@/db"
import { Contact } from "@/types"
import { mapContactFromDB, mapContactToDB } from "./mappers"

export type CreateContactDTO = Omit<Contact, "id" | "createdAt">
export type UpdateContactDTO = Partial<Omit<Contact, "id" | "createdAt">>

/**
 * Buscar contatos por tenant
 */
export async function fetchContactsByTenant(tenantId: string): Promise<Contact[]> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("last_interaction", { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar contatos: ${error.message}`)
    }

    return (data || []).map(mapContactFromDB)
  } catch (error) {
    console.error("Erro ao buscar contatos:", error)
    throw error
  }
}

/**
 * Buscar contato por ID
 */
export async function fetchContactById(id: string): Promise<Contact | null> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase.from("contacts").select("*").eq("id", id).single()

    if (error) {
      throw new Error(`Erro ao buscar contato: ${error.message}`)
    }

    return data ? mapContactFromDB(data) : null
  } catch (error) {
    console.error("Erro ao buscar contato:", error)
    throw error
  }
}

/**
 * Criar novo contato
 */
export async function createContact(data: CreateContactDTO): Promise<Contact> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapContactToDB(data)

    const { data: createdData, error } = await supabase
      .from("contacts")
      .insert(dbData)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar contato: ${error.message}`)
    }

    return mapContactFromDB(createdData)
  } catch (error) {
    console.error("Erro ao criar contato:", error)
    throw error
  }
}

/**
 * Atualizar contato existente
 */
export async function updateContact(id: string, data: UpdateContactDTO): Promise<Contact> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapContactToDB(data)

    const { data: updatedData, error } = await supabase
      .from("contacts")
      .update(dbData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar contato: ${error.message}`)
    }

    return mapContactFromDB(updatedData)
  } catch (error) {
    console.error("Erro ao atualizar contato:", error)
    throw error
  }
}

/**
 * Deletar contato
 */
export async function deleteContact(id: string): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase.from("contacts").delete().eq("id", id)

    if (error) {
      throw new Error(`Erro ao deletar contato: ${error.message}`)
    }
  } catch (error) {
    console.error("Erro ao deletar contato:", error)
    throw error
  }
}

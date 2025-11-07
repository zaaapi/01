import { createSupabaseClient } from "@/db"
import { QuickReplyTemplate } from "@/types"
import { mapQuickReplyTemplateFromDB, mapQuickReplyTemplateToDB } from "./mappers"

export type CreateQuickReplyTemplateDTO = Omit<QuickReplyTemplate, "id" | "createdAt">
export type UpdateQuickReplyTemplateDTO = Partial<Omit<QuickReplyTemplate, "id" | "createdAt">>

/**
 * Buscar quick replies por tenant
 */
export async function fetchQuickRepliesByTenant(tenantId: string): Promise<QuickReplyTemplate[]> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("quick_reply_templates")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("usage_count", { ascending: false })
      .limit(10)

    if (error) {
      throw new Error(`Erro ao buscar quick replies: ${error.message}`)
    }

    return (data || []).map(mapQuickReplyTemplateFromDB)
  } catch (error) {
    console.error("Erro ao buscar quick replies:", error)
    throw error
  }
}

/**
 * Buscar quick reply por ID
 */
export async function fetchQuickReplyById(id: string): Promise<QuickReplyTemplate | null> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("quick_reply_templates")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      throw new Error(`Erro ao buscar quick reply: ${error.message}`)
    }

    return data ? mapQuickReplyTemplateFromDB(data) : null
  } catch (error) {
    console.error("Erro ao buscar quick reply:", error)
    throw error
  }
}

/**
 * Criar novo quick reply
 */
export async function createQuickReply(
  data: CreateQuickReplyTemplateDTO
): Promise<QuickReplyTemplate> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapQuickReplyTemplateToDB(data)

    const { data: createdData, error } = await supabase
      .from("quick_reply_templates")
      .insert(dbData)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar quick reply: ${error.message}`)
    }

    return mapQuickReplyTemplateFromDB(createdData)
  } catch (error) {
    console.error("Erro ao criar quick reply:", error)
    throw error
  }
}

/**
 * Atualizar quick reply existente
 */
export async function updateQuickReply(
  id: string,
  data: UpdateQuickReplyTemplateDTO
): Promise<QuickReplyTemplate> {
  try {
    const supabase = createSupabaseClient()
    const dbData = mapQuickReplyTemplateToDB(data)

    const { data: updatedData, error } = await supabase
      .from("quick_reply_templates")
      .update(dbData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar quick reply: ${error.message}`)
    }

    return mapQuickReplyTemplateFromDB(updatedData)
  } catch (error) {
    console.error("Erro ao atualizar quick reply:", error)
    throw error
  }
}

/**
 * Deletar quick reply
 */
export async function deleteQuickReply(id: string): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase.from("quick_reply_templates").delete().eq("id", id)

    if (error) {
      throw new Error(`Erro ao deletar quick reply: ${error.message}`)
    }
  } catch (error) {
    console.error("Erro ao deletar quick reply:", error)
    throw error
  }
}

/**
 * Incrementar contador de uso
 */
export async function incrementQuickReplyUsage(id: string): Promise<void> {
  try {
    const supabase = createSupabaseClient()

    // Buscar valor atual
    const { data: current, error: fetchError } = await supabase
      .from("quick_reply_templates")
      .select("usage_count")
      .eq("id", id)
      .single()

    if (fetchError) {
      throw new Error(`Erro ao buscar usage_count: ${fetchError.message}`)
    }

    // Incrementar
    const { error: updateError } = await supabase
      .from("quick_reply_templates")
      .update({ usage_count: (current.usage_count || 0) + 1 })
      .eq("id", id)

    if (updateError) {
      throw new Error(`Erro ao incrementar usage_count: ${updateError.message}`)
    }
  } catch (error) {
    console.error("Erro ao incrementar usage_count:", error)
    throw error
  }
}

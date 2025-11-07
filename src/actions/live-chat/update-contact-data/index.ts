"use server"

import { actionClient } from "@/lib/safe-action"
import { updateContactDataSchema } from "./schema"
import { createSupabaseClient } from "@/db"
import { revalidatePath } from "next/cache"

export const updateContactData = actionClient
  .schema(updateContactDataSchema)
  .action(async ({ parsedInput: { contactId, data } }) => {
    try {
      const supabase = createSupabaseClient()

      // Preparar dados para atualização no Supabase (converter camelCase para snake_case)
      const updateData: Record<string, unknown> = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.phoneSecondary !== undefined) updateData.phone_secondary = data.phoneSecondary
      if (data.email !== undefined) updateData.email = data.email
      if (data.country !== undefined) updateData.country = data.country
      if (data.city !== undefined) updateData.city = data.city
      if (data.zipCode !== undefined) updateData.zip_code = data.zipCode
      if (data.addressStreet !== undefined) updateData.address_street = data.addressStreet
      if (data.addressNumber !== undefined) updateData.address_number = data.addressNumber
      if (data.addressComplement !== undefined)
        updateData.address_complement = data.addressComplement
      if (data.cpf !== undefined) updateData.cpf = data.cpf
      if (data.rg !== undefined) updateData.rg = data.rg
      if (data.tags !== undefined) updateData.tags = data.tags

      const { error } = await supabase.from("contacts").update(updateData).eq("id", contactId)

      if (error) {
        throw new Error(`Erro ao atualizar contato: ${error.message}`)
      }

      // Revalidar cache
      revalidatePath("/cliente/live-chat")

      return { success: true }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Erro ao atualizar dados do contato")
    }
  })

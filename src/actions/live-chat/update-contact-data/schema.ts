import { z } from "zod"

export const updateContactDataSchema = z.object({
  contactId: z.string().uuid("ID do contato inválido"),
  data: z.object({
    name: z.string().optional(),
    phoneSecondary: z.string().nullable().optional(),
    email: z.string().email("Email inválido").nullable().optional(),
    country: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    zipCode: z.string().nullable().optional(),
    addressStreet: z.string().nullable().optional(),
    addressNumber: z.string().nullable().optional(),
    addressComplement: z.string().nullable().optional(),
    cpf: z.string().nullable().optional(),
    rg: z.string().nullable().optional(),
    tags: z.array(z.string()).nullable().optional(),
  }),
})

export type UpdateContactDataInput = z.infer<typeof updateContactDataSchema>

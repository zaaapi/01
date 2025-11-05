"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tenant } from "@/types"
import { useData } from "@/lib/contexts/data-provider"

const empresaSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  neurocoreId: z.string().min(1, "Selecione um NeuroCore"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  plan: z.string().min(1, "Selecione um plano"),
})

type FormValues = z.infer<typeof empresaSchema>

interface AddEditEmpresaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  empresa?: Tenant | null
  onSave: (data: FormValues & { plan: string }) => void
}

export function AddEditEmpresaModal({
  open,
  onOpenChange,
  empresa,
  onSave,
}: AddEditEmpresaModalProps) {
  const { state } = useData()
  const isEditMode = !!empresa

  const form = useForm<FormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      name: "",
      neurocoreId: "",
      cnpj: "",
      phone: "",
      plan: "",
    },
  })

  useEffect(() => {
    if (empresa) {
      form.reset({
        name: empresa.name,
        neurocoreId: empresa.neurocoreId,
        cnpj: empresa.cnpj,
        phone: empresa.phone,
        plan: empresa.plan,
      })
    } else {
      form.reset({
        name: "",
        neurocoreId: "",
        cnpj: "",
        phone: "",
        plan: "",
      })
    }
  }, [empresa, form])

  const onSubmit = (data: FormValues) => {
    onSave(data)
    form.reset()
    onOpenChange(false)
  }

  const neurocores = state.neurocores.filter((nc) => nc.isActive)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Empresa" : "Adicionar Nova Empresa"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Atualize as informações da empresa."
              : "Preencha os dados para criar uma nova empresa."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Loja Tech Store" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="neurocoreId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NeuroCore Associado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um NeuroCore" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {neurocores.map((neurocore) => (
                        <SelectItem key={neurocore.id} value={neurocore.id}>
                          {neurocore.name} ({neurocore.niche})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input placeholder="00.000.000/0001-00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="+55 11 98765-4321" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="plan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plano</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um plano" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Starter">Starter</SelectItem>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  onOpenChange(false)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {isEditMode ? "Salvar Alterações" : "Adicionar Empresa"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

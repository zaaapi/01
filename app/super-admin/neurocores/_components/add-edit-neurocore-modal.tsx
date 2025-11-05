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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { NeuroCore } from "@/types"

const neurocoreSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres"),
  niche: z.string().min(2, "Nicho deve ter no mínimo 2 caracteres"),
  apiUrl: z.string().url("URL inválida"),
  apiSecret: z.string().min(10, "API Secret deve ter no mínimo 10 caracteres"),
})

type FormValues = z.infer<typeof neurocoreSchema>

interface AddEditNeuroCoreModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  neurocore?: NeuroCore | null
  onSave: (data: FormValues) => void
}

export function AddEditNeuroCoreModal({
  open,
  onOpenChange,
  neurocore,
  onSave,
}: AddEditNeuroCoreModalProps) {
  const isEditMode = !!neurocore

  const form = useForm<FormValues>({
    resolver: zodResolver(neurocoreSchema),
    defaultValues: {
      name: "",
      description: "",
      niche: "",
      apiUrl: "",
      apiSecret: "",
    },
  })

  useEffect(() => {
    if (neurocore) {
      form.reset({
        name: neurocore.name,
        description: neurocore.description,
        niche: neurocore.niche,
        apiUrl: neurocore.apiUrl,
        apiSecret: neurocore.apiSecret,
      })
    } else {
      form.reset({
        name: "",
        description: "",
        niche: "",
        apiUrl: "",
        apiSecret: "",
      })
    }
  }, [neurocore, form])

  const onSubmit = (data: FormValues) => {
    onSave(data)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar NeuroCore" : "Adicionar Novo NeuroCore"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Atualize as informações do NeuroCore."
              : "Preencha os dados para criar um novo NeuroCore."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do NeuroCore</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: NeuroCore Varejo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Especializado em atendimento para varejo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="niche"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nicho</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Varejo, Saúde, Serviços" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da API</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://api.example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Secret</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Secret token da API"
                      {...field}
                    />
                  </FormControl>
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
                {isEditMode ? "Salvar Alterações" : "Adicionar NeuroCore"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}


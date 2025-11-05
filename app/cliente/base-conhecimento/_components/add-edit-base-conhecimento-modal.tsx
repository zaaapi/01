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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { BaseConhecimento } from "@/types"

const baseConhecimentoSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres"),
})

type FormValues = z.infer<typeof baseConhecimentoSchema>

interface AddEditBaseConhecimentoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  base?: BaseConhecimento | null
  onSave: (data: FormValues) => void
}

export function AddEditBaseConhecimentoModal({
  open,
  onOpenChange,
  base,
  onSave,
}: AddEditBaseConhecimentoModalProps) {
  const isEditMode = !!base

  const form = useForm<FormValues>({
    resolver: zodResolver(baseConhecimentoSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  useEffect(() => {
    if (base) {
      form.reset({
        name: base.name,
        description: base.description,
      })
    } else {
      form.reset({
        name: "",
        description: "",
      })
    }
  }, [base, form])

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
            {isEditMode ? "Editar Base de Conhecimento" : "Nova Base de Conhecimento"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Atualize as informações da base de conhecimento."
              : "Crie uma nova base de conhecimento para organizar suas synapses."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Base</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Base Produtos Tech Store" {...field} />
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
                    <Textarea
                      placeholder="Descreva o propósito desta base de conhecimento"
                      rows={4}
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
                {isEditMode ? "Salvar Alterações" : "Criar Base"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}


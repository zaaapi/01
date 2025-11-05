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
import { Synapse } from "@/types"

const synapseSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres"),
  imageUrl: z.union([z.string().url(), z.literal("")]).optional(),
})

type FormValues = z.infer<typeof synapseSchema>

interface EditSynapseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  synapse?: Synapse | null
  onSave: (data: { title: string; description: string; imageUrl: string | null }) => void
}

export function EditSynapseModal({
  open,
  onOpenChange,
  synapse,
  onSave,
}: EditSynapseModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(synapseSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
    },
  })

  useEffect(() => {
    if (synapse) {
      form.reset({
        title: synapse.title,
        description: synapse.description,
        imageUrl: synapse.imageUrl ?? "",
      })
    } else {
      form.reset({
        title: "",
        description: "",
        imageUrl: "",
      })
    }
  }, [synapse, form])

  const onSubmit = (data: FormValues) => {
    const imageUrlValue = data.imageUrl && data.imageUrl.trim() !== "" ? data.imageUrl : null
    onSave({
      title: data.title,
      description: data.description,
      imageUrl: imageUrlValue as string | null,
    })
    form.reset()
    onOpenChange(false)
  }

  if (!synapse) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Synapse</DialogTitle>
          <DialogDescription>
            Atualize as informações da synapse.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Como funciona o produto X" {...field} />
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
                      placeholder="Descreva detalhadamente a informação desta synapse"
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
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
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}


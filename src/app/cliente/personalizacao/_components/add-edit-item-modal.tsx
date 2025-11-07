"use client"

import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  AgentInstruction,
  AgentLimitation,
  AgentConversationRoteiro,
  AgentOtherInstruction,
} from "@/types"

const itemSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  mainInstruction: z.string().optional(),
})

type ItemFormValues = z.infer<typeof itemSchema>

type KanbanItem =
  | AgentInstruction
  | AgentLimitation
  | AgentConversationRoteiro
  | AgentOtherInstruction

interface AddEditItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: KanbanItem | null
  type: "instructions" | "limitacoes" | "roteiro" | "outras"
  onSave: (data: ItemFormValues) => void
}

export function AddEditItemModal({
  open,
  onOpenChange,
  item,
  type,
  onSave,
}: AddEditItemModalProps) {
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: "",
      description: "",
      mainInstruction: "",
    },
  })

  useEffect(() => {
    if (item) {
      form.reset({
        title: item.title,
        description: "description" in item ? item.description : "",
        mainInstruction: "mainInstruction" in item ? item.mainInstruction : "",
      })
    } else {
      form.reset({
        title: "",
        description: "",
        mainInstruction: "",
      })
    }
  }, [item, form])

  const handleSubmit = (data: ItemFormValues) => {
    onSave(data)
    form.reset()
  }

  const getTitle = () => {
    if (item) return "Editar Item"

    switch (type) {
      case "instructions":
        return "Adicionar Nova Instrução"
      case "limitacoes":
        return "Adicionar Nova Limitação"
      case "roteiro":
        return "Adicionar Novo Roteiro"
      case "outras":
        return "Adicionar Outra Instrução"
      default:
        return "Adicionar Item"
    }
  }

  const getDescription = () => {
    if (item) return "Edite os campos abaixo para atualizar o item"

    switch (type) {
      case "instructions":
        return "Adicione uma nova instrução para o agente seguir"
      case "limitacoes":
        return "Adicione uma nova limitação para o agente respeitar"
      case "roteiro":
        return "Adicione um novo item ao roteiro de conversa"
      case "outras":
        return "Adicione outra instrução complementar"
      default:
        return "Preencha os campos abaixo"
    }
  }

  const isRoteiro = type === "roteiro"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o título" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isRoteiro ? (
              <FormField
                control={form.control}
                name="mainInstruction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instrução Principal</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva a instrução principal para esta etapa do roteiro"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva o item em detalhes" rows={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">{item ? "Salvar Alterações" : "Adicionar"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

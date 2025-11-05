"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
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
import { Agent, AgentInstruction, AgentLimitation, AgentConversationRoteiro } from "@/types"
import { useData } from "@/lib/contexts/data-provider"
import { useToast } from "@/hooks/use-toast"
import { GripVertical, MoveUp, MoveDown, Plus, Trash2, Pencil } from "lucide-react"
import { KanbanBoard } from "./kanban-board"

const personaSchema = z.object({
  persona: z.string().min(10, "Persona deve ter no mínimo 10 caracteres"),
  personalityTone: z.string().min(3, "Tom de personalidade deve ter no mínimo 3 caracteres"),
  communicationMedium: z.string().min(3, "Meio de comunicação deve ter no mínimo 3 caracteres"),
  objective: z.string().min(10, "Objetivo deve ter no mínimo 10 caracteres"),
})

type PersonaFormValues = z.infer<typeof personaSchema>

interface PersonalizarAgenteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: Agent | null
  onSave: () => void
}

export function PersonalizarAgenteModal({
  open,
  onOpenChange,
  agent,
  onSave,
}: PersonalizarAgenteModalProps) {
  const { state, updateAgent } = useData()
  const { toast } = useToast()

  const form = useForm<PersonaFormValues>({
    resolver: zodResolver(personaSchema),
    defaultValues: {
      persona: "",
      personalityTone: "",
      communicationMedium: "",
      objective: "",
    },
  })

  useEffect(() => {
    if (agent) {
      form.reset({
        persona: agent.persona,
        personalityTone: agent.personalityTone,
        communicationMedium: agent.communicationMedium,
        objective: agent.objective,
      })
    }
  }, [agent, form])

  const handleSavePersona = async (data: PersonaFormValues) => {
    if (!agent) return

    try {
      await updateAgent(agent.id, {
        persona: data.persona,
        personalityTone: data.personalityTone,
        communicationMedium: data.communicationMedium,
        objective: data.objective,
      })
      toast({
        title: "Persona atualizada",
        description: "A persona do agente foi atualizada com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a persona.",
        variant: "destructive",
      })
    }
  }

  if (!agent) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Personalizar Agente - {agent.name}</DialogTitle>
          <DialogDescription>
            Configure a persona, comportamento e instruções do agente
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="persona" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="persona">Persona</TabsTrigger>
            <TabsTrigger value="comportamento">Comportamento</TabsTrigger>
            <TabsTrigger value="instrucoes">Instruções</TabsTrigger>
            <TabsTrigger value="limitacoes">Limitações</TabsTrigger>
            <TabsTrigger value="roteiro">Roteiro</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            {/* Tab Persona */}
            <TabsContent value="persona" className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSavePersona)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="persona"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Persona</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva a personalidade e características do agente"
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
                    name="personalityTone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tom de Personalidade</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Amigável, Profissional, Empolgado"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="communicationMedium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meio de Comunicação</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: WhatsApp, Chat, Email"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="objective"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objetivo</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o objetivo principal do agente"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">Salvar Persona</Button>
                </form>
              </Form>
            </TabsContent>

            {/* Tab Comportamento */}
            <TabsContent value="comportamento" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Comportamento Geral</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure como o agente se comporta em diferentes situações
                  </p>
                </div>
                <Textarea
                  placeholder="Descreva o comportamento esperado do agente..."
                  rows={10}
                  defaultValue={agent.personalityTone}
                />
                <Button>Salvar Comportamento</Button>
              </div>
            </TabsContent>

            {/* Tab Instruções */}
            <TabsContent value="instrucoes">
              <KanbanBoard
                items={agent.instructions}
                type="instructions"
                agentId={agent.id}
              />
            </TabsContent>

            {/* Tab Limitações */}
            <TabsContent value="limitacoes">
              <KanbanBoard
                items={agent.limitations}
                type="limitacoes"
                agentId={agent.id}
              />
            </TabsContent>

            {/* Tab Roteiro */}
            <TabsContent value="roteiro">
              <KanbanBoard
                items={agent.conversationRoteiro}
                type="roteiro"
                agentId={agent.id}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


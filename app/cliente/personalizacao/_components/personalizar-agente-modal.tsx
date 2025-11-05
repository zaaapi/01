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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Agent, AgentGender } from "@/types"
import { useData } from "@/lib/contexts/data-provider"
import { useToast } from "@/hooks/use-toast"
import { KanbanBoard } from "./kanban-board"
import { Loader2 } from "lucide-react"

const configuracaoGeralSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  gender: z.nativeEnum(AgentGender).nullable(),
  communicationMedium: z.string().min(3, "Meio de comunicação deve ter no mínimo 3 caracteres"),
})

const personaComportamentoSchema = z.object({
  persona: z.string().min(10, "Persona deve ter no mínimo 10 caracteres"),
  personalityTone: z.string().min(3, "Tom de personalidade deve ter no mínimo 3 caracteres"),
  objective: z.string().min(10, "Objetivo deve ter no mínimo 10 caracteres"),
})

type ConfiguracaoGeralFormValues = z.infer<typeof configuracaoGeralSchema>
type PersonaComportamentoFormValues = z.infer<typeof personaComportamentoSchema>

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
  const { updateAgent } = useData()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("configuracoes")

  const formConfiguracao = useForm<ConfiguracaoGeralFormValues>({
    resolver: zodResolver(configuracaoGeralSchema),
    defaultValues: {
      name: "",
      gender: null,
      communicationMedium: "",
    },
  })

  const formPersonaComportamento = useForm<PersonaComportamentoFormValues>({
    resolver: zodResolver(personaComportamentoSchema),
    defaultValues: {
      persona: "",
      personalityTone: "",
      objective: "",
    },
  })

  useEffect(() => {
    if (agent) {
      formConfiguracao.reset({
        name: agent.name,
        gender: agent.gender,
        communicationMedium: agent.communicationMedium,
      })
      formPersonaComportamento.reset({
        persona: agent.persona,
        personalityTone: agent.personalityTone,
        objective: agent.objective,
      })
    }
  }, [agent, formConfiguracao, formPersonaComportamento])

  const handleSaveConfiguracao = async (data: ConfiguracaoGeralFormValues) => {
    if (!agent) return

    try {
      setIsSaving(true)
      await updateAgent(agent.id, {
        name: data.name,
        gender: data.gender,
        communicationMedium: data.communicationMedium,
      })
      toast({
        title: "Configurações atualizadas",
        description: "As configurações gerais do agente foram atualizadas com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as configurações.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePersonaComportamento = async (data: PersonaComportamentoFormValues) => {
    if (!agent) return

    try {
      setIsSaving(true)
      await updateAgent(agent.id, {
        persona: data.persona,
        personalityTone: data.personalityTone,
        objective: data.objective,
      })
      toast({
        title: "Persona e Comportamento atualizados",
        description: "A persona e comportamento do agente foram atualizados com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a persona e comportamento.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAll = async () => {
    if (!agent) return

    try {
      setIsSaving(true)
      
      // Validar todos os formulários
      const isConfiguracaoValid = await formConfiguracao.trigger()
      const isPersonaValid = await formPersonaComportamento.trigger()

      if (!isConfiguracaoValid || !isPersonaValid) {
        toast({
          title: "Erro de validação",
          description: "Por favor, corrija os erros nos formulários antes de salvar.",
          variant: "destructive",
        })
        return
      }

      // Salvar todas as alterações
      await updateAgent(agent.id, {
        name: formConfiguracao.getValues("name"),
        gender: formConfiguracao.getValues("gender"),
        communicationMedium: formConfiguracao.getValues("communicationMedium"),
        persona: formPersonaComportamento.getValues("persona"),
        personalityTone: formPersonaComportamento.getValues("personalityTone"),
        objective: formPersonaComportamento.getValues("objective"),
      })

      toast({
        title: "Agente atualizado",
        description: "Todas as alterações foram salvas com sucesso.",
      })
      
      onSave()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
            <TabsTrigger value="persona">Persona</TabsTrigger>
            <TabsTrigger value="instrucoes">Instruções</TabsTrigger>
            <TabsTrigger value="limitacoes">Limitações</TabsTrigger>
            <TabsTrigger value="roteiro">Roteiro</TabsTrigger>
            <TabsTrigger value="outras">Outras</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            {/* Tab Configurações Gerais */}
            <TabsContent value="configuracoes" className="space-y-4">
              <Form {...formConfiguracao}>
                <form onSubmit={formConfiguracao.handleSubmit(handleSaveConfiguracao)} className="space-y-4">
                  <FormField
                    control={formConfiguracao.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Agente</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Agente de Vendas" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Input value={agent.type} disabled />
                    <p className="text-sm text-muted-foreground">
                      O tipo do agente não pode ser alterado
                    </p>
                  </div>

                  <FormField
                    control={formConfiguracao.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gênero</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-3 space-y-0">
                              <RadioGroupItem value={AgentGender.MASCULINO} />
                              <Label className="font-normal">
                                Masculino
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3 space-y-0">
                              <RadioGroupItem value={AgentGender.FEMININO} />
                              <Label className="font-normal">
                                Feminino
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formConfiguracao.control}
                    name="communicationMedium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meio de Comunicação</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: WhatsApp" {...field} />
                        </FormControl>
                        <FormDescription>
                          Meio principal de comunicação do agente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Configurações
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* Tab Persona */}
            <TabsContent value="persona" className="space-y-4">
              <Form {...formPersonaComportamento}>
                <form onSubmit={formPersonaComportamento.handleSubmit(handleSavePersonaComportamento)} className="space-y-4">
                  <FormField
                    control={formPersonaComportamento.control}
                    name="persona"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {agent.isIntentAgent ? "Prompt Principal" : "Persona"}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={
                              agent.isIntentAgent
                                ? "Descreva o prompt principal do agente de intenções"
                                : "Descreva a personalidade e características do agente"
                            }
                            rows={8}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {agent.isIntentAgent
                            ? "Este é o prompt que o agente de intenções usará para identificar as intenções dos clientes"
                            : "Defina quem é o agente, sua personalidade e como ele deve se comportar"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formPersonaComportamento.control}
                    name="personalityTone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tom de Personalidade</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Amigável, Profissional, Empolgado"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Como o agente deve se comunicar (tom, estilo, etc.)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formPersonaComportamento.control}
                    name="objective"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objetivo</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o objetivo principal do agente"
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Qual é o objetivo principal que o agente deve alcançar
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Persona e Comportamento
                  </Button>
                </form>
              </Form>
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

            {/* Tab Outras Instruções */}
            <TabsContent value="outras">
              <KanbanBoard
                items={agent.otherInstructions}
                type="outras"
                agentId={agent.id}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handleSaveAll} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Todas as Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

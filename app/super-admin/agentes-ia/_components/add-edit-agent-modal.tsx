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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Agent, AgentType, AgentFunction, AgentGender } from "@/types"

const agentSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  type: z.nativeEnum(AgentType),
  function: z.nativeEnum(AgentFunction),
  gender: z.nativeEnum(AgentGender).nullable(),
  persona: z.string().min(10, "Persona deve ter no mínimo 10 caracteres"),
  personalityTone: z.string().min(3, "Tom de personalidade deve ter no mínimo 3 caracteres"),
  communicationMedium: z.string().min(3, "Meio de comunicação deve ter no mínimo 3 caracteres"),
  objective: z.string().min(10, "Objetivo deve ter no mínimo 10 caracteres"),
  isIntentAgent: z.boolean(),
})

type FormValues = z.infer<typeof agentSchema>

interface AddEditAgentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent?: Agent | null
  onSave: (data: FormValues & { gender: AgentGender | null }) => void
}

export function AddEditAgentModal({
  open,
  onOpenChange,
  agent,
  onSave,
}: AddEditAgentModalProps) {
  const isEditMode = !!agent

  const form = useForm<FormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: "",
      type: AgentType.REATIVO,
      function: AgentFunction.ATENDIMENTO,
      gender: null,
      persona: "",
      personalityTone: "",
      communicationMedium: "",
      objective: "",
      isIntentAgent: false,
    },
  })

  useEffect(() => {
    if (agent) {
      form.reset({
        name: agent.name,
        type: agent.type,
        function: agent.function,
        gender: agent.gender || null,
        persona: agent.persona,
        personalityTone: agent.personalityTone,
        communicationMedium: agent.communicationMedium,
        objective: agent.objective,
        isIntentAgent: agent.isIntentAgent,
      })
    } else {
      form.reset({
        name: "",
        type: AgentType.REATIVO,
        function: AgentFunction.ATENDIMENTO,
        gender: null,
        persona: "",
        personalityTone: "",
        communicationMedium: "",
        objective: "",
        isIntentAgent: false,
      })
    }
  }, [agent, form])

  const onSubmit = (data: FormValues) => {
    onSave(data)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Agente IA" : "Adicionar Novo Agente IA"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Atualize as informações do agente."
              : "Preencha os dados para criar um novo agente IA."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Agente</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Agente de Atendimento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={AgentType.REATIVO}>Reativo</SelectItem>
                        <SelectItem value={AgentType.ATIVO}>Ativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="function"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={AgentFunction.ATENDIMENTO}>Atendimento</SelectItem>
                        <SelectItem value={AgentFunction.VENDAS}>Vendas</SelectItem>
                        <SelectItem value={AgentFunction.POS_VENDA}>Pós-Venda</SelectItem>
                        <SelectItem value={AgentFunction.PESQUISA}>Pesquisa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gênero (Opcional)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "null" ? null : (value as AgentGender))}
                    value={field.value || "null"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um gênero" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Não especificado</SelectItem>
                      <SelectItem value={AgentGender.MASCULINO}>Masculino</SelectItem>
                      <SelectItem value={AgentGender.FEMININO}>Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="persona"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Persona</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva a personalidade e características do agente"
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
              name="personalityTone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tom de Personalidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Amigável, Profissional, Empolgado" {...field} />
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
                    <Input placeholder="Ex: WhatsApp, Chat, Email" {...field} />
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
              name="isIntentAgent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Agente de Intenções</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Marque se este é o agente responsável por identificar intenções
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
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
                {isEditMode ? "Salvar Alterações" : "Adicionar Agente"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}


"use client"

import { useEffect, useState } from "react"
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
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { NeuroCore, Agent } from "@/types"
import { useData } from "@/lib/contexts/data-provider"
import { useToast } from "@/hooks/use-toast"
import { Bot, Plus, Trash2 } from "lucide-react"
import { AssociarAgentesSheet } from "./associar-agentes-sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const neurocoreSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres"),
  niche: z.string().min(2, "Nicho deve ter no mínimo 2 caracteres"),
  apiUrl: z.string().url("URL inválida"),
  apiSecret: z.string().optional(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof neurocoreSchema>

interface AddEditNeuroCoreModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  neurocore?: NeuroCore | null
  isViewMode?: boolean
  onSave: (data: FormValues & { associatedAgents?: string[] }) => void
}

export function AddEditNeuroCoreModal({
  open,
  onOpenChange,
  neurocore,
  isViewMode = false,
  onSave,
}: AddEditNeuroCoreModalProps) {
  const isEditMode = !!neurocore && !isViewMode
  const { fetchAgents } = useData()
  const { toast } = useToast()
  const [agents, setAgents] = useState<Agent[]>([])
  const [associatedAgents, setAssociatedAgents] = useState<string[]>([])
  const [agentesSheetOpen, setAgentesSheetOpen] = useState(false)
  const [removeAgentModal, setRemoveAgentModal] = useState<{
    open: boolean
    agentId: string | null
  }>({ open: false, agentId: null })
  const [confirmRemoveText, setConfirmRemoveText] = useState("")

  const form = useForm<FormValues>({
    resolver: zodResolver(neurocoreSchema),
    defaultValues: {
      name: "",
      description: "",
      niche: "",
      apiUrl: "",
      apiSecret: "",
      isActive: true,
    },
  })

  // Carregar agentes ao abrir o modal
  useEffect(() => {
    if (open) {
      const loadAgents = async () => {
        try {
          const fetchedAgents = await fetchAgents()
          setAgents(fetchedAgents)
        } catch (error) {
          console.error("Erro ao carregar agentes:", error)
        }
      }
      loadAgents()
    }
  }, [open, fetchAgents])

  useEffect(() => {
    if (neurocore) {
      form.reset({
        name: neurocore.name,
        description: neurocore.description,
        niche: neurocore.niche,
        apiUrl: neurocore.apiUrl,
        apiSecret: "", // Não preencher o secret por segurança
        isActive: neurocore.isActive,
      })
      setAssociatedAgents([...neurocore.associatedAgents])
    } else {
      form.reset({
        name: "",
        description: "",
        niche: "",
        apiUrl: "",
        apiSecret: "",
        isActive: true,
      })
      setAssociatedAgents([])
    }
  }, [neurocore, form])

  const onSubmit = (data: FormValues) => {
    // Se estiver editando e apiSecret estiver vazio, não incluir no update
    const updateData: FormValues & { associatedAgents?: string[] } = {
      ...data,
      associatedAgents,
    }

    if (isEditMode && !data.apiSecret) {
      // Remover apiSecret do objeto se estiver vazio
      const { apiSecret: _apiSecret, ...rest } = updateData
      onSave(rest)
    } else {
      onSave(updateData)
    }

    if (!isViewMode) {
      form.reset()
      setAssociatedAgents([])
      onOpenChange(false)
    }
  }

  const handleRemoveAgent = (agentId: string) => {
    setRemoveAgentModal({ open: true, agentId })
    setConfirmRemoveText("")
  }

  const handleConfirmRemoveAgent = () => {
    if (removeAgentModal.agentId && confirmRemoveText.toLowerCase() === "desassociar agente") {
      setAssociatedAgents(associatedAgents.filter((id) => id !== removeAgentModal.agentId))
      setRemoveAgentModal({ open: false, agentId: null })
      setConfirmRemoveText("")
      toast({
        title: "Agente removido",
        description: "O agente foi removido da associação.",
      })
    }
  }

  const handleAddAgent = (agentId: string) => {
    if (!associatedAgents.includes(agentId)) {
      setAssociatedAgents([...associatedAgents, agentId])
      toast({
        title: "Agente adicionado",
        description: "O agente foi adicionado à associação.",
      })
    }
  }

  const associatedAgentsList = agents.filter((a) => associatedAgents.includes(a.id))

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isViewMode
                ? "Detalhes do NeuroCore"
                : isEditMode
                  ? "Editar NeuroCore"
                  : "Adicionar Novo NeuroCore"}
            </DialogTitle>
            <DialogDescription>
              {isViewMode
                ? "Visualize as informações do NeuroCore."
                : isEditMode
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
                      <Input placeholder="Ex: NeuroCore Varejo" {...field} disabled={isViewMode} />
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
                        disabled={isViewMode}
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
                      <Input
                        placeholder="Ex: Varejo, Saúde, Serviços"
                        {...field}
                        disabled={isViewMode}
                      />
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
                        disabled={isViewMode}
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
                        placeholder={
                          isEditMode ? "Deixe em branco para manter o atual" : "Secret token da API"
                        }
                        {...field}
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormMessage />
                    {isEditMode && (
                      <FormDescription>
                        Deixe em branco para manter o secret atual. Digite um novo valor apenas se
                        desejar alterá-lo.
                      </FormDescription>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status</FormLabel>
                      <FormDescription>Ativar ou desativar este NeuroCore</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isViewMode}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Separator />

              {/* Seção de Associar Agentes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Associar Agentes de IA</h3>
                    <p className="text-sm text-muted-foreground">
                      Gerencie os agentes associados a este NeuroCore
                    </p>
                  </div>
                  {!isViewMode && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAgentesSheetOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Agente
                    </Button>
                  )}
                </div>

                {associatedAgentsList.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum agente associado</p>
                    {!isViewMode && (
                      <p className="text-sm">Clique em &quot;Adicionar Agente&quot; para associar</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {associatedAgentsList.map((agent) => (
                      <Card key={agent.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Bot className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{agent.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {agent.type} • {agent.function}
                              </p>
                            </div>
                          </div>
                          {!isViewMode && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAgent(agent.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                {isViewMode ? (
                  <Button type="button" onClick={() => onOpenChange(false)}>
                    Fechar
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.reset()
                        setAssociatedAgents([])
                        onOpenChange(false)
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {isEditMode ? "Salvar Alterações" : "Adicionar NeuroCore"}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Sheet para adicionar agentes */}
      <AssociarAgentesSheet
        open={agentesSheetOpen}
        onOpenChange={setAgentesSheetOpen}
        neurocore={neurocore ? { ...neurocore, associatedAgents } : null}
        onSave={(agentIds) => {
          setAssociatedAgents(agentIds)
          setAgentesSheetOpen(false)
        }}
        mode="add"
        onAddAgent={handleAddAgent}
      />

      {/* Modal de confirmação para remover agente */}
      <AlertDialog
        open={removeAgentModal.open}
        onOpenChange={(open) => setRemoveAgentModal({ open, agentId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desassociar Agente</AlertDialogTitle>
            <AlertDialogDescription>
              Para confirmar, digite <strong>&quot;desassociar agente&quot;</strong> no campo
              abaixo:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="desassociar agente"
              value={confirmRemoveText}
              onChange={(e) => setConfirmRemoveText(e.target.value)}
              autoComplete="off"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmRemoveText("")}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemoveAgent}
              disabled={confirmRemoveText.toLowerCase() !== "desassociar agente"}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

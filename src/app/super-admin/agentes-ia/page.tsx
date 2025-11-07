"use client"

import { useState, useMemo } from "react"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Bot, Brain } from "lucide-react"
import { useData } from "@/lib/contexts/data-provider"
import { useToast } from "@/hooks/use-toast"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useRouter } from "next/navigation"
import { Agent, AgentType, AgentFunction, AgentGender } from "@/types"
import { AddEditAgentModal } from "./_components/add-edit-agent-modal"
import { DeleteAgentModal } from "./_components/delete-agent-modal"
import { AssociarNeuroCoresSheet } from "./_components/associar-neurocores-sheet"

export default function AgentesIAPage() {
  const router = useRouter()
  const { state, isLoading, createAgent, updateAgent, deleteAgent } = useData()
  const { toast } = useToast()

  // Estado dos modais
  const [addEditModal, setAddEditModal] = useState<{
    open: boolean
    agent: Agent | null
  }>({
    open: false,
    agent: null,
  })

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    agent: Agent | null
  }>({
    open: false,
    agent: null,
  })

  const [neurocoresSheet, setNeurocoresSheet] = useState<{
    open: boolean
    agent: Agent | null
  }>({
    open: false,
    agent: null,
  })

  // Atalhos de teclado
  useKeyboardShortcuts({
    onNew: () => setAddEditModal({ open: true, agent: null }),
    onNavigate1: () => router.push("/super-admin"),
    onNavigate2: () => router.push("/super-admin/agentes-ia"),
    onNavigate3: () => router.push("/super-admin/perfil"),
  })

  // Calcular NeuroCores associados por Agente
  const agentsList = useMemo(() => {
    return state.agents.map((agent) => {
      const neurocoresCount = state.neurocores.filter((nc) =>
        nc.associatedAgents.includes(agent.id)
      ).length

      return {
        ...agent,
        neurocoresCount,
      }
    })
  }, [state.agents, state.neurocores])

  // Handlers para adicionar/editar Agente
  const handleOpenAddModal = () => {
    setAddEditModal({ open: true, agent: null })
  }

  const handleOpenEditModal = (agent: Agent) => {
    setAddEditModal({ open: true, agent })
  }

  const handleSaveAgent = async (data: {
    name: string
    type: AgentType
    function: AgentFunction
    gender: AgentGender | null
    persona: string
    personalityTone: string
    communicationMedium: string
    objective: string
    isIntentAgent: boolean
  }) => {
    try {
      if (addEditModal.agent) {
        // Editar Agente existente
        await updateAgent(addEditModal.agent.id, {
          name: data.name,
          type: data.type,
          function: data.function,
          gender: data.gender,
          persona: data.persona,
          personalityTone: data.personalityTone,
          communicationMedium: data.communicationMedium,
          objective: data.objective,
          isIntentAgent: data.isIntentAgent,
        })
        toast({
          title: "Agente atualizado",
          description: "O agente foi atualizado com sucesso.",
        })
      } else {
        // Adicionar novo Agente
        await createAgent({
          name: data.name,
          type: data.type,
          function: data.function,
          gender: data.gender,
          persona: data.persona,
          personalityTone: data.personalityTone,
          communicationMedium: data.communicationMedium,
          objective: data.objective,
          isIntentAgent: data.isIntentAgent,
          instructions: [],
          limitations: [],
          conversationRoteiro: [],
          otherInstructions: [],
          associatedNeuroCores: [],
        })
        toast({
          title: "Agente criado",
          description: "O agente foi criado com sucesso.",
        })
      }
      setAddEditModal({ open: false, agent: null })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o agente.",
        variant: "destructive",
      })
    }
  }

  // Handler para deletar Agente
  const handleDeleteAgent = (agent: Agent) => {
    setDeleteModal({ open: true, agent })
  }

  const handleConfirmDelete = async () => {
    if (deleteModal.agent) {
      try {
        await deleteAgent(deleteModal.agent.id)
        toast({
          title: "Agente excluído",
          description: "O agente foi excluído com sucesso.",
        })
        setDeleteModal({ open: false, agent: null })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o agente.",
          variant: "destructive",
        })
      }
    }
  }

  // Handler para associar NeuroCores
  const handleAssociarNeuroCores = (agent: Agent) => {
    setNeurocoresSheet({ open: true, agent })
  }

  const handleSaveNeuroCores = async (neurocoreIds: string[]) => {
    if (neurocoresSheet.agent) {
      try {
        await updateAgent(neurocoresSheet.agent.id, {
          associatedNeuroCores: neurocoreIds,
        })
        toast({
          title: "NeuroCores associados",
          description: "Os NeuroCores foram associados com sucesso.",
        })
        setNeurocoresSheet({ open: false, agent: null })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível associar os NeuroCores.",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="Gerenciar Agentes IA"
          description="Configure e gerencie os Agentes IA do sistema"
        />
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-10 w-[250px] mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Gerenciar Agentes IA"
        description="Configure e gerencie os Agentes IA do sistema"
      >
        <Button onClick={handleOpenAddModal}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Novo Agente
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          {agentsList.length === 0 ? (
            <EmptyState
              icon={Bot}
              title="Nenhum agente encontrado"
              description="Crie seu primeiro agente IA para começar"
              actionLabel="Adicionar Agente"
              onAction={handleOpenAddModal}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>NeuroCores</TableHead>
                    <TableHead>Especial</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentsList.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{agent.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{agent.function}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-muted-foreground" />
                          {agent.neurocoresCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        {agent.isIntentAgent ? (
                          <Badge variant="default">Agente de Intenções</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAssociarNeuroCores(agent)}
                          >
                            <Brain className="h-4 w-4 mr-1" />
                            NeuroCores
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(agent)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAgent(agent)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modais */}
      <AddEditAgentModal
        open={addEditModal.open}
        onOpenChange={(open) => setAddEditModal({ ...addEditModal, open })}
        agent={addEditModal.agent}
        onSave={handleSaveAgent}
      />

      <DeleteAgentModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
        agentNome={deleteModal.agent?.name || ""}
        onConfirm={handleConfirmDelete}
      />

      <AssociarNeuroCoresSheet
        open={neurocoresSheet.open}
        onOpenChange={(open) => setNeurocoresSheet({ ...neurocoresSheet, open })}
        agent={neurocoresSheet.agent}
        onSave={handleSaveNeuroCores}
      />
    </PageContainer>
  )
}

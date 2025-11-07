"use client"

import { useState, useMemo, useEffect } from "react"
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
import { Plus, Pencil, PowerOff, Power, Brain, Bot, Eye } from "lucide-react"
import { useData } from "@/lib/contexts/data-provider"
import { useToast } from "@/hooks/use-toast"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useRouter } from "next/navigation"
import { NeuroCore } from "@/types"
import { AddEditNeuroCoreModal } from "./_components/add-edit-neurocore-modal"
import { InativarNeuroCoreModal } from "./_components/inativar-neurocore-modal"
import { ReativarNeuroCoreModal } from "./_components/reativar-neurocore-modal"
import { AssociarAgentesSheet } from "./_components/associar-agentes-sheet"

export default function NeuroCoresPage() {
  const router = useRouter()
  const { fetchNeurocores, fetchTenants, fetchAgents, createNeuroCore, updateNeuroCore } = useData()
  const { toast } = useToast()

  // Estados locais para dados do Supabase
  const [neurocores, setNeurocores] = useState<NeuroCore[]>([])
  const [tenants, setTenants] = useState<{ id: string; neurocoreId: string }[]>([])
  const [agents, setAgents] = useState<{ id: string }[]>([])
  const [isLoadingNeurocores, setIsLoadingNeurocores] = useState(true)

  // Estado dos modais
  const [addEditModal, setAddEditModal] = useState<{
    open: boolean
    neurocore: NeuroCore | null
  }>({
    open: false,
    neurocore: null,
  })

  const [inativarModal, setInativarModal] = useState<{
    open: boolean
    neurocore: NeuroCore | null
  }>({
    open: false,
    neurocore: null,
  })

  const [reativarModal, setReativarModal] = useState<{
    open: boolean
    neurocore: NeuroCore | null
  }>({
    open: false,
    neurocore: null,
  })

  const [agentesSheet, setAgentesSheet] = useState<{
    open: boolean
    neurocore: NeuroCore | null
  }>({
    open: false,
    neurocore: null,
  })

  // Atalhos de teclado
  useKeyboardShortcuts({
    onNew: () => setAddEditModal({ open: true, neurocore: null }),
    onNavigate1: () => router.push("/super-admin"),
    onNavigate2: () => router.push("/super-admin/neurocores"),
    onNavigate3: () => router.push("/super-admin/perfil"),
  })

  // Carregar dados do Supabase ao montar o componente
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingNeurocores(true)
      try {
        const [fetchedNeurocores, fetchedTenants, fetchedAgents] = await Promise.all([
          fetchNeurocores(),
          fetchTenants("all"),
          fetchAgents(),
        ])
        setNeurocores(fetchedNeurocores)
        setTenants(fetchedTenants.map((t) => ({ id: t.id, neurocoreId: t.neurocoreId })))
        setAgents(fetchedAgents.map((a) => ({ id: a.id })))
      } catch {
        console.error("Erro ao carregar dados:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os NeuroCores.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingNeurocores(false)
      }
    }

    loadData()
  }, [fetchNeurocores, fetchTenants, fetchAgents, toast])

  // Calcular empresas associadas por NeuroCore
  const neurocoresList = useMemo(() => {
    return neurocores.map((neurocore) => {
      const empresasCount = tenants.filter((t) => t.neurocoreId === neurocore.id).length
      const agentesCount = agents.filter((a) => neurocore.associatedAgents.includes(a.id)).length

      return {
        ...neurocore,
        empresasCount,
        agentesCount,
      }
    })
  }, [neurocores, tenants, agents])

  // Handlers para adicionar/editar NeuroCore
  const handleOpenAddModal = () => {
    setAddEditModal({ open: true, neurocore: null })
  }

  const handleOpenEditModal = (neurocore: NeuroCore) => {
    setAddEditModal({ open: true, neurocore })
  }

  const handleSaveNeuroCore = async (data: {
    name: string
    description: string
    niche: string
    apiUrl: string
    apiSecret?: string
    isActive?: boolean
    associatedAgents?: string[]
  }) => {
    try {
      if (addEditModal.neurocore) {
        // Editar NeuroCore existente
        await updateNeuroCore(addEditModal.neurocore.id, {
          name: data.name,
          description: data.description,
          niche: data.niche,
          apiUrl: data.apiUrl,
          apiSecret: data.apiSecret || addEditModal.neurocore.apiSecret,
          isActive: data.isActive ?? addEditModal.neurocore.isActive,
          associatedAgents: data.associatedAgents ?? addEditModal.neurocore.associatedAgents,
        })
        toast({
          title: "NeuroCore atualizado",
          description: "O NeuroCore foi atualizado com sucesso.",
        })
      } else {
        // Adicionar novo NeuroCore
        await createNeuroCore({
          name: data.name,
          description: data.description,
          niche: data.niche,
          apiUrl: data.apiUrl,
          apiSecret: data.apiSecret || "",
          isActive: data.isActive ?? true,
          associatedAgents: data.associatedAgents || [],
        })
        toast({
          title: "NeuroCore criado",
          description: "O NeuroCore foi criado com sucesso.",
        })
      }
      setAddEditModal({ open: false, neurocore: null })

      // Recarregar dados após salvar
      const fetchedNeurocores = await fetchNeurocores()
      setNeurocores(fetchedNeurocores)
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o NeuroCore.",
        variant: "destructive",
      })
    }
  }

  // Handlers para inativar/reativar
  const handleInativarNeuroCore = (neurocore: NeuroCore) => {
    setInativarModal({ open: true, neurocore })
  }

  const handleConfirmInativar = async () => {
    if (inativarModal.neurocore) {
      try {
        await updateNeuroCore(inativarModal.neurocore.id, { isActive: false })
        toast({
          title: "NeuroCore inativado",
          description: "O NeuroCore foi inativado com sucesso.",
        })
        setInativarModal({ open: false, neurocore: null })

        // Recarregar dados após inativar
        const fetchedNeurocores = await fetchNeurocores()
        setNeurocores(fetchedNeurocores)
      } catch {
        toast({
          title: "Erro",
          description: "Não foi possível inativar o NeuroCore.",
          variant: "destructive",
        })
      }
    }
  }

  const handleReativarNeuroCore = (neurocore: NeuroCore) => {
    setReativarModal({ open: true, neurocore })
  }

  const handleConfirmReativar = async () => {
    if (reativarModal.neurocore) {
      try {
        await updateNeuroCore(reativarModal.neurocore.id, { isActive: true })
        toast({
          title: "NeuroCore reativado",
          description: "O NeuroCore foi reativado com sucesso.",
        })
        setReativarModal({ open: false, neurocore: null })

        // Recarregar dados após reativar
        const fetchedNeurocores = await fetchNeurocores()
        setNeurocores(fetchedNeurocores)
      } catch {
        toast({
          title: "Erro",
          description: "Não foi possível reativar o NeuroCore.",
          variant: "destructive",
        })
      }
    }
  }

  // Handler para associar agentes
  const handleAssociarAgentes = (neurocore: NeuroCore) => {
    setAgentesSheet({ open: true, neurocore })
  }

  const handleSaveAgentes = async (agentIds: string[]) => {
    if (agentesSheet.neurocore) {
      try {
        await updateNeuroCore(agentesSheet.neurocore.id, {
          associatedAgents: agentIds,
        })
        toast({
          title: "Agentes associados",
          description: "Os agentes foram associados com sucesso.",
        })
        setAgentesSheet({ open: false, neurocore: null })

        // Recarregar dados após associar agentes
        const fetchedNeurocores = await fetchNeurocores()
        setNeurocores(fetchedNeurocores)
      } catch {
        toast({
          title: "Erro",
          description: "Não foi possível associar os agentes.",
          variant: "destructive",
        })
      }
    }
  }

  const [viewModal, setViewModal] = useState<{
    open: boolean
    neurocore: NeuroCore | null
  }>({
    open: false,
    neurocore: null,
  })

  const handleOpenViewModal = (neurocore: NeuroCore) => {
    setViewModal({ open: true, neurocore })
  }

  if (isLoadingNeurocores) {
    return (
      <PageContainer>
        <PageHeader
          title="Gerenciar NeuroCores"
          description="Configure e gerencie os NeuroCores do sistema"
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
        title="Gerenciar NeuroCores"
        description="Configure e gerencie os NeuroCores do sistema"
      >
        <Button onClick={handleOpenAddModal}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Novo NeuroCore
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          {neurocoresList.length === 0 ? (
            <EmptyState
              icon={Brain}
              title="Nenhum NeuroCore encontrado"
              description="Crie seu primeiro NeuroCore para começar"
              actionLabel="Adicionar NeuroCore"
              onAction={handleOpenAddModal}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Nicho</TableHead>
                    <TableHead>Empresas</TableHead>
                    <TableHead>Agentes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {neurocoresList.map((neurocore) => (
                    <TableRow key={neurocore.id}>
                      <TableCell className="font-medium">{neurocore.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{neurocore.description}</TableCell>
                      <TableCell>{neurocore.niche}</TableCell>
                      <TableCell>{neurocore.empresasCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-muted-foreground" />
                          {neurocore.agentesCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        {neurocore.isActive ? (
                          <Badge variant="default">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenViewModal(neurocore)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalhes
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAssociarAgentes(neurocore)}
                          >
                            <Bot className="h-4 w-4 mr-1" />
                            Agentes
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(neurocore)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          {neurocore.isActive ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleInativarNeuroCore(neurocore)}
                            >
                              <PowerOff className="h-4 w-4 mr-1" />
                              Inativar
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReativarNeuroCore(neurocore)}
                            >
                              <Power className="h-4 w-4 mr-1" />
                              Reativar
                            </Button>
                          )}
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
      <AddEditNeuroCoreModal
        open={addEditModal.open}
        onOpenChange={(open) => setAddEditModal({ ...addEditModal, open })}
        neurocore={addEditModal.neurocore}
        isViewMode={false}
        onSave={handleSaveNeuroCore}
      />

      <AddEditNeuroCoreModal
        open={viewModal.open}
        onOpenChange={(open) => setViewModal({ ...viewModal, open })}
        neurocore={viewModal.neurocore}
        isViewMode={true}
        onSave={handleSaveNeuroCore}
      />

      <InativarNeuroCoreModal
        open={inativarModal.open}
        onOpenChange={(open) => setInativarModal({ ...inativarModal, open })}
        neurocoreNome={inativarModal.neurocore?.name || ""}
        onConfirm={handleConfirmInativar}
      />

      <ReativarNeuroCoreModal
        open={reativarModal.open}
        onOpenChange={(open) => setReativarModal({ ...reativarModal, open })}
        neurocoreNome={reativarModal.neurocore?.name || ""}
        onConfirm={handleConfirmReativar}
      />

      <AssociarAgentesSheet
        open={agentesSheet.open}
        onOpenChange={(open) => setAgentesSheet({ ...agentesSheet, open })}
        neurocore={agentesSheet.neurocore}
        onSave={handleSaveAgentes}
      />
    </PageContainer>
  )
}

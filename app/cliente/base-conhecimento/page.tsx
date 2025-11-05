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
import { Plus, Pencil, PowerOff, Power, Book, Wand } from "lucide-react"
import Link from "next/link"
import { useData } from "@/lib/contexts/data-provider"
import { useAuth } from "@/lib/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useRouter } from "next/navigation"
import { BaseConhecimento, SynapseStatus } from "@/types"
import { AddEditBaseConhecimentoModal } from "./_components/add-edit-base-conhecimento-modal"
import { InativarBaseConhecimentoModal } from "./_components/inativar-base-conhecimento-modal"
import { ReativarBaseConhecimentoModal } from "./_components/reativar-base-conhecimento-modal"
import { GerenciarSynapsesModal } from "./_components/gerenciar-synapses-modal"

export default function BaseConhecimentoPage() {
  const router = useRouter()
  const { state, isLoading, createBaseConhecimento, updateBaseConhecimento } = useData()
  const { user } = useAuth()
  const { toast } = useToast()

  const tenantId = user?.tenantId

  const [addEditModal, setAddEditModal] = useState<{
    open: boolean
    base: BaseConhecimento | null
  }>({
    open: false,
    base: null,
  })

  const [inativarModal, setInativarModal] = useState<{
    open: boolean
    base: BaseConhecimento | null
  }>({
    open: false,
    base: null,
  })

  const [reativarModal, setReativarModal] = useState<{
    open: boolean
    base: BaseConhecimento | null
  }>({
    open: false,
    base: null,
  })

  const [synapsesModal, setSynapsesModal] = useState<{
    open: boolean
    base: BaseConhecimento | null
  }>({
    open: false,
    base: null,
  })

  // Atalhos de teclado
  useKeyboardShortcuts({
    onNew: () => setAddEditModal({ open: true, base: null }),
    onNavigate1: () => router.push("/cliente"),
    onNavigate2: () => router.push("/cliente/base-conhecimento"),
    onNavigate3: () => router.push("/cliente/perfil"),
  })

  // Filtrar bases do tenant logado
  const tenantBases = useMemo(() => {
    if (!tenantId) return []
    return state.baseConhecimentos.filter((b) => b.tenantId === tenantId)
  }, [state.baseConhecimentos, tenantId])

  // Enriquecer com dados de synapses e neurocore
  const enrichedBases = useMemo(() => {
    return tenantBases.map((base) => {
      const synapsesCount = state.synapses.filter((s) => s.baseConhecimentoId === base.id).length
      const synapsesPublicando = state.synapses.filter(
        (s) => s.baseConhecimentoId === base.id && s.status === SynapseStatus.PUBLICANDO
      ).length
      const neurocore = state.neurocores.find((nc) => nc.id === base.neurocoreId)

      return {
        ...base,
        synapsesCount,
        synapsesPublicando,
        neurocoreName: neurocore?.name || "N/A",
      }
    })
  }, [tenantBases, state.synapses, state.neurocores])

  const handleOpenAddModal = () => {
    setAddEditModal({ open: true, base: null })
  }

  const handleOpenEditModal = (base: BaseConhecimento) => {
    setAddEditModal({ open: true, base })
  }

  const handleSaveBase = async (data: {
    name: string
    description: string
  }) => {
    if (!tenantId) return

    try {
      const tenant = state.tenants.find((t) => t.id === tenantId)
      if (!tenant) return

      if (addEditModal.base) {
        // Editar base existente
        await updateBaseConhecimento(addEditModal.base.id, {
          name: data.name,
          description: data.description,
        })
        toast({
          title: "Base atualizada",
          description: "A base de conhecimento foi atualizada com sucesso.",
        })
      } else {
        // Adicionar nova base
        await createBaseConhecimento({
          tenantId,
          name: data.name,
          description: data.description,
          neurocoreId: tenant.neurocoreId,
          isActive: true,
        })
        toast({
          title: "Base criada",
          description: "A base de conhecimento foi criada com sucesso.",
        })
      }
      setAddEditModal({ open: false, base: null })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a base de conhecimento.",
        variant: "destructive",
      })
    }
  }

  const handleInativarBase = (base: BaseConhecimento) => {
    setInativarModal({ open: true, base })
  }

  const handleConfirmInativar = async () => {
    if (inativarModal.base) {
      try {
        await updateBaseConhecimento(inativarModal.base.id, { isActive: false })
        toast({
          title: "Base inativada",
          description: "A base de conhecimento foi inativada com sucesso.",
        })
        setInativarModal({ open: false, base: null })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível inativar a base.",
          variant: "destructive",
        })
      }
    }
  }

  const handleReativarBase = (base: BaseConhecimento) => {
    setReativarModal({ open: true, base })
  }

  const handleConfirmReativar = async () => {
    if (reativarModal.base) {
      try {
        await updateBaseConhecimento(reativarModal.base.id, { isActive: true })
        toast({
          title: "Base reativada",
          description: "A base de conhecimento foi reativada com sucesso.",
        })
        setReativarModal({ open: false, base: null })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível reativar a base.",
          variant: "destructive",
        })
      }
    }
  }

  const handleGerenciarSynapses = (base: BaseConhecimento) => {
    setSynapsesModal({ open: true, base })
  }

  if (!tenantId) {
    return (
      <PageContainer>
        <PageHeader title="Base de Conhecimento" description="Gerencie bases de conhecimento e synapses" />
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={Book}
              title="Usuário não associado a um tenant"
              description="Entre em contato com o administrador"
            />
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Base de Conhecimento" description="Gerencie bases de conhecimento e synapses" />
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
        title="Base de Conhecimento"
        description="Gerencie bases de conhecimento e synapses"
      >
        <div className="flex gap-2">
          <Link href="/cliente/treinamento">
            <Button variant="outline">
              <Wand className="mr-2 h-4 w-4" />
              Treinar NeuroCore
            </Button>
          </Link>
          <Button onClick={handleOpenAddModal}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Base de Conhecimento
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          {enrichedBases.length === 0 ? (
            <EmptyState
              icon={Book}
              title="Nenhuma base de conhecimento encontrada"
              description="Crie sua primeira base de conhecimento para começar"
              actionLabel="Nova Base"
              onAction={handleOpenAddModal}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>NeuroCore</TableHead>
                    <TableHead>Synapses</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrichedBases.map((base) => (
                    <TableRow key={base.id}>
                      <TableCell className="font-medium">{base.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {base.description}
                      </TableCell>
                      <TableCell>{base.neurocoreName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{base.synapsesCount}</span>
                          {base.synapsesPublicando > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {base.synapsesPublicando} publicando
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {base.isActive ? (
                          <Badge variant="default">Ativa</Badge>
                        ) : (
                          <Badge variant="secondary">Inativa</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGerenciarSynapses(base)}
                          >
                            Synapses
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(base)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          {base.isActive ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleInativarBase(base)}
                            >
                              <PowerOff className="h-4 w-4 mr-1" />
                              Inativar
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReativarBase(base)}
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
      <AddEditBaseConhecimentoModal
        open={addEditModal.open}
        onOpenChange={(open) => setAddEditModal({ ...addEditModal, open })}
        base={addEditModal.base}
        onSave={handleSaveBase}
      />

      <InativarBaseConhecimentoModal
        open={inativarModal.open}
        onOpenChange={(open) => setInativarModal({ ...inativarModal, open })}
        baseNome={inativarModal.base?.name || ""}
        onConfirm={handleConfirmInativar}
      />

      <ReativarBaseConhecimentoModal
        open={reativarModal.open}
        onOpenChange={(open) => setReativarModal({ ...reativarModal, open })}
        baseNome={reativarModal.base?.name || ""}
        onConfirm={handleConfirmReativar}
      />

      <GerenciarSynapsesModal
        open={synapsesModal.open}
        onOpenChange={(open) => setSynapsesModal({ ...synapsesModal, open })}
        base={synapsesModal.base}
      />
    </PageContainer>
  )
}

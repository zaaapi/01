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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Power, PowerOff, Users, Building } from "lucide-react"
import { useData } from "@/lib/contexts/data-provider"
import { useToast } from "@/hooks/use-toast"
import { Tenant } from "@/types"
import { AddEditEmpresaModal } from "./_components/add-edit-empresa-modal"
import { InativarEmpresaModal } from "./_components/inativar-empresa-modal"
import { ReativarEmpresaModal } from "./_components/reativar-empresa-modal"
import { GerenciarUsuariosModal } from "./_components/gerenciar-usuarios-modal"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useRouter } from "next/navigation"

export default function EmpresasPage() {
  const router = useRouter()
  const { state, isLoading, updateTenant, createTenant } = useData()
  const { toast } = useToast()
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("active")

  // Estado dos modais
  const [addEditModal, setAddEditModal] = useState<{
    open: boolean
    empresa: Tenant | null
  }>({
    open: false,
    empresa: null,
  })

  const [inativarModal, setInativarModal] = useState<{
    open: boolean
    empresa: Tenant | null
  }>({
    open: false,
    empresa: null,
  })

  const [reativarModal, setReativarModal] = useState<{
    open: boolean
    empresa: Tenant | null
  }>({
    open: false,
    empresa: null,
  })

  const [usuariosModal, setUsuariosModal] = useState<{
    open: boolean
    empresa: Tenant | null
  }>({
    open: false,
    empresa: null,
  })

  // Atalhos de teclado
  useKeyboardShortcuts({
    onNew: () => setAddEditModal({ open: true, empresa: null }),
    onNavigate1: () => router.push("/super-admin"),
    onNavigate2: () => router.push("/super-admin/empresas"),
    onNavigate3: () => router.push("/super-admin/perfil"),
  })

  // Calcular quantidade de usuários por empresa
  const getUsuariosCount = (tenantId: string) => {
    return state.users.filter((u) => u.tenantId === tenantId).length
  }

  // Calcular conversas por empresa
  const getConversasCount = (tenantId: string) => {
    const tenantConversations = state.conversations.filter((c) => c.tenantId === tenantId)
    return {
      abertas: tenantConversations.filter((c) => c.status === "Conversando").length,
      pausadas: tenantConversations.filter((c) => c.status === "Pausada").length,
      encerradas: tenantConversations.filter((c) => c.status === "Encerrada").length,
    }
  }

  // Empresas com dados calculados
  const empresasList = useMemo(() => {
    return state.tenants.map((tenant) => {
      const neurocore = state.neurocores.find((nc) => nc.id === tenant.neurocoreId)
      return {
        ...tenant,
        neurocoreName: neurocore?.name || "N/A",
        userCount: getUsuariosCount(tenant.id),
        conversas: getConversasCount(tenant.id),
      }
    })
  }, [state.tenants, state.neurocores, state.users, state.conversations])

  const filteredEmpresas = empresasList.filter((empresa) => {
    if (filter === "all") return true
    if (filter === "active") return empresa.isActive
    if (filter === "inactive") return !empresa.isActive
    return true
  })

  // Handlers para adicionar/editar empresa
  const handleOpenAddModal = () => {
    setAddEditModal({ open: true, empresa: null })
  }

  const handleOpenEditModal = (empresa: Tenant) => {
    setAddEditModal({ open: true, empresa })
  }

  const handleSaveEmpresa = async (data: { name: string; neurocoreId: string; cnpj: string; phone: string; plan: string }) => {
    try {
      if (addEditModal.empresa) {
        // Editar empresa existente
        await updateTenant(addEditModal.empresa.id, {
          name: data.name,
          neurocoreId: data.neurocoreId,
          cnpj: data.cnpj,
          phone: data.phone,
          plan: data.plan,
        })
        toast({
          title: "Empresa atualizada",
          description: "A empresa foi atualizada com sucesso.",
        })
      } else {
        // Adicionar nova empresa
        await createTenant({
          name: data.name,
          neurocoreId: data.neurocoreId,
          isActive: true,
          cnpj: data.cnpj,
          phone: data.phone,
          plan: data.plan,
          responsibleTech: {
            name: "",
            whatsapp: "",
            email: "",
          },
          responsibleFinance: {
            name: "",
            whatsapp: "",
            email: "",
          },
        })
        toast({
          title: "Empresa criada",
          description: "A empresa foi criada com sucesso.",
        })
      }
      setAddEditModal({ open: false, empresa: null })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a empresa.",
        variant: "destructive",
      })
    }
  }

  // Handlers para inativar/reativar
  const handleInativarEmpresa = (empresa: Tenant) => {
    setInativarModal({ open: true, empresa })
  }

  const handleConfirmInativar = async () => {
    if (inativarModal.empresa) {
      try {
        await updateTenant(inativarModal.empresa.id, { isActive: false })
        toast({
          title: "Empresa inativada",
          description: "A empresa foi inativada com sucesso.",
        })
        setInativarModal({ open: false, empresa: null })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível inativar a empresa.",
          variant: "destructive",
        })
      }
    }
  }

  const handleReativarEmpresa = (empresa: Tenant) => {
    setReativarModal({ open: true, empresa })
  }

  const handleConfirmReativar = async () => {
    if (reativarModal.empresa) {
      try {
        await updateTenant(reativarModal.empresa.id, { isActive: true })
        toast({
          title: "Empresa reativada",
          description: "A empresa foi reativada com sucesso.",
        })
        setReativarModal({ open: false, empresa: null })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível reativar a empresa.",
          variant: "destructive",
        })
      }
    }
  }

  // Handler para gerenciar usuários
  const handleGerenciarUsuarios = (empresa: Tenant) => {
    setUsuariosModal({ open: true, empresa })
  }

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Gerenciar Empresas" description="Gerencie empresas, usuários e configurações" />
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
        title="Gerenciar Empresas"
        description="Gerencie empresas, usuários e configurações"
      >
        <Button onClick={handleOpenAddModal}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Nova Empresa
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          {/* Filtro */}
          <div className="mb-6">
            <Select
              value={filter}
              onValueChange={(value: "all" | "active" | "inactive") => setFilter(value)}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filtrar empresas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as empresas</SelectItem>
                <SelectItem value="active">Apenas empresas ativas</SelectItem>
                <SelectItem value="inactive">Apenas empresas inativas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          {filteredEmpresas.length === 0 ? (
            <EmptyState
              icon={Building}
              title="Nenhuma empresa encontrada"
              description={
                filter === "active"
                  ? "Não há empresas ativas no sistema"
                  : filter === "inactive"
                  ? "Não há empresas inativas no sistema"
                  : "Nenhuma empresa cadastrada"
              }
              actionLabel={filter !== "all" ? "Limpar filtros" : undefined}
              onAction={filter !== "all" ? () => setFilter("all") : undefined}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome da Empresa</TableHead>
                    <TableHead>NeuroCore Associado</TableHead>
                    <TableHead>Usuários</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmpresas.map((empresa) => (
                    <TableRow key={empresa.id}>
                      <TableCell className="font-medium">{empresa.name}</TableCell>
                      <TableCell>{empresa.neurocoreName}</TableCell>
                      <TableCell>{empresa.userCount}</TableCell>
                      <TableCell>
                        {empresa.isActive ? (
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
                            onClick={() => handleGerenciarUsuarios(empresa)}
                          >
                            <Users className="h-4 w-4 mr-1" />
                            Usuários
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(empresa)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          {empresa.isActive ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleInativarEmpresa(empresa)}
                            >
                              <PowerOff className="h-4 w-4 mr-1" />
                              Inativar
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReativarEmpresa(empresa)}
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

              {/* Rodapé com contadores */}
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <p>
                  Mostrando {filteredEmpresas.length} de {empresasList.length} empresas
                </p>
                <p>
                  {empresasList.filter((e) => e.isActive).length} ativas •{" "}
                  {empresasList.filter((e) => !e.isActive).length} inativas
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modais */}
      <AddEditEmpresaModal
        open={addEditModal.open}
        onOpenChange={(open) => setAddEditModal({ ...addEditModal, open })}
        empresa={addEditModal.empresa}
        onSave={handleSaveEmpresa}
      />

      <InativarEmpresaModal
        open={inativarModal.open}
        onOpenChange={(open) => setInativarModal({ ...inativarModal, open })}
        empresaNome={inativarModal.empresa?.name || ""}
        onConfirm={handleConfirmInativar}
      />

      <ReativarEmpresaModal
        open={reativarModal.open}
        onOpenChange={(open) => setReativarModal({ ...reativarModal, open })}
        empresaNome={reativarModal.empresa?.name || ""}
        onConfirm={handleConfirmReativar}
      />

      <GerenciarUsuariosModal
        open={usuariosModal.open}
        onOpenChange={(open) => setUsuariosModal({ ...usuariosModal, open })}
        empresaId={usuariosModal.empresa?.id || ""}
        empresaNome={usuariosModal.empresa?.name || ""}
      />
    </PageContainer>
  )
}

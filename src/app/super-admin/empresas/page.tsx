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
import { useTenants, useUpdateTenant, useCreateTenant } from "@/lib/hooks"
import { useNeurocores } from "@/lib/hooks"
import { Tenant } from "@/types"
import { AddEditEmpresaModal } from "./_components/add-edit-empresa-modal"
import { InativarEmpresaModal } from "./_components/inativar-empresa-modal"
import { ReativarEmpresaModal } from "./_components/reativar-empresa-modal"
import { GerenciarUsuariosModal } from "./_components/gerenciar-usuarios-modal"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useRouter } from "next/navigation"

export default function EmpresasPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("active")

  // React Query hooks
  const { data: tenants = [], isLoading: isLoadingTenants } = useTenants(filter)
  const { data: neurocores = [] } = useNeurocores()
  const updateTenantMutation = useUpdateTenant()
  const createTenantMutation = useCreateTenant()

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

  // Empresas com dados calculados
  const empresasList = useMemo(() => {
    return tenants.map((tenant) => {
      const neurocore = neurocores.find((nc) => nc.id === tenant.neurocoreId)
      return {
        ...tenant,
        neurocoreName: neurocore?.name || "N/A",
        userCount: 0, // TODO: Implementar contagem quando migrar componente gerenciar-usuarios
      }
    })
  }, [tenants, neurocores])

  // Handlers para adicionar/editar empresa
  const handleOpenAddModal = () => {
    setAddEditModal({ open: true, empresa: null })
  }

  const handleOpenEditModal = (empresa: Tenant) => {
    setAddEditModal({ open: true, empresa })
  }

  const handleSaveEmpresa = async (data: {
    name: string
    neurocoreId: string
    cnpj: string
    phone: string
    plan: string
    responsibleTech: { name: string; whatsapp: string; email: string }
    responsibleFinance: { name: string; whatsapp: string; email: string }
    masterIntegrationUrl?: string
    masterIntegrationActive: boolean
  }) => {
    if (addEditModal.empresa) {
      // Editar empresa existente
      await updateTenantMutation.mutateAsync({
        id: addEditModal.empresa.id,
        data: {
          name: data.name,
          neurocoreId: data.neurocoreId,
          cnpj: data.cnpj,
          phone: data.phone,
          plan: data.plan,
          responsibleTech: data.responsibleTech,
          responsibleFinance: data.responsibleFinance,
        },
      })
    } else {
      // Adicionar nova empresa
      await createTenantMutation.mutateAsync({
        name: data.name,
        neurocoreId: data.neurocoreId,
        isActive: true,
        cnpj: data.cnpj,
        phone: data.phone,
        plan: data.plan,
        responsibleTech: data.responsibleTech,
        responsibleFinance: data.responsibleFinance,
      })
    }
    setAddEditModal({ open: false, empresa: null })
  }

  // Handlers para inativar/reativar
  const handleInativarEmpresa = (empresa: Tenant) => {
    setInativarModal({ open: true, empresa })
  }

  const handleConfirmInativar = async () => {
    if (inativarModal.empresa) {
      await updateTenantMutation.mutateAsync({
        id: inativarModal.empresa.id,
        data: { isActive: false },
      })
      setInativarModal({ open: false, empresa: null })
    }
  }

  const handleReativarEmpresa = (empresa: Tenant) => {
    setReativarModal({ open: true, empresa })
  }

  const handleConfirmReativar = async () => {
    if (reativarModal.empresa) {
      await updateTenantMutation.mutateAsync({
        id: reativarModal.empresa.id,
        data: { isActive: true },
      })
      setReativarModal({ open: false, empresa: null })
    }
  }

  // Handler para gerenciar usuários
  const handleGerenciarUsuarios = (empresa: Tenant) => {
    setUsuariosModal({ open: true, empresa })
  }

  if (isLoadingTenants) {
    return (
      <PageContainer>
        <PageHeader
          title="Gerenciar Empresas"
          description="Gerencie empresas, usuários e configurações"
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
          {empresasList.length === 0 ? (
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
                  {empresasList.map((empresa) => (
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
                <p>Mostrando {empresasList.length} empresas</p>
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

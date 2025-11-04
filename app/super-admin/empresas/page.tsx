"use client";

import { useState } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Power, PowerOff, Users } from "lucide-react";
import { mockEmpresas, mockUsuarios, Empresa } from "./_components/mock-data";
import { AddEditEmpresaModal } from "./_components/add-edit-empresa-modal";
import { InativarEmpresaModal } from "./_components/inativar-empresa-modal";
import { ReativarEmpresaModal } from "./_components/reativar-empresa-modal";
import { GerenciarUsuariosModal } from "./_components/gerenciar-usuarios-modal";

export default function EmpresasPage() {
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("active");
  const [empresas, setEmpresas] = useState<Empresa[]>(mockEmpresas);

  // Estado dos modais
  const [addEditModal, setAddEditModal] = useState<{
    open: boolean;
    empresa: Empresa | null;
  }>({
    open: false,
    empresa: null,
  });

  const [inativarModal, setInativarModal] = useState<{
    open: boolean;
    empresa: Empresa | null;
  }>({
    open: false,
    empresa: null,
  });

  const [reativarModal, setReativarModal] = useState<{
    open: boolean;
    empresa: Empresa | null;
  }>({
    open: false,
    empresa: null,
  });

  const [usuariosModal, setUsuariosModal] = useState<{
    open: boolean;
    empresa: Empresa | null;
  }>({
    open: false,
    empresa: null,
  });

  // Handlers para adicionar/editar empresa
  const handleOpenAddModal = () => {
    setAddEditModal({ open: true, empresa: null });
  };

  const handleOpenEditModal = (empresa: Empresa) => {
    setAddEditModal({ open: true, empresa });
  };

  const handleSaveEmpresa = (data: { name: string; neurocore: string }) => {
    if (addEditModal.empresa) {
      // Editar empresa existente
      setEmpresas(
        empresas.map((e) =>
          e.id === addEditModal.empresa?.id ? { ...e, ...data } : e
        )
      );
    } else {
      // Adicionar nova empresa
      const newEmpresa: Empresa = {
        id: `tenant-${Date.now()}`,
        ...data,
        isActive: true,
      };
      setEmpresas([...empresas, newEmpresa]);
    }
  };

  // Handlers para inativar/reativar
  const handleInativarEmpresa = (empresa: Empresa) => {
    setInativarModal({ open: true, empresa });
  };

  const handleConfirmInativar = () => {
    if (inativarModal.empresa) {
      setEmpresas(
        empresas.map((e) =>
          e.id === inativarModal.empresa?.id ? { ...e, isActive: false } : e
        )
      );
    }
  };

  const handleReativarEmpresa = (empresa: Empresa) => {
    setReativarModal({ open: true, empresa });
  };

  const handleConfirmReativar = () => {
    if (reativarModal.empresa) {
      setEmpresas(
        empresas.map((e) =>
          e.id === reativarModal.empresa?.id ? { ...e, isActive: true } : e
        )
      );
    }
  };

  // Handler para gerenciar usuários
  const handleGerenciarUsuarios = (empresa: Empresa) => {
    setUsuariosModal({ open: true, empresa });
  };

  // Calcular quantidade de usuários por empresa
  const getUsuariosCount = (empresaId: string) => {
    return mockUsuarios.filter((u) => u.empresaId === empresaId).length;
  };

  const filteredEmpresas = empresas.filter((empresa) => {
    if (filter === "all") return true;
    if (filter === "active") return empresa.isActive;
    if (filter === "inactive") return !empresa.isActive;
    return true;
  });

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
              onValueChange={(value: "all" | "active" | "inactive") =>
                setFilter(value)
              }
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
              {filteredEmpresas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-muted-foreground">
                        Nenhuma empresa encontrada com os filtros selecionados
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilter("all")}
                      >
                        Limpar filtros
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmpresas.map((empresa) => (
                  <TableRow key={empresa.id}>
                    <TableCell className="font-medium">{empresa.name}</TableCell>
                    <TableCell>{empresa.neurocore}</TableCell>
                    <TableCell>{getUsuariosCount(empresa.id)}</TableCell>
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
                ))
              )}
            </TableBody>
          </Table>

          {/* Rodapé com contadores */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Mostrando {filteredEmpresas.length} de {empresas.length} empresas
            </p>
            <p>
              {empresas.filter((e) => e.isActive).length} ativas •{" "}
              {empresas.filter((e) => !e.isActive).length} inativas
            </p>
          </div>
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
  );
}


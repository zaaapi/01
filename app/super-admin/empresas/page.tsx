"use client"

import { useState } from "react"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Plus, Pencil, Power, PowerOff, Users } from "lucide-react"

// Mock data - em produção virá do localStorage
const empresas = [
  {
    id: "tenant-1",
    name: "Loja Tech Store",
    neurocore: "NeuroCore Varejo",
    usuarios: 2,
    isActive: true,
  },
  {
    id: "tenant-2",
    name: "Clínica Vida Saudável",
    neurocore: "NeuroCore Saúde",
    usuarios: 1,
    isActive: true,
  },
  {
    id: "tenant-3",
    name: "Empresa Inativa",
    neurocore: "NeuroCore Varejo",
    usuarios: 2,
    isActive: false,
  },
]

export default function EmpresasPage() {
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("active")

  const filteredEmpresas = empresas.filter((empresa) => {
    if (filter === "all") return true
    if (filter === "active") return empresa.isActive
    if (filter === "inactive") return !empresa.isActive
    return true
  })

  return (
    <PageContainer>
      <PageHeader
        title="Gerenciar Empresas"
        description="Gerencie empresas, usuários e configurações"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Nova Empresa
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          {/* Filtro */}
          <div className="mb-6">
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
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
                      <Button variant="outline" size="sm" onClick={() => setFilter("all")}>
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
                    <TableCell>{empresa.usuarios}</TableCell>
                    <TableCell>
                      {empresa.isActive ? (
                        <Badge variant="default">Ativa</Badge>
                      ) : (
                        <Badge variant="secondary">Inativa</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Users className="h-4 w-4 mr-1" />
                          Usuários
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        {empresa.isActive ? (
                          <Button variant="ghost" size="sm">
                            <PowerOff className="h-4 w-4 mr-1" />
                            Inativar
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm">
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
    </PageContainer>
  )
}


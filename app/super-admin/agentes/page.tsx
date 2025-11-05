"use client"

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
import { Plus, Pencil, Trash2 } from "lucide-react"

const agentes = [
  {
    id: "agent-1",
    name: "Agente de Intenções",
    type: "Reativo",
    function: "Atendimento",
    neurocores: 1,
    isActive: true,
  },
  {
    id: "agent-2",
    name: "Agente de Vendas",
    type: "Ativo",
    function: "Vendas",
    neurocores: 1,
    isActive: true,
  },
  {
    id: "agent-3",
    name: "Agente Pós-Venda",
    type: "Reativo",
    function: "Pós-Venda",
    neurocores: 1,
    isActive: true,
  },
]

export default function AgentesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Gerenciar Agentes IA"
        description="Configure os agentes de inteligência artificial"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Novo Agente
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>NeuroCores</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentes.map((agente) => (
                <TableRow key={agente.id}>
                  <TableCell className="font-medium">{agente.name}</TableCell>
                  <TableCell>
                    <Badge variant={agente.type === "Ativo" ? "default" : "secondary"}>
                      {agente.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{agente.function}</TableCell>
                  <TableCell>{agente.neurocores}</TableCell>
                  <TableCell>
                    {agente.isActive ? (
                      <Badge variant="default">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  )
}





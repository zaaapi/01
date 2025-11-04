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
import { Plus, Pencil, PowerOff } from "lucide-react"

const neurocores = [
  {
    id: "nc-1",
    name: "NeuroCore Varejo",
    description: "Especializado em atendimento para varejo",
    niche: "Varejo",
    empresas: 2,
    isActive: true,
  },
  {
    id: "nc-2",
    name: "NeuroCore Saúde",
    description: "Especializado em atendimento para área da saúde",
    niche: "Saúde",
    empresas: 1,
    isActive: true,
  },
]

export default function NeuroCoresPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Gerenciar NeuroCores"
        description="Configure e gerencie os NeuroCores do sistema"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Novo NeuroCore
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Nicho</TableHead>
                <TableHead>Empresas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {neurocores.map((neurocore) => (
                <TableRow key={neurocore.id}>
                  <TableCell className="font-medium">{neurocore.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{neurocore.description}</TableCell>
                  <TableCell>{neurocore.niche}</TableCell>
                  <TableCell>{neurocore.empresas}</TableCell>
                  <TableCell>
                    {neurocore.isActive ? (
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
                        <PowerOff className="h-4 w-4 mr-1" />
                        Inativar
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


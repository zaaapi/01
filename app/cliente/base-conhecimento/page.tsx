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
import { Plus, Pencil, PowerOff, Wand } from "lucide-react"
import Link from "next/link"

const basesConhecimento = [
  {
    id: "base-1",
    name: "Base Produtos Tech Store",
    description: "Informações sobre produtos eletrônicos",
    neurocore: "NeuroCore Varejo",
    synapses: 2,
    isActive: true,
  },
]

export default function BaseConhecimentoPage() {
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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Base de Conhecimento
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
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
              {basesConhecimento.map((base) => (
                <TableRow key={base.id}>
                  <TableCell className="font-medium">{base.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{base.description}</TableCell>
                  <TableCell>{base.neurocore}</TableCell>
                  <TableCell>{base.synapses}</TableCell>
                  <TableCell>
                    {base.isActive ? (
                      <Badge variant="default">Ativa</Badge>
                    ) : (
                      <Badge variant="secondary">Inativa</Badge>
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


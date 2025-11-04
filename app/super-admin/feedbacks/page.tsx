"use client"

import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
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
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, Eye } from "lucide-react"

const feedbacks = [
  {
    id: "feed-1",
    date: "04/11/2024 10:30",
    type: "like",
    message: "Olá! Seja bem-vindo à Tech Store!",
    cliente: "Tech Store",
    usuario: "Roberto Costa",
    status: "Em Aberto",
  },
  {
    id: "feed-2",
    date: "03/11/2024 15:45",
    type: "dislike",
    message: "Por favor, aguarde um momento...",
    cliente: "Tech Store",
    usuario: "Roberto Costa",
    status: "Sendo Tratado",
  },
]

export default function FeedbacksPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Gerenciar Feedbacks"
        description="Visualize e gerencie os feedbacks de IA dos clientes"
      />

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Mensagem da IA</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {feedback.date}
                  </TableCell>
                  <TableCell>
                    {feedback.type === "like" ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <ThumbsUp className="h-4 w-4" />
                        <span className="text-xs">LIKE</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <ThumbsDown className="h-4 w-4" />
                        <span className="text-xs">DISLIKE</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{feedback.message}</TableCell>
                  <TableCell>{feedback.cliente}</TableCell>
                  <TableCell>{feedback.usuario}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        feedback.status === "Em Aberto"
                          ? "destructive"
                          : feedback.status === "Sendo Tratado"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {feedback.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalhes
                    </Button>
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


"use client"

import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Star } from "lucide-react"

const agentes = [
  {
    id: "agent-1",
    name: "Agente de Intenções",
    type: "Reativo",
    function: "Atendimento",
    isIntentAgent: true,
  },
  {
    id: "agent-2",
    name: "Agente de Vendas",
    type: "Ativo",
    function: "Vendas",
    isIntentAgent: false,
  },
]

export default function PersonalizacaoPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Personalização NeuroCore"
        description="Configure os agentes de IA do seu NeuroCore"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agentes.map((agente) => (
          <Card
            key={agente.id}
            className={agente.isIntentAgent ? "border-primary/50 shadow-lg" : ""}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-2">
                  {agente.name}
                  {agente.isIntentAgent && (
                    <Star className="h-4 w-4 fill-primary text-primary" />
                  )}
                </CardTitle>
              </div>
              <CardDescription>{agente.function}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tipo</span>
                  <Badge variant={agente.type === "Ativo" ? "default" : "secondary"}>
                    {agente.type}
                  </Badge>
                </div>

                {agente.isIntentAgent && (
                  <div className="rounded-md bg-primary/10 p-3 text-sm">
                    <p className="font-medium text-primary">Agente Principal</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Este agente identifica as intenções dos clientes
                    </p>
                  </div>
                )}

                <Button className="w-full" variant={agente.isIntentAgent ? "default" : "outline"}>
                  <Settings className="mr-2 h-4 w-4" />
                  Personalizar Agente
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  )
}


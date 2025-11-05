"use client"

import { useState, useMemo } from "react"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { Settings, Star, Bot } from "lucide-react"
import { useData } from "@/lib/contexts/data-provider"
import { useAuth } from "@/lib/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useRouter } from "next/navigation"
import { Agent, AgentType, AgentFunction } from "@/types"
import { PersonalizarAgenteModal } from "./_components/personalizar-agente-modal"

export default function PersonalizacaoPage() {
  const router = useRouter()
  const { state, isLoading } = useData()
  const { currentAuthUser } = useAuth()
  const { toast } = useToast()

  const tenantId = currentAuthUser?.tenantId

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Atalhos de teclado
  useKeyboardShortcuts({
    onNavigate1: () => router.push("/cliente"),
    onNavigate2: () => router.push("/cliente/personalizacao"),
    onNavigate3: () => router.push("/cliente/perfil"),
  })

  // Buscar NeuroCore do tenant e seus agentes associados
  const tenantNeurocore = useMemo(() => {
    if (!tenantId) return null
    const tenant = state.tenants.find((t) => t.id === tenantId)
    if (!tenant) return null
    return state.neurocores.find((nc) => nc.id === tenant.neurocoreId)
  }, [state.tenants, state.neurocores, tenantId])

  const tenantAgents = useMemo(() => {
    if (!tenantNeurocore) return []
    return state.agents.filter((a) =>
      tenantNeurocore.associatedAgents.includes(a.id)
    )
  }, [state.agents, tenantNeurocore])

  // Ordenar: Agente de Intenções primeiro
  const sortedAgents = useMemo(() => {
    const intentAgent = tenantAgents.find((a) => a.isIntentAgent)
    const otherAgents = tenantAgents.filter((a) => !a.isIntentAgent)
    return intentAgent ? [intentAgent, ...otherAgents] : otherAgents
  }, [tenantAgents])

  const handleOpenPersonalizar = (agent: Agent) => {
    setSelectedAgent(agent)
    setModalOpen(true)
  }

  const handleSaveAgent = async () => {
    toast({
      title: "Agente atualizado",
      description: "As personalizações do agente foram salvas com sucesso.",
    })
    setModalOpen(false)
    setSelectedAgent(null)
  }

  if (!tenantId) {
    return (
      <PageContainer>
        <PageHeader title="Personalização NeuroCore" description="Configure os agentes de IA do seu NeuroCore" />
        <EmptyState
          icon={Bot}
          title="Usuário não associado a um tenant"
          description="Entre em contato com o administrador"
        />
      </PageContainer>
    )
  }

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Personalização NeuroCore" description="Configure os agentes de IA do seu NeuroCore" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Personalização NeuroCore"
        description="Configure os agentes de IA do seu NeuroCore"
      />

      {sortedAgents.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="Nenhum agente configurado"
          description="Entre em contato com o administrador para configurar agentes"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedAgents.map((agent) => (
            <Card
              key={agent.id}
              className={agent.isIntentAgent ? "border-primary/50 shadow-lg" : ""}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {agent.name}
                    {agent.isIntentAgent && (
                      <Star className="h-4 w-4 fill-primary text-primary" />
                    )}
                  </CardTitle>
                </div>
                <CardDescription>{agent.function}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tipo</span>
                    <Badge variant={agent.type === AgentType.ATIVO ? "default" : "secondary"}>
                      {agent.type}
                    </Badge>
                  </div>

                  {agent.isIntentAgent && (
                    <div className="rounded-md bg-primary/10 p-3 text-sm">
                      <p className="font-medium text-primary">Agente Principal</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Este agente identifica as intenções dos clientes
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    variant={agent.isIntentAgent ? "default" : "outline"}
                    onClick={() => handleOpenPersonalizar(agent)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Personalizar Agente
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Personalização */}
      <PersonalizarAgenteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        agent={selectedAgent}
        onSave={handleSaveAgent}
      />
    </PageContainer>
  )
}

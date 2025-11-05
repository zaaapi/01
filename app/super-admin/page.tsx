"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { WordCloud } from "@/components/shared/word-cloud"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Building, Bot, Brain, MessageSquare, Search } from "lucide-react"
import { useData } from "@/lib/contexts/data-provider"
import { useAuth } from "@/lib/contexts/auth-context"
import { GlobalFilterPeriod, GlobalFilterConversationSelection, ConversationStatus, ContactStatus } from "@/types"
import { formatDate } from "@/lib/formatters"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useRouter } from "next/navigation"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import dayjs from "dayjs"

export default function SuperAdminDashboard() {
  const router = useRouter()
  const { state, isLoading, updateGlobalFilters } = useData()
  const { user } = useAuth()
  const [localPeriod, setLocalPeriod] = useState<GlobalFilterPeriod>(state.globalFilters.period)
  const [localConversationSelection, setLocalConversationSelection] = useState<GlobalFilterConversationSelection>(
    state.globalFilters.conversationSelection
  )

  // Atalhos de teclado
  useKeyboardShortcuts({
    onNavigate1: () => router.push("/super-admin"),
    onNavigate2: () => router.push("/super-admin/empresas"),
    onNavigate3: () => router.push("/super-admin/perfil"),
  })

  // Calcular KPIs baseados nos filtros
  const kpis = useMemo(() => {
    const now = new Date()
    const periodStart = 
      localPeriod === GlobalFilterPeriod.SEVEN_DAYS
        ? dayjs().subtract(7, "days").toDate()
        : localPeriod === GlobalFilterPeriod.THIRTY_DAYS
        ? dayjs().subtract(30, "days").toDate()
        : new Date(0)

    const filteredConversations = state.conversations.filter((conv) => {
      const convDate = new Date(conv.lastMessageAt)
      if (convDate < periodStart) return false

      if (localConversationSelection === GlobalFilterConversationSelection.IA_NOW) {
        return conv.status === ConversationStatus.CONVERSANDO && conv.iaActive
      }
      if (localConversationSelection === GlobalFilterConversationSelection.PAUSED_NOW) {
        return conv.status === ConversationStatus.PAUSADA
      }
      return true
    })

    const activeTenants = state.tenants.filter((t) => t.isActive).length
    const totalTenants = state.tenants.length
    const conversationsWithIA = filteredConversations.filter(
      (c) => c.status === ConversationStatus.CONVERSANDO && c.iaActive
    ).length
    const pausedConversations = filteredConversations.filter(
      (c) => c.status === ConversationStatus.PAUSADA
    ).length

    return {
      activeTenants,
      totalTenants,
      conversationsWithIA,
      pausedConversations,
    }
  }, [state, localPeriod, localConversationSelection])

  // Dados para gráfico de conversas por hora
  const chartData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    return hours.map((hour) => {
      const hourStart = dayjs().startOf("day").add(hour, "hours")
      const hourEnd = hourStart.add(1, "hour")
      
      const count = state.conversations.filter((conv) => {
        const convTime = dayjs(conv.lastMessageAt)
        return convTime.isAfter(hourStart) && convTime.isBefore(hourEnd)
      }).length

      return {
        hora: `${hour.toString().padStart(2, "0")}h`,
        conversas: count,
      }
    })
  }, [state.conversations])

  // Nuvem de palavras (extrair palavras das mensagens)
  const wordCloudData = useMemo(() => {
    const wordCounts: Record<string, number> = {}
    state.messages.forEach((msg) => {
      const words = msg.content.toLowerCase().split(/\s+/)
      words.forEach((word) => {
        const cleanWord = word.replace(/[^\wáàâãéèêíìîóòôõúùûç]/g, "")
        if (cleanWord.length > 3) {
          wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1
        }
      })
    })
    return Object.entries(wordCounts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30)
  }, [state.messages])

  // Lista de empresas com dados calculados
  const empresasList = useMemo(() => {
    return state.tenants.map((tenant) => {
      const users = state.users.filter((u) => u.tenantId === tenant.id)
      const tenantConversations = state.conversations.filter((c) => c.tenantId === tenant.id)
      const periodStart = 
        localPeriod === GlobalFilterPeriod.SEVEN_DAYS
          ? dayjs().subtract(7, "days").toDate()
          : localPeriod === GlobalFilterPeriod.THIRTY_DAYS
          ? dayjs().subtract(30, "days").toDate()
          : new Date(0)
      
      const filteredConvs = tenantConversations.filter((c) => {
        const convDate = new Date(c.lastMessageAt)
        return convDate >= periodStart
      })

      const neurocore = state.neurocores.find((nc) => nc.id === tenant.neurocoreId)

      return {
        ...tenant,
        userCount: users.length,
        openConversations: filteredConvs.filter((c) => c.status === ConversationStatus.CONVERSANDO).length,
        pausedConversations: filteredConvs.filter((c) => c.status === ConversationStatus.PAUSADA).length,
        closedConversations: filteredConvs.filter((c) => c.status === ConversationStatus.ENCERRADA).length,
        neurocoreName: neurocore?.name || "N/A",
      }
    })
  }, [state, localPeriod])

  const handlePeriodChange = async (value: GlobalFilterPeriod) => {
    setLocalPeriod(value)
    await updateGlobalFilters({ period: value })
  }

  const handleConversationSelectionChange = async (value: GlobalFilterConversationSelection) => {
    setLocalConversationSelection(value)
    await updateGlobalFilters({ conversationSelection: value })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Dashboard" description="Visão geral do sistema LIVIA" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
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
        title="Dashboard"
        description="Visão geral do sistema LIVIA"
      />

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Período:</label>
          <Select value={localPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={GlobalFilterPeriod.SEVEN_DAYS}>7 dias</SelectItem>
              <SelectItem value={GlobalFilterPeriod.THIRTY_DAYS}>30 dias</SelectItem>
              <SelectItem value={GlobalFilterPeriod.TOTAL}>Total</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Conversas:</label>
          <Select value={localConversationSelection} onValueChange={handleConversationSelectionChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={GlobalFilterConversationSelection.IA_NOW}>
                Conversas com IA Agora
              </SelectItem>
              <SelectItem value={GlobalFilterConversationSelection.PAUSED_NOW}>
                Conversas em Pause Agora
              </SelectItem>
              <SelectItem value={GlobalFilterConversationSelection.ALL}>Todas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Empresas Ativas
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.activeTenants}</div>
              <p className="text-xs text-muted-foreground">
                {kpis.totalTenants - kpis.activeTenants} inativa{kpis.totalTenants - kpis.activeTenants !== 1 ? "s" : ""} no sistema
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversas com IA Agora
              </CardTitle>
              <Brain className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.conversationsWithIA}</div>
              <p className="text-xs text-muted-foreground">
                IA ativa respondendo
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversas em Pause Agora
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.pausedConversations}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando atendimento
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                NeuroCores
              </CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{state.neurocores.filter((nc) => nc.isActive).length}</div>
              <p className="text-xs text-muted-foreground">
                {state.neurocores.map((nc) => nc.niche).join(", ")}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Gráfico */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Quantidade de Conversas por Hora do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="conversas" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={Search}
                title="Sem dados para exibir"
                description="Não há conversas no período selecionado"
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Nuvem de Palavras e Lista de Empresas */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <CardTitle>Nuvem de Palavras</CardTitle>
            </CardHeader>
            <CardContent>
              {wordCloudData.length > 0 ? (
                <WordCloud words={wordCloudData} />
              ) : (
                <EmptyState
                  icon={Search}
                  title="Sem palavras encontradas"
                  description="Não há mensagens para analisar"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Empresas</CardTitle>
            </CardHeader>
            <CardContent>
              {empresasList.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>NeuroCore</TableHead>
                      <TableHead>Usuários</TableHead>
                      <TableHead>Conversas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {empresasList.map((empresa) => (
                      <TableRow key={empresa.id}>
                        <TableCell className="font-medium">{empresa.name}</TableCell>
                        <TableCell>{empresa.neurocoreName}</TableCell>
                        <TableCell>{empresa.userCount}</TableCell>
                        <TableCell>
                          <div className="text-xs space-y-1">
                            <div>Abertas: {empresa.openConversations}</div>
                            <div>Pausadas: {empresa.pausedConversations}</div>
                            <div>Encerradas: {empresa.closedConversations}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={empresa.isActive ? "default" : "secondary"}>
                            {empresa.isActive ? "Ativa" : "Inativa"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/super-admin/empresas?tenant=${empresa.id}`)}
                          >
                            Gerenciar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  icon={Building}
                  title="Nenhuma empresa encontrada"
                  description="Cadastre sua primeira empresa para começar"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageContainer>
  )
}

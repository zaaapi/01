"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Brain, MessagesSquare, Book, Search } from "lucide-react"
import { useData } from "@/lib/contexts/data-provider"
import { useAuth } from "@/lib/contexts/auth-context"
import { GlobalFilterPeriod, GlobalFilterConversationSelection, ConversationStatus } from "@/types"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useRouter } from "next/navigation"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import dayjs from "dayjs"

export default function ClienteDashboard() {
  const router = useRouter()
  const { state, isLoading, updateGlobalFilters } = useData()
  const { currentAuthUser } = useAuth()
  const [localPeriod, setLocalPeriod] = useState<GlobalFilterPeriod>(state.globalFilters.period)
  const [localConversationSelection, setLocalConversationSelection] = useState<GlobalFilterConversationSelection>(
    state.globalFilters.conversationSelection
  )

  // Atalhos de teclado
  useKeyboardShortcuts({
    onNavigate1: () => router.push("/cliente"),
    onNavigate2: () => router.push("/cliente/live-chat"),
    onNavigate3: () => router.push("/cliente/perfil"),
  })

  // Filtrar dados apenas do tenant logado
  const tenantId = currentAuthUser?.tenantId
  const tenantConversations = useMemo(() => {
    if (!tenantId) return []
    return state.conversations.filter((c) => c.tenantId === tenantId)
  }, [state.conversations, tenantId])

  const tenantMessages = useMemo(() => {
    if (!tenantId) return []
    return state.messages.filter((m) => {
      const conv = state.conversations.find((c) => c.id === m.conversationId)
      return conv?.tenantId === tenantId
    })
  }, [state.messages, state.conversations, tenantId])

  // Calcular KPIs
  const kpis = useMemo(() => {
    const now = new Date()
    const periodStart = 
      localPeriod === GlobalFilterPeriod.SEVEN_DAYS
        ? dayjs().subtract(7, "days").toDate()
        : localPeriod === GlobalFilterPeriod.THIRTY_DAYS
        ? dayjs().subtract(30, "days").toDate()
        : new Date(0)

    const filteredConversations = tenantConversations.filter((conv) => {
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

    const conversationsWithIA = filteredConversations.filter(
      (c) => c.status === ConversationStatus.CONVERSANDO && c.iaActive
    ).length
    const pausedConversations = filteredConversations.filter(
      (c) => c.status === ConversationStatus.PAUSADA
    ).length

    return {
      conversationsWithIA,
      pausedConversations,
    }
  }, [tenantConversations, localPeriod, localConversationSelection])

  // Dados para gráfico de conversas por hora
  const chartData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    return hours.map((hour) => {
      const hourStart = dayjs().startOf("day").add(hour, "hours")
      const hourEnd = hourStart.add(1, "hour")
      
      const count = tenantConversations.filter((conv) => {
        const convTime = dayjs(conv.lastMessageAt)
        return convTime.isAfter(hourStart) && convTime.isBefore(hourEnd)
      }).length

      return {
        hora: `${hour.toString().padStart(2, "0")}h`,
        conversas: count,
      }
    })
  }, [tenantConversations])

  // Nuvem de palavras
  const wordCloudData = useMemo(() => {
    const wordCounts: Record<string, number> = {}
    tenantMessages.forEach((msg) => {
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
  }, [tenantMessages])

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
        <PageHeader title="Dashboard" description="Visão geral das suas conversas e atendimentos" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
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

  if (!tenantId) {
    return (
      <PageContainer>
        <PageHeader title="Dashboard" description="Visão geral das suas conversas e atendimentos" />
        <EmptyState
          icon={Search}
          title="Usuário não associado a um tenant"
          description="Entre em contato com o administrador"
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Visão geral das suas conversas e atendimentos"
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
        className="grid gap-4 md:grid-cols-3 mb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
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
              <MessagesSquare className="h-4 w-4 text-muted-foreground" />
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
                Bases de Conhecimento
              </CardTitle>
              <Book className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {state.baseConhecimentos.filter((b) => b.tenantId === tenantId && b.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {state.synapses.filter((s) => s.tenantId === tenantId && s.status === "PUBLICANDO").length} synapses ativas
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
            {chartData.some((d) => d.conversas > 0) ? (
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

      {/* Nuvem de Palavras */}
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
    </PageContainer>
  )
}

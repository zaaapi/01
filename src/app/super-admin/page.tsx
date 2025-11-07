"use client"

import { useState, useEffect } from "react"
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
import { Building, Brain, MessageSquare, Search } from "lucide-react"
import { useData } from "@/lib/contexts/data-provider"
import { useAuth } from "@/lib/contexts/auth-context"
import { GlobalFilterPeriod, GlobalFilterConversationSelection } from "@/types"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useRouter } from "next/navigation"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useToast } from "@/hooks/use-toast"

export default function SuperAdminDashboard() {
  const router = useRouter()
  const {
    state,
    isLoading: providerLoading,
    fetchDashboardKpis,
    fetchConversationsByHour,
    fetchConversationKeywords,
    fetchTenantListWithConversationCounts,
    updateGlobalFilters,
  } = useData()
  const { user: _user } = useAuth()
  const { toast } = useToast()

  const [localPeriod, setLocalPeriod] = useState<GlobalFilterPeriod>(state.globalFilters.period)
  const [localConversationSelection, setLocalConversationSelection] =
    useState<GlobalFilterConversationSelection>(state.globalFilters.conversationSelection)

  // Estados para dados do Dashboard
  const [kpis, setKpis] = useState({
    activeTenants: 0,
    totalTenants: 0,
    conversationsWithIA: 0,
    pausedConversations: 0,
  })
  const [chartData, setChartData] = useState<{ hora: string; conversas: number }[]>([])
  const [wordCloudData, setWordCloudData] = useState<{ word: string; count: number }[]>([])
  const [empresasList, setEmpresasList] = useState<any[]>([])
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const [loadingKpis, setLoadingKpis] = useState(false)
  const [loadingChart, setLoadingChart] = useState(false)
  const [loadingKeywords, setLoadingKeywords] = useState(false)
  const [loadingTenants, setLoadingTenants] = useState(false)

  // Atalhos de teclado
  useKeyboardShortcuts({
    onNavigate1: () => router.push("/super-admin"),
    onNavigate2: () => router.push("/super-admin/empresas"),
    onNavigate3: () => router.push("/super-admin/perfil"),
  })

  // Função para carregar todos os dados do Dashboard
  const loadDashboardData = async () => {
    setLoadingDashboard(true)
    setLoadingKpis(true)
    setLoadingChart(true)
    setLoadingKeywords(true)
    setLoadingTenants(true)

    const filters = {
      period: localPeriod,
      conversationSelection: localConversationSelection,
    }

    try {
      // Carregar todos os dados em paralelo
      const [kpisData, chartDataResult, keywordsData, tenantsData] = await Promise.all([
        fetchDashboardKpis(filters),
        fetchConversationsByHour(filters),
        fetchConversationKeywords(filters),
        fetchTenantListWithConversationCounts(filters),
      ])

      setKpis(kpisData)
      setChartData(chartDataResult)
      setWordCloudData(keywordsData)
      setEmpresasList(tenantsData)
    } catch (error) {
      console.error("Erro ao carregar dados do Dashboard:", error)
      toast({
        title: "Erro ao carregar Dashboard",
        description: "Não foi possível carregar os dados. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoadingDashboard(false)
      setLoadingKpis(false)
      setLoadingChart(false)
      setLoadingKeywords(false)
      setLoadingTenants(false)
    }
  }

  // Carregar dados na montagem e quando os filtros mudarem
  useEffect(() => {
    if (!providerLoading) {
      loadDashboardData()
    }
  }, [localPeriod, localConversationSelection, providerLoading])

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

  if (providerLoading || loadingDashboard) {
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
      <PageHeader title="Dashboard" description="Visão geral do sistema LIVIA" />

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
          <Select
            value={localConversationSelection}
            onValueChange={handleConversationSelectionChange}
          >
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
              <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingKpis ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{kpis.activeTenants}</div>
                  <p className="text-xs text-muted-foreground">
                    {kpis.totalTenants - kpis.activeTenants} inativa
                    {kpis.totalTenants - kpis.activeTenants !== 1 ? "s" : ""} no sistema
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversas com IA Agora</CardTitle>
              <Brain className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loadingKpis ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{kpis.conversationsWithIA}</div>
                  <p className="text-xs text-muted-foreground">IA ativa respondendo</p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversas em Pause Agora</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingKpis ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{kpis.pausedConversations}</div>
                  <p className="text-xs text-muted-foreground">Aguardando atendimento</p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingKpis ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{kpis.totalTenants}</div>
                  <p className="text-xs text-muted-foreground">
                    {kpis.activeTenants} ativa{kpis.activeTenants !== 1 ? "s" : ""} no sistema
                  </p>
                </>
              )}
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
            {loadingChart ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : chartData.length > 0 && chartData.some((d) => d.conversas > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="conversas"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
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
              {loadingKeywords ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : wordCloudData.length > 0 ? (
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
              {loadingTenants ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : empresasList.length > 0 ? (
                <div className="overflow-x-auto">
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
                              onClick={() =>
                                router.push(`/super-admin/empresas?tenant=${empresa.id}`)
                              }
                            >
                              Gerenciar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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

"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useData } from "@/lib/contexts/data-provider"
import { NeuroCore, Agent, AgentType, AgentFunction } from "@/types"
import { EmptyState } from "@/components/shared/empty-state"
import { Bot, Plus, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AssociarAgentesSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  neurocore: NeuroCore | null
  onSave: (agentIds: string[]) => void
  mode?: "add" | "edit"
  onAddAgent?: (agentId: string) => void
}

export function AssociarAgentesSheet({
  open,
  onOpenChange,
  neurocore,
  onSave,
  mode = "edit",
  onAddAgent,
}: AssociarAgentesSheetProps) {
  const { fetchAgents, updateNeuroCore } = useData()
  const { toast } = useToast()
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterFunction, setFilterFunction] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)

  // Carregar agentes do Supabase
  useEffect(() => {
    if (open) {
      const loadAgents = async () => {
        setIsLoading(true)
        try {
          const fetchedAgents = await fetchAgents()
          setAgents(fetchedAgents)
        } catch (error) {
          console.error("Erro ao carregar agentes:", error)
          toast({
            title: "Erro",
            description: "Não foi possível carregar os agentes.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
      loadAgents()
    }
  }, [open, fetchAgents, toast])

  useEffect(() => {
    if (neurocore) {
      setSelectedAgents([...neurocore.associatedAgents])
    } else {
      setSelectedAgents([])
    }
  }, [neurocore])

  // Filtrar agentes disponíveis (não associados ao neurocore atual)
  const availableAgents = agents.filter((agent) => {
    const isNotAssociated = !neurocore?.associatedAgents.includes(agent.id)
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || agent.type === filterType
    const matchesFunction = filterFunction === "all" || agent.function === filterFunction

    return isNotAssociated && matchesSearch && matchesType && matchesFunction
  })

  const handleToggleAgent = (agentId: string) => {
    if (selectedAgents.includes(agentId)) {
      setSelectedAgents(selectedAgents.filter((id) => id !== agentId))
    } else {
      setSelectedAgents([...selectedAgents, agentId])
    }
  }

  const handleAddAgentImmediate = async (agentId: string) => {
    if (!neurocore) return

    try {
      const newAssociatedAgents = [...neurocore.associatedAgents, agentId]
      await updateNeuroCore(neurocore.id, {
        associatedAgents: newAssociatedAgents,
      })

      // Atualizar estado local
      setSelectedAgents([...selectedAgents, agentId])

      // Chamar callback se fornecido
      if (onAddAgent) {
        onAddAgent(agentId)
      }

      toast({
        title: "Agente adicionado",
        description: "O agente foi associado ao NeuroCore.",
      })

      // O sheet permanece aberto para múltiplas seleções
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o agente.",
        variant: "destructive",
      })
    }
  }

  const handleSave = () => {
    onSave(selectedAgents)
    onOpenChange(false)
  }

  // Obter tipos e funções únicos para filtros
  const uniqueTypes = Array.from(new Set(agents.map((a) => a.type)))
  const uniqueFunctions = Array.from(new Set(agents.map((a) => a.function)))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] w-full">
        <SheetHeader>
          <SheetTitle>Gerenciar Agentes Disponíveis</SheetTitle>
          <SheetDescription>
            {mode === "add"
              ? "Adicione agentes ao NeuroCore selecionando-os abaixo."
              : `Selecione os agentes que serão associados ao NeuroCore ${neurocore?.name || ""}.`}
          </SheetDescription>
        </SheetHeader>

        {/* Busca e Filtros */}
        <div className="space-y-4 mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar agentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterFunction} onValueChange={setFilterFunction}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Funções</SelectItem>
                {uniqueFunctions.map((func) => (
                  <SelectItem key={func} value={func}>
                    {func}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-280px)] pr-4 mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : availableAgents.length === 0 ? (
            <EmptyState
              icon={Bot}
              title="Nenhum agente disponível"
              description={
                agents.length === 0
                  ? "Crie agentes antes de associá-los ao NeuroCore"
                  : "Todos os agentes já estão associados ou não correspondem aos filtros"
              }
            />
          ) : (
            <div className="space-y-4">
              {availableAgents.map((agent) => (
                <Card key={agent.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Bot className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {agent.type} • {agent.function}
                        </div>
                      </div>
                    </div>
                    {mode === "add" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddAgentImmediate(agent.id)}
                        disabled={neurocore?.associatedAgents.includes(agent.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant={selectedAgents.includes(agent.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleAgent(agent.id)}
                      >
                        {selectedAgents.includes(agent.id) ? "Selecionado" : "Selecionar"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        {mode === "edit" && (
          <SheetFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button type="button" onClick={handleSave}>
              Salvar Associações
            </Button>
          </SheetFooter>
        )}
        {mode === "add" && (
          <SheetFooter className="mt-6">
            <Button type="button" onClick={() => onOpenChange(false)}>
              Fechar Painel Lateral
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

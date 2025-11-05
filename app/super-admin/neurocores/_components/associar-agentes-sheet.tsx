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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useData } from "@/lib/contexts/data-provider"
import { NeuroCore, Agent } from "@/types"
import { EmptyState } from "@/components/shared/empty-state"
import { Bot } from "lucide-react"

interface AssociarAgentesSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  neurocore: NeuroCore | null
  onSave: (agentIds: string[]) => void
}

export function AssociarAgentesSheet({
  open,
  onOpenChange,
  neurocore,
  onSave,
}: AssociarAgentesSheetProps) {
  const { state } = useData()
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])

  useEffect(() => {
    if (neurocore) {
      setSelectedAgents([...neurocore.associatedAgents])
    } else {
      setSelectedAgents([])
    }
  }, [neurocore])

  const availableAgents = state.agents

  const handleToggleAgent = (agentId: string) => {
    if (selectedAgents.includes(agentId)) {
      setSelectedAgents(selectedAgents.filter((id) => id !== agentId))
    } else {
      setSelectedAgents([...selectedAgents, agentId])
    }
  }

  const handleSave = () => {
    onSave(selectedAgents)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] w-full">
        <SheetHeader>
          <SheetTitle>Associar Agentes ao NeuroCore</SheetTitle>
          <SheetDescription>
            Selecione os agentes que serão associados ao NeuroCore{" "}
            <strong>{neurocore?.name}</strong>.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] pr-4">
          <div className="space-y-4 mt-6">
            {availableAgents.length === 0 ? (
              <EmptyState
                icon={Bot}
                title="Nenhum agente disponível"
                description="Crie agentes antes de associá-los ao NeuroCore"
              />
            ) : (
              availableAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent transition-colors"
                >
                  <Checkbox
                    id={agent.id}
                    checked={selectedAgents.includes(agent.id)}
                    onCheckedChange={() => handleToggleAgent(agent.id)}
                  />
                  <Label
                    htmlFor={agent.id}
                    className="flex-1 cursor-pointer space-y-1"
                  >
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {agent.type} • {agent.function}
                    </div>
                  </Label>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Salvar Associações
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}


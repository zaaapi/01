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
import { Agent } from "@/types"
import { EmptyState } from "@/components/shared/empty-state"
import { Brain } from "lucide-react"

interface AssociarNeuroCoresSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: Agent | null
  onSave: (neurocoreIds: string[]) => void
}

export function AssociarNeuroCoresSheet({
  open,
  onOpenChange,
  agent,
  onSave,
}: AssociarNeuroCoresSheetProps) {
  const { state } = useData()
  const [selectedNeuroCores, setSelectedNeuroCores] = useState<string[]>([])

  useEffect(() => {
    if (agent) {
      setSelectedNeuroCores([...agent.associatedNeuroCores])
    } else {
      setSelectedNeuroCores([])
    }
  }, [agent])

  const availableNeuroCores = state.neurocores.filter((nc) => nc.isActive)

  const handleToggleNeuroCore = (neurocoreId: string) => {
    if (selectedNeuroCores.includes(neurocoreId)) {
      setSelectedNeuroCores(selectedNeuroCores.filter((id) => id !== neurocoreId))
    } else {
      setSelectedNeuroCores([...selectedNeuroCores, neurocoreId])
    }
  }

  const handleSave = () => {
    onSave(selectedNeuroCores)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] w-full">
        <SheetHeader>
          <SheetTitle>Associar NeuroCores ao Agente</SheetTitle>
          <SheetDescription>
            Selecione os NeuroCores que serão associados ao agente <strong>{agent?.name}</strong>.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] pr-4">
          <div className="space-y-4 mt-6">
            {availableNeuroCores.length === 0 ? (
              <EmptyState
                icon={Brain}
                title="Nenhum NeuroCore disponível"
                description="Crie NeuroCores antes de associá-los ao agente"
              />
            ) : (
              availableNeuroCores.map((neurocore) => (
                <div
                  key={neurocore.id}
                  className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent transition-colors"
                >
                  <Checkbox
                    id={neurocore.id}
                    checked={selectedNeuroCores.includes(neurocore.id)}
                    onCheckedChange={() => handleToggleNeuroCore(neurocore.id)}
                  />
                  <Label htmlFor={neurocore.id} className="flex-1 cursor-pointer space-y-1">
                    <div className="font-medium">{neurocore.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {neurocore.niche} • {neurocore.description}
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

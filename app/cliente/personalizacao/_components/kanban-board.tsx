"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { MoveUp, MoveDown, Plus, Trash2, Pencil, GripVertical } from "lucide-react"
import { AgentInstruction, AgentLimitation, AgentConversationRoteiro } from "@/types"
import { useData } from "@/lib/contexts/data-provider"
import { useToast } from "@/hooks/use-toast"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type KanbanItem = AgentInstruction | AgentLimitation | AgentConversationRoteiro

interface KanbanBoardProps {
  items: KanbanItem[]
  type: "instructions" | "limitacoes" | "roteiro"
  agentId: string
}

// Componente de item sortable
function SortableItem({
  item,
  index,
  onToggle,
  onDelete,
  onEdit,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: {
  item: KanbanItem
  index: number
  onToggle: () => void
  onDelete: () => void
  onEdit: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <Card className={item.isActive ? "border-primary" : ""}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium">{item.title}</h4>
                  {"description" in item && (
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  )}
                  {"mainInstruction" in item && (
                    <p className="text-sm text-muted-foreground mt-1">{item.mainInstruction}</p>
                  )}
                </div>
                <Switch checked={item.isActive} onCheckedChange={onToggle} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMoveUp}
                  disabled={!canMoveUp}
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMoveDown}
                  disabled={!canMoveDown}
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onEdit}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function KanbanBoard({ items, type, agentId }: KanbanBoardProps) {
  const { updateAgent } = useData()
  const { toast } = useToast()
  const [localItems, setLocalItems] = useState(items)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setLocalItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)

        // Atualizar ordem
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          order: index,
        }))

        // Salvar no DataProvider
        if (type === "instructions") {
          updateAgent(agentId, {
            instructions: updatedItems as AgentInstruction[],
          })
        } else if (type === "limitacoes") {
          updateAgent(agentId, {
            limitations: updatedItems as AgentLimitation[],
          })
        } else {
          updateAgent(agentId, {
            conversationRoteiro: updatedItems as AgentConversationRoteiro[],
          })
        }

        return updatedItems
      })
    }
  }

  const handleToggle = (itemId: string) => {
    setLocalItems((items) => {
      const updated = items.map((item) =>
        item.id === itemId ? { ...item, isActive: !item.isActive } : item
      )
      if (type === "instructions") {
        updateAgent(agentId, { instructions: updated as AgentInstruction[] })
      } else if (type === "limitacoes") {
        updateAgent(agentId, { limitations: updated as AgentLimitation[] })
      } else {
        updateAgent(agentId, { conversationRoteiro: updated as AgentConversationRoteiro[] })
      }
      return updated
    })
    toast({
      title: "Item atualizado",
      description: "O item foi atualizado com sucesso.",
    })
  }

  const handleDelete = (itemId: string) => {
    setLocalItems((items) => {
      const updated = items.filter((item) => item.id !== itemId)
      if (type === "instructions") {
        updateAgent(agentId, { instructions: updated as AgentInstruction[] })
      } else if (type === "limitacoes") {
        updateAgent(agentId, { limitations: updated as AgentLimitation[] })
      } else {
        updateAgent(agentId, { conversationRoteiro: updated as AgentConversationRoteiro[] })
      }
      return updated
    })
    toast({
      title: "Item excluído",
      description: "O item foi excluído com sucesso.",
    })
  }

  const handleMoveUp = (itemId: string) => {
    setLocalItems((items) => {
      const index = items.findIndex((item) => item.id === itemId)
      if (index <= 0) return items
      const newItems = [...items]
      ;[newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]]
      const updated = newItems.map((item, idx) => ({ ...item, order: idx }))
      if (type === "instructions") {
        updateAgent(agentId, { instructions: updated as AgentInstruction[] })
      } else if (type === "limitacoes") {
        updateAgent(agentId, { limitations: updated as AgentLimitation[] })
      } else {
        updateAgent(agentId, { conversationRoteiro: updated as AgentConversationRoteiro[] })
      }
      return updated
    })
  }

  const handleMoveDown = (itemId: string) => {
    setLocalItems((items) => {
      const index = items.findIndex((item) => item.id === itemId)
      if (index >= items.length - 1) return items
      const newItems = [...items]
      ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
      const updated = newItems.map((item, idx) => ({ ...item, order: idx }))
      if (type === "instructions") {
        updateAgent(agentId, { instructions: updated as AgentInstruction[] })
      } else if (type === "limitacoes") {
        updateAgent(agentId, { limitations: updated as AgentLimitation[] })
      } else {
        updateAgent(agentId, { conversationRoteiro: updated as AgentConversationRoteiro[] })
      }
      return updated
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">
          {type === "instructions"
            ? "Instruções"
            : type === "limitacoes"
            ? "Limitações"
            : "Roteiro"}
        </h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={localItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {localItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum item cadastrado</p>
            </div>
          ) : (
            localItems.map((item, index) => (
              <SortableItem
                key={item.id}
                item={item}
                index={index}
                onToggle={() => handleToggle(item.id)}
                onDelete={() => handleDelete(item.id)}
                onEdit={() => {
                  // Implementar edição depois
                  toast({
                    title: "Em desenvolvimento",
                    description: "A edição de itens será implementada em breve.",
                  })
                }}
                canMoveUp={index > 0}
                canMoveDown={index < localItems.length - 1}
                onMoveUp={() => handleMoveUp(item.id)}
                onMoveDown={() => handleMoveDown(item.id)}
              />
            ))
          )}
        </SortableContext>
      </DndContext>
    </div>
  )
}


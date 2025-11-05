"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { MoveUp, MoveDown, Plus, Trash2, Pencil, GripVertical } from "lucide-react"
import {
  AgentInstruction,
  AgentLimitation,
  AgentConversationRoteiro,
  AgentOtherInstruction,
} from "@/types"
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
import { AddEditItemModal } from "./add-edit-item-modal"
import { ConfirmDeleteModal } from "./confirm-delete-modal"

type KanbanItem = AgentInstruction | AgentLimitation | AgentConversationRoteiro | AgentOtherInstruction

interface KanbanBoardProps {
  items: KanbanItem[]
  type: "instructions" | "limitacoes" | "roteiro" | "outras"
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
      <Card className={item.isActive ? "border-primary" : "border-muted"}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing pt-1">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-4">
                  <h4 className="font-medium">{item.title}</h4>
                  {"description" in item && item.description && (
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  )}
                  {"mainInstruction" in item && item.mainInstruction && (
                    <p className="text-sm text-muted-foreground mt-1">{item.mainInstruction}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={item.isActive} onCheckedChange={onToggle} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMoveUp}
                  disabled={!canMoveUp}
                  title="Mover para cima"
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMoveDown}
                  disabled={!canMoveDown}
                  title="Mover para baixo"
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onEdit} title="Editar">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  title="Excluir"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
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
  const [localItems, setLocalItems] = useState<KanbanItem[]>(items)
  const [addEditModalOpen, setAddEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<KanbanItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<KanbanItem | null>(null)

  useEffect(() => {
    setLocalItems(items)
  }, [items])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const getUpdateKey = () => {
    switch (type) {
      case "instructions":
        return "instructions"
      case "limitacoes":
        return "limitations"
      case "roteiro":
        return "conversationRoteiro"
      case "outras":
        return "otherInstructions"
      default:
        return "instructions"
    }
  }

  const saveItems = async (updatedItems: KanbanItem[]) => {
    const updateKey = getUpdateKey()
    await updateAgent(agentId, {
      [updateKey]: updatedItems,
    })
  }

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

        // Salvar no Supabase
        saveItems(updatedItems)

        return updatedItems
      })
    }
  }

  const handleToggle = (itemId: string) => {
    setLocalItems((items) => {
      const updated = items.map((item) =>
        item.id === itemId ? { ...item, isActive: !item.isActive } : item
      )
      saveItems(updated)
      return updated
    })
    toast({
      title: "Item atualizado",
      description: "O status do item foi atualizado com sucesso.",
    })
  }

  const handleDeleteClick = (item: KanbanItem) => {
    setItemToDelete(item)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return

    setLocalItems((items) => {
      const updated = items.filter((item) => item.id !== itemToDelete.id)
      saveItems(updated)
      return updated
    })
    toast({
      title: "Item excluído",
      description: "O item foi excluído com sucesso.",
    })
    setDeleteModalOpen(false)
    setItemToDelete(null)
  }

  const handleEditClick = (item: KanbanItem) => {
    setSelectedItem(item)
    setAddEditModalOpen(true)
  }

  const handleAddClick = () => {
    setSelectedItem(null)
    setAddEditModalOpen(true)
  }

  const handleSaveItem = (data: { title: string; description?: string; mainInstruction?: string }) => {
    if (selectedItem) {
      // Editar item existente
      setLocalItems((items) => {
        const updated = items.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                title: data.title,
                ...(type === "roteiro"
                  ? { mainInstruction: data.mainInstruction || "" }
                  : { description: data.description || "" }),
              }
            : item
        )
        saveItems(updated)
        return updated
      })
      toast({
        title: "Item atualizado",
        description: "O item foi atualizado com sucesso.",
      })
    } else {
      // Adicionar novo item
      const newItem: KanbanItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: data.title,
        isActive: true,
        order: localItems.length,
        ...(type === "roteiro"
          ? { mainInstruction: data.mainInstruction || "", subTasks: null }
          : { description: data.description || "" }),
      } as KanbanItem

      setLocalItems((items) => {
        const updated = [...items, newItem]
        saveItems(updated)
        return updated
      })
      toast({
        title: "Item adicionado",
        description: "O item foi adicionado com sucesso.",
      })
    }
    setAddEditModalOpen(false)
    setSelectedItem(null)
  }

  const handleMoveUp = (itemId: string) => {
    setLocalItems((items) => {
      const index = items.findIndex((item) => item.id === itemId)
      if (index <= 0) return items
      const newItems = [...items]
      ;[newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]]
      const updated = newItems.map((item, idx) => ({ ...item, order: idx }))
      saveItems(updated)
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
      saveItems(updated)
      return updated
    })
  }

  const getTitle = () => {
    switch (type) {
      case "instructions":
        return "Instruções"
      case "limitacoes":
        return "Limitações"
      case "roteiro":
        return "Roteiro de Conversa"
      case "outras":
        return "Outras Instruções"
      default:
        return "Itens"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{getTitle()}</h3>
        <Button size="sm" onClick={handleAddClick}>
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
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">Nenhum item cadastrado</p>
              <Button size="sm" onClick={handleAddClick}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Item
              </Button>
            </div>
          ) : (
            localItems.map((item, index) => (
              <SortableItem
                key={item.id}
                item={item}
                index={index}
                onToggle={() => handleToggle(item.id)}
                onDelete={() => handleDeleteClick(item)}
                onEdit={() => handleEditClick(item)}
                canMoveUp={index > 0}
                canMoveDown={index < localItems.length - 1}
                onMoveUp={() => handleMoveUp(item.id)}
                onMoveDown={() => handleMoveDown(item.id)}
              />
            ))
          )}
        </SortableContext>
      </DndContext>

      {/* Modal de Adicionar/Editar */}
      <AddEditItemModal
        open={addEditModalOpen}
        onOpenChange={setAddEditModalOpen}
        item={selectedItem}
        type={type}
        onSave={handleSaveItem}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        title={itemToDelete?.title || ""}
      />
    </div>
  )
}

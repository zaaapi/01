"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { QuickReplyTemplate } from "@/types"
import { EmptyState } from "@/components/shared/empty-state"
import { Zap, Plus, Edit, Trash2 } from "lucide-react"
import { useData } from "@/lib/contexts/data-provider"
import { useToast } from "@/hooks/use-toast"

interface QuickRepliesSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  onSelect: (quickReply: QuickReplyTemplate) => void
}

export function QuickRepliesSheet({
  open,
  onOpenChange,
  tenantId,
  onSelect,
}: QuickRepliesSheetProps) {
  const { 
    fetchQuickReplyTemplates, 
    deleteQuickReplyTemplate 
  } = useData()
  const { toast } = useToast()
  const [quickReplies, setQuickReplies] = useState<QuickReplyTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddEditModal, setShowAddEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingReply, setEditingReply] = useState<QuickReplyTemplate | null>(null)
  const [deletingReply, setDeletingReply] = useState<QuickReplyTemplate | null>(null)

  // Load quick replies when sheet opens
  useEffect(() => {
    if (open) {
      loadQuickReplies()
    }
  }, [open])

  const loadQuickReplies = async () => {
    setIsLoading(true)
    try {
      const data = await fetchQuickReplyTemplates(tenantId)
      setQuickReplies(data)
    } catch (error) {
      console.error("Erro ao carregar respostas rápidas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as respostas rápidas.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNew = () => {
    setEditingReply(null)
    setShowAddEditModal(true)
  }

  const handleEdit = (reply: QuickReplyTemplate) => {
    setEditingReply(reply)
    setShowAddEditModal(true)
  }

  const handleDeleteClick = (reply: QuickReplyTemplate) => {
    setDeletingReply(reply)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingReply) return

    try {
      await deleteQuickReplyTemplate(deletingReply.id)
      toast({
        title: "Resposta rápida excluída",
        description: "A resposta rápida foi excluída com sucesso.",
      })
      await loadQuickReplies()
      setShowDeleteModal(false)
      setDeletingReply(null)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a resposta rápida.",
        variant: "destructive",
      })
    }
  }

  const handleModalSuccess = async () => {
    setShowAddEditModal(false)
    setEditingReply(null)
    await loadQuickReplies()
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-[700px] w-full">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle>Respostas Rápidas</SheetTitle>
                <SheetDescription>
                  Gerencie suas respostas rápidas para agilizar o atendimento
                </SheetDescription>
              </div>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-150px)] mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Carregando...</p>
              </div>
            ) : quickReplies.length === 0 ? (
              <EmptyState
                icon={Zap}
                title="Nenhuma resposta rápida cadastrada"
                description="Crie respostas rápidas para agilizar o atendimento"
              />
            ) : (
              <div className="space-y-2">
                {quickReplies.map((qr) => (
                  <div
                    key={qr.id}
                    className="flex items-center gap-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Button
                      variant="ghost"
                      className="flex-1 justify-start h-auto p-2"
                      onClick={() => {
                        onSelect(qr)
                        onOpenChange(false)
                      }}
                    >
                      <div className="flex items-center gap-3 w-full text-left">
                        {qr.icon && <span className="text-xl">{qr.icon}</span>}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{qr.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {qr.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Usado {qr.usageCount} vez(es)
                          </p>
                        </div>
                      </div>
                    </Button>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(qr)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(qr)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Add/Edit Modal */}
      <AddEditQuickReplyModal
        open={showAddEditModal}
        onOpenChange={setShowAddEditModal}
        tenantId={tenantId}
        editingReply={editingReply}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Resposta Rápida</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a resposta rápida "{deletingReply?.title}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Add/Edit Quick Reply Modal Component
interface AddEditQuickReplyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  editingReply: QuickReplyTemplate | null
  onSuccess: () => void
}

function AddEditQuickReplyModal({
  open,
  onOpenChange,
  tenantId,
  editingReply,
  onSuccess,
}: AddEditQuickReplyModalProps) {
  const { createQuickReplyTemplate, updateQuickReplyTemplate } = useData()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [icon, setIcon] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load editing data when modal opens
  useEffect(() => {
    if (open && editingReply) {
      setTitle(editingReply.title)
      setMessage(editingReply.message)
      setIcon(editingReply.icon || "")
    } else if (!open) {
      // Reset when modal closes
      setTitle("")
      setMessage("")
      setIcon("")
    }
  }, [open, editingReply])

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e mensagem são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (editingReply) {
        await updateQuickReplyTemplate(editingReply.id, {
          title: title.trim(),
          message: message.trim(),
          icon: icon.trim() || null,
        })
        toast({
          title: "Resposta rápida atualizada",
          description: "A resposta rápida foi atualizada com sucesso.",
        })
      } else {
        await createQuickReplyTemplate({
          tenantId,
          title: title.trim(),
          message: message.trim(),
          icon: icon.trim() || null,
          usageCount: 0,
        })
        toast({
          title: "Resposta rápida criada",
          description: "A resposta rápida foi criada com sucesso.",
        })
      }
      onSuccess()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a resposta rápida.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingReply ? "Editar" : "Adicionar"} Resposta Rápida
          </DialogTitle>
          <DialogDescription>
            {editingReply
              ? "Atualize os dados da resposta rápida"
              : "Crie uma nova resposta rápida para agilizar o atendimento"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Saudação Inicial"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="message">Mensagem *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite a mensagem da resposta rápida..."
              className="mt-1"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="icon">Ícone/Emoji (opcional)</Label>
            <Input
              id="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Ex: 👋 ou 💬"
              className="mt-1"
              maxLength={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Feedback, FeedbackStatus } from "@/types"

interface ChangeStatusModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feedback: Feedback | null
  onConfirm: (status: FeedbackStatus) => void
}

export function ChangeStatusModal({
  open,
  onOpenChange,
  feedback,
  onConfirm,
}: ChangeStatusModalProps) {
  const [newStatus, setNewStatus] = useState<FeedbackStatus>(
    feedback?.feedbackStatus || FeedbackStatus.EM_ABERTO
  )

  // Atualizar status quando feedback mudar
  useEffect(() => {
    if (feedback) {
      setNewStatus(feedback.feedbackStatus)
    }
  }, [feedback])

  const handleConfirm = () => {
    onConfirm(newStatus)
    onOpenChange(false)
  }

  if (!feedback) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Alterar Status do Feedback</DialogTitle>
          <DialogDescription>
            Atualize o status do feedback para acompanhar seu tratamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Novo Status</Label>
            <Select
              value={newStatus}
              onValueChange={(value) => setNewStatus(value as FeedbackStatus)}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FeedbackStatus.EM_ABERTO}>Em Aberto</SelectItem>
                <SelectItem value={FeedbackStatus.SENDO_TRATADO}>Sendo Tratado</SelectItem>
                <SelectItem value={FeedbackStatus.ENCERRADO}>Encerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newStatus === feedback.feedbackStatus && (
            <p className="text-sm text-muted-foreground">
              O status atual já é "{feedback.feedbackStatus}". Selecione um status diferente.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={newStatus === feedback.feedbackStatus}
          >
            Confirmar Alteração
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

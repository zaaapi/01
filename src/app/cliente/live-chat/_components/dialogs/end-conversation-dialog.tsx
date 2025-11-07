"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface EndConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading?: boolean
  contactName?: string
}

export function EndConversationDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  contactName,
}: EndConversationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Encerrar conversa</DialogTitle>
          </div>
          <DialogDescription>
            Tem certeza que deseja encerrar a conversa com{" "}
            <strong>{contactName || "este cliente"}</strong>? Esta ação não pode ser desfeita e a IA
            será desativada.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Encerrando..." : "Encerrar conversa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

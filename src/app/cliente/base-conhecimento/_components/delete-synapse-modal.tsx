"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"

interface DeleteSynapseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  synapseNome: string
  onConfirm: () => void
}

export function DeleteSynapseModal({
  open,
  onOpenChange,
  synapseNome,
  onConfirm,
}: DeleteSynapseModalProps) {
  const [confirmText, setConfirmText] = useState("")
  const CONFIRMATION_TEXT = "confirmo excluir synapse"

  const handleConfirm = () => {
    if (confirmText.toLowerCase() === CONFIRMATION_TEXT) {
      onConfirm()
      setConfirmText("")
      onOpenChange(false)
    }
  }

  const isConfirmDisabled = confirmText.toLowerCase() !== CONFIRMATION_TEXT

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setConfirmText("")
        }
        onOpenChange(isOpen)
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Excluir Synapse</DialogTitle>
          </div>
          <DialogDescription>
            Esta ação irá excluir permanentemente a synapse <strong>{synapseNome}</strong>. Esta
            ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-foreground">
              Para confirmar, digite <strong>&quot;{CONFIRMATION_TEXT}&quot;</strong> no campo
              abaixo:
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-text">Confirmação</Label>
            <Input
              id="confirm-text"
              placeholder={CONFIRMATION_TEXT}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setConfirmText("")
              onOpenChange(false)
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            Excluir Synapse
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

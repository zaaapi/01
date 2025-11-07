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

interface ReativarNeuroCoreModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  neurocoreNome: string
  onConfirm: () => void
}

export function ReativarNeuroCoreModal({
  open,
  onOpenChange,
  neurocoreNome,
  onConfirm,
}: ReativarNeuroCoreModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reativar NeuroCore</DialogTitle>
          <DialogDescription>
            Esta ação irá reativar o NeuroCore <strong>{neurocoreNome}</strong>. Todas as empresas
            associadas voltarão a ter acesso a este NeuroCore.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Reativar NeuroCore
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

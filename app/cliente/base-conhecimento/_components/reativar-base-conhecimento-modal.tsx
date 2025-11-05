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

interface ReativarBaseConhecimentoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  baseNome: string
  onConfirm: () => void
}

export function ReativarBaseConhecimentoModal({
  open,
  onOpenChange,
  baseNome,
  onConfirm,
}: ReativarBaseConhecimentoModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reativar Base de Conhecimento</DialogTitle>
          <DialogDescription>
            Esta ação irá reativar a base <strong>{baseNome}</strong>.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Reativar Base
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


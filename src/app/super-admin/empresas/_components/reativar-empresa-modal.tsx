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
import { Power } from "lucide-react"

interface ReativarEmpresaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  empresaNome: string
  onConfirm: () => void
}

export function ReativarEmpresaModal({
  open,
  onOpenChange,
  empresaNome,
  onConfirm,
}: ReativarEmpresaModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Power className="h-5 w-5 text-green-600" />
            <DialogTitle>Reativar Empresa</DialogTitle>
          </div>
          <DialogDescription>
            Tem certeza que deseja reativar a empresa <strong>{empresaNome}</strong>? Os usuários
            poderão acessar o sistema novamente.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Não, cancelar
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Sim, reativar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

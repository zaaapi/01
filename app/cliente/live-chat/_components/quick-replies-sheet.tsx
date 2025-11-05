"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { QuickReplyTemplate } from "@/types"
import { EmptyState } from "@/components/shared/empty-state"
import { Zap } from "lucide-react"

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
  // Este componente será expandido quando implementarmos o CRUD de Quick Replies
  // Por enquanto, apenas mostra uma lista vazia
  const quickReplies: QuickReplyTemplate[] = []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] w-full">
        <SheetHeader>
          <SheetTitle>Respostas Rápidas</SheetTitle>
          <SheetDescription>
            Selecione uma resposta rápida para inserir na mensagem
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          {quickReplies.length === 0 ? (
            <EmptyState
              icon={Zap}
              title="Nenhuma resposta rápida cadastrada"
              description="Crie respostas rápidas para agilizar o atendimento"
            />
          ) : (
            <div className="space-y-2">
              {quickReplies.map((qr) => (
                <Button
                  key={qr.id}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => {
                    onSelect(qr)
                    onOpenChange(false)
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    {qr.icon && <span>{qr.icon}</span>}
                    <div className="flex-1 text-left">
                      <p className="font-medium">{qr.title}</p>
                      <p className="text-sm text-muted-foreground">{qr.message}</p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}


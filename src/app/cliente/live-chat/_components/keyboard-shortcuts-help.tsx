"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import { Search, MessageSquare, Zap, ArrowDown, XCircle, Info } from "lucide-react"

interface KeyboardShortcutsHelpProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ShortcutGroup {
  title: string
  icon: React.ElementType
  shortcuts: {
    keys: string[]
    description: string
  }[]
}

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  const shortcutGroups: ShortcutGroup[] = [
    {
      title: "Navegação",
      icon: Search,
      shortcuts: [
        {
          keys: ["Ctrl", "K"],
          description: "Focar na busca de contatos",
        },
        {
          keys: ["Esc"],
          description: "Limpar busca / Fechar modais",
        },
      ],
    },
    {
      title: "Mensagens",
      icon: MessageSquare,
      shortcuts: [
        {
          keys: ["Enter"],
          description: "Enviar mensagem",
        },
        {
          keys: ["Shift", "Enter"],
          description: "Nova linha na mensagem",
        },
        {
          keys: ["/"],
          description: "Abrir respostas rápidas",
        },
      ],
    },
    {
      title: "Ações Rápidas",
      icon: Zap,
      shortcuts: [
        {
          keys: ["Ctrl", "I"],
          description: "Pausar/Retomar IA",
        },
        {
          keys: ["Ctrl", "E"],
          description: "Encerrar conversa",
        },
        {
          keys: ["Ctrl", "F"],
          description: "Abrir/Fechar busca no chat",
        },
      ],
    },
    {
      title: "Visualização",
      icon: ArrowDown,
      shortcuts: [
        {
          keys: ["Ctrl", "↓"],
          description: "Ir para o final do chat",
        },
      ],
    },
    {
      title: "Ajuda",
      icon: Info,
      shortcuts: [
        {
          keys: ["Ctrl", "?"],
          description: "Abrir/Fechar esta ajuda",
        },
      ],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Atalhos do Teclado
          </DialogTitle>
          <DialogDescription>
            Use estes atalhos para navegar mais rapidamente pelo Live Chat
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {shortcutGroups.map((group, groupIndex) => {
            const Icon = group.icon
            return (
              <div key={group.title}>
                {groupIndex > 0 && <Separator className="mb-4" />}

                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {group.title}
                  </h3>

                  <div className="space-y-2">
                    {group.shortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm text-muted-foreground">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <div key={keyIndex} className="flex items-center">
                              <Kbd>{key}</Kbd>
                              {keyIndex < shortcut.keys.length - 1 && (
                                <span className="mx-1 text-muted-foreground">+</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 p-3 bg-muted/30 rounded-md">
          <p className="text-xs text-muted-foreground">
            <strong>Dica:</strong> No macOS, use <Kbd>Cmd</Kbd> ao invés de <Kbd>Ctrl</Kbd>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

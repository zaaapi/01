"use client"

import { Badge } from "@/components/ui/badge"
import { Conversation, Contact, ConversationStatus } from "@/types"
import { formatRelativeTime } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { Bot } from "lucide-react"

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversationId: string | null
  onSelectConversation: (conversationId: string) => void
  contacts: Contact[]
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <p className="text-sm text-muted-foreground text-center">Nenhuma conversa encontrada</p>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {conversations.map((conversation) => {
        return (
          <div
            key={conversation.id}
            className={cn(
              "p-4 cursor-pointer hover:bg-muted transition-colors",
              selectedConversationId === conversation.id && "bg-muted"
            )}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    conversation.status === ConversationStatus.CONVERSANDO
                      ? "default"
                      : conversation.status === ConversationStatus.PAUSADA
                        ? "secondary"
                        : "outline"
                  }
                  className="text-xs"
                >
                  {conversation.status}
                </Badge>
                {conversation.iaActive && <Bot className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(conversation.lastMessageAt)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

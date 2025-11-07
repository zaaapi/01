"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ConversationList } from "../conversation-list"
import { ConversationSkeleton } from "../skeletons/conversation-skeleton"
import { Contact, Conversation, ConversationStatus } from "@/types"

interface ConversationListPanelProps {
  selectedContact: Contact | null
  conversations: Conversation[]
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
  isLoading: boolean
  statusFilter: ConversationStatus | "all"
  onStatusFilterChange: (status: ConversationStatus | "all") => void
}

export function ConversationListPanel({
  selectedContact,
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading,
  statusFilter,
  onStatusFilterChange,
}: ConversationListPanelProps) {
  if (!selectedContact) {
    return (
      <div className="w-80 border-r flex flex-col bg-card">
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-muted-foreground text-center">
            Selecione um contato para ver as conversas
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 border-r flex flex-col bg-card">
      <div className="p-4 border-b space-y-4">
        <div>
          <h3 className="font-semibold">{selectedContact.name}</h3>
          <p className="text-xs text-muted-foreground">{selectedContact.phone}</p>
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value: ConversationStatus | "all") => onStatusFilterChange(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value={ConversationStatus.CONVERSANDO}>Conversando</SelectItem>
            <SelectItem value={ConversationStatus.PAUSADA}>Pausadas</SelectItem>
            <SelectItem value={ConversationStatus.ENCERRADA}>Encerradas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <ConversationSkeleton />
        ) : (
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={onSelectConversation}
            contacts={[selectedContact]}
          />
        )}
      </ScrollArea>
    </div>
  )
}

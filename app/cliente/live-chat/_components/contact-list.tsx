"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Contact, ContactStatus } from "@/types"
import { formatRelativeTime } from "@/lib/formatters"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContactListProps {
  contacts: Contact[]
  selectedContactId: string | null
  onSelectContact: (contactId: string) => void
}

export function ContactList({
  contacts,
  selectedContactId,
  onSelectContact,
}: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <p className="text-sm text-muted-foreground text-center">
          Nenhum contato encontrado
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className={cn(
            "p-4 cursor-pointer hover:bg-muted transition-colors",
            selectedContactId === contact.id && "bg-muted"
          )}
          onClick={() => onSelectContact(contact.id)}
        >
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="font-medium text-sm truncate">{contact.name}</p>
                <Badge
                  variant={
                    contact.status === ContactStatus.COM_IA
                      ? "default"
                      : contact.status === ContactStatus.PAUSADA
                      ? "secondary"
                      : "outline"
                  }
                  className="text-[10px] px-1.5 py-0 flex-shrink-0"
                >
                  {contact.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {contact.phone}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {formatRelativeTime(contact.lastInteraction)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}


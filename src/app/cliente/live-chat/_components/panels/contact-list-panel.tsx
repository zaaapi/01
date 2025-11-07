"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown } from "lucide-react"
import { ContactList } from "../contact-list"
import { ContactSkeleton } from "../skeletons/contact-skeleton"
import { Contact } from "@/types"

interface ContactListPanelProps {
  contacts: Contact[]
  selectedContactId: string | null
  onSelectContact: (id: string) => void
  isLoading: boolean
  searchQuery: string
  searchField: "name" | "phone" | "email"
  onSearchQueryChange: (query: string) => void
  onSearchFieldChange: (field: "name" | "phone" | "email") => void
}

export function ContactListPanel({
  contacts,
  selectedContactId,
  onSelectContact,
  isLoading,
  searchQuery,
  searchField,
  onSearchQueryChange,
  onSearchFieldChange,
}: ContactListPanelProps) {
  const fieldLabels = {
    name: "Nome",
    phone: "Telefone",
    email: "Email",
  }

  return (
    <div className="w-80 border-r flex flex-col bg-card">
      <div className="p-4 border-b space-y-4">
        <h2 className="font-semibold text-lg">Contatos</h2>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-24">
                {fieldLabels[searchField]}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1">
              {(Object.keys(fieldLabels) as Array<keyof typeof fieldLabels>).map((field) => (
                <Button
                  key={field}
                  variant={searchField === field ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onSearchFieldChange(field)}
                >
                  {fieldLabels[field]}
                </Button>
              ))}
            </PopoverContent>
          </Popover>
          <Input
            placeholder={`Buscar por ${fieldLabels[searchField].toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <ContactSkeleton />
        ) : (
          <ContactList
            contacts={contacts}
            selectedContactId={selectedContactId}
            onSelectContact={onSelectContact}
          />
        )}
      </ScrollArea>
    </div>
  )
}

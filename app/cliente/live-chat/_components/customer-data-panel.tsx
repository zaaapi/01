"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Copy, Check } from "lucide-react"
import { Contact } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface CustomerDataPanelProps {
  contact: Contact
  onCopy: () => void
  onUpdate: (data: Partial<Contact>) => Promise<void>
}

export function CustomerDataPanel({
  contact,
  onCopy,
  onUpdate,
}: CustomerDataPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    name: contact.name,
    phone: contact.phone,
    phoneSecondary: contact.phoneSecondary || "",
    email: contact.email || "",
    country: contact.country || "",
    city: contact.city || "",
    zipCode: contact.zipCode || "",
    addressStreet: contact.addressStreet || "",
    addressNumber: contact.addressNumber || "",
    addressComplement: contact.addressComplement || "",
    cpf: contact.cpf || "",
    rg: contact.rg || "",
  })

  const handleSave = async () => {
    await onUpdate(formData)
    setIsEditing(false)
  }

  const handleCopy = async () => {
    await onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Ficha Cadastral</h3>
            <div className="flex gap-2">
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (isEditing) {
                    handleSave()
                  } else {
                    setIsEditing(true)
                  }
                }}
              >
                {isEditing ? "Salvar" : "Editar"}
              </Button>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Nome</Label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm mt-1">{contact.name}</p>
              )}
            </div>

            <Separator />

            <div>
              <Label className="text-xs text-muted-foreground">Telefone</Label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm mt-1">{contact.phone}</p>
              )}
            </div>

            <Separator />

            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm mt-1 text-muted-foreground">
                  {contact.email || "N/A"}
                </p>
              )}
            </div>

            {contact.tags && contact.tags.length > 0 && (
              <>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {contact.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {contact.lastNegotiation && (
              <>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground">Último Negócio</Label>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto mt-2">
                    {JSON.stringify(contact.lastNegotiation, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}


"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Send, Pause, Play, User, Bot, UserCircle } from "lucide-react"

const contatos = [
  {
    id: "contact-1",
    name: "José da Silva",
    phone: "+55 11 91234-5678",
    lastMessage: "Olá, gostaria de saber sobre notebooks",
    timestamp: "Agora",
    status: "Com IA",
  },
  {
    id: "contact-2",
    name: "Maria Oliveira",
    phone: "+55 11 92345-6789",
    lastMessage: "Obrigada!",
    timestamp: "1h atrás",
    status: "Pausada",
  },
]

const mensagens = [
  {
    id: "msg-1",
    senderType: "customer",
    content: "Olá, gostaria de saber sobre notebooks",
    timestamp: "10:30",
  },
  {
    id: "msg-2",
    senderType: "ia",
    content: "Olá! Seja bem-vindo à Tech Store! Claro, ficarei feliz em ajudar com notebooks.",
    timestamp: "10:31",
  },
  {
    id: "msg-3",
    senderType: "customer",
    content: "Para trabalho, preciso de algo potente",
    timestamp: "10:32",
  },
]

export default function LiveChatPage() {
  const [selectedContact, setSelectedContact] = useState(contatos[0])
  const [iaActive, setIaActive] = useState(true)
  const [message, setMessage] = useState("")

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Coluna 1: Lista de Contatos */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b space-y-4">
          <h2 className="font-semibold">Live Chat</h2>
          <Select defaultValue="aberto">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="aberto">Abertas</SelectItem>
              <SelectItem value="ia">Com IA</SelectItem>
              <SelectItem value="pausada">Pausadas</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Buscar contato..." />
        </div>

        <div className="flex-1 overflow-y-auto">
          {contatos.map((contato) => (
            <div
              key={contato.id}
              className={`p-4 border-b cursor-pointer hover:bg-muted ${
                selectedContact.id === contato.id ? "bg-muted" : ""
              }`}
              onClick={() => setSelectedContact(contato)}
            >
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>{contato.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">{contato.name}</p>
                    <Badge
                      variant={contato.status === "Com IA" ? "default" : "secondary"}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {contato.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {contato.lastMessage}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {contato.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coluna 2: Interações da Conversa */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{selectedContact.name}</h3>
            <p className="text-xs text-muted-foreground">{selectedContact.phone}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={iaActive ? "secondary" : "default"}
              size="sm"
              onClick={() => setIaActive(!iaActive)}
            >
              {iaActive ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pausar IA
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Retomar IA
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mensagens.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.senderType === "customer" ? "justify-start" : "justify-end"
              }`}
            >
              {msg.senderType !== "customer" && <div className="flex-1" />}

              {msg.senderType === "customer" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div className="flex flex-col gap-1 max-w-[70%]">
                <div
                  className={`rounded-lg p-3 ${
                    msg.senderType === "customer"
                      ? "bg-muted"
                      : msg.senderType === "ia"
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-secondary/10"
                  }`}
                >
                  {msg.senderType === "ia" && (
                    <div className="flex items-center gap-1 mb-1 text-xs text-primary">
                      <Bot className="h-3 w-3" />
                      <span className="font-medium">IA</span>
                    </div>
                  )}
                  <p className="text-sm">{msg.content}</p>
                </div>
                <p className="text-[10px] text-muted-foreground px-1">
                  {msg.timestamp}
                </p>
              </div>

              {msg.senderType === "ia" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/20">
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Digite sua mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && message.trim()) {
                  setMessage("")
                }
              }}
            />
            <Button disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Coluna 3: Dados do Cliente */}
      <div className="w-80 border-l p-4 space-y-4 overflow-y-auto">
        <div>
          <h3 className="font-semibold mb-4">Ficha Cadastral</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Nome</Label>
              <p className="text-sm">{selectedContact.name}</p>
            </div>
            <Separator />
            <div>
              <Label className="text-xs text-muted-foreground">Telefone</Label>
              <p className="text-sm">{selectedContact.phone}</p>
            </div>
            <Separator />
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="text-sm text-muted-foreground">jose@email.com</p>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold mb-2">Último Negócio</h3>
          <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
{`{
  "produto": "Notebook Dell",
  "valor": 3500,
  "status": "Em negociação"
}`}
          </pre>
        </div>

        <Button variant="outline" className="w-full">
          Copiar Informações
        </Button>
      </div>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}


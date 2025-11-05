"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Send,
  Pause,
  Play,
  User,
  Bot,
  Search,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Zap,
  ChevronDown,
} from "lucide-react"
import { useData } from "@/lib/contexts/data-provider"
import { useAuth } from "@/lib/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  Contact,
  Conversation,
  Message,
  ConversationStatus,
  MessageSenderType,
  FeedbackType,
  QuickReplyTemplate,
} from "@/types"
import { formatDateTime, formatRelativeTime } from "@/lib/formatters"
import { ContactList } from "./_components/contact-list"
import { ConversationList } from "./_components/conversation-list"
import { MessageList } from "./_components/message-list"
import { CustomerDataPanel } from "./_components/customer-data-panel"
import { QuickRepliesSheet } from "./_components/quick-replies-sheet"
import { MessageFeedbackPopover } from "./_components/message-feedback-popover"
import { ConversationFeedbackModal } from "./_components/conversation-feedback-modal"

export default function LiveChatPage() {
  const { state, isLoading, updateConversation, createMessage, updateContact } = useData()
  const { currentAuthUser } = useAuth()
  const { toast } = useToast()

  const tenantId = currentAuthUser?.tenantId
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchField, setSearchField] = useState<"name" | "phone" | "email">("name")
  const [messageInput, setMessageInput] = useState("")
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [showConversationFeedback, setShowConversationFeedback] = useState(false)
  const messageEndRef = useRef<HTMLDivElement>(null)

  // Filtrar contatos e conversas do tenant logado
  const tenantContacts = useMemo(() => {
    if (!tenantId) return []
    return state.contacts.filter((c) => c.tenantId === tenantId)
  }, [state.contacts, tenantId])

  const tenantConversations = useMemo(() => {
    if (!tenantId) return []
    return state.conversations.filter((c) => c.tenantId === tenantId)
  }, [state.conversations, tenantId])

  // Filtrar contatos por busca
  const filteredContacts = useMemo(() => {
    let contacts = tenantContacts

    if (searchQuery) {
      contacts = contacts.filter((c) => {
        const fieldValue = c[searchField]?.toLowerCase() || ""
        return fieldValue.includes(searchQuery.toLowerCase())
      })
    }

    return contacts.sort((a, b) => {
      const dateA = new Date(a.lastInteraction).getTime()
      const dateB = new Date(b.lastInteraction).getTime()
      return dateB - dateA
    })
  }, [tenantContacts, searchQuery, searchField])

  // Filtrar conversas por status
  const filteredConversations = useMemo(() => {
    if (!selectedContactId) return []

    let conversations = tenantConversations.filter(
      (c) => c.contactId === selectedContactId
    )

    if (statusFilter !== "all") {
      conversations = conversations.filter((c) => c.status === statusFilter)
    }

    return conversations.sort((a, b) => {
      const dateA = new Date(a.lastMessageAt).getTime()
      const dateB = new Date(b.lastMessageAt).getTime()
      return dateB - dateA
    })
  }, [tenantConversations, selectedContactId, statusFilter])

  // Selecionar primeira conversa automaticamente
  useEffect(() => {
    if (selectedContactId && filteredConversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(filteredConversations[0].id)
    }
  }, [selectedContactId, filteredConversations, selectedConversationId])

  // Buscar mensagens da conversa selecionada
  const conversationMessages = useMemo(() => {
    if (!selectedConversationId) return []
    return state.messages
      .filter((m) => m.conversationId === selectedConversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }, [state.messages, selectedConversationId])

  // Buscar contato selecionado
  const selectedContact = useMemo(() => {
    if (!selectedContactId) return null
    return tenantContacts.find((c) => c.id === selectedContactId)
  }, [tenantContacts, selectedContactId])

  // Buscar conversa selecionada
  const selectedConversation = useMemo(() => {
    if (!selectedConversationId) return null
    return tenantConversations.find((c) => c.id === selectedConversationId)
  }, [tenantConversations, selectedConversationId])

  // Scroll para última mensagem
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversationMessages])

  // Buscar 10 respostas rápidas mais usadas
  const topQuickReplies = useMemo(() => {
    if (!tenantId) return []
    return state.quickReplyTemplates
      .filter((q) => q.tenantId === tenantId)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10)
  }, [state.quickReplyTemplates, tenantId])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId || !currentAuthUser) return

    try {
      await createMessage({
        conversationId: selectedConversationId,
        senderType: MessageSenderType.ATENDENTE,
        senderId: currentAuthUser.id,
        content: messageInput.trim(),
        timestamp: new Date().toISOString(),
        feedback: null,
      })

      // Atualizar lastMessageAt da conversa
      if (selectedConversation) {
        await updateConversation(selectedConversationId, {
          lastMessageAt: new Date().toISOString(),
        })
      }

      setMessageInput("")
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      })
    }
  }

  const handleQuickReplyClick = (quickReply: QuickReplyTemplate) => {
    setMessageInput(quickReply.message)
    setShowQuickReplies(false)
    // Incrementar uso (simulado)
    toast({
      title: "Resposta rápida inserida",
      description: "Adicione a lógica para incrementar usageCount",
    })
  }

  const handlePauseResumeIA = async () => {
    if (!selectedConversationId || !selectedConversation) return

    try {
      await updateConversation(selectedConversationId, {
        iaActive: !selectedConversation.iaActive,
      })
      toast({
        title: selectedConversation.iaActive ? "IA pausada" : "IA retomada",
        description: selectedConversation.iaActive
          ? "A IA foi pausada para esta conversa."
          : "A IA foi retomada para esta conversa.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o estado da IA.",
        variant: "destructive",
      })
    }
  }

  const handleCopyCustomerInfo = async () => {
    if (!selectedContact) return

    const markdown = `# Ficha Cadastral - ${selectedContact.name}

## Informações Básicas
- **Nome**: ${selectedContact.name}
- **Telefone**: ${selectedContact.phone}
- **Telefone Secundário**: ${selectedContact.phoneSecondary || "N/A"}
- **Email**: ${selectedContact.email || "N/A"}
- **País**: ${selectedContact.country || "N/A"}
- **Cidade**: ${selectedContact.city || "N/A"}
- **CEP**: ${selectedContact.zipCode || "N/A"}
- **Endereço**: ${selectedContact.addressStreet || ""} ${selectedContact.addressNumber || ""} ${selectedContact.addressComplement || ""}
- **CPF**: ${selectedContact.cpf || "N/A"}
- **RG**: ${selectedContact.rg || "N/A"}

## Última Negociação
${selectedContact.lastNegotiation ? JSON.stringify(selectedContact.lastNegotiation, null, 2) : "N/A"}

## Tags
${selectedContact.tags?.join(", ") || "Nenhuma tag"}
`

    try {
      await navigator.clipboard.writeText(markdown)
      toast({
        title: "Informações copiadas",
        description: "As informações do cliente foram copiadas para a área de transferência.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar as informações.",
        variant: "destructive",
      })
    }
  }

  // Detectar atalho / para abrir respostas rápidas
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "/" && messageInput === "") {
      e.preventDefault()
      setShowQuickReplies(true)
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!tenantId) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Usuário não associado a um tenant. Entre em contato com o administrador.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Coluna 1: Lista de Contatos */}
      <div className="w-80 border-r flex flex-col bg-card">
        <div className="p-4 border-b space-y-4">
          <h2 className="font-semibold text-lg">Contatos</h2>
          
          {/* Busca com microseletor */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-24">
                    {searchField === "name" ? "Nome" : searchField === "phone" ? "Telefone" : "Email"}
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-1">
                  <Button
                    variant={searchField === "name" ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSearchField("name")}
                  >
                    Nome
                  </Button>
                  <Button
                    variant={searchField === "phone" ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSearchField("phone")}
                  >
                    Telefone
                  </Button>
                  <Button
                    variant={searchField === "email" ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSearchField("email")}
                  >
                    Email
                  </Button>
                </PopoverContent>
              </Popover>
              <Input
                placeholder={`Buscar por ${searchField === "name" ? "nome" : searchField === "phone" ? "telefone" : "email"}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <ContactList
            contacts={filteredContacts}
            selectedContactId={selectedContactId}
            onSelectContact={setSelectedContactId}
          />
        </ScrollArea>
      </div>

      {/* Coluna 2: Lista de Conversas */}
      <div className="w-80 border-r flex flex-col bg-card">
        {selectedContact ? (
          <>
            <div className="p-4 border-b space-y-4">
              <div>
                <h3 className="font-semibold">{selectedContact.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedContact.phone}</p>
              </div>
              
              <Select
                value={statusFilter}
                onValueChange={(value: ConversationStatus | "all") => setStatusFilter(value)}
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
              <ConversationList
                conversations={filteredConversations}
                selectedConversationId={selectedConversationId}
                onSelectConversation={setSelectedConversationId}
                contacts={tenantContacts}
              />
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-sm text-muted-foreground text-center">
              Selecione um contato para ver as conversas
            </p>
          </div>
        )}
      </div>

      {/* Coluna 3: Mensagens */}
      <div className="flex-1 flex flex-col bg-card">
        {selectedConversation && selectedContact ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{selectedContact.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedConversation.status === ConversationStatus.CONVERSANDO
                    ? selectedConversation.iaActive
                      ? "IA Ativa"
                      : "IA Pausada"
                    : selectedConversation.status}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedConversation.iaActive ? "secondary" : "default"}
                  size="sm"
                  onClick={handlePauseResumeIA}
                >
                  {selectedConversation.iaActive ? (
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConversationFeedback(true)}
                >
                  Feedback
                </Button>
              </div>
            </div>

            {/* Mensagens */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                <MessageList
                  messages={conversationMessages}
                  selectedConversation={selectedConversation}
                  tenantId={tenantId}
                  currentUserId={currentAuthUser?.id || null}
                />
                <div ref={messageEndRef} />
              </div>
            </ScrollArea>

            {/* Input com Respostas Rápidas */}
            <div className="p-4 border-t space-y-2">
              {/* Botão de Respostas Rápidas */}
              {topQuickReplies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {topQuickReplies.slice(0, 5).map((qr) => (
                    <Button
                      key={qr.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReplyClick(qr)}
                      className="text-xs"
                    >
                      {qr.icon && <span className="mr-1">{qr.icon}</span>}
                      {qr.title}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuickReplies(true)}
                    className="text-xs"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Ver todas
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder='Digite sua mensagem... (Digite "/" para respostas rápidas)'
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                />
                <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-sm text-muted-foreground text-center">
              Selecione uma conversa para ver as mensagens
            </p>
          </div>
        )}
      </div>

      {/* Coluna 4: Dados do Cliente */}
      <div className="w-96 border-l bg-card">
        {selectedContact ? (
          <CustomerDataPanel
            contact={selectedContact}
            onCopy={handleCopyCustomerInfo}
            onUpdate={async (data: Partial<Contact>) => {
              if (selectedContactId) {
                try {
                  await updateContact(selectedContactId, data)
                  toast({
                    title: "Dados atualizados",
                    description: "Os dados do cliente foram atualizados com sucesso.",
                  })
                } catch (error) {
                  toast({
                    title: "Erro",
                    description: "Não foi possível atualizar os dados.",
                    variant: "destructive",
                  })
                }
              }
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-sm text-muted-foreground text-center">
              Selecione um contato para ver os dados
            </p>
          </div>
        )}
      </div>

      {/* Modais e Sheets */}
      <QuickRepliesSheet
        open={showQuickReplies}
        onOpenChange={setShowQuickReplies}
        tenantId={tenantId}
        onSelect={handleQuickReplyClick}
      />

      <ConversationFeedbackModal
        open={showConversationFeedback}
        onOpenChange={setShowConversationFeedback}
        conversation={selectedConversation || null}
        contact={selectedContact || null}
      />
    </div>
  )
}

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
  const { 
    fetchContacts,
    fetchContact,
    fetchConversationsByContact,
    fetchMessagesByConversation,
    fetchQuickReplyTemplates,
    updateConversation, 
    createMessage, 
    updateContact,
    incrementQuickReplyUsage,
  } = useData()
  const { user } = useAuth()
  const { toast } = useToast()

  const tenantId = user?.tenantId
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchField, setSearchField] = useState<"name" | "phone" | "email">("name")
  const [messageInput, setMessageInput] = useState("")
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [showConversationFeedback, setShowConversationFeedback] = useState(false)
  const messageEndRef = useRef<HTMLDivElement>(null)

  // State for data loaded from Supabase
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [quickReplies, setQuickReplies] = useState<QuickReplyTemplate[]>([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isLoadingQuickReplies, setIsLoadingQuickReplies] = useState(false)

  // Load contacts on mount and when filters change
  useEffect(() => {
    if (!tenantId) return

    const loadContacts = async () => {
      setIsLoadingContacts(true)
      try {
        const filters = {
          search: searchQuery || undefined,
          searchField: searchField,
        }
        const data = await fetchContacts(tenantId, filters)
        setContacts(data)
      } catch (error) {
        console.error("Erro ao carregar contatos:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os contatos.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingContacts(false)
      }
    }

    loadContacts()
  }, [tenantId, searchQuery, searchField, fetchContacts, toast])

  // Load conversations when contact is selected
  useEffect(() => {
    if (!selectedContactId || !tenantId) {
      setConversations([])
      return
    }

    const loadConversations = async () => {
      setIsLoadingConversations(true)
      try {
        const filters = statusFilter !== "all" ? { status: statusFilter } : undefined
        const data = await fetchConversationsByContact(selectedContactId, tenantId, filters)
        setConversations(data)
        
        // Auto-select first conversation
        if (data.length > 0 && !selectedConversationId) {
          setSelectedConversationId(data[0].id)
          setSelectedConversation(data[0])
        }
      } catch (error) {
        console.error("Erro ao carregar conversas:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar as conversas.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingConversations(false)
      }
    }

    loadConversations()
  }, [selectedContactId, tenantId, statusFilter, fetchConversationsByContact, selectedConversationId, toast])

  // Load selected contact details
  useEffect(() => {
    if (!selectedContactId) {
      setSelectedContact(null)
      return
    }

    const loadContact = async () => {
      try {
        const data = await fetchContact(selectedContactId)
        setSelectedContact(data)
      } catch (error) {
        console.error("Erro ao carregar contato:", error)
      }
    }

    loadContact()
  }, [selectedContactId, fetchContact])

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([])
      return
    }

    const loadMessages = async () => {
      setIsLoadingMessages(true)
      try {
        const data = await fetchMessagesByConversation(selectedConversationId)
        setMessages(data)
      } catch (error) {
        console.error("Erro ao carregar mensagens:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar as mensagens.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingMessages(false)
      }
    }

    loadMessages()
  }, [selectedConversationId, fetchMessagesByConversation, toast])

  // Update selected conversation when it changes in the list
  useEffect(() => {
    if (selectedConversationId) {
      const conv = conversations.find(c => c.id === selectedConversationId)
      setSelectedConversation(conv || null)
    }
  }, [selectedConversationId, conversations])

  // Load top quick replies
  useEffect(() => {
    if (!tenantId) return

    const loadQuickReplies = async () => {
      setIsLoadingQuickReplies(true)
      try {
        const data = await fetchQuickReplyTemplates(tenantId, true)
        setQuickReplies(data.slice(0, 10))
      } catch (error) {
        console.error("Erro ao carregar respostas rápidas:", error)
      } finally {
        setIsLoadingQuickReplies(false)
      }
    }

    loadQuickReplies()
  }, [tenantId, fetchQuickReplyTemplates])

  // Scroll para última mensagem
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId || !user) return

    try {
      await createMessage({
        conversationId: selectedConversationId,
        senderType: MessageSenderType.ATENDENTE,
        senderId: user.id,
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

      // Reload messages to show new message
      const updatedMessages = await fetchMessagesByConversation(selectedConversationId)
      setMessages(updatedMessages)

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

  const handleQuickReplyClick = async (quickReply: QuickReplyTemplate) => {
    setMessageInput(quickReply.message)
    setShowQuickReplies(false)
    
    // Incrementar uso
    try {
      await incrementQuickReplyUsage(quickReply.id)
      // Reload quick replies to update counts
      const updatedQuickReplies = await fetchQuickReplyTemplates(tenantId!, true)
      setQuickReplies(updatedQuickReplies.slice(0, 10))
    } catch (error) {
      console.error("Erro ao incrementar uso da resposta rápida:", error)
    }
  }

  const handlePauseResumeIA = async () => {
    if (!selectedConversationId || !selectedConversation) return

    try {
      const newIaActive = !selectedConversation.iaActive
      await updateConversation(selectedConversationId, {
        iaActive: newIaActive,
      })
      
      // Update local state
      setSelectedConversation({
        ...selectedConversation,
        iaActive: newIaActive,
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
          {isLoadingContacts ? (
            <div className="flex items-center justify-center h-full p-4">
              <p className="text-sm text-muted-foreground">Carregando contatos...</p>
            </div>
          ) : (
            <ContactList
              contacts={contacts}
              selectedContactId={selectedContactId}
              onSelectContact={setSelectedContactId}
            />
          )}
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
              {isLoadingConversations ? (
                <div className="flex items-center justify-center h-full p-4">
                  <p className="text-sm text-muted-foreground">Carregando conversas...</p>
                </div>
              ) : (
                <ConversationList
                  conversations={conversations}
                  selectedConversationId={selectedConversationId}
                  onSelectConversation={setSelectedConversationId}
                  contacts={contacts}
                />
              )}
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
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">Carregando mensagens...</p>
                  </div>
                ) : (
                  <>
                    <MessageList
                      messages={messages}
                      selectedConversation={selectedConversation!}
                      tenantId={tenantId!}
                      currentUserId={user?.id || null}
                    />
                    <div ref={messageEndRef} />
                  </>
                )}
              </div>
            </ScrollArea>

            {/* Input com Respostas Rápidas */}
            <div className="p-4 border-t space-y-2">
              {/* Botão de Respostas Rápidas */}
              {!isLoadingQuickReplies && quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {quickReplies.slice(0, 5).map((qr) => (
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
                  // Reload contact to show updated data
                  const updatedContact = await fetchContact(selectedContactId)
                  setSelectedContact(updatedContact)
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

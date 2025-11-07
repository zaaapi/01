"use client"

import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useData } from "@/lib/contexts/data-provider"
import { ConversationStatus, QuickReplyTemplate, MessageSenderType } from "@/types"

// Hooks customizados
import { useLiveChatData } from "./_hooks/use-live-chat-data"
import { useLiveChatActions } from "./_hooks/use-live-chat-actions"
import { useDebouncedSearch } from "./_hooks/use-debounced-search"
import { useMessageScroll } from "./_hooks/use-message-scroll"
import { useRealtimeMessages } from "./_hooks/use-realtime-messages"
import { useRealtimeConversations } from "./_hooks/use-realtime-conversations"
import { useKeyboardShortcuts } from "./_hooks/use-keyboard-shortcuts"

// Componentes de painel
import { ContactListPanel } from "./_components/panels/contact-list-panel"
import { ConversationListPanel } from "./_components/panels/conversation-list-panel"
import { ChatPanel } from "./_components/panels/chat-panel"
import { CustomerDataPanel } from "./_components/customer-data-panel"

// Modais e Dialogs
import { QuickRepliesSheet } from "./_components/quick-replies-sheet"
import { ConversationFeedbackModal } from "./_components/conversation-feedback-modal"
import { EndConversationDialog } from "./_components/dialogs/end-conversation-dialog"
import { EmptyTenantState } from "./_components/empty-tenant-state"
import { KeyboardShortcutsHelp } from "./_components/keyboard-shortcuts-help"
import { useToast } from "@/hooks/use-toast"

export default function LiveChatPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { fetchQuickReplyTemplates, incrementQuickReplyUsage, fetchContact } = useData()

  const tenantId = user?.tenantId

  // UI State
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchField, setSearchField] = useState<"name" | "phone" | "email">("name")
  const [messageInput, setMessageInput] = useState("")
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [showConversationFeedback, setShowConversationFeedback] = useState(false)
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [quickReplies, setQuickReplies] = useState<QuickReplyTemplate[]>([])
  const [isLoadingQuickReplies, setIsLoadingQuickReplies] = useState(false)

  // Debounced search
  const debouncedSearch = useDebouncedSearch(searchQuery, 500)

  // Data loading via React Query
  const {
    contacts,
    selectedContact,
    conversations,
    selectedConversation,
    messages,
    isLoadingContacts,
    isLoadingConversations,
    isLoadingMessages,
    addOptimisticMessage,
    removeOptimisticMessage,
    invalidateMessages,
    invalidateConversations,
    invalidateSelectedContact,
  } = useLiveChatData({
    tenantId: tenantId || undefined,
    selectedContactId,
    selectedConversationId,
    searchQuery: debouncedSearch,
    searchField,
    statusFilter,
  })

  // Realtime subscriptions
  useRealtimeMessages({
    conversationId: selectedConversationId,
    enabled: !!selectedConversationId,
  })

  useRealtimeConversations({
    contactId: selectedContactId,
    tenantId: tenantId || undefined,
    enabled: !!selectedContactId && !!tenantId,
  })

  // Actions via Server Actions
  const {
    sendMessage,
    pauseIA,
    resumeIA,
    endConversation: endConversationAction,
    updateContact,
    isSendingMessage,
    isEndingConversation,
  } = useLiveChatActions()

  // Smart scroll
  const { scrollAreaRef, messageEndRef, scrollToBottom, showScrollButton } = useMessageScroll({
    messages,
    enabled: !!selectedConversationId,
  })

  // Keyboard shortcuts
  useKeyboardShortcuts(
    [
      // Busca de contatos
      {
        key: "k",
        ctrl: true,
        callback: () => {
          const searchInput = document.querySelector<HTMLInputElement>(
            'input[placeholder*="Buscar"]'
          )
          searchInput?.focus()
        },
        description: "Focar na busca de contatos",
      },
      // Respostas rápidas
      {
        key: "/",
        callback: () => {
          if (!showQuickReplies && selectedConversationId) {
            setShowQuickReplies(true)
          }
        },
        description: "Abrir respostas rápidas",
      },
      // Fechar modais
      {
        key: "Escape",
        callback: () => {
          if (showQuickReplies) setShowQuickReplies(false)
          else if (showConversationFeedback) setShowConversationFeedback(false)
          else if (showEndDialog) setShowEndDialog(false)
          else if (showKeyboardHelp) setShowKeyboardHelp(false)
          else if (searchQuery) setSearchQuery("")
        },
        description: "Fechar modais / Limpar busca",
      },
      // Pausar/Retomar IA
      {
        key: "i",
        ctrl: true,
        callback: () => {
          if (selectedConversation) {
            handleToggleIA()
          }
        },
        description: "Pausar/Retomar IA",
      },
      // Encerrar conversa
      {
        key: "e",
        ctrl: true,
        callback: () => {
          if (selectedConversation && !showEndDialog) {
            setShowEndDialog(true)
          }
        },
        description: "Encerrar conversa",
      },
      // Abrir busca no chat
      {
        key: "f",
        ctrl: true,
        callback: () => {
          if (selectedConversationId) {
            setShowSearch((prev) => !prev)
          }
        },
        description: "Abrir/Fechar busca no chat",
      },
      // Scroll to bottom
      {
        key: "ArrowDown",
        ctrl: true,
        callback: () => {
          if (selectedConversationId) {
            scrollToBottom()
          }
        },
        description: "Ir para o final do chat",
      },
      // Ajuda
      {
        key: "?",
        ctrl: true,
        callback: () => {
          setShowKeyboardHelp((prev) => !prev)
        },
        description: "Abrir/Fechar ajuda",
      },
    ],
    !!tenantId
  )

  // Load quick replies quando o tenant muda
  useState(() => {
    if (tenantId) {
      setIsLoadingQuickReplies(true)
      fetchQuickReplyTemplates(tenantId, true)
        .then((data) => setQuickReplies(data.slice(0, 10)))
        .finally(() => setIsLoadingQuickReplies(false))
    }
  })

  // Handlers
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId || !tenantId || !selectedContactId) {
      return
    }

    // Update otimista
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      content: messageInput.trim(),
      senderType: MessageSenderType.ATENDENTE,
      senderId: user?.id || null,
      timestamp: new Date().toISOString(),
      conversationId: selectedConversationId,
      feedback: null,
    }

    addOptimisticMessage(optimisticMessage)
    const messageToSend = messageInput
    setMessageInput("")

    // Enviar via Server Action
    const result = await sendMessage({
      tenantId,
      contactId: selectedContactId,
      conversationId: selectedConversationId,
      message: messageToSend,
    })

    // Verificar se teve sucesso
    if (result?.data?.success) {
      // Remover mensagem otimista e recarregar do servidor
      setTimeout(() => {
        removeOptimisticMessage(optimisticMessage.id)
        invalidateMessages()
      }, 1000)
    } else {
      // Reverter em caso de erro
      removeOptimisticMessage(optimisticMessage.id)
      setMessageInput(messageToSend)
    }
  }

  const handleToggleIA = async () => {
    if (!selectedConversation || !tenantId || !selectedConversationId) return

    const isPausing = selectedConversation.iaActive

    let result
    if (isPausing) {
      result = await pauseIA({
        tenantId,
        conversationId: selectedConversationId,
      })
    } else {
      result = await resumeIA({
        tenantId,
        conversationId: selectedConversationId,
      })
    }

    // Só invalidar se teve sucesso
    if (result?.data?.success) {
      invalidateConversations()
    }
  }

  const handleEndConversation = async () => {
    if (!selectedConversationId || !tenantId || !selectedContactId) return

    const result = await endConversationAction({
      tenantId,
      conversationId: selectedConversationId,
      contactId: selectedContactId,
    })

    // Só fechar dialog e invalidar se teve sucesso
    if (result?.data?.success) {
      setShowEndDialog(false)
      invalidateConversations()
    }
  }

  const handleQuickReplyClick = async (quickReply: QuickReplyTemplate) => {
    setMessageInput(quickReply.message)
    setShowQuickReplies(false)

    // Incrementar uso
    try {
      await incrementQuickReplyUsage(quickReply.id)
      // Reload quick replies
      if (tenantId) {
        const updatedQuickReplies = await fetchQuickReplyTemplates(tenantId, true)
        setQuickReplies(updatedQuickReplies.slice(0, 10))
      }
    } catch (error) {
      // Ignorar erro de incremento
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
- **Endereço**: ${selectedContact.addressStreet || ""} ${
      selectedContact.addressNumber || ""
    } ${selectedContact.addressComplement || ""}
- **CPF**: ${selectedContact.cpf || "N/A"}
- **RG**: ${selectedContact.rg || "N/A"}

## Última Negociação
${
  selectedContact.lastNegotiation ? JSON.stringify(selectedContact.lastNegotiation, null, 2) : "N/A"
}

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

  const handleUpdateContact = async (data: any) => {
    if (!selectedContactId) return

    await updateContact({ contactId: selectedContactId, data })
    invalidateSelectedContact()

    // Reload contact
    const updatedContact = await fetchContact(selectedContactId)
    // O cache já foi invalidado, o React Query vai recarregar
  }

  // Early return para no tenant
  if (!tenantId) {
    return <EmptyTenantState />
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Coluna 1: Contatos */}
      <ContactListPanel
        contacts={contacts}
        selectedContactId={selectedContactId}
        onSelectContact={setSelectedContactId}
        isLoading={isLoadingContacts}
        searchQuery={searchQuery}
        searchField={searchField}
        onSearchQueryChange={setSearchQuery}
        onSearchFieldChange={setSearchField}
      />

      {/* Coluna 2: Conversas */}
      <ConversationListPanel
        selectedContact={selectedContact}
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
        isLoading={isLoadingConversations}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Coluna 3: Chat */}
      <ChatPanel
        selectedConversation={selectedConversation}
        selectedContact={selectedContact}
        messages={messages}
        isLoadingMessages={isLoadingMessages}
        messageInput={messageInput}
        onMessageInputChange={setMessageInput}
        onSendMessage={handleSendMessage}
        onToggleIA={handleToggleIA}
        onOpenEndDialog={() => setShowEndDialog(true)}
        onOpenFeedback={() => setShowConversationFeedback(true)}
        onOpenQuickReplies={() => setShowQuickReplies(true)}
        scrollAreaRef={scrollAreaRef}
        messageEndRef={messageEndRef}
        tenantId={tenantId}
        currentUserId={user?.id || null}
        quickReplies={quickReplies}
        isLoadingQuickReplies={isLoadingQuickReplies}
        onQuickReplyClick={handleQuickReplyClick}
        showScrollButton={showScrollButton}
        onScrollToBottom={scrollToBottom}
        showSearch={showSearch}
        onSearchOpenChange={setShowSearch}
      />

      {/* Coluna 4: Dados do Cliente */}
      <div className="w-96 border-l bg-card">
        {selectedContact ? (
          <CustomerDataPanel
            contact={selectedContact}
            onCopy={handleCopyCustomerInfo}
            onUpdate={handleUpdateContact}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-sm text-muted-foreground text-center">
              Selecione um contato para ver os dados
            </p>
          </div>
        )}
      </div>

      {/* Modais */}
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

      <EndConversationDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
        onConfirm={handleEndConversation}
        isLoading={isEndingConversation}
        contactName={selectedContact?.name}
      />

      <KeyboardShortcutsHelp open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp} />
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Kbd } from "@/components/ui/kbd"
import { Pause, Play, Zap } from "lucide-react"
import { MessageList } from "../message-list"
import { MessageSkeleton } from "../skeletons/message-skeleton"
import { ScrollToBottomButton } from "../scroll-to-bottom-button"
import { ChatSearch } from "../chat-search"
import { Contact, Conversation, Message, ConversationStatus, QuickReplyTemplate } from "@/types"
import { RefObject } from "react"
import { useMessageSearch } from "../../_hooks/use-message-search"

interface ChatPanelProps {
  selectedConversation: Conversation | null
  selectedContact: Contact | null
  messages: Message[]
  isLoadingMessages: boolean
  messageInput: string
  onMessageInputChange: (value: string) => void
  onSendMessage: () => void
  onToggleIA: () => void
  onOpenEndDialog: () => void
  onOpenFeedback: () => void
  onOpenQuickReplies: () => void
  scrollAreaRef: RefObject<HTMLDivElement>
  messageEndRef: RefObject<HTMLDivElement>
  tenantId: string
  currentUserId: string | null
  quickReplies?: QuickReplyTemplate[]
  isLoadingQuickReplies?: boolean
  onQuickReplyClick?: (qr: QuickReplyTemplate) => void
  showScrollButton?: boolean
  onScrollToBottom?: () => void
  showSearch?: boolean
  onSearchOpenChange?: (open: boolean) => void
}

export function ChatPanel({
  selectedConversation,
  selectedContact,
  messages,
  isLoadingMessages,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  onToggleIA,
  onOpenEndDialog,
  onOpenFeedback,
  onOpenQuickReplies,
  scrollAreaRef,
  messageEndRef,
  tenantId,
  currentUserId,
  quickReplies = [],
  isLoadingQuickReplies = false,
  onQuickReplyClick,
  showScrollButton = false,
  onScrollToBottom,
  showSearch = false,
  onSearchOpenChange,
}: ChatPanelProps) {
  // Message search
  const {
    searchQuery,
    totalResults,
    currentResult,
    currentHighlightedMessageId,
    handleSearch,
    goToNext,
    goToPrevious,
  } = useMessageSearch({ messages })

  if (!selectedConversation || !selectedContact) {
    return (
      <div className="flex-1 flex flex-col bg-card">
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-muted-foreground text-center">
            Selecione uma conversa para ver as mensagens
          </p>
        </div>
      </div>
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "/" && messageInput === "") {
      e.preventDefault()
      onOpenQuickReplies()
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex-1 flex flex-col bg-card">
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
            <ChatSearch
              onSearch={handleSearch}
              totalResults={totalResults}
              currentResult={currentResult}
              onNext={goToNext}
              onPrevious={goToPrevious}
              isOpen={showSearch}
              onOpenChange={onSearchOpenChange}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={selectedConversation.iaActive ? "secondary" : "default"}
                  size="sm"
                  onClick={onToggleIA}
                  disabled={selectedConversation.status === ConversationStatus.ENCERRADA}
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
              </TooltipTrigger>
              <TooltipContent>
                <p className="flex items-center gap-1">
                  Pausar/Retomar IA <Kbd>Ctrl</Kbd> + <Kbd>I</Kbd>
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onOpenFeedback}>
                  Feedback
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="flex items-center gap-1">
                  Abrir feedback <Kbd>Ctrl</Kbd> + <Kbd>F</Kbd>
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onOpenEndDialog}
                  disabled={selectedConversation.status === ConversationStatus.ENCERRADA}
                >
                  Encerrar
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="flex items-center gap-1">
                  Encerrar conversa <Kbd>Ctrl</Kbd> + <Kbd>E</Kbd>
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 relative">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-4">
              {isLoadingMessages ? (
                <MessageSkeleton />
              ) : (
                <>
                  <MessageList
                    messages={messages}
                    selectedConversation={selectedConversation}
                    tenantId={tenantId}
                    currentUserId={currentUserId}
                    searchQuery={searchQuery}
                    highlightedMessageId={currentHighlightedMessageId}
                  />
                  <div ref={messageEndRef} />
                </>
              )}
            </div>
          </ScrollArea>

          {/* Botão de scroll para baixo */}
          {onScrollToBottom && (
            <ScrollToBottomButton show={showScrollButton} onClick={onScrollToBottom} />
          )}
        </div>

        {/* Input com Respostas Rápidas */}
        <div className="p-4 border-t space-y-2">
          {/* Botões de Respostas Rápidas */}
          {!isLoadingQuickReplies && quickReplies.length > 0 && onQuickReplyClick && (
            <div className="flex flex-wrap gap-2">
              {quickReplies.slice(0, 5).map((qr) => (
                <Button
                  key={qr.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onQuickReplyClick(qr)}
                  className="text-xs"
                >
                  {qr.icon && <span className="mr-1">{qr.icon}</span>}
                  {qr.title}
                </Button>
              ))}
              <Button variant="ghost" size="sm" onClick={onOpenQuickReplies} className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Ver todas
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder='Digite sua mensagem... (Digite "/" para respostas rápidas)'
              value={messageInput}
              onChange={(e) => onMessageInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button onClick={onSendMessage} disabled={!messageInput.trim()}>
              Enviar
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Message, Conversation, MessageSenderType, FeedbackType } from "@/types"
import { formatDateTime } from "@/lib/formatters"
import { User, Bot, ThumbsUp, ThumbsDown } from "lucide-react"
import { MessageFeedbackPopover } from "./message-feedback-popover"
import { HighlightedText } from "./highlighted-text"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface MessageListProps {
  messages: Message[]
  selectedConversation: Conversation
  tenantId: string
  currentUserId: string | null
  searchQuery?: string
  highlightedMessageId?: string | null
}

export function MessageList({
  messages,
  selectedConversation,
  tenantId,
  currentUserId,
  searchQuery = "",
  highlightedMessageId = null,
}: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda. Comece a conversa!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isIA = message.senderType === MessageSenderType.IA
        const isCustomer = message.senderType === MessageSenderType.CUSTOMER
        const isAtendente = message.senderType === MessageSenderType.ATENDENTE
        const isHighlighted = highlightedMessageId === message.id

        return (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              isCustomer ? "justify-start" : "justify-end",
              isHighlighted && "animate-pulse"
            )}
            id={`message-${message.id}`}
          >
            {isCustomer && (
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}

            {isCustomer && <div className="flex-1" />}

            <div className="flex flex-col gap-1 max-w-[70%]">
              <div
                className={cn(
                  "rounded-lg p-3",
                  isCustomer
                    ? "bg-muted"
                    : isIA
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-secondary",
                  isHighlighted && "ring-2 ring-yellow-400"
                )}
              >
                {isIA && (
                  <div className="flex items-center gap-1 mb-1 text-xs text-primary">
                    <Bot className="h-3 w-3" />
                    <span className="font-medium">IA</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">
                  <HighlightedText
                    text={message.content}
                    highlight={searchQuery}
                    isCurrentMatch={isHighlighted}
                  />
                </p>
              </div>
              <div className="flex items-center gap-2 px-1">
                <p className="text-[10px] text-muted-foreground">
                  {formatDateTime(message.timestamp)}
                </p>
                {isIA && (
                  <MessageFeedbackPopover message={message} conversation={selectedConversation} />
                )}
              </div>
            </div>

            {(isIA || isAtendente) && (
              <Avatar className="h-8 w-8">
                <AvatarFallback className={isIA ? "bg-primary/20" : ""}>
                  {isIA ? <Bot className="h-4 w-4 text-primary" /> : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            )}

            {isCustomer && <div className="flex-1" />}
          </div>
        )
      })}
    </div>
  )
}

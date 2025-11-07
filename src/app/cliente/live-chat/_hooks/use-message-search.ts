"use client"

import { useMemo, useState, useEffect } from "react"
import { Message } from "@/types"

interface UseMessageSearchProps {
  messages: Message[]
}

export function useMessageSearch({ messages }: UseMessageSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentResultIndex, setCurrentResultIndex] = useState(0)

  // Encontrar índices de mensagens que contêm a busca
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()
    return messages
      .map((message, index) => ({
        messageIndex: index,
        messageId: message.id,
        content: message.content,
      }))
      .filter((item) => item.content.toLowerCase().includes(query))
  }, [messages, searchQuery])

  const totalResults = searchResults.length
  const currentResult = totalResults > 0 ? currentResultIndex + 1 : 0

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentResultIndex(0)
  }

  const goToNext = () => {
    if (currentResultIndex < totalResults - 1) {
      setCurrentResultIndex(currentResultIndex + 1)
    }
  }

  const goToPrevious = () => {
    if (currentResultIndex > 0) {
      setCurrentResultIndex(currentResultIndex - 1)
    }
  }

  // ID da mensagem atual sendo destacada
  const currentHighlightedMessageId =
    totalResults > 0 ? searchResults[currentResultIndex]?.messageId : null

  // Auto-scroll para mensagem destacada
  useEffect(() => {
    if (currentHighlightedMessageId) {
      const messageElement = document.getElementById(`message-${currentHighlightedMessageId}`)
      if (messageElement) {
        messageElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }
    }
  }, [currentHighlightedMessageId])

  return {
    searchQuery,
    totalResults,
    currentResult,
    currentHighlightedMessageId,
    handleSearch,
    goToNext,
    goToPrevious,
    clearSearch: () => handleSearch(""),
  }
}

"use client"

import { useEffect, useRef, useState } from "react"

interface UseMessageScrollProps {
  messages: any[]
  enabled?: boolean
}

export function useMessageScroll({ messages, enabled = true }: UseMessageScrollProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messageEndRef = useRef<HTMLDivElement>(null)
  const previousScrollHeight = useRef<number>(0)
  const previousMessageCount = useRef<number>(0)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)

  // Detectar se usuário está fazendo scroll manual
  useEffect(() => {
    if (!enabled || !scrollAreaRef.current) return

    const container = scrollAreaRef.current

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
      setIsUserScrolling(!isAtBottom)
      setShowScrollButton(!isAtBottom && messages.length > 0)
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [enabled, messages.length])

  // Auto-scroll quando mensagens mudam
  useEffect(() => {
    if (!enabled || !scrollAreaRef.current || !messageEndRef.current) return

    const container = scrollAreaRef.current
    const { scrollTop, scrollHeight, clientHeight } = container

    // Verifica se usuário está próximo do final (tolerância de 100px)
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

    // Só faz scroll automático se estava perto do final OU é primeira carga
    if (isNearBottom || previousScrollHeight.current === 0 || !isUserScrolling) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
      setShowScrollButton(false)
    }

    previousScrollHeight.current = scrollHeight
    previousMessageCount.current = messages.length
  }, [messages, enabled, isUserScrolling])

  // Função para forçar scroll para o final
  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
      setIsUserScrolling(false)
      setShowScrollButton(false)
    }
  }

  return {
    scrollAreaRef,
    messageEndRef,
    scrollToBottom,
    isUserScrolling,
    showScrollButton,
  }
}

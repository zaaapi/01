"use client"

import { useAction } from "next-safe-action/hooks"
import { useToast } from "@/hooks/use-toast"
import {
  sendWhatsAppMessage,
  pauseIAConversation,
  resumeIAConversation,
  endConversation,
  updateContactData,
} from "@/actions"

export function useLiveChatActions() {
  const { toast } = useToast()

  // Send message action
  const sendMessageAction = useAction(sendWhatsAppMessage, {
    onSuccess: () => {
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso via WhatsApp.",
      })
      return undefined
    },
    onError: ({ error }) => {
      toast({
        title: "Erro ao enviar",
        description: (error.serverError as string) || "Não foi possível enviar a mensagem.",
        variant: "destructive",
      })
      return undefined
    },
  })

  // Pause IA action
  const pauseIAAction = useAction(pauseIAConversation, {
    onSuccess: () => {
      toast({
        title: "IA pausada",
        description: "A IA foi pausada para esta conversa.",
      })
      return undefined
    },
    onError: ({ error }) => {
      toast({
        title: "Erro",
        description: (error.serverError as string) || "Não foi possível pausar a IA.",
        variant: "destructive",
      })
      return undefined
    },
  })

  // Resume IA action
  const resumeIAAction = useAction(resumeIAConversation, {
    onSuccess: () => {
      toast({
        title: "IA retomada",
        description: "A IA foi retomada para esta conversa.",
      })
      return undefined
    },
    onError: ({ error }) => {
      toast({
        title: "Erro",
        description: (error.serverError as string) || "Não foi possível retomar a IA.",
        variant: "destructive",
      })
      return undefined
    },
  })

  // End conversation action
  const endConversationAction = useAction(endConversation, {
    onSuccess: () => {
      toast({
        title: "Conversa encerrada",
        description: "A conversa foi encerrada com sucesso.",
      })
      return undefined
    },
    onError: ({ error }) => {
      toast({
        title: "Erro",
        description: (error.serverError as string) || "Não foi possível encerrar a conversa.",
        variant: "destructive",
      })
      return undefined
    },
  })

  // Update contact data action
  const updateContactDataAction = useAction(updateContactData, {
    onSuccess: () => {
      toast({
        title: "Dados atualizados",
        description: "Os dados do cliente foram atualizados com sucesso.",
      })
      return undefined
    },
    onError: ({ error }) => {
      toast({
        title: "Erro",
        description: (error.serverError as string) || "Não foi possível atualizar os dados.",
        variant: "destructive",
      })
      return undefined
    },
  })

  return {
    // Execute functions
    sendMessage: sendMessageAction.execute,
    pauseIA: pauseIAAction.execute,
    resumeIA: resumeIAAction.execute,
    endConversation: endConversationAction.execute,
    updateContact: updateContactDataAction.execute,

    // Status e result
    sendMessageStatus: sendMessageAction.status,
    pauseIAStatus: pauseIAAction.status,
    resumeIAStatus: resumeIAAction.status,
    endConversationStatus: endConversationAction.status,
    updateContactStatus: updateContactDataAction.status,

    // Loading states
    isSendingMessage: sendMessageAction.status === "executing",
    isPausingIA: pauseIAAction.status === "executing",
    isResumingIA: resumeIAAction.status === "executing",
    isEndingConversation: endConversationAction.status === "executing",
    isUpdatingContact: updateContactDataAction.status === "executing",
  }
}

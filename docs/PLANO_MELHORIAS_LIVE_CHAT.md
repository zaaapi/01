# 📋 Plano de Implementação - Live Chat Improvements

> **Projeto:** Avocado - Live Chat  
> **Versão:** 1.0  
> **Data:** Novembro 2024  
> **Autor:** Time de Desenvolvimento

---

## 📖 Índice

1. [Visão Geral](#visão-geral)
2. [Análise Atual](#análise-atual)
3. [Fase 1: Fundação](#fase-1-fundação-infraestrutura)
4. [Fase 2: Refatoração Core](#fase-2-refatoração-core)
5. [Fase 3: Melhorias UX/UI](#fase-3-melhorias-de-uxui)
6. [Fase 4: Features Avançadas](#fase-4-features-avançadas)
7. [Testes e Documentação](#fase-extra-testes-e-documentação)
8. [Cronograma](#cronograma-sugerido)
9. [Métricas de Sucesso](#métricas-de-sucesso)

---

## 🎯 Visão Geral do Plano

```
Fase 1: Fundação (Infraestrutura)         → 2-3 dias
Fase 2: Refatoração Core                  → 3-4 dias
Fase 3: Melhorias de UX/UI                → 2-3 dias
Fase 4: Features Avançadas                → 3-4 dias
────────────────────────────────────────────────────
TOTAL ESTIMADO:                            10-14 dias
```

### Objetivos Principais

- ✅ Reduzir complexidade do código (744 → ~200 linhas no page.tsx)
- ✅ Melhorar performance e experiência do usuário
- ✅ Implementar best practices (SOLID, Clean Code)
- ✅ Adicionar features modernas (real-time, infinite scroll, etc)
- ✅ Garantir type safety e testabilidade

---

## 🔍 Análise Atual

### Arquitetura Atual do Live Chat

O Live Chat é uma interface de atendimento ao cliente com 4 colunas principais:

1. **Lista de Contatos** (Coluna 1)
2. **Lista de Conversas** (Coluna 2)
3. **Chat/Mensagens** (Coluna 3)
4. **Painel de Dados do Cliente** (Coluna 4)

### Fluxo de Funcionamento

```
Usuário seleciona Contato → Carrega Conversas → Seleciona Conversa → Exibe Mensagens
```

### Problemas Identificados

#### 🚨 **Problemas Críticos**

1. **Uso de `confirm()` nativo** - Quebra UX e não segue padrão shadcn/ui
2. **Console.error no código** - Viola checklist de review
3. **Arquivo monolítico** - 744 linhas violando Single Responsibility
4. **Ausência de Server Actions** - Lógica complexa no componente cliente

#### ⚠️ **Problemas de Arquitetura**

1. **Múltiplos useEffects** - 6 useEffects com dependências complexas
2. **Carregamento sequencial** - Múltiplos reloads causam flickering
3. **Sem debounce na busca** - Requisição a cada keystroke
4. **Updates não otimistas** - Experiência lenta ao enviar mensagens

#### 🎨 **Problemas de UX**

1. **Loading states inconsistentes** - Apenas texto, sem skeletons
2. **Auto-scroll sempre ativo** - Força scroll mesmo lendo mensagens antigas
3. **Feedback visual limitado** - Sem status de entrega, "digitando", etc
4. **Sem keyboard shortcuts** - Navegação apenas por mouse

#### ⚡ **Problemas de Performance**

1. **Recarregamento completo** - Toda lista é recarregada a cada mudança
2. **Sem cache** - Requisições duplicadas
3. **Type safety fraco** - Non-null assertions perigosas

---

## 📅 FASE 1: Fundação (Infraestrutura)

**Objetivo:** Criar base sólida para as próximas melhorias

**Duração:** 2-3 dias

### 1.1 - Criar Server Actions ⭐ CRÍTICO

**Arquivos a criar:**

```
src/actions/
├── send-whatsapp-message/
│   ├── index.ts
│   └── schema.ts
├── pause-ia-conversation/
│   ├── index.ts
│   └── schema.ts
├── resume-ia-conversation/
│   ├── index.ts
│   └── schema.ts
├── end-conversation/
│   ├── index.ts
│   └── schema.ts
└── update-contact-data/
    ├── index.ts
    └── schema.ts
```

#### Exemplo: Send WhatsApp Message Action

**Schema:**

```typescript
// src/actions/send-whatsapp-message/schema.ts
import { z } from "zod"

export const sendWhatsAppMessageSchema = z.object({
  tenantId: z.string().uuid("ID do tenant inválido"),
  contactId: z.string().uuid("ID do contato inválido"),
  conversationId: z.string().uuid("ID da conversa inválido"),
  message: z.string().min(1, "Mensagem não pode estar vazia").max(4096, "Mensagem muito longa"),
})

export type SendWhatsAppMessageInput = z.infer<typeof sendWhatsAppMessageSchema>
```

**Action:**

```typescript
// src/actions/send-whatsapp-message/index.ts
"use server"

import { action } from "@/lib/safe-action"
import { sendWhatsAppMessageSchema } from "./schema"
import { n8nClient } from "@/lib/n8n-client"
import { supabase } from "@/db"
import { revalidatePath } from "next/cache"

export const sendWhatsAppMessage = action(
  sendWhatsAppMessageSchema,
  async ({ tenantId, contactId, conversationId, message }) => {
    try {
      // Enviar via N8N
      const result = await n8nClient.sendWhatsAppMessage({
        tenantId,
        contactId,
        conversationId,
        message,
      })

      // Atualizar lastMessageAt
      const { error: updateError } = await supabase
        .from("conversations")
        .update({ lastMessageAt: new Date().toISOString() })
        .eq("id", conversationId)

      if (updateError) {
        throw new Error(`Erro ao atualizar conversa: ${updateError.message}`)
      }

      // Revalidar cache
      revalidatePath("/cliente/live-chat")

      return {
        success: true,
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Erro ao enviar mensagem")
    }
  }
)
```

#### Exemplo: Pause IA Conversation Action

```typescript
// src/actions/pause-ia-conversation/schema.ts
import { z } from "zod"

export const pauseIAConversationSchema = z.object({
  tenantId: z.string().uuid(),
  conversationId: z.string().uuid(),
})
```

```typescript
// src/actions/pause-ia-conversation/index.ts
"use server"

import { action } from "@/lib/safe-action"
import { pauseIAConversationSchema } from "./schema"
import { n8nClient } from "@/lib/n8n-client"
import { supabase } from "@/db"

export const pauseIAConversation = action(
  pauseIAConversationSchema,
  async ({ tenantId, conversationId }) => {
    // Chamar N8N
    await n8nClient.pauseIAConversation({ tenantId, conversationId })

    // Atualizar Supabase
    const { error } = await supabase
      .from("conversations")
      .update({ iaActive: false })
      .eq("id", conversationId)

    if (error) throw new Error(error.message)

    return { success: true }
  }
)
```

**Checklist Fase 1.1:**

- [ ] Criar `sendWhatsAppMessage` action
- [ ] Criar `pauseIAConversation` action
- [ ] Criar `resumeIAConversation` action
- [ ] Criar `endConversation` action
- [ ] Criar `updateContactData` action
- [ ] Adicionar testes unitários para schemas
- [ ] Documentar cada action (JSDoc)

---

### 1.2 - Criar Hooks Customizados

**Arquivos a criar:**

```
app/cliente/live-chat/_hooks/
├── use-live-chat-data.ts       # Gerenciar estado dos dados
├── use-live-chat-actions.ts    # Handlers de ações
├── use-debounced-search.ts     # Busca com debounce
└── use-message-scroll.ts       # Lógica de scroll inteligente
```

#### Hook: use-live-chat-data

```typescript
// app/cliente/live-chat/_hooks/use-live-chat-data.ts
"use client"

import { useState, useEffect } from "react"
import { useData } from "@/lib/contexts/data-provider"
import { Contact, Conversation, Message, ConversationStatus } from "@/types"

interface UseLiveChatDataProps {
  tenantId: string | undefined
  selectedContactId: string | null
  selectedConversationId: string | null
  searchQuery: string
  searchField: "name" | "phone" | "email"
  statusFilter: ConversationStatus | "all"
}

export function useLiveChatData({
  tenantId,
  selectedContactId,
  selectedConversationId,
  searchQuery,
  searchField,
  statusFilter,
}: UseLiveChatDataProps) {
  const { fetchContacts, fetchContact, fetchConversationsByContact, fetchMessagesByConversation } =
    useData()

  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)

  // Load contacts
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
        throw error
      } finally {
        setIsLoadingContacts(false)
      }
    }

    loadContacts()
  }, [tenantId, searchQuery, searchField, fetchContacts])

  // Load selected contact
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
        throw error
      }
    }

    loadContact()
  }, [selectedContactId, fetchContact])

  // Load conversations
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
      } catch (error) {
        throw error
      } finally {
        setIsLoadingConversations(false)
      }
    }

    loadConversations()
  }, [selectedContactId, tenantId, statusFilter, fetchConversationsByContact])

  // Load messages
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
        throw error
      } finally {
        setIsLoadingMessages(false)
      }
    }

    loadMessages()
  }, [selectedConversationId, fetchMessagesByConversation])

  return {
    // Data
    contacts,
    selectedContact,
    conversations,
    selectedConversation,
    messages,

    // Loading states
    isLoadingContacts,
    isLoadingConversations,
    isLoadingMessages,

    // Setters (para updates otimistas)
    setContacts,
    setSelectedContact,
    setConversations,
    setSelectedConversation,
    setMessages,
  }
}
```

#### Hook: use-debounced-search

```typescript
// app/cliente/live-chat/_hooks/use-debounced-search.ts
"use client"

import { useState, useEffect } from "react"

export function useDebouncedSearch(value: string, delay: number = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

#### Hook: use-message-scroll

```typescript
// app/cliente/live-chat/_hooks/use-message-scroll.ts
"use client"

import { useEffect, useRef } from "react"

interface UseMessageScrollProps {
  messages: any[]
  enabled?: boolean
}

export function useMessageScroll({ messages, enabled = true }: UseMessageScrollProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messageEndRef = useRef<HTMLDivElement>(null)
  const previousScrollHeight = useRef<number>(0)

  useEffect(() => {
    if (!enabled || !scrollAreaRef.current || !messageEndRef.current) return

    const container = scrollAreaRef.current
    const { scrollTop, scrollHeight, clientHeight } = container

    // Verifica se usuário está próximo do final (tolerância de 100px)
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

    // Só faz scroll automático se estava perto do final
    if (isNearBottom || previousScrollHeight.current === 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    }

    previousScrollHeight.current = scrollHeight
  }, [messages, enabled])

  return { scrollAreaRef, messageEndRef }
}
```

#### Hook: use-live-chat-actions

```typescript
// app/cliente/live-chat/_hooks/use-live-chat-actions.ts
"use client"

import { useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { useToast } from "@/hooks/use-toast"
import {
  sendWhatsAppMessage,
  pauseIAConversation,
  resumeIAConversation,
  endConversation,
} from "@/actions" // Barrel export

export function useLiveChatActions() {
  const { toast } = useToast()
  const [isSending, setIsSending] = useState(false)

  // Send message action
  const { execute: executeSendMessage } = useAction(sendWhatsAppMessage, {
    onSuccess: ({ data }) => {
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso via WhatsApp.",
      })
    },
    onError: ({ error }) => {
      toast({
        title: "Erro ao enviar",
        description: error.serverError || "Não foi possível enviar a mensagem.",
        variant: "destructive",
      })
    },
  })

  // Pause IA action
  const { execute: executePauseIA } = useAction(pauseIAConversation, {
    onSuccess: () => {
      toast({
        title: "IA pausada",
        description: "A IA foi pausada para esta conversa.",
      })
    },
    onError: ({ error }) => {
      toast({
        title: "Erro",
        description: error.serverError || "Não foi possível pausar a IA.",
        variant: "destructive",
      })
    },
  })

  // Resume IA action
  const { execute: executeResumeIA } = useAction(resumeIAConversation, {
    onSuccess: () => {
      toast({
        title: "IA retomada",
        description: "A IA foi retomada para esta conversa.",
      })
    },
    onError: ({ error }) => {
      toast({
        title: "Erro",
        description: error.serverError || "Não foi possível retomar a IA.",
        variant: "destructive",
      })
    },
  })

  // End conversation action
  const { execute: executeEndConversation } = useAction(endConversation, {
    onSuccess: () => {
      toast({
        title: "Conversa encerrada",
        description: "A conversa foi encerrada com sucesso.",
      })
    },
    onError: ({ error }) => {
      toast({
        title: "Erro",
        description: error.serverError || "Não foi possível encerrar a conversa.",
        variant: "destructive",
      })
    },
  })

  return {
    sendMessage: executeSendMessage,
    pauseIA: executePauseIA,
    resumeIA: executeResumeIA,
    endConversation: executeEndConversation,
    isSending,
  }
}
```

**Checklist Fase 1.2:**

- [ ] Criar `use-live-chat-data.ts`
- [ ] Criar `use-live-chat-actions.ts`
- [ ] Criar `use-debounced-search.ts`
- [ ] Criar `use-message-scroll.ts`
- [ ] Adicionar error boundaries nos hooks
- [ ] Testar hooks isoladamente

---

### 1.3 - Criar Componentes Base

**Arquivos a criar:**

```
app/cliente/live-chat/_components/
├── skeletons/
│   ├── contact-skeleton.tsx
│   ├── conversation-skeleton.tsx
│   └── message-skeleton.tsx
├── dialogs/
│   ├── end-conversation-dialog.tsx
│   └── confirm-action-dialog.tsx
└── indicators/
    ├── typing-indicator.tsx
    └── message-status.tsx
```

#### Component: Contact Skeleton

```typescript
// app/cliente/live-chat/_components/skeletons/contact-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function ContactSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### Component: End Conversation Dialog

```typescript
// app/cliente/live-chat/_components/dialogs/end-conversation-dialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface EndConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  contactName?: string;
}

export function EndConversationDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  contactName,
}: EndConversationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Encerrar conversa</DialogTitle>
          </div>
          <DialogDescription>
            Tem certeza que deseja encerrar a conversa com{" "}
            <strong>{contactName || "este cliente"}</strong>? Esta ação não pode
            ser desfeita e a IA será desativada.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Encerrando..." : "Encerrar conversa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### Component: Message Status

```typescript
// app/cliente/live-chat/_components/indicators/message-status.tsx
import { Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export enum MessageDeliveryStatus {
  SENDING = "sending",
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
}

interface MessageStatusProps {
  status?: MessageDeliveryStatus;
  className?: string;
}

export function MessageStatus({ status, className }: MessageStatusProps) {
  if (!status) return null;

  const iconMap = {
    [MessageDeliveryStatus.SENDING]: (
      <Clock className="h-3 w-3 text-muted-foreground" />
    ),
    [MessageDeliveryStatus.SENT]: (
      <Check className="h-3 w-3 text-muted-foreground" />
    ),
    [MessageDeliveryStatus.DELIVERED]: (
      <CheckCheck className="h-3 w-3 text-muted-foreground" />
    ),
    [MessageDeliveryStatus.READ]: (
      <CheckCheck className="h-3 w-3 text-blue-500" />
    ),
    [MessageDeliveryStatus.FAILED]: (
      <AlertCircle className="h-3 w-3 text-destructive" />
    ),
  };

  return (
    <span className={cn("inline-flex items-center", className)}>
      {iconMap[status]}
    </span>
  );
}
```

#### Component: Typing Indicator

```typescript
// app/cliente/live-chat/_components/indicators/typing-indicator.tsx
"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface TypingIndicatorProps {
  userName?: string;
}

export function TypingIndicator({
  userName = "Cliente",
}: TypingIndicatorProps) {
  return (
    <div className="flex gap-3 items-center">
      <Avatar className="h-8 w-8">
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="rounded-lg p-3 bg-muted">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      <span className="text-xs text-muted-foreground">
        {userName} está digitando...
      </span>
    </div>
  );
}
```

**Checklist Fase 1.3:**

- [ ] Criar skeletons para todas as listas
- [ ] Criar `EndConversationDialog`
- [ ] Criar `ConfirmActionDialog` (genérico)
- [ ] Criar `TypingIndicator`
- [ ] Criar `MessageStatus`
- [ ] Testar cada componente isoladamente

---

## 📅 FASE 2: Refatoração Core

**Objetivo:** Refatorar `page.tsx` usando a infraestrutura criada

**Duração:** 3-4 dias

### 2.1 - Refatorar page.tsx

**Objetivo:** Reduzir de 744 linhas para ~200 linhas

#### page.tsx Refatorado

```typescript
// app/cliente/live-chat/page.tsx (REFATORADO)
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useLiveChatData } from "./_hooks/use-live-chat-data";
import { useLiveChatActions } from "./_hooks/use-live-chat-actions";
import { useDebouncedSearch } from "./_hooks/use-debounced-search";
import { useMessageScroll } from "./_hooks/use-message-scroll";
import { ConversationStatus } from "@/types";

// Components
import { ContactListPanel } from "./_components/panels/contact-list-panel";
import { ConversationListPanel } from "./_components/panels/conversation-list-panel";
import { ChatPanel } from "./_components/panels/chat-panel";
import { CustomerDataPanel } from "./_components/customer-data-panel";
import { QuickRepliesSheet } from "./_components/quick-replies-sheet";
import { ConversationFeedbackModal } from "./_components/conversation-feedback-modal";
import { EndConversationDialog } from "./_components/dialogs/end-conversation-dialog";
import { EmptyTenantState } from "./_components/empty-tenant-state";

export default function LiveChatPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  // UI State
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null
  );
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | "all">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"name" | "phone" | "email">(
    "name"
  );
  const [messageInput, setMessageInput] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showConversationFeedback, setShowConversationFeedback] =
    useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);

  // Debounced search
  const debouncedSearch = useDebouncedSearch(searchQuery, 500);

  // Data loading via custom hook
  const {
    contacts,
    selectedContact,
    conversations,
    selectedConversation,
    messages,
    isLoadingContacts,
    isLoadingConversations,
    isLoadingMessages,
    setMessages,
  } = useLiveChatData({
    tenantId,
    selectedContactId,
    selectedConversationId,
    searchQuery: debouncedSearch,
    searchField,
    statusFilter,
  });

  // Actions via custom hook
  const { sendMessage, pauseIA, resumeIA, endConversation } =
    useLiveChatActions();

  // Smart scroll
  const { scrollAreaRef, messageEndRef } = useMessageScroll({
    messages,
    enabled: !!selectedConversationId,
  });

  // Handlers
  const handleSendMessage = async () => {
    if (
      !messageInput.trim() ||
      !selectedConversationId ||
      !tenantId ||
      !selectedContactId
    ) {
      return;
    }

    // Update otimista
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      content: messageInput.trim(),
      senderType: "ATENDENTE" as const,
      timestamp: new Date().toISOString(),
      conversationId: selectedConversationId,
      status: "sending" as const,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    const messageToSend = messageInput;
    setMessageInput("");

    // Enviar via action
    await sendMessage({
      tenantId,
      contactId: selectedContactId,
      conversationId: selectedConversationId,
      message: messageToSend,
    });
  };

  const handleToggleIA = async () => {
    if (!selectedConversation || !tenantId || !selectedConversationId) return;

    const isPausing = selectedConversation.iaActive;

    if (isPausing) {
      await pauseIA({ tenantId, conversationId: selectedConversationId });
    } else {
      await resumeIA({ tenantId, conversationId: selectedConversationId });
    }
  };

  const handleEndConversation = async () => {
    if (!selectedConversationId || !tenantId || !selectedContactId) return;

    await endConversation({
      tenantId,
      conversationId: selectedConversationId,
      contactId: selectedContactId,
    });

    setShowEndDialog(false);
  };

  // Early return for no tenant
  if (!tenantId) {
    return <EmptyTenantState />;
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
      />

      {/* Coluna 4: Dados do Cliente */}
      <div className="w-96 border-l bg-card">
        {selectedContact ? (
          <CustomerDataPanel
            contact={selectedContact}
            onCopy={() => {
              /* handler */
            }}
            onUpdate={async (data) => {
              /* handler */
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

      {/* Modais */}
      <QuickRepliesSheet
        open={showQuickReplies}
        onOpenChange={setShowQuickReplies}
        tenantId={tenantId}
        onSelect={(qr) => {
          setMessageInput(qr.message);
          setShowQuickReplies(false);
        }}
      />

      <ConversationFeedbackModal
        open={showConversationFeedback}
        onOpenChange={setShowConversationFeedback}
        conversation={selectedConversation}
        contact={selectedContact}
      />

      <EndConversationDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
        onConfirm={handleEndConversation}
        contactName={selectedContact?.name}
      />
    </div>
  );
}
```

**Checklist Fase 2.1:**

- [ ] Extrair lógica para hooks
- [ ] Substituir handlers inline por hooks
- [ ] Implementar updates otimistas
- [ ] Remover todos os `console.error`
- [ ] Adicionar error boundaries
- [ ] Testar fluxo completo
- [ ] Reduzir de 744 para ~200 linhas

---

### 2.2 - Criar Componentes de Painel

**Arquivos a criar:**

```
app/cliente/live-chat/_components/panels/
├── contact-list-panel.tsx
├── conversation-list-panel.tsx
└── chat-panel.tsx
```

#### Component: Contact List Panel

```typescript
// app/cliente/live-chat/_components/panels/contact-list-panel.tsx
"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { ContactList } from "../contact-list";
import { ContactSkeleton } from "../skeletons/contact-skeleton";
import { Contact } from "@/types";

interface ContactListPanelProps {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (id: string) => void;
  isLoading: boolean;
  searchQuery: string;
  searchField: "name" | "phone" | "email";
  onSearchQueryChange: (query: string) => void;
  onSearchFieldChange: (field: "name" | "phone" | "email") => void;
}

export function ContactListPanel({
  contacts,
  selectedContactId,
  onSelectContact,
  isLoading,
  searchQuery,
  searchField,
  onSearchQueryChange,
  onSearchFieldChange,
}: ContactListPanelProps) {
  const fieldLabels = {
    name: "Nome",
    phone: "Telefone",
    email: "Email",
  };

  return (
    <div className="w-80 border-r flex flex-col bg-card">
      <div className="p-4 border-b space-y-4">
        <h2 className="font-semibold text-lg">Contatos</h2>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-24">
                {fieldLabels[searchField]}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1">
              {(
                Object.keys(fieldLabels) as Array<keyof typeof fieldLabels>
              ).map((field) => (
                <Button
                  key={field}
                  variant={searchField === field ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onSearchFieldChange(field)}
                >
                  {fieldLabels[field]}
                </Button>
              ))}
            </PopoverContent>
          </Popover>
          <Input
            placeholder={`Buscar por ${fieldLabels[
              searchField
            ].toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <ContactSkeleton />
        ) : (
          <ContactList
            contacts={contacts}
            selectedContactId={selectedContactId}
            onSelectContact={onSelectContact}
          />
        )}
      </ScrollArea>
    </div>
  );
}
```

**Checklist Fase 2.2:**

- [ ] Criar `ContactListPanel`
- [ ] Criar `ConversationListPanel`
- [ ] Criar `ChatPanel`
- [ ] Integrar skeletons
- [ ] Adicionar keyboard navigation
- [ ] Testar responsividade

---

## 📅 FASE 3: Melhorias de UX/UI

**Objetivo:** Polimento da experiência do usuário

**Duração:** 2-3 dias

### 3.1 - Implementar Keyboard Shortcuts

```typescript
// app/cliente/live-chat/_hooks/use-keyboard-shortcuts.ts
"use client"

import { useEffect } from "react"

interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  callback: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : true
        const metaMatch = shortcut.meta ? e.metaKey : true
        const shiftMatch = shortcut.shift ? e.shiftKey : true
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()

        if (ctrlMatch && metaMatch && shiftMatch && keyMatch) {
          e.preventDefault()
          shortcut.callback()
        }
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts, enabled])
}

// Uso no page.tsx:
// useKeyboardShortcuts([
//   { key: "k", ctrl: true, callback: () => searchInputRef.current?.focus(), description: "Buscar" },
//   { key: "/", callback: () => setShowQuickReplies(true), description: "Respostas rápidas" },
//   { key: "Escape", callback: () => setShowQuickReplies(false), description: "Fechar modal" },
// ])
```

**Checklist Fase 3.1:**

- [ ] Criar hook de keyboard shortcuts
- [ ] Implementar atalhos principais (Ctrl+K, /, Esc, Enter)
- [ ] Criar componente de ajuda (Ctrl+?)
- [ ] Adicionar tooltips com atalhos
- [ ] Testar em diferentes navegadores

---

### 3.2 - React Query para Caching

**Instalação:**

```bash
npm install @tanstack/react-query
```

**Configuração:**

```typescript
// lib/query-client.ts
"use client"

import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 segundos
      gcTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
```

```typescript
// app/layout.tsx (adicionar provider)
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

**Refatorar hooks com React Query:**

```typescript
// app/cliente/live-chat/_hooks/use-live-chat-data.ts (refatorar)
import { useQuery, useQueryClient } from "@tanstack/react-query"

export function useLiveChatData({ tenantId, selectedContactId, ... }) {
  const queryClient = useQueryClient()

  // Contacts query
  const {
    data: contacts = [],
    isLoading: isLoadingContacts,
  } = useQuery({
    queryKey: ["contacts", tenantId, searchQuery, searchField],
    queryFn: () => fetchContacts(tenantId!, { search: searchQuery, searchField }),
    enabled: !!tenantId,
  })

  // Conversations query
  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
  } = useQuery({
    queryKey: ["conversations", selectedContactId, statusFilter],
    queryFn: () => fetchConversationsByContact(selectedContactId!, tenantId!, ...),
    enabled: !!selectedContactId && !!tenantId,
  })

  // Messages query
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
  } = useQuery({
    queryKey: ["messages", selectedConversationId],
    queryFn: () => fetchMessagesByConversation(selectedConversationId!),
    enabled: !!selectedConversationId,
  })

  // Mutation para invalidar cache
  const invalidateMessages = () => {
    queryClient.invalidateQueries({ queryKey: ["messages", selectedConversationId] })
  }

  return {
    contacts,
    conversations,
    messages,
    isLoadingContacts,
    isLoadingConversations,
    isLoadingMessages,
    invalidateMessages,
  }
}
```

**Checklist Fase 3.2:**

- [ ] Instalar `@tanstack/react-query`
- [ ] Configurar QueryClient
- [ ] Adicionar provider no layout
- [ ] Refatorar hooks para usar React Query
- [ ] Implementar invalidação de cache
- [ ] Adicionar React Query DevTools (dev only)

---

### 3.3 - Outras Melhorias de UX

**Checklist Fase 3.3:**

- [ ] Adicionar animações de transição (framer-motion)
- [ ] Implementar toasts informativos
- [ ] Adicionar confirmações visuais
- [ ] Melhorar estados de erro
- [ ] Implementar retry automático
- [ ] Adicionar modo offline

---

## 📅 FASE 4: Features Avançadas

**Objetivo:** Adicionar funcionalidades extras

**Duração:** 3-4 dias

### 4.1 - Busca dentro da Conversa

```typescript
// app/cliente/live-chat/_components/chat-search.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, ChevronUp, ChevronDown } from "lucide-react";

interface ChatSearchProps {
  onSearch: (query: string) => void;
  totalResults?: number;
  currentResult?: number;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function ChatSearch({
  onSearch,
  totalResults,
  currentResult,
  onNext,
  onPrevious,
}: ChatSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  if (!isOpen) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
        <Search className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Buscar na conversa..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="max-w-xs"
        autoFocus
      />
      {totalResults !== undefined && totalResults > 0 && (
        <>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {currentResult}/{totalResults}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              disabled={!currentResult || currentResult <= 1}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              disabled={!currentResult || currentResult >= totalResults}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setIsOpen(false);
          setQuery("");
          onSearch("");
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

**Checklist Fase 4.1:**

- [ ] Criar componente `ChatSearch`
- [ ] Implementar highlight de texto
- [ ] Adicionar navegação entre resultados
- [ ] Integrar com keyboard shortcuts (Ctrl+F)
- [ ] Adicionar contagem de resultados

---

### 4.2 - Histórico Infinito (Load More)

```typescript
// app/cliente/live-chat/_hooks/use-infinite-messages.ts
import { useInfiniteQuery } from "@tanstack/react-query"

export function useInfiniteMessages(conversationId: string | null) {
  return useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam = 0 }) =>
      fetchMessagesByConversation(conversationId!, {
        offset: pageParam,
        limit: 50,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 50) return undefined
      return allPages.length * 50
    },
    enabled: !!conversationId,
  })
}
```

**Uso:**

```typescript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useInfiniteMessages(selectedConversationId);

const messages = data?.pages.flat() ?? [];

// Botão no topo
{
  hasNextPage && (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => fetchNextPage()}
      disabled={isFetchingNextPage}
      className="w-full"
    >
      {isFetchingNextPage ? "Carregando..." : "Carregar mensagens antigas"}
    </Button>
  );
}
```

**Checklist Fase 4.2:**

- [ ] Implementar `useInfiniteMessages`
- [ ] Adicionar botão "Load More"
- [ ] Implementar scroll virtualization (opcional)
- [ ] Manter posição do scroll após load
- [ ] Testar com grandes volumes

---

### 4.3 - Notificações em Tempo Real

```typescript
// lib/realtime-client.ts
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const realtimeClient = createClient(supabaseUrl, supabaseAnonKey)

// Hook para subscrições
export function useRealtimeMessages(conversationId: string | null) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!conversationId) return

    const channel = realtimeClient
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload) => {
          // Atualizar cache com nova mensagem
          queryClient.setQueryData(["messages", conversationId], (old: Message[]) => [
            ...old,
            payload.new as Message,
          ])

          // Tocar som de notificação
          playNotificationSound()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [conversationId, queryClient])
}
```

**Checklist Fase 4.3:**

- [ ] Configurar Supabase Realtime
- [ ] Criar `useRealtimeMessages` hook
- [ ] Criar `useRealtimeConversations` hook
- [ ] Adicionar notificação de nova mensagem (toast)
- [ ] Implementar som de notificação (opcional)
- [ ] Testar conexão/desconexão

---

### 4.4 - Analytics e Métricas

```typescript
// app/cliente/live-chat/_components/metrics-panel.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Clock, ThumbsUp, Zap } from "lucide-react";

interface MetricsPanelProps {
  totalMessages: number;
  avgResponseTime: number;
  satisfactionRate: number;
  iaUsageRate: number;
}

export function MetricsPanel({
  totalMessages,
  avgResponseTime,
  satisfactionRate,
  iaUsageRate,
}: MetricsPanelProps) {
  const metrics = [
    {
      label: "Total de Mensagens",
      value: totalMessages,
      icon: MessageSquare,
      color: "text-blue-500",
    },
    {
      label: "Tempo Médio de Resposta",
      value: `${avgResponseTime}min`,
      icon: Clock,
      color: "text-green-500",
    },
    {
      label: "Taxa de Satisfação",
      value: `${satisfactionRate}%`,
      icon: ThumbsUp,
      color: "text-yellow-500",
    },
    {
      label: "Uso da IA",
      value: `${iaUsageRate}%`,
      icon: Zap,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon className={`h-4 w-4 ${metric.color}`} />
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{metric.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
```

**Checklist Fase 4.4:**

- [ ] Criar `MetricsPanel` component
- [ ] Implementar cálculo de métricas
- [ ] Adicionar gráficos (recharts)
- [ ] Criar dashboard de métricas
- [ ] Exportar relatórios (CSV/PDF)

---

## 🧪 FASE EXTRA: Testes e Documentação

### Testes

**Estrutura de Testes:**

```
__tests__/
└── live-chat/
    ├── hooks/
    │   ├── use-live-chat-data.test.ts
    │   ├── use-live-chat-actions.test.ts
    │   └── use-debounced-search.test.ts
    ├── components/
    │   ├── contact-list-panel.test.tsx
    │   └── end-conversation-dialog.test.tsx
    └── actions/
        └── send-whatsapp-message.test.ts
```

**Exemplo de teste:**

```typescript
// __tests__/live-chat/hooks/use-live-chat-data.test.ts
import { renderHook, waitFor } from "@testing-library/react"
import { useLiveChatData } from "@/app/cliente/live-chat/_hooks/use-live-chat-data"

describe("useLiveChatData", () => {
  it("should load contacts on mount", async () => {
    const { result } = renderHook(() =>
      useLiveChatData({
        tenantId: "test-tenant",
        selectedContactId: null,
        selectedConversationId: null,
        searchQuery: "",
        searchField: "name",
        statusFilter: "all",
      })
    )

    expect(result.current.isLoadingContacts).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoadingContacts).toBe(false)
      expect(result.current.contacts).toHaveLength(3)
    })
  })
})
```

**Checklist Testes:**

- [ ] Unit tests para hooks
- [ ] Unit tests para Server Actions
- [ ] Integration tests para fluxos críticos
- [ ] E2E tests com Playwright
- [ ] Coverage mínimo de 80%

---

### Documentação

**Criar:**

```
docs/
└── live-chat/
    ├── ARCHITECTURE.md
    ├── CONTRIBUTING.md
    ├── API.md
    └── KEYBOARD_SHORTCUTS.md
```

**Exemplo - ARCHITECTURE.md:**

```markdown
# Live Chat - Arquitetura

## Visão Geral

O Live Chat segue uma arquitetura em camadas:

1. **Apresentação**: Componentes React (pages, components)
2. **Lógica**: Hooks customizados (use-\*)
3. **Dados**: Server Actions (actions/)
4. **Infraestrutura**: Supabase, N8N

## Fluxo de Dados
```

User Action → Hook → Server Action → N8N/Supabase → React Query → UI Update

```

## Principais Hooks

- `useLiveChatData`: Gerencia estado de dados
- `useLiveChatActions`: Gerencia ações do usuário
- `useDebouncedSearch`: Busca com debounce
- `useMessageScroll`: Scroll inteligente

## Componentes

### Painéis (Panels)
- ContactListPanel
- ConversationListPanel
- ChatPanel

### Dialogs
- EndConversationDialog
- ConversationFeedbackModal

### Indicators
- TypingIndicator
- MessageStatus

## Server Actions

Todas as operações críticas usam Server Actions:
- sendWhatsAppMessage
- pauseIAConversation
- resumeIAConversation
- endConversation

## Cache Strategy

React Query com:
- staleTime: 30s
- gcTime: 5min
- Invalidação manual após mutations
```

**Checklist Documentação:**

- [ ] README.md atualizado
- [ ] Documentação de arquitetura
- [ ] Guia de contribuição
- [ ] JSDoc em todos os exports públicos
- [ ] Storybook para componentes (opcional)

---

## 📊 Cronograma Sugerido

| Semana | Fase                | Dias | Tarefas Principais                         |
| ------ | ------------------- | ---- | ------------------------------------------ |
| 1      | Fase 1: Fundação    | 3    | Server Actions, Hooks, Componentes Base    |
| 2      | Fase 2: Refatoração | 4    | Refatorar page.tsx, Criar Painéis          |
| 3      | Fase 3: UX/UI       | 3    | Keyboard Shortcuts, React Query, Melhorias |
| 4      | Fase 4: Features    | 4    | Busca, Infinite Scroll, Realtime, Métricas |

**Total:** 10-14 dias úteis

---

## 🎯 Métricas de Sucesso

Após implementação, espera-se:

### Performance

- ✅ **FCP** (First Contentful Paint) < 1.5s
- ✅ **TTI** (Time to Interactive) < 3.5s
- ✅ **LCP** (Largest Contentful Paint) < 2.5s
- ✅ **50% menos** requisições ao backend (React Query cache)

### Código

- ✅ **Redução de 70%** no tamanho do `page.tsx` (744 → ~200 linhas)
- ✅ **Type Safety:** 0 erros TypeScript
- ✅ **Cobertura de testes:** > 80%
- ✅ **0 console.log/error** esquecidos

### UX

- ✅ **Acessibilidade:** Score 95+ no Lighthouse
- ✅ **Keyboard Navigation:** 100% navegável
- ✅ **Loading States:** Skeletons em todos os carregamentos
- ✅ **Feedback Visual:** Status de todas as ações

### Features

- ✅ **Realtime:** Mensagens aparecem instantaneamente
- ✅ **Offline:** Graceful degradation
- ✅ **Search:** Busca rápida com highlight
- ✅ **History:** Infinite scroll implementado

---

## 🚀 Como Começar

### 1. Criar branch de desenvolvimento

```bash
git checkout -b feature/live-chat-improvements
```

### 2. Instalar dependências necessárias

```bash
npm install @tanstack/react-query
```

### 3. Começar pela Fase 1.1 (Server Actions)

Criar as Server Actions é crítico pois todas as outras fases dependem delas.

### 4. Commitar frequentemente

Seguir conventional commits:

```bash
git commit -m "feat: adiciona server action para envio de mensagens"
git commit -m "refactor: extrai lógica de dados para hook customizado"
git commit -m "fix: corrige auto-scroll em mensagens antigas"
```

### 5. Abrir PRs incrementais

Não esperar tudo ficar pronto. Abrir PRs por fase ou sub-fase.

---

## 📝 Notas Finais

### Priorização

Se o tempo for limitado, priorize:

1. **Alta Prioridade** (Crítico):
   - Server Actions
   - Refatoração do page.tsx
   - Debounce na busca
   - Substituir confirm() por Dialog
   - Updates otimistas

2. **Média Prioridade** (Importante):
   - Skeletons
   - React Query
   - Keyboard shortcuts
   - Smart scroll

3. **Baixa Prioridade** (Nice to have):
   - Busca na conversa
   - Infinite scroll
   - Realtime (se N8N já envia webhooks)
   - Métricas

### Riscos e Mitigações

| Risco                          | Impacto | Mitigação                     |
| ------------------------------ | ------- | ----------------------------- |
| Breaking changes em produção   | Alto    | Feature flags, deploy gradual |
| Performance pior após refactor | Médio   | Benchmarks antes/depois       |
| Bugs em fluxos críticos        | Alto    | Testes E2E antes de merge     |
| Dependências incompatíveis     | Baixo   | Lock versions no package.json |

---

## 🤝 Contribuindo

Ao trabalhar neste plano:

1. **Siga as regras do Cursor** (docs/repo_specific_rule)
2. **Use TypeScript strict mode**
3. **Adicione testes** para novos hooks/components
4. **Documente** mudanças significativas
5. **Peça review** antes de merge

---

**Versão:** 1.0  
**Última Atualização:** Novembro 2024  
**Próxima Revisão:** Após conclusão da Fase 2

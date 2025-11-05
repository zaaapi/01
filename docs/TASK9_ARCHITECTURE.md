# Task 9: Arquitetura da Integração de Feedbacks

## Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                     Página de Feedbacks                          │
│                  (/super-admin/feedbacks)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ usa
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DataProvider                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  fetchFeedbacks()                                         │  │
│  │  └─> SELECT com JOINs (tenant, user, conversation, msg)  │  │
│  │                                                            │  │
│  │  fetchConversationMessages(conversationId)                │  │
│  │  └─> SELECT messages WHERE conversation_id = ?           │  │
│  │                                                            │  │
│  │  updateFeedback(id, updates)                              │  │
│  │  └─> UPDATE feedbacks SET ... WHERE id = ?               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ acessa
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Supabase                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Table: feedbacks                                         │  │
│  │  ├─ id (uuid, PK)                                         │  │
│  │  ├─ tenant_id (uuid, FK → tenants)                       │  │
│  │  ├─ user_id (uuid, FK → users)                           │  │
│  │  ├─ conversation_id (uuid, FK → conversations)           │  │
│  │  ├─ message_id (uuid, FK → messages, nullable)           │  │
│  │  ├─ feedback_type (enum: like/dislike)                   │  │
│  │  ├─ feedback_text (text, nullable)                       │  │
│  │  ├─ feedback_status (enum: Em Aberto/Sendo Tratado/...)  │  │
│  │  ├─ super_admin_comment (text, nullable)                 │  │
│  │  ├─ created_at (timestamp)                               │  │
│  │  └─ updated_at (timestamp)                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Table: messages                                          │  │
│  │  └─ Relacionada via conversation_id                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Fluxo de Dados

### 1. Listagem de Feedbacks

```
┌─────────┐      ┌──────────────┐      ┌───────────┐      ┌──────────┐
│  User   │──1──▶│ FeedbacksPage│──2──▶│DataProvider│──3──▶│ Supabase │
└─────────┘      └──────────────┘      └───────────┘      └──────────┘
                        │                      │                  │
                        │◀──────6────────────  │◀────5────────────│
                        │    Feedbacks[]       │  DB Response     │
                        │                      │                  │
                        └───7──▶ Render Table  │                  │
```

**Etapas:**

1. Usuário acessa a página `/super-admin/feedbacks`
2. `useEffect` chama `fetchFeedbacks()`
3. DataProvider executa query com JOINs no Supabase
4. Supabase processa query e retorna dados
5. DataProvider mapeia dados para tipo `Feedback[]`
6. Página recebe feedbacks e atualiza estado
7. Tabela é renderizada com dados

### 2. Visualização de Detalhes

```
┌─────────┐      ┌──────────────────┐      ┌──────────────┐      ┌──────────┐
│  User   │──1──▶│ FeedbacksPage    │──2──▶│DetailsModal  │──3──▶│  Supabase│
└─────────┘      └──────────────────┘      └──────────────┘      └──────────┘
                                                   │                    │
                  Click "Ver Detalhes"             │                    │
                                                   │──4─▶fetchConversation│
                                                   │     Messages()      │
                                                   │                     │
                                                   │◀──────5─────────────│
                                                   │    Messages[]       │
                                                   │                     │
                                                   └───6──▶ Render       │
                                                       History Chat      │
```

**Etapas:**

1. Usuário clica em "Ver Detalhes" em um feedback
2. Página abre `FeedbackDetailsModal` com feedback selecionado
3. Modal usa `useEffect` para buscar mensagens da conversa
4. Chama `fetchConversationMessages(conversationId)`
5. Supabase retorna mensagens ordenadas por timestamp
6. Modal renderiza histórico de chat com mensagens

### 3. Atualização de Status e Comentário

```
┌─────────┐      ┌──────────────────┐      ┌──────────────┐      ┌──────────┐
│  User   │──1──▶│  DetailsModal    │──2──▶│DataProvider  │──3──▶│ Supabase │
└─────────┘      └──────────────────┘      └──────────────┘      └──────────┘
   Edita              │                          │                     │
   campos             │                          │                     │
     │                │                          │                     │
     └──4──▶ Clica    │                          │                     │
         "Salvar"     │                          │                     │
                      │──5──▶updateFeedback()    │                     │
                      │                          │──6──▶UPDATE         │
                      │                          │                     │
                      │                          │◀──────7─────────────│
                      │                          │    Success          │
                      │◀─────8───────────────────│                     │
                      │   Toast + onSave()       │                     │
                      │                          │                     │
                      └───9──▶ Reload Feedbacks  │                     │
```

**Etapas:**

1. Usuário edita status e/ou comentário no modal
2. Clica em "Salvar Alterações"
3. Modal chama `handleSave()`
4. `handleSave()` invoca `updateFeedback(id, updates)`
5. DataProvider prepara dados e executa UPDATE no Supabase
6. Supabase atualiza registro
7. Retorna sucesso
8. Modal exibe toast e chama callback `onSave()`
9. Página recarrega lista de feedbacks

## Componentes e Responsabilidades

### FeedbacksPage

**Responsabilidades:**

- Gerenciar estado local dos feedbacks
- Buscar feedbacks do Supabase na montagem
- Filtrar feedbacks por status e tipo
- Enriquecer feedbacks com dados relacionados
- Renderizar tabela com ações
- Gerenciar abertura de modais
- Recarregar feedbacks após atualizações

**Estados:**

- `feedbacks: Feedback[]` - Lista de feedbacks do Supabase
- `isLoading: boolean` - Estado de carregamento
- `statusFilter` - Filtro de status atual
- `typeFilter` - Filtro de tipo atual
- `detailsModal` - Estado do modal de detalhes
- `changeStatusModal` - Estado do modal de quick status

### FeedbackDetailsModal

**Responsabilidades:**

- Exibir informações completas do feedback
- Buscar e exibir histórico de mensagens da conversa
- Permitir edição de status e comentário
- Salvar alterações no Supabase
- Gerenciar loading states

**Estados:**

- `conversationMessages: Message[]` - Mensagens da conversa
- `isLoadingMessages: boolean` - Loading das mensagens
- `isSaving: boolean` - Loading do salvamento
- `feedbackStatus: FeedbackStatus` - Status editável
- `superAdminComment: string` - Comentário editável

### DataProvider

**Responsabilidades:**

- Centralizar acesso ao Supabase
- Executar queries com JOINs
- Mapear dados do Supabase para tipos TypeScript
- Tratar erros e retornar arrays vazios em caso de falha
- Manter sincronização com estado local (opcional)

**Funções:**

- `fetchFeedbacks()` - Busca feedbacks com relações
- `fetchConversationMessages(conversationId)` - Busca mensagens
- `updateFeedback(id, updates)` - Atualiza feedback

## Tratamento de Erros

### Níveis de Tratamento

1. **DataProvider:**

   - `try/catch` em todas as funções assíncronas
   - `console.error()` para logging
   - Retorna arrays vazios em caso de erro (evita crashes)

2. **Componentes:**

   - `try/catch` em handlers de ações
   - Exibe toasts de erro com mensagens amigáveis
   - Mantém estado consistente mesmo com erros

3. **Supabase:**
   - RLS policies previnem acessos não autorizados
   - Foreign key constraints garantem integridade referencial
   - Validações no schema (enums, not null, etc.)

## Estados de UI

### Loading States

- **Página:** Skeleton components durante carregamento inicial
- **Modal:** Spinner com mensagem "Carregando mensagens..."
- **Botão Salvar:** Spinner + texto "Salvando..."

### Empty States

- **Tabela:** EmptyState com ícone, título e ação (limpar filtros)
- **Modal:** Ícone de mensagem + texto quando não há mensagens

### Success/Error States

- **Sucesso:** Toast verde com título e descrição
- **Erro:** Toast vermelho (destructive) com mensagem de erro

## Performance e Otimizações

1. **JOINs no Supabase:** Reduz número de queries
2. **useMemo:** Evita recálculos desnecessários de filtros
3. **useCallback:** Mantém referências estáveis de funções
4. **Ordenação no backend:** `.order()` no Supabase
5. **Loading states:** UX responsiva durante operações assíncronas

## Segurança

1. **RLS Policies:** Super Admin tem acesso total, clientes apenas seu tenant
2. **Type Safety:** TypeScript strict mode
3. **Validação de Foreign Keys:** Garante integridade de dados
4. **Prepared Statements:** Supabase usa automaticamente

## Extensibilidade Futura

- Adicionar paginação para grandes volumes de feedbacks
- Implementar busca/filtro por texto
- Exportar feedbacks (CSV, PDF)
- Dashboard de análise de feedbacks
- Notificações automáticas para novos feedbacks
- Integração com N8N para automações

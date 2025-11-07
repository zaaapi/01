# Guia de Migração - DataProvider para React Query

## 🚀 Início Rápido

### Importar Hooks

```typescript
// Importar hooks necessários do index centralizado
import { useTenants, useCreateTenant, useUpdateTenant, useDeleteTenant } from "@/lib/hooks"
```

## 📖 Padrões de Uso

### 1. Buscar Lista de Dados

**Antes:**

```typescript
const { state, fetchTenants } = useData()
const [tenants, setTenants] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  const load = async () => {
    const data = await fetchTenants()
    setTenants(data)
    setLoading(false)
  }
  load()
}, [])
```

**Depois:**

```typescript
const { data: tenants = [], isLoading, error } = useTenants("active")

// Dados carregam automaticamente
// Estados gerenciados pelo React Query
```

### 2. Criar Novo Item

**Antes:**

```typescript
const { createTenant } = useData()

const handleCreate = async (data) => {
  try {
    await createTenant(data)
    toast({ title: "Sucesso!" })
  } catch (error) {
    toast({ title: "Erro", variant: "destructive" })
  }
}
```

**Depois:**

```typescript
const createMutation = useCreateTenant()

const handleCreate = async (data) => {
  await createMutation.mutateAsync(data)
  // Toast automático no hook
  // Cache invalidado automaticamente
}

// Ou usar mutation.mutate() sem await
// createMutation.mutate(data)
```

### 3. Atualizar Item Existente

**Antes:**

```typescript
const { updateTenant } = useData()

const handleUpdate = async (id, updates) => {
  await updateTenant(id, updates)
  // Precisa recarregar dados manualmente
  const newData = await fetchTenants()
  setTenants(newData)
}
```

**Depois:**

```typescript
const updateMutation = useUpdateTenant()

const handleUpdate = async (id, updates) => {
  await updateMutation.mutateAsync({ id, data: updates })
  // Cache atualizado automaticamente
  // UI reage instantaneamente
}
```

### 4. Deletar Item

**Antes:**

```typescript
const { deleteTenant } = useData()

const handleDelete = async (id) => {
  await deleteTenant(id)
  // Remover do estado local manualmente
  setTenants((prev) => prev.filter((t) => t.id !== id))
}
```

**Depois:**

```typescript
const deleteMutation = useDeleteTenant()

const handleDelete = async (id) => {
  await deleteMutation.mutateAsync(id)
  // Item removido automaticamente da UI
}
```

### 5. Buscar Item Individual

**Antes:**

```typescript
const { state } = useData()
const tenant = state.tenants.find((t) => t.id === tenantId)
```

**Depois:**

```typescript
const { data: tenant, isLoading } = useTenant(tenantId)
```

### 6. Estados de Loading e Error

**React Query fornece estados automáticos:**

```typescript
const {
  data, // Dados retornados
  isLoading, // Primeira vez carregando
  isFetching, // Qualquer fetch (incluindo background)
  isError, // Houve erro
  error, // Objeto do erro
  refetch, // Função para recarregar manualmente
} = useTenants()

// Para mutations:
const mutation = useCreateTenant()
const {
  mutate, // Função para executar mutation
  mutateAsync, // Versão com Promise
  isLoading, // Mutation em andamento
  isError, // Mutation falhou
  isSuccess, // Mutation bem-sucedida
  reset, // Resetar estado da mutation
} = mutation
```

## 🎯 Hooks Disponíveis

### Tenants (Empresas)

```typescript
useTenants(filter: "all" | "active" | "inactive")
useTenant(id: string)
useCreateTenant()
useUpdateTenant()
useDeleteTenant()
```

### Users (Usuários)

```typescript
useUsers(tenantId: string)
useUser(id: string)
useFeatureModules()
useCreateUser()
useUpdateUser()
useDeleteUser()
```

### NeuroCores

```typescript
useNeurocores()
useNeurocore(id: string)
useCreateNeurocore()
useUpdateNeurocore()
useDeleteNeurocore()
```

### Agents (Agentes IA)

```typescript
useAgents()
useAgent(id: string)
useCreateAgent()
useUpdateAgent()
useDeleteAgent()
```

### Contacts (Contatos)

```typescript
useContacts(tenantId: string)
useContact(id: string)
useCreateContact()
useUpdateContact()
useDeleteContact()
```

### Conversations (Conversas)

```typescript
useConversationsByTenant(tenantId: string)
useConversationsByContact(contactId: string)
useConversation(id: string)
useCreateConversation()
useUpdateConversation() // Com optimistic update
useDeleteConversation()
```

### Messages (Mensagens)

```typescript
useMessages(conversationId: string)
useMessage(id: string)
useCreateMessage() // Com optimistic update
useUpdateMessage()
useDeleteMessage()
```

### Base Conhecimentos

```typescript
useBaseConhecimentos(tenantId: string)
useBaseConhecimento(id: string)
useCreateBaseConhecimento()
useUpdateBaseConhecimento()
useDeleteBaseConhecimento()
```

### Synapses

```typescript
useSynapsesByBase(baseId: string)
useSynapsesByTenant(tenantId: string)
useSynapse(id: string)
useCreateSynapse()
useUpdateSynapse()
useDeleteSynapse()
```

### Feedbacks

```typescript
useFeedbacksByTenant(tenantId: string)
useAllFeedbacks() // Para super admin
useFeedback(id: string)
useCreateFeedback()
useUpdateFeedback()
useDeleteFeedback()
```

### Quick Replies

```typescript
useQuickReplies(tenantId: string)
useQuickReply(id: string)
useCreateQuickReply()
useUpdateQuickReply()
useDeleteQuickReply()
useIncrementQuickReplyUsage() // Contador de uso
```

## 💡 Dicas e Boas Práticas

### 1. Enabled Option

Use `enabled` para buscar dados condicionalmente:

```typescript
// Só buscar se tiver tenantId
const { data } = useUsers(tenantId, { enabled: !!tenantId })

// Ou
const { data } = useUser(userId, { enabled: Boolean(userId) })
```

### 2. Refetch Manual

```typescript
const { data, refetch } = useTenants()

// Recarregar dados manualmente
const handleRefresh = () => {
  refetch()
}
```

### 3. Invalidar Cache Manualmente

```typescript
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/hooks/data/query-keys"

const queryClient = useQueryClient()

// Invalidar todas as queries de tenants
queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all })

// Invalidar tenant específico
queryClient.invalidateQueries({ queryKey: queryKeys.tenants.detail(id) })
```

### 4. Optimistic Updates Personalizados

```typescript
const mutation = useMutation({
  mutationFn: updateData,
  onMutate: async (newData) => {
    // 1. Cancelar queries em andamento
    await queryClient.cancelQueries({ queryKey: ["myData"] })

    // 2. Snapshot para rollback
    const previous = queryClient.getQueryData(["myData"])

    // 3. Update otimista
    queryClient.setQueryData(["myData"], newData)

    // 4. Retornar contexto
    return { previous }
  },
  onError: (err, vars, context) => {
    // Rollback em erro
    queryClient.setQueryData(["myData"], context.previous)
  },
  onSettled: () => {
    // Revalidar sempre
    queryClient.invalidateQueries({ queryKey: ["myData"] })
  },
})
```

### 5. Dependent Queries

```typescript
// Buscar tenant primeiro
const { data: tenant } = useTenant(tenantId)

// Depois buscar usuários (só quando tenant carregar)
const { data: users } = useUsers(tenant?.id, {
  enabled: !!tenant?.id,
})
```

### 6. Parallel Queries

```typescript
// Múltiplas queries em paralelo
const tenantsQuery = useTenants()
const neurocoresQuery = useNeurocores()
const agentsQuery = useAgents()

// Verificar se todos carregaram
const isLoading = tenantsQuery.isLoading || neurocoresQuery.isLoading || agentsQuery.isLoading
```

## 🔧 Debugging

### React Query DevTools

Em desenvolvimento, abra as DevTools (canto inferior esquerdo):

- Ver todas as queries ativas
- Inspecionar cache
- Ver estados de loading/error
- Trigger refetch manual
- Ver mutations executadas

### Console Logs

```typescript
const query = useTenants()

console.log({
  data: query.data,
  isLoading: query.isLoading,
  error: query.error,
  status: query.status, // 'idle' | 'loading' | 'error' | 'success'
  fetchStatus: query.fetchStatus, // 'fetching' | 'paused' | 'idle'
})
```

## 📚 Recursos Adicionais

- [React Query Docs](https://tanstack.com/query/latest)
- [Query Keys Best Practices](https://tkdodo.eu/blog/effective-react-query-keys)
- [Optimistic Updates](https://tkdodo.eu/blog/optimistic-updates-in-react-query)
- [React Query Tips](https://tkdodo.eu/blog/practical-react-query)

## ❓ Perguntas Frequentes

**Q: Preciso usar `useEffect` para buscar dados?**  
A: Não! React Query busca automaticamente quando o componente monta.

**Q: Como recarregar dados após uma mutation?**  
A: Automatic! Os hooks de mutation invalidam o cache automaticamente.

**Q: Posso desabilitar o refetch automático?**  
A: Sim, configure no hook:

```typescript
const { data } = useTenants("all", {
  refetchOnWindowFocus: false,
})
```

**Q: Como lidar com formulários?**  
A: Use `mutateAsync` e aguarde o resultado:

```typescript
const handleSubmit = async (data) => {
  try {
    await createMutation.mutateAsync(data)
    router.push("/success")
  } catch (error) {
    // Lidar com erro
  }
}
```

**Q: Dados estão desatualizados?**  
A: Use `refetch()` ou ajuste `staleTime` na configuração do query client.

**Q: Como testar componentes que usam React Query?**  
A: Crie um `QueryClientProvider` wrapper no setup dos testes.

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte a documentação oficial do React Query
2. Verifique os exemplos em `app/super-admin/empresas/page.tsx`
3. Inspect as DevTools do React Query em desenvolvimento

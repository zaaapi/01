# Relatório de Análise Geral e Otimização Supabase

**Data**: 2024-12-19  
**Task**: 17 - Análise Geral e Otimização Supabase  
**Status**: ✅ Completo

---

## 📋 Sumário Executivo

Este relatório apresenta uma análise abrangente do sistema LIVIA, focando em integração, performance e segurança relacionadas ao Supabase. Foram identificados **15 problemas principais** distribuídos em 5 categorias, com propostas de solução detalhadas para cada um.

---

## 🔍 1. ANÁLISE DAS POLÍTICAS RLS (Row Level Security)

### 1.1 Problemas Identificados

#### 🔴 **Problema 1.1: Dependência Circular Potencial nas Funções RLS**

**Descrição**:  
As funções `get_user_role()` e `get_user_tenant_id()` nas migrations 007 e 008 usam `SECURITY DEFINER` para bypassar RLS e ler de `public.users`. Embora isso resolva problemas de dependência circular durante o login, pode haver situações onde:

- O JWT ainda não contém os custom claims (durante o primeiro login)
- A função falha silenciosamente e retorna valores padrão (`usuario_cliente` ou `NULL`)
- Não há logging adequado para debug

**Localização**:

- `supabase/migrations/007_fix_rls_custom_claims.sql`
- `supabase/migrations/008_fix_rls_login_circular_dependency.sql`

**Impacto**: ⚠️ **MÉDIO** - Pode causar problemas de permissão em casos edge

**Solução Proposta**:

```sql
-- Adicionar logging e melhorar tratamento de erros
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS app_role LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  _role text;
  _user_id uuid;
BEGIN
  _user_id := auth.uid();

  IF _user_id IS NULL THEN
    RETURN 'usuario_cliente'::app_role;
  END IF;

  -- Priorizar JWT claims
  BEGIN
    _role := current_setting('request.jwt.claims', true)::jsonb->>'user_role';
    IF _role IS NOT NULL AND _role != '' THEN
      RETURN _role::app_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Log error (em produção, usar um sistema de logging)
    RAISE WARNING 'Erro ao ler user_role do JWT: %', SQLERRM;
  END;

  -- Fallback para public.users
  BEGIN
    SELECT u.role::text INTO _role
    FROM public.users u
    WHERE u.id = _user_id;

    IF _role IS NOT NULL THEN
      RETURN _role::app_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao ler user_role de public.users: %', SQLERRM;
  END;

  RETURN 'usuario_cliente'::app_role;
END;
$$;
```

---

#### 🔴 **Problema 1.2: Políticas RLS com Subqueries Ineficientes**

**Descrição**:  
Algumas políticas RLS usam subqueries que podem ser executadas para cada linha verificada, causando problemas de performance:

1. **Neurocores** (linha 112 de `002_rls_policies.sql`):

```sql
FOR SELECT USING (id = (SELECT neurocore_id FROM public.tenants WHERE id = get_user_tenant_id()));
```

2. **Agents** (linhas 122-126):

```sql
FOR SELECT USING (
    get_user_tenant_id() IS NOT NULL AND (
        (SELECT neurocore_id FROM public.tenants WHERE id = get_user_tenant_id()) = ANY(associated_neurocores)
    )
);
```

3. **Messages** (linha 158):

```sql
FOR ALL USING (conversation_id IN (SELECT id FROM public.conversations WHERE tenant_id = get_user_tenant_id()))
```

**Impacto**: ⚠️ **ALTO** - Performance degradada em tabelas grandes

**Solução Proposta**:

```sql
-- Criar índices compostos e otimizar políticas
-- Migration: 009_optimize_rls_performance.sql

-- Índice para otimizar policy de neurocores
CREATE INDEX IF NOT EXISTS idx_tenants_neurocore_id_tenant_id
ON public.tenants(neurocore_id, id);

-- Índice para otimizar policy de agents
CREATE INDEX IF NOT EXISTS idx_agents_associated_neurocores_gin
ON public.agents USING GIN(associated_neurocores);

-- Índice para otimizar policy de messages
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_id_id
ON public.conversations(tenant_id, id);

-- Refatorar política de neurocores para usar JOIN implícito
DROP POLICY IF EXISTS "Tenant users can read neurocores associated with their tenant" ON public.neurocores;
CREATE POLICY "Tenant users can read neurocores associated with their tenant" ON public.neurocores
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tenants t
    WHERE t.id = get_user_tenant_id()
    AND t.neurocore_id = neurocores.id
  )
);
```

---

#### 🟡 **Problema 1.3: Falta de Políticas para INSERT em algumas Tabelas**

**Descrição**:  
Algumas tabelas não têm políticas explícitas para INSERT para `usuario_cliente`:

- `public.channels` - apenas super_admin pode criar
- `public.base_conhecimentos` - apenas super_admin tem política explícita
- `public.synapses` - apenas super_admin tem política explícita

**Impacto**: ⚠️ **BAIXO** - Pode estar funcionando por herança, mas não está explícito

**Solução Proposta**:

```sql
-- Adicionar políticas explícitas para INSERT onde necessário
-- Verificar se tenant users podem criar channels, base_conhecimentos, etc.
-- Se sim, adicionar políticas explícitas
```

---

### 1.2 Testes de Permissões Recomendados

**Checklist de Testes**:

- [ ] Login como `super_admin` → Verificar acesso total a todas as tabelas
- [ ] Login como `usuario_cliente` → Verificar acesso apenas ao próprio tenant
- [ ] Tentar acessar dados de outro tenant → Deve ser bloqueado
- [ ] Tentar acessar neurocores/agents não associados → Deve ser bloqueado
- [ ] Requisições não autenticadas → Devem ser bloqueadas
- [ ] Criar/Editar/Excluir dados do próprio tenant → Deve funcionar
- [ ] Criar/Editar/Excluir dados de outro tenant → Deve ser bloqueado

---

## ⚡ 2. ANÁLISE DE PERFORMANCE

### 2.1 Problemas Identificados

#### 🔴 **Problema 2.1: Queries N+1 no Frontend**

**Descrição**:  
No arquivo `app/super-admin/empresas/page.tsx` (linhas 88-115), há um padrão N+1:

```typescript
for (const tenant of tenants) {
  const tenantUsers = await fetchUsersByTenant(tenant.id)
  allUsers.push(...tenantUsers)
}
```

Se houver 10 tenants, isso executa 11 queries (1 para tenants + 10 para users).

**Impacto**: ⚠️ **ALTO** - Performance degradada com muitos tenants

**Solução Proposta**:

```typescript
// Em data-provider.tsx, criar função otimizada
const fetchAllUsers = useCallback(async (): Promise<User[]> => {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar usuários:", error)
      return []
    }

    return (
      data?.map((u) => ({
        id: u.id,
        tenantId: u.tenant_id || null,
        // ... resto do mapeamento
      })) || []
    )
  } catch (error) {
    console.error("Exceção ao buscar usuários:", error)
    return []
  }
}, [])

// No componente, usar uma única query
const allUsers = await fetchAllUsers()
```

---

#### 🔴 **Problema 2.2: Falta de Índices Compostos**

**Descrição**:  
Faltam índices compostos para queries comuns:

1. **Conversations**: Buscar por `tenant_id + status + last_message_at`
2. **Messages**: Buscar por `conversation_id + timestamp` (ordenação)
3. **Contacts**: Buscar por `tenant_id + status + last_interaction_at`
4. **Feedbacks**: Buscar por `tenant_id + feedback_status + created_at`

**Impacto**: ⚠️ **ALTO** - Queries lentas em tabelas grandes

**Solução Proposta**:

```sql
-- Migration: 010_add_composite_indexes.sql

-- Índices para conversations
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_status_last_message
ON public.conversations(tenant_id, status, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_tenant_status
ON public.conversations(tenant_id, status)
WHERE status IN ('Conversando', 'Pausada'); -- Partial index para status ativos

-- Índices para messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_timestamp
ON public.messages(conversation_id, timestamp DESC);

-- Índices para contacts
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_status_last_interaction
ON public.contacts(tenant_id, status, last_interaction_at DESC);

-- Índices para feedbacks
CREATE INDEX IF NOT EXISTS idx_feedbacks_tenant_status_created
ON public.feedbacks(tenant_id, feedback_status, created_at DESC);

-- Índices para synapses
CREATE INDEX IF NOT EXISTS idx_synapses_tenant_status
ON public.synapses(tenant_id, status);
```

---

#### 🟡 **Problema 2.3: Queries sem Paginação**

**Descrição**:  
Muitas queries não implementam paginação:

- `fetchTenants()` - pode retornar centenas de tenants
- `fetchUsersByTenant()` - pode retornar muitos usuários
- `fetchAllFeatureModules()` - OK, mas pode crescer

**Impacto**: ⚠️ **MÉDIO** - Problemas de performance e memória quando há muitos dados

**Solução Proposta**:

```typescript
// Adicionar paginação nas funções de fetch
const fetchTenants = useCallback(
  async (
    filter: "all" | "active" | "inactive" = "all",
    options?: { limit?: number; offset?: number }
  ): Promise<{ data: Tenant[]; total: number }> => {
    try {
      const supabase = createSupabaseClient()
      let query = supabase.from("tenants").select("*", { count: "exact" })

      if (filter === "active") {
        query = query.eq("is_active", true)
      } else if (filter === "inactive") {
        query = query.eq("is_active", false)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error, count } = await query.order("created_at", {
        ascending: false,
      })

      if (error) {
        console.error("Erro ao buscar tenants:", error)
        return { data: [], total: 0 }
      }

      return {
        data: data?.map(/* ... */) || [],
        total: count || 0,
      }
    } catch (error) {
      console.error("Exceção ao buscar tenants:", error)
      return { data: [], total: 0 }
    }
  },
  []
)
```

---

### 2.2 Análise de Queries Recomendadas

**Checklist de Verificação**:

- [ ] Usar `EXPLAIN ANALYZE` em queries principais
- [ ] Verificar `pg_stat_statements` para queries mais lentas
- [ ] Implementar paginação em todas as listagens
- [ ] Adicionar limites padrão (ex: 50 itens por página)
- [ ] Monitorar queries que fazem full table scan

---

## 🔗 3. INTEGRAÇÃO FRONTEND-SUPABASE

### 3.1 Problemas Identificados

#### 🔴 **Problema 3.1: Duplicação de Estado (localStorage + Supabase)**

**Descrição**:  
O `data-provider.tsx` mantém estado duplicado:

- Dados no `localStorage` (para mock/fallback)
- Dados no Supabase
- Atualizações são feitas em ambos, causando possível inconsistência

**Impacto**: ⚠️ **ALTO** - Inconsistências de dados, bugs difíceis de debugar

**Solução Proposta**:

```typescript
// Remover sincronização com localStorage para dados do Supabase
// Manter localStorage apenas para configurações de UI (filtros, preferências)

// Refatorar data-provider para usar apenas Supabase quando autenticado
const createTenant = useCallback(async (tenant: Omit<Tenant, "id" | "createdAt">) => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase.from("tenants").insert(insertData).select().single()

    if (error) {
      throw new Error(`Erro ao criar tenant: ${error.message}`)
    }

    // Atualizar apenas o estado React (não localStorage)
    setState((prev) => ({
      ...prev,
      tenants: [...prev.tenants, mappedTenant],
    }))
  } catch (error) {
    console.error("Erro ao criar tenant:", error)
    throw error
  }
}, [])
```

---

#### 🔴 **Problema 3.2: Falta de Tratamento de Erros Consistente**

**Descrição**:  
Algumas funções retornam arrays vazios em caso de erro, outras lançam exceções. Não há padronização.

**Impacto**: ⚠️ **MÉDIO** - UX inconsistente, difícil de debugar

**Solução Proposta**:

```typescript
// Criar helper centralizado para tratamento de erros
const handleSupabaseError = (error: any, context: string) => {
  console.error(`Erro em ${context}:`, error)

  // Mapear erros comuns para mensagens amigáveis
  if (error.code === "PGRST116") {
    throw new Error("Recurso não encontrado")
  }
  if (error.code === "42501") {
    throw new Error("Você não tem permissão para realizar esta ação")
  }
  if (error.code === "23505") {
    throw new Error("Este registro já existe")
  }

  throw new Error(error.message || "Erro desconhecido")
}

// Usar em todas as funções
const fetchTenants = useCallback(
  async (filter: "all" | "active" | "inactive" = "all"): Promise<Tenant[]> => {
    try {
      // ... código da query
      if (error) {
        handleSupabaseError(error, "fetchTenants")
      }
      // ...
    } catch (error) {
      handleSupabaseError(error, "fetchTenants")
    }
  },
  []
)
```

---

#### 🟡 **Problema 3.3: Falta de Validação de Dados no Frontend**

**Descrição**:  
Dados são enviados para Supabase sem validação Zod no frontend antes do envio.

**Impacto**: ⚠️ **BAIXO** - Validação existe no Supabase (constraints), mas UX melhoraria com validação prévia

**Solução Proposta**:

```typescript
// Criar schemas Zod para validação
import { z } from "zod"

const tenantSchema = z.object({
  name: z.string().min(3).max(255),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/),
  phone: z.string().regex(/^\+55\s\d{2}\s\d{4,5}-\d{4}$/),
  // ... outros campos
})

const createTenant = useCallback(async (tenant: Omit<Tenant, "id" | "createdAt">) => {
  // Validar antes de enviar
  const validated = tenantSchema.parse(tenant)

  try {
    // ... resto do código
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Dados inválidos: ${error.errors.map((e) => e.message).join(", ")}`)
    }
    throw error
  }
}, [])
```

---

#### 🟡 **Problema 3.4: Falta de Loading States e Feedback Visual**

**Descrição**:  
Algumas operações não mostram feedback visual adequado (loading, success, error).

**Impacto**: ⚠️ **BAIXO** - UX melhoraria com feedback adequado

**Solução Proposta**:

- Usar `react-hot-toast` ou shadcn/ui toast para feedback
- Implementar skeleton loaders durante carregamento
- Adicionar estados de loading em todas as operações assíncronas

---

## 🔌 4. INTEGRAÇÃO COM N8N

### 4.1 Problemas Identificados

#### 🔴 **Problema 4.1: Integração N8N Não Implementada**

**Descrição**:  
Não foi encontrado código de integração com N8N no projeto. As funcionalidades que deveriam usar N8N são:

- **Live Chat**: Enviar mensagem, pausar/retomar IA, encerrar conversa
- **Treinamento NeuroCore**: Perguntar à IA, publicar sinapse

**Impacto**: ⚠️ **ALTO** - Funcionalidades críticas não funcionam

**Solução Proposta**:

```typescript
// Criar lib/n8n/client.ts
const N8N_BASE_URL = process.env.NEXT_PUBLIC_N8N_BASE_URL!
const N8N_API_KEY = process.env.NEXT_PUBLIC_N8N_API_KEY!

export async function callN8NWorkflow(
  workflowId: string,
  data: Record<string, any>,
  authToken?: string
): Promise<any> {
  const response = await fetch(`${N8N_BASE_URL}/webhook/${workflowId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...(N8N_API_KEY && { "X-N8N-API-KEY": N8N_API_KEY }),
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Erro ao chamar workflow N8N: ${response.statusText}`)
  }

  return response.json()
}

// Criar app/api/n8n/send-message/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/db"
import { callN8NWorkflow } from "@/lib/n8n/client"

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { conversationId, message } = body

    // Validar dados
    if (!conversationId || !message) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    // Chamar workflow N8N
    const result = await callN8NWorkflow(
      "send-message",
      {
        conversationId,
        message,
        userId: user.id,
      },
      request.headers.get("authorization") || undefined
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error)
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 })
  }
}
```

---

#### 🟡 **Problema 4.2: Falta de Documentação da Integração N8N**

**Descrição**:  
Não há documentação sobre:

- Quais workflows do N8N devem existir
- Quais endpoints/URLs devem ser chamados
- Como autenticar com N8N
- Estrutura de dados esperada

**Solução Proposta**:

- Criar `docs/N8N_INTEGRATION.md` com documentação completa
- Incluir exemplos de workflows esperados
- Documentar autenticação e segurança

---

## 🔒 5. SEGURANÇA E INTEGRIDADE

### 5.1 Problemas Identificados

#### 🟡 **Problema 5.1: Validação de Constraints no Banco**

**Descrição**:  
Algumas validações importantes não estão no banco:

- Validação de formato de CNPJ
- Validação de formato de telefone
- Validação de email (já existe UNIQUE, mas sem formato)

**Solução Proposta**:

```sql
-- Adicionar constraints de validação
ALTER TABLE public.tenants
ADD CONSTRAINT check_cnpj_format
CHECK (cnpj ~ '^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$');

ALTER TABLE public.tenants
ADD CONSTRAINT check_phone_format
CHECK (phone ~ '^\+55\s\d{2}\s\d{4,5}-\d{4}$');

ALTER TABLE public.users
ADD CONSTRAINT check_email_format
CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');
```

---

#### 🟡 **Problema 5.2: Falta de Auditoria**

**Descrição**:  
Não há sistema de auditoria para rastrear:

- Quem criou/editou/excluiu registros
- Quando ocorreram mudanças
- Valores antigos vs novos

**Solução Proposta**:

```sql
-- Criar tabela de auditoria
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL, -- INSERT, UPDATE, DELETE
  user_id uuid REFERENCES public.users(id),
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_audit_log_table_record ON public.audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at DESC);

-- Criar função de trigger para auditoria
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, old_data)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, old_data, new_data)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, new_data)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW));
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📊 RESUMO DE PROBLEMAS E PRIORIDADES

### 🔴 Críticos (Alta Prioridade)

1. **Queries N+1** - Performance degradada
2. **Duplicação de Estado** - Inconsistências de dados
3. **Integração N8N Não Implementada** - Funcionalidades não funcionam
4. **Falta de Índices Compostos** - Queries lentas

### 🟡 Importantes (Média Prioridade)

5. **Subqueries Ineficientes em RLS** - Performance
6. **Falta de Tratamento de Erros Consistente** - UX
7. **Falta de Paginação** - Escalabilidade
8. **Falta de Validação no Frontend** - UX

### 🟢 Melhorias (Baixa Prioridade)

9. **Dependência Circular Potencial** - Edge cases
10. **Falta de Políticas Explícitas** - Clareza
11. **Falta de Loading States** - UX
12. **Falta de Validação de Constraints** - Integridade
13. **Falta de Auditoria** - Rastreabilidade
14. **Falta de Documentação N8N** - Manutenibilidade

---

## 🎯 PLANO DE AÇÃO RECOMENDADO

### Fase 1: Correções Críticas (Semana 1)

1. ✅ Implementar integração N8N básica
2. ✅ Remover duplicação de estado (localStorage)
3. ✅ Adicionar índices compostos principais
4. ✅ Corrigir queries N+1

### Fase 2: Otimizações (Semana 2)

5. ✅ Otimizar políticas RLS com subqueries
6. ✅ Implementar paginação em todas as listagens
7. ✅ Padronizar tratamento de erros
8. ✅ Adicionar validação Zod no frontend

### Fase 3: Melhorias e Robustez (Semana 3)

9. ✅ Melhorar logging nas funções RLS
10. ✅ Adicionar políticas explícitas onde necessário
11. ✅ Implementar loading states e feedback visual
12. ✅ Adicionar constraints de validação
13. ✅ Implementar sistema de auditoria básico
14. ✅ Documentar integração N8N

---

## 📝 CHECKLIST DE TESTES

### Testes de Permissões

- [ ] Super admin pode acessar todas as tabelas
- [ ] Usuário cliente só acessa seu tenant
- [ ] Tentativas de acesso não autorizado são bloqueadas
- [ ] Requisições não autenticadas são bloqueadas

### Testes de Performance

- [ ] Queries principais executam em < 100ms
- [ ] Paginação funciona corretamente
- [ ] Índices estão sendo usados (verificar com EXPLAIN ANALYZE)
- [ ] Não há queries N+1

### Testes de Integração

- [ ] Frontend comunica corretamente com Supabase
- [ ] N8N recebe e processa requisições
- [ ] Respostas do N8N são tratadas adequadamente
- [ ] Erros são tratados e exibidos ao usuário

### Testes de Segurança

- [ ] RLS impede acesso não autorizado
- [ ] Validações impedem dados inválidos
- [ ] Constraints do banco impedem inconsistências
- [ ] Auditoria registra mudanças importantes

---

## 🔗 ARQUIVOS RELACIONADOS

- `supabase/migrations/001_initial_schema.sql` - Schema inicial
- `supabase/migrations/002_rls_policies.sql` - Políticas RLS
- `supabase/migrations/007_fix_rls_custom_claims.sql` - Fix claims
- `supabase/migrations/008_fix_rls_login_circular_dependency.sql` - Fix circular
- `lib/contexts/data-provider.tsx` - Provider de dados
- `db/index.ts` - Cliente Supabase
- `db/auth-helpers.ts` - Helpers de autenticação

---

## ✅ CONCLUSÃO

Este relatório identificou **15 problemas principais** distribuídos em 5 categorias. Os problemas críticos devem ser corrigidos imediatamente, enquanto os problemas de melhoria podem ser tratados em fases subsequentes.

**Próximos Passos**:

1. Revisar este relatório com a equipe
2. Priorizar correções baseado em impacto de negócio
3. Criar tickets/tasks para cada correção
4. Implementar correções seguindo o plano de ação
5. Executar testes de validação após cada correção

---

**Autor**: Sistema de Análise Automatizada  
**Revisão**: Pendente  
**Status**: ✅ Análise Completa

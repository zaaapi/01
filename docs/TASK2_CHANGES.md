# Task 2 - Resumo das Mudanças Implementadas

## ✅ Migração Inicial Atualizada (`001_initial_schema.sql`)

### Mudanças Principais:

1. **ENUMs Atualizados:**
   - `app_role` ao invés de `user_role`
   - `agent_type_enum`, `agent_function_enum`, `agent_gender_enum`
   - `contact_status_enum`, `conversation_status_enum`
   - `message_sender_type_enum`, `feedback_type_enum`
   - `synapse_status_enum`, `feedback_process_status_enum`

2. **Nova Estrutura para Agents:**
   - Agora usa campos JSONB: `instructions`, `limitations`, `conversation_roteiro`, `other_instructions`
   - Campo `associated_neurocores` como array de UUIDs
   - Removidas tabelas separadas: `agent_instructions`, `agent_limitations`, etc.

3. **Novas Tabelas Adicionadas:**
   - `channel_providers` - Provedores de canais de comunicação
   - `channels` - Canais/filas de atendimento dos tenants
   - `conversation_reactivations_settings` - Configurações de reativação automática

4. **Mudanças em Tabelas Existentes:**
   - **tenants**: Adicionados `master_integration_url`, `master_integration_active`, `neurocore_id` NOT NULL
   - **users**: Campo `modules` como array de texto, `id` agora é PRIMARY KEY sem DEFAULT (vinculado ao auth.users)
   - **contacts**: `last_interaction_at` ao invés de `last_interaction`, UNIQUE `(tenant_id, phone)`
   - **conversations**: Adicionados `channel_id`, `external_id`
   - **messages**: Adicionado `updated_at`
   - **base_conhecimentos**: Renomeado de `base_conhecimento`, UNIQUE `(tenant_id, name)`
   - **synapses**: `description` pode ser NULL, UNIQUE `(base_conhecimento_id, title)`
   - **feedbacks**: `feedback_status` agora usa `feedback_process_status_enum`
   - **quick_reply_templates**: UNIQUE `(tenant_id, title)`, `icon` como varchar(50)

5. **Índices Adicionados:**
   - Índices para `channels` e `channel_providers`
   - Índices atualizados conforme novas colunas

## ✅ Políticas RLS Atualizadas (`002_rls_policies.sql`)

### Mudanças Principais:

1. **Funções Auxiliares:**
   - `get_user_role()` - Lê `user_role` dos JWT claims
   - `get_user_tenant_id()` - Lê `tenant_id` dos JWT claims

2. **Políticas RLS:**
   - Todas as políticas agora usam `get_user_role()` e `get_user_tenant_id()`
   - Políticas para novas tabelas: `channels`, `channel_providers`, `conversation_reactivations_settings`
   - Política para `agents` simplificada para usar `associated_neurocores` array

3. **Estrutura de Permissões:**
   - **Super Admin**: Acesso total a todas as tabelas
   - **Tenant Users**: Acesso apenas aos dados do seu próprio tenant
   - **Authenticated Users**: Leitura de `feature_modules` e `channel_providers`

## 📋 Próximos Passos

### Para Executar as Migrações:

1. **No Supabase SQL Editor:**
   - Execute `001_initial_schema.sql` primeiro
   - Execute `002_rls_policies.sql` depois

2. **Configurar JWT Claims:**
   - Configure o Supabase Auth para incluir `tenant_id` e `user_role` nos JWT claims
   - Isso será necessário para que as políticas RLS funcionem corretamente

3. **Testar:**
   - Use as páginas de teste: `/test-supabase` e `/test-supabase-server`
   - Verifique se todas as tabelas foram criadas corretamente
   - Teste as políticas RLS com diferentes usuários

## ⚠️ Observações Importantes

1. **JWT Claims**: As políticas RLS dependem de `tenant_id` e `user_role` nos JWT claims. Isso precisa ser configurado no backend de autenticação.

2. **Agents**: A estrutura mudou de tabelas relacionadas para campos JSONB. Você precisará migrar os dados se já tiver algum.

3. **Base de Conhecimento**: Renomeada para `base_conhecimentos` (plural) para manter consistência.

4. **Users**: O campo `id` agora deve ser o mesmo do `auth.users.id` do Supabase Auth.

5. **Channels**: Nova tabela importante para gerenciar múltiplos canais de comunicação por tenant.

## 🔗 Arquivos Modificados

- `supabase/migrations/001_initial_schema.sql` - Schema completo atualizado
- `supabase/migrations/002_rls_policies.sql` - Políticas RLS atualizadas
- `app/test-supabase/page.tsx` - Teste atualizado com novas tabelas



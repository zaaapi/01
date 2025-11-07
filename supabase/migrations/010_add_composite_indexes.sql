-- Migration: 010_add_composite_indexes.sql
-- Adiciona índices compostos para melhorar performance de queries comuns

-- ============================================
-- 1. ÍNDICES PARA CONVERSATIONS
-- ============================================

-- Índice composto para buscar conversas por tenant, status e última mensagem
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_status_last_message 
ON public.conversations(tenant_id, status, last_message_at DESC);

-- Índice parcial para conversas ativas (mais comuns)
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_status_active 
ON public.conversations(tenant_id, last_message_at DESC) 
WHERE status IN ('Conversando', 'Pausada');

-- ============================================
-- 2. ÍNDICES PARA MESSAGES
-- ============================================

-- Índice composto para buscar mensagens por conversa e timestamp
CREATE INDEX IF NOT EXISTS idx_messages_conversation_timestamp 
ON public.messages(conversation_id, timestamp DESC);

-- Índice para buscar mensagens por tipo de remetente
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sender_type 
ON public.messages(conversation_id, sender_type, timestamp DESC);

-- ============================================
-- 3. ÍNDICES PARA CONTACTS
-- ============================================

-- Índice composto para buscar contatos por tenant, status e última interação
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_status_last_interaction 
ON public.contacts(tenant_id, status, last_interaction_at DESC);

-- Índice para buscar contatos ativos por tenant
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_status_active 
ON public.contacts(tenant_id, last_interaction_at DESC) 
WHERE status IN ('Aberto', 'Com IA');

-- ============================================
-- 4. ÍNDICES PARA FEEDBACKS
-- ============================================

-- Índice composto para buscar feedbacks por tenant, status e data
CREATE INDEX IF NOT EXISTS idx_feedbacks_tenant_status_created 
ON public.feedbacks(tenant_id, feedback_status, created_at DESC);

-- Índice para buscar feedbacks por conversa
CREATE INDEX IF NOT EXISTS idx_feedbacks_conversation_created 
ON public.feedbacks(conversation_id, created_at DESC);

-- ============================================
-- 5. ÍNDICES PARA SYNAPSES
-- ============================================

-- Índice composto para buscar synapses por tenant e status
CREATE INDEX IF NOT EXISTS idx_synapses_tenant_status 
ON public.synapses(tenant_id, status);

-- Índice para buscar synapses publicadas por tenant
CREATE INDEX IF NOT EXISTS idx_synapses_tenant_status_published 
ON public.synapses(tenant_id, created_at DESC) 
WHERE status = 'PUBLICANDO';

-- ============================================
-- 6. ÍNDICES PARA BASE CONHECIMENTOS
-- ============================================

-- Índice composto para buscar bases por tenant e status
CREATE INDEX IF NOT EXISTS idx_base_conhecimentos_tenant_active 
ON public.base_conhecimentos(tenant_id, is_active, created_at DESC);

-- ============================================
-- 7. COMENTÁRIOS EXPLICATIVOS
-- ============================================

COMMENT ON INDEX idx_conversations_tenant_status_last_message IS 'Índice composto para otimizar listagem de conversas filtradas por tenant e status';
COMMENT ON INDEX idx_conversations_tenant_status_active IS 'Índice parcial para conversas ativas (mais consultadas)';
COMMENT ON INDEX idx_messages_conversation_timestamp IS 'Índice para otimizar ordenação de mensagens por conversa';
COMMENT ON INDEX idx_contacts_tenant_status_last_interaction IS 'Índice composto para otimizar listagem de contatos';
COMMENT ON INDEX idx_feedbacks_tenant_status_created IS 'Índice composto para otimizar listagem de feedbacks';
COMMENT ON INDEX idx_synapses_tenant_status IS 'Índice composto para otimizar listagem de synapses';






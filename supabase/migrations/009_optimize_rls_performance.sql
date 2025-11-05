-- Migration: 009_optimize_rls_performance.sql
-- Otimiza políticas RLS com índices e refatoração de subqueries

-- ============================================
-- 1. ÍNDICES PARA OTIMIZAR POLÍTICAS RLS
-- ============================================

-- Índice para otimizar policy de neurocores
CREATE INDEX IF NOT EXISTS idx_tenants_neurocore_id_tenant_id 
ON public.tenants(neurocore_id, id);

-- Índice GIN para otimizar policy de agents (busca em array)
CREATE INDEX IF NOT EXISTS idx_agents_associated_neurocores_gin 
ON public.agents USING GIN(associated_neurocores);

-- Índice para otimizar policy de messages
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_id_id 
ON public.conversations(tenant_id, id);

-- ============================================
-- 2. REFATORAR POLÍTICAS RLS INEFICIENTES
-- ============================================

-- Refatorar política de neurocores para usar EXISTS (mais eficiente)
DROP POLICY IF EXISTS "Tenant users can read neurocores associated with their tenant" ON public.neurocores;
CREATE POLICY "Tenant users can read neurocores associated with their tenant" ON public.neurocores
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tenants t
    WHERE t.id = get_user_tenant_id()
    AND t.neurocore_id = neurocores.id
  )
);

-- Refatorar política de agents para usar EXISTS
DROP POLICY IF EXISTS "Tenant users can read agents associated with their tenant's neurocore" ON public.agents;
CREATE POLICY "Tenant users can read agents associated with their tenant's neurocore" ON public.agents
FOR SELECT USING (
  get_user_tenant_id() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.tenants t
    WHERE t.id = get_user_tenant_id()
    AND t.neurocore_id = ANY(agents.associated_neurocores)
  )
);

-- Refatorar política de messages para usar EXISTS
DROP POLICY IF EXISTS "Tenant users can manage messages from their tenant's conversations" ON public.messages;
CREATE POLICY "Tenant users can manage messages from their tenant's conversations" ON public.messages
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND c.tenant_id = get_user_tenant_id()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND c.tenant_id = get_user_tenant_id()
  )
);

-- ============================================
-- 3. COMENTÁRIOS EXPLICATIVOS
-- ============================================

COMMENT ON INDEX idx_tenants_neurocore_id_tenant_id IS 'Índice para otimizar política RLS de neurocores';
COMMENT ON INDEX idx_agents_associated_neurocores_gin IS 'Índice GIN para busca eficiente em array de neurocores associados';
COMMENT ON INDEX idx_conversations_tenant_id_id IS 'Índice para otimizar política RLS de messages';


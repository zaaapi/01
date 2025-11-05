-- LIVIA - Row Level Security (RLS) Policies
-- Task 2: Configuração de segurança no Supabase
-- Adiciona políticas RLS para todas as tabelas usando JWT claims

-- ============================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- ============================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neurocores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.base_conhecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synapses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_reply_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_reactivations_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. FUNÇÕES AUXILIARES PARA RLS
-- ============================================

-- Helper para acessar os claims do JWT de forma segura
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS app_role LANGUAGE plpgsql AS $$
BEGIN
  RETURN COALESCE(current_setting('request.jwt.claims', true)::jsonb->>'user_role', 'usuario_cliente')::app_role;
END;
$$;

CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS uuid LANGUAGE plpgsql AS $$
BEGIN
  RETURN (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid;
END;
$$;

-- ============================================
-- 3. POLÍTICAS RLS POR TABELA
-- ============================================

-- RLS para Tenants
CREATE POLICY "Super admins can view all tenants" ON public.tenants
FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "Super admins can manage all tenants" ON public.tenants
FOR ALL USING (get_user_role() = 'super_admin') WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "Tenant users can view their own tenant" ON public.tenants
FOR SELECT USING (id = get_user_tenant_id());

CREATE POLICY "Tenant users can update their own tenant" ON public.tenants
FOR UPDATE USING (id = get_user_tenant_id()) WITH CHECK (id = get_user_tenant_id());

-- RLS para Feature Modules
CREATE POLICY "Super admins can manage all feature modules" ON public.feature_modules
FOR ALL USING (get_user_role() = 'super_admin') WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "All authenticated users can read feature modules" ON public.feature_modules
FOR SELECT USING (auth.role() = 'authenticated');

-- RLS para Users
CREATE POLICY "Super admins can view all users" ON public.users
FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "Super admins can manage all users" ON public.users
FOR ALL USING (get_user_role() = 'super_admin') WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "Tenant users can view users from their tenant" ON public.users
FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Tenant users can update their own user profile" ON public.users
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Note: INSERT for users would typically happen during sign-up process via a trigger/function, not directly via RLS.

-- RLS para Channel Providers
CREATE POLICY "Super admins can manage all channel providers" ON public.channel_providers
FOR ALL USING (get_user_role() = 'super_admin') WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "All authenticated users can read channel providers" ON public.channel_providers
FOR SELECT USING (auth.role() = 'authenticated');

-- RLS para Channels
CREATE POLICY "Super admins can view all channels" ON public.channels
FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "Super admins can manage all channels" ON public.channels
FOR ALL USING (get_user_role() = 'super_admin') WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "Tenant users can manage their own channels" ON public.channels
FOR ALL USING (tenant_id = get_user_tenant_id()) WITH CHECK (tenant_id = get_user_tenant_id());

-- RLS para Neurocores
CREATE POLICY "Super admins can view all neurocores" ON public.neurocores
FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "Super admins can manage all neurocores" ON public.neurocores
FOR ALL USING (get_user_role() = 'super_admin') WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "Tenant users can read neurocores associated with their tenant" ON public.neurocores
FOR SELECT USING (id = (SELECT neurocore_id FROM public.tenants WHERE id = get_user_tenant_id()));

-- RLS para Agents
CREATE POLICY "Super admins can view all agents" ON public.agents
FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "Super admins can manage all agents" ON public.agents
FOR ALL USING (get_user_role() = 'super_admin') WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "Tenant users can read agents associated with their tenant's neurocore" ON public.agents
FOR SELECT USING (
    get_user_tenant_id() IS NOT NULL AND (
        (SELECT neurocore_id FROM public.tenants WHERE id = get_user_tenant_id()) = ANY(associated_neurocores)
    )
);
-- A política acima permite acesso a agentes que estão associados ao NeuroCore principal do tenant do usuário.
-- O campo associated_neurocores é um array de UUIDs que contém os IDs dos NeuroCores associados ao agente.

-- RLS para Contacts
CREATE POLICY "Super admins can view all contacts" ON public.contacts
FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "Super admins can manage all contacts" ON public.contacts
FOR ALL USING (get_user_role() = 'super_admin') WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "Tenant users can manage their own contacts" ON public.contacts
FOR ALL USING (tenant_id = get_user_tenant_id()) WITH CHECK (tenant_id = get_user_tenant_id());

-- RLS para Conversations
CREATE POLICY "Super admins can view all conversations" ON public.conversations
FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "Super admins can manage all conversations" ON public.conversations
FOR ALL USING (get_user_role() = 'super_admin') WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "Tenant users can manage their own conversations" ON public.conversations
FOR ALL USING (tenant_id = get_user_tenant_id()) WITH CHECK (tenant_id = get_user_tenant_id());

-- RLS para Messages
CREATE POLICY "Super admins can view all messages" ON public.messages
FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "Super admins can manage all messages" ON public.messages
FOR ALL USING (get_user_role() = 'super_admin') WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "Tenant users can manage messages from their tenant's conversations" ON public.messages
FOR ALL USING (conversation_id IN (SELECT id FROM public.conversations WHERE tenant_id = get_user_tenant_id())) WITH CHECK (conversation_id IN (SELECT id FROM public.conversations WHERE tenant_id = get_user_tenant_id()));

-- RLS para Base de Conhecimentos
CREATE POLICY "Super admins can view all base conhecimentos" ON public.base_conhecimentos
FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "Super admins can manage all base conhecimentos" ON public.base_conhecimentos
FOR ALL USING (get_user_role() = 'super_admin') WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "Tenant users can manage their own base conhecimentos" ON public.base_conhecimentos
FOR ALL USING (tenant_id = get_user_tenant_id()) WITH CHECK (tenant_id = get_user_tenant_id());

-- RLS para Synapses
CREATE POLICY "Super admins can view all synapses" ON public.synapses
FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "Super admins can manage all synapses" ON public.synapses
FOR ALL USING (get_user_role() = 'super_admin') WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "Tenant users can manage their own synapses" ON public.synapses
FOR ALL USING (tenant_id = get_user_tenant_id()) WITH CHECK (tenant_id = get_user_tenant_id());

-- RLS para Feedbacks
CREATE POLICY "Super admins can view all feedbacks" ON public.feedbacks
FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "Super admins can manage all feedbacks" ON public.feedbacks
FOR ALL USING (get_user_role() = 'super_admin') WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "Tenant users can manage their own feedbacks" ON public.feedbacks
FOR ALL USING (tenant_id = get_user_tenant_id()) WITH CHECK (tenant_id = get_user_tenant_id());

-- RLS para Quick Reply Templates
CREATE POLICY "Super admins can view all quick reply templates" ON public.quick_reply_templates
FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "Super admins can manage all quick reply templates" ON public.quick_reply_templates
FOR ALL USING (get_user_role() = 'super_admin') WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "Tenant users can manage their own quick reply templates" ON public.quick_reply_templates
FOR ALL USING (tenant_id = get_user_tenant_id()) WITH CHECK (tenant_id = get_user_tenant_id());

-- RLS para Conversation Reactivations Settings
CREATE POLICY "Super admins can view all conv react settings" ON public.conversation_reactivations_settings
FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "Super admins can manage all conv react settings" ON public.conversation_reactivations_settings
FOR ALL USING (get_user_role() = 'super_admin') WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "Tenant users can manage their own conv react settings" ON public.conversation_reactivations_settings
FOR ALL USING (tenant_id = get_user_tenant_id()) WITH CHECK (tenant_id = get_user_tenant_id());
-- LIVIA - Database Schema
-- Task 2: Modelagem e Criação do Banco de Dados no Supabase
-- Baseado no prompt detalhado da Task 2

-- ============================================
-- 1. EXTENSÕES
-- ============================================

-- Habilita a extensão uuid-ossp para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar extensões úteis
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca com LIKE
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- Para criptografia se necessário

-- ============================================
-- 2. ENUMS (Tipos Customizados)
-- ============================================

-- Cria um tipo ENUM para as roles dos usuários
CREATE TYPE app_role AS ENUM ('super_admin', 'usuario_cliente');

-- Cria um tipo ENUM para os tipos de agent
CREATE TYPE agent_type_enum AS ENUM ('Reativo', 'Ativo');

-- Cria um tipo ENUM para as funções dos agent
CREATE TYPE agent_function_enum AS ENUM ('Atendimento', 'Vendas', 'Pós-Venda', 'Pesquisa');

-- Cria um tipo ENUM para os generos dos agent
CREATE TYPE agent_gender_enum AS ENUM ('Masculino', 'Feminino');

-- Cria um tipo ENUM para os status de contato
CREATE TYPE contact_status_enum AS ENUM ('Aberto', 'Com IA', 'Pausada', 'Encerrada');

-- Cria um tipo ENUM para os status de conversação
CREATE TYPE conversation_status_enum AS ENUM ('Conversando', 'Pausada', 'Encerrada');

-- Cria um tipo ENUM para os tipos de remetente de mensagem
CREATE TYPE message_sender_type_enum AS ENUM ('customer', 'atendente', 'ia');

-- Cria um tipo ENUM para os tipos de feedback
CREATE TYPE feedback_type_enum AS ENUM ('like', 'dislike');

-- Cria um tipo ENUM para os status de synapse
CREATE TYPE synapse_status_enum AS ENUM ('RASCUNHO', 'INDEXANDO', 'PUBLICANDO', 'ERROR');

-- Cria um tipo ENUM para os status de feedback
CREATE TYPE feedback_process_status_enum AS ENUM ('Em Aberto', 'Sendo Tratado', 'Encerrado');

-- ============================================
-- 3. FUNÇÕES AUXILIARES
-- ============================================

-- Função para atualizar `updated_at` automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. TABELAS PRINCIPAIS
-- ============================================

-- 1. NeuroCores (criar primeiro pois tenants precisa de FK)
CREATE TABLE public.neurocores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    description text NULL,
    niche varchar(100) NULL,
    api_url varchar(255) NOT NULL,
    api_secret varchar(255) NOT NULL, -- DEVE SER CRIPTOGRAFADA ou tratada com segurança
    is_active boolean NOT NULL DEFAULT TRUE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TRIGGER update_neurocores_updated_at BEFORE UPDATE ON public.neurocores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Tenants (Empresas)
CREATE TABLE public.tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    neurocore_id uuid NOT NULL, -- FK para neurocores.id, será adicionada após a criação de neurocores
    is_active boolean NOT NULL DEFAULT TRUE,
    cnpj varchar(18) UNIQUE NOT NULL,
    phone varchar(20) NOT NULL,
    responsible_tech_name varchar(255) NOT NULL,
    responsible_tech_whatsapp varchar(20) NOT NULL,
    responsible_tech_email varchar(255) NOT NULL,
    responsible_finance_name varchar(255) NOT NULL,
    responsible_finance_whatsapp varchar(20) NOT NULL,
    responsible_finance_email varchar(255) NOT NULL,
    plan varchar(50) NOT NULL,
    master_integration_url varchar(255) NULL,
    master_integration_active boolean NOT NULL DEFAULT FALSE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Adicionar FK de neurocore_id em tenants após neurocores ser criada
ALTER TABLE public.tenants ADD CONSTRAINT fk_tenants_neurocore FOREIGN KEY (neurocore_id) REFERENCES public.neurocores(id) ON DELETE RESTRICT;

-- 3. Feature Modules (Módulos de Funcionalidade)
CREATE TABLE public.feature_modules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key varchar(50) UNIQUE NOT NULL,
    name varchar(100) NOT NULL,
    description text NOT NULL,
    icon varchar(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TRIGGER update_feature_modules_updated_at BEFORE UPDATE ON public.feature_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Users (Usuários - vinculados ao Auth Supabase)
CREATE TABLE public.users (
    id uuid PRIMARY KEY, -- Id do auth.users.id
    tenant_id uuid NULL, -- FK para tenants.id, NULL para super_admin
    full_name varchar(255) NOT NULL,
    email varchar(255) UNIQUE NOT NULL,
    whatsapp_number varchar(20) NOT NULL,
    role app_role NOT NULL DEFAULT 'usuario_cliente', -- Usa o tipo ENUM app_role
    avatar_url text NULL,
    is_active boolean NOT NULL DEFAULT TRUE,
    last_sign_in_at timestamp with time zone NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    modules text[] NOT NULL DEFAULT '{}'
);
ALTER TABLE public.users ADD CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE RESTRICT;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Channel Providers (Provedores de Canal)
CREATE TABLE public.channel_providers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) UNIQUE NOT NULL,
    description text NULL,
    api_base_config jsonb NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TRIGGER update_channel_providers_updated_at BEFORE UPDATE ON public.channel_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Channels (Canais/Filas de Atendimento)
CREATE TABLE public.channels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL,
    channel_provider_id uuid NOT NULL,
    name varchar(255) NOT NULL,
    identification_number varchar(255) NOT NULL,
    instance_company_name varchar(255) UNIQUE NULL, -- Único em todo o sistema
    is_active boolean NOT NULL DEFAULT TRUE,
    is_receiving_messages boolean NOT NULL DEFAULT TRUE,
    is_sending_messages boolean NOT NULL DEFAULT TRUE,
    observations text NULL,
    external_api_url varchar(255) NULL,
    api_key text NULL, -- TEXT para permitir chaves mais longas, CRÍTICO: TRATAR COM SEGURANÇA
    config_json jsonb NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT fk_channels_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_channels_provider FOREIGN KEY (channel_provider_id) REFERENCES public.channel_providers(id) ON DELETE RESTRICT,
    UNIQUE (tenant_id, channel_provider_id, identification_number)
);
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON public.channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Agents (Agentes de IA) - usando JSONB ao invés de tabelas separadas
CREATE TABLE public.agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    type agent_type_enum NOT NULL, -- Usa o tipo ENUM agent_type_enum
    function agent_function_enum NOT NULL, -- Usa o tipo ENUM agent_function_enum
    gender agent_gender_enum NULL, -- Usa o tipo ENUM agent_gender_enum
    persona text NULL,
    personality_tone text NULL,
    communication_medium varchar(100) NULL,
    objective text NULL,
    is_intent_agent boolean NOT NULL DEFAULT FALSE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    associated_neurocores uuid[] NOT NULL DEFAULT '{}',
    instructions jsonb NOT NULL DEFAULT '[]',
    limitations jsonb NOT NULL DEFAULT '[]',
    conversation_roteiro jsonb NOT NULL DEFAULT '[]',
    other_instructions jsonb NOT NULL DEFAULT '[]'
);
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Contacts (Contatos de Clientes)
CREATE TABLE public.contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL,
    name varchar(255) NOT NULL,
    phone varchar(20) NOT NULL,
    phone_secondary varchar(20) NULL,
    email varchar(255) NULL,
    country varchar(100) NULL,
    city varchar(100) NULL,
    zip_code varchar(20) NULL,
    address_street varchar(255) NULL,
    address_number varchar(50) NULL,
    address_complement varchar(255) NULL,
    cpf varchar(14) NULL,
    rg varchar(20) NULL,
    last_interaction_at timestamp with time zone NOT NULL DEFAULT now(),
    status contact_status_enum NOT NULL, -- Usa o tipo ENUM contact_status_enum
    customer_data_extracted jsonb NULL,
    tags text[] NULL DEFAULT '{}',
    last_negotiation jsonb NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT fk_contacts_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    UNIQUE (tenant_id, phone) -- Unicidade de telefone para um tenant
);
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Conversations (Conversas)
CREATE TABLE public.conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    channel_id uuid NULL, -- FK para channels.id
    external_id varchar(255) UNIQUE NULL, -- ID da conversa na plataforma externa
    status conversation_status_enum NOT NULL, -- Usa o tipo ENUM conversation_status_enum
    ia_active boolean NOT NULL DEFAULT TRUE,
    last_message_at timestamp with time zone NOT NULL DEFAULT now(),
    overall_feedback_type feedback_type_enum NULL, -- Usa o tipo ENUM feedback_type_enum
    overall_feedback_text text NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT fk_conversations_contact FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE,
    CONSTRAINT fk_conversations_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_conversations_channel FOREIGN KEY (channel_id) REFERENCES public.channels(id) ON DELETE SET NULL -- Set NULL se o canal for excluído
);
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Messages (Mensagens)
CREATE TABLE public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL,
    sender_type message_sender_type_enum NOT NULL, -- Usa o tipo ENUM message_sender_type_enum
    sender_id uuid NULL, -- FK para users.id (atendente) ou agents.id (ia)
    content text NOT NULL,
    timestamp timestamp with time zone DEFAULT now() NOT NULL,
    feedback_type feedback_type_enum NULL, -- Usa o tipo ENUM feedback_type_enum
    feedback_text text NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender_user FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE SET NULL, -- Se sender_type = 'atendente'
    CONSTRAINT fk_messages_sender_agent FOREIGN KEY (sender_id) REFERENCES public.agents(id) ON DELETE SET NULL -- Se sender_type = 'ia'
    -- NOTE: A FK para sender_id é ambígua para user/agent. Isso será tratado por lógica de aplicação e RLS.
);
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Base de Conhecimentos
CREATE TABLE public.base_conhecimentos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL,
    name varchar(255) NOT NULL,
    description text NULL,
    neurocore_id uuid NOT NULL, -- FK para neurocores.id
    is_active boolean NOT NULL DEFAULT TRUE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT fk_base_conhecimentos_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_base_conhecimentos_neurocore FOREIGN KEY (neurocore_id) REFERENCES public.neurocores(id) ON DELETE RESTRICT,
    UNIQUE (tenant_id, name)
);
CREATE TRIGGER update_base_conhecimentos_updated_at BEFORE UPDATE ON public.base_conhecimentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Synapses
CREATE TABLE public.synapses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    base_conhecimento_id uuid NOT NULL,
    tenant_id uuid NOT NULL, -- Para facilitar filtros e RLS
    title varchar(255) NOT NULL,
    description text NULL,
    image_url text NULL,
    status synapse_status_enum NOT NULL, -- Usa o tipo ENUM synapse_status_enum
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT fk_synapses_base_conhecimento FOREIGN KEY (base_conhecimento_id) REFERENCES public.base_conhecimentos(id) ON DELETE CASCADE,
    CONSTRAINT fk_synapses_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    UNIQUE (base_conhecimento_id, title)
);
CREATE TRIGGER update_synapses_updated_at BEFORE UPDATE ON public.synapses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Feedbacks
CREATE TABLE public.feedbacks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL, -- Quem deu o feedback
    conversation_id uuid NOT NULL,
    message_id uuid NULL, -- FK para messages.id se feedback de mensagem específica
    feedback_type feedback_type_enum NOT NULL, -- Usa o tipo ENUM feedback_type_enum
    feedback_text text NULL,
    feedback_status feedback_process_status_enum NOT NULL DEFAULT 'Em Aberto', -- Usa o tipo ENUM feedback_process_status_enum
    super_admin_comment text NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT fk_feedbacks_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedbacks_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedbacks_conversation FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedbacks_message FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE SET NULL
);
CREATE TRIGGER update_feedbacks_updated_at BEFORE UPDATE ON public.feedbacks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. Quick Reply Templates (Respostas Rápidas)
CREATE TABLE public.quick_reply_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL,
    title varchar(255) NOT NULL,
    message text NOT NULL,
    icon varchar(50) NULL,
    usage_count integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT fk_quick_reply_templates_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    UNIQUE (tenant_id, title)
);
CREATE TRIGGER update_quick_reply_templates_updated_at BEFORE UPDATE ON public.quick_reply_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. Conversation Reactivations Settings (Configurações de Reativação de Conversas)
CREATE TABLE public.conversation_reactivations_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid UNIQUE NOT NULL, -- Uma única configuração por tenant
    is_active boolean NOT NULL DEFAULT FALSE,
    max_reactivations integer NOT NULL DEFAULT 0,
    reactivation_time_1_minutes integer NULL,
    reactivation_time_2_minutes integer NULL,
    reactivation_time_3_minutes integer NULL,
    reactivation_time_4_minutes integer NULL,
    reactivation_time_5_minutes integer NULL,
    start_time time NULL,
    end_time time NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT fk_conversation_reactivations_settings_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE TRIGGER update_conversation_reactivations_settings_updated_at BEFORE UPDATE ON public.conversation_reactivations_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para tenants
CREATE INDEX idx_tenants_is_active ON public.tenants(is_active);
CREATE INDEX idx_tenants_neurocore_id ON public.tenants(neurocore_id);

-- Índices para users
CREATE INDEX idx_users_tenant_id ON public.users(tenant_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_is_active ON public.users(is_active);

-- Índices para contacts
CREATE INDEX idx_contacts_tenant_id ON public.contacts(tenant_id);
CREATE INDEX idx_contacts_phone ON public.contacts(phone);
CREATE INDEX idx_contacts_status ON public.contacts(status);
CREATE INDEX idx_contacts_last_interaction_at ON public.contacts(last_interaction_at);

-- Índices para conversations
CREATE INDEX idx_conversations_tenant_id ON public.conversations(tenant_id);
CREATE INDEX idx_conversations_contact_id ON public.conversations(contact_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at);
CREATE INDEX idx_conversations_channel_id ON public.conversations(channel_id);

-- Índices para messages
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON public.messages(timestamp);
CREATE INDEX idx_messages_sender_type ON public.messages(sender_type);

-- Índices para synapses
CREATE INDEX idx_synapses_base_conhecimento_id ON public.synapses(base_conhecimento_id);
CREATE INDEX idx_synapses_tenant_id ON public.synapses(tenant_id);
CREATE INDEX idx_synapses_status ON public.synapses(status);

-- Índices para feedbacks
CREATE INDEX idx_feedbacks_tenant_id ON public.feedbacks(tenant_id);
CREATE INDEX idx_feedbacks_conversation_id ON public.feedbacks(conversation_id);
CREATE INDEX idx_feedbacks_feedback_status ON public.feedbacks(feedback_status);

-- Índices para quick_reply_templates
CREATE INDEX idx_quick_replies_tenant_id ON public.quick_reply_templates(tenant_id);
CREATE INDEX idx_quick_replies_usage_count ON public.quick_reply_templates(usage_count DESC);

-- Índices para channels
CREATE INDEX idx_channels_tenant_id ON public.channels(tenant_id);
CREATE INDEX idx_channels_channel_provider_id ON public.channels(channel_provider_id);

-- ============================================
-- 6. COMENTÁRIOS NAS TABELAS
-- ============================================

COMMENT ON TABLE public.tenants IS 'Empresas/clientes que usam a plataforma LIVIA';
COMMENT ON TABLE public.users IS 'Usuários do sistema (Super Admin ou Cliente)';
COMMENT ON TABLE public.neurocores IS 'NeuroCores - Instâncias de IA configuradas';
COMMENT ON TABLE public.agents IS 'Agentes de IA configuráveis';
COMMENT ON TABLE public.contacts IS 'Contatos de clientes dos tenants';
COMMENT ON TABLE public.conversations IS 'Conversas entre contatos e atendentes/IA';
COMMENT ON TABLE public.messages IS 'Mensagens dentro das conversas';
COMMENT ON TABLE public.base_conhecimentos IS 'Bases de conhecimento dos tenants';
COMMENT ON TABLE public.synapses IS 'Synapses (conhecimentos) dentro das bases';
COMMENT ON TABLE public.feedbacks IS 'Feedbacks de usuários sobre conversas/mensagens';
COMMENT ON TABLE public.quick_reply_templates IS 'Templates de respostas rápidas dos tenants';
COMMENT ON TABLE public.channel_providers IS 'Provedores de canais de comunicação';
COMMENT ON TABLE public.channels IS 'Canais/filas de atendimento dos tenants';
COMMENT ON TABLE public.conversation_reactivations_settings IS 'Configurações de reativação automática de conversas';
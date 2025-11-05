-- Seed Completo: Dados Iniciais do Sistema
-- Execute este script APÓS executar todas as migrations anteriores
-- Este script popula o banco com dados de exemplo baseados no seed-data.ts

-- ============================================
-- 1. FEATURE MODULES (módulos do sistema)
-- ============================================

INSERT INTO public.feature_modules (id, key, name, description, icon)
VALUES 
    (gen_random_uuid(), 'MOD_DASHBOARD', 'Dashboard', 'Visualização de métricas e KPIs', 'gauge'),
    (gen_random_uuid(), 'MOD_LIVE_CHAT', 'Live Chat', 'Gerenciamento de conversas em tempo real', 'messages-square'),
    (gen_random_uuid(), 'MOD_BASE_CONHECIMENTO', 'Base de Conhecimento', 'Gestão de bases de conhecimento e synapses', 'book'),
    (gen_random_uuid(), 'MOD_PERSONALIZACAO_NEUROCORE', 'Personalização NeuroCore', 'Configuração de agentes de IA', 'settings'),
    (gen_random_uuid(), 'MOD_TREINAMENTO_NEUROCORE', 'Treinamento NeuroCore', 'Teste e treinamento da IA', 'wand')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 2. NEUROCORES (criar primeiro pois tenants precisa)
-- ============================================

DO $$
DECLARE
    _neurocore1_id UUID;
    _neurocore2_id UUID;
BEGIN
    -- Verificar se já existem
    SELECT id INTO _neurocore1_id FROM public.neurocores WHERE name = 'NeuroCore Varejo' LIMIT 1;
    SELECT id INTO _neurocore2_id FROM public.neurocores WHERE name = 'NeuroCore Saúde' LIMIT 1;

    -- Criar se não existirem
    IF _neurocore1_id IS NULL THEN
        _neurocore1_id := gen_random_uuid();
        INSERT INTO public.neurocores (id, name, description, niche, api_url, api_secret, is_active, created_at)
        VALUES (_neurocore1_id, 'NeuroCore Varejo', 'NeuroCore especializado em atendimento para varejo', 'Varejo', 'https://api.neurocore.example.com/varejo', 'secret_varejo_123', TRUE, NOW());
    END IF;

    IF _neurocore2_id IS NULL THEN
        _neurocore2_id := gen_random_uuid();
        INSERT INTO public.neurocores (id, name, description, niche, api_url, api_secret, is_active, created_at)
        VALUES (_neurocore2_id, 'NeuroCore Saúde', 'NeuroCore especializado em atendimento para área da saúde', 'Saúde', 'https://api.neurocore.example.com/saude', 'secret_saude_456', TRUE, NOW());
    END IF;
END $$;

-- ============================================
-- 3. TENANTS (Empresas)
-- ============================================

DO $$
DECLARE
    _tenant1_id UUID;
    _tenant2_id UUID;
    _tenant3_id UUID;
    _neurocore1_id UUID;
    _neurocore2_id UUID;
BEGIN
    -- Buscar IDs dos neurocores criados
    SELECT id INTO _neurocore1_id FROM public.neurocores WHERE name = 'NeuroCore Varejo' LIMIT 1;
    SELECT id INTO _neurocore2_id FROM public.neurocores WHERE name = 'NeuroCore Saúde' LIMIT 1;

    -- Criar tenants se não existirem
    SELECT id INTO _tenant1_id FROM public.tenants WHERE cnpj = '12.345.678/0001-90' LIMIT 1;
    IF _tenant1_id IS NULL THEN
        _tenant1_id := gen_random_uuid();
        INSERT INTO public.tenants (
            id, name, neurocore_id, is_active, cnpj, phone,
            responsible_tech_name, responsible_tech_whatsapp, responsible_tech_email,
            responsible_finance_name, responsible_finance_whatsapp, responsible_finance_email,
            plan, created_at
        )
        VALUES (
            _tenant1_id, 'Loja Tech Store', _neurocore1_id, TRUE, '12.345.678/0001-90', '+55 11 98765-4321',
            'Carlos Silva', '+55 11 98765-1111', 'carlos@techstore.com',
            'Maria Santos', '+55 11 98765-2222', 'maria@techstore.com',
            'Premium', NOW()
        );
    END IF;

    SELECT id INTO _tenant2_id FROM public.tenants WHERE cnpj = '98.765.432/0001-10' LIMIT 1;
    IF _tenant2_id IS NULL THEN
        _tenant2_id := gen_random_uuid();
        INSERT INTO public.tenants (
            id, name, neurocore_id, is_active, cnpj, phone,
            responsible_tech_name, responsible_tech_whatsapp, responsible_tech_email,
            responsible_finance_name, responsible_finance_whatsapp, responsible_finance_email,
            plan, created_at
        )
        VALUES (
            _tenant2_id, 'Clínica Vida Saudável', _neurocore2_id, TRUE, '98.765.432/0001-10', '+55 21 97654-3210',
            'João Pedro', '+55 21 97654-1111', 'joao@vidasaudavel.com',
            'Ana Costa', '+55 21 97654-2222', 'ana@vidasaudavel.com',
            'Business', NOW()
        );
    END IF;

    SELECT id INTO _tenant3_id FROM public.tenants WHERE cnpj = '11.222.333/0001-44' LIMIT 1;
    IF _tenant3_id IS NULL THEN
        _tenant3_id := gen_random_uuid();
        INSERT INTO public.tenants (
            id, name, neurocore_id, is_active, cnpj, phone,
            responsible_tech_name, responsible_tech_whatsapp, responsible_tech_email,
            responsible_finance_name, responsible_finance_whatsapp, responsible_finance_email,
            plan, created_at
        )
        VALUES (
            _tenant3_id, 'Empresa Inativa', _neurocore1_id, FALSE, '11.222.333/0001-44', '+55 11 91111-2222',
            'Pedro Oliveira', '+55 11 91111-3333', 'pedro@inativa.com',
            'Julia Lima', '+55 11 91111-4444', 'julia@inativa.com',
            'Basic', NOW()
        );
    END IF;
END $$;

-- ============================================
-- 4. AGENTS (Agentes de IA)
-- ============================================

DO $$
DECLARE
    _agent_intents_id UUID;
    _agent_sales_id UUID;
    _agent_support_id UUID;
BEGIN
    -- Verificar se já existem
    SELECT id INTO _agent_intents_id FROM public.agents WHERE name = 'Agente de Intenções' LIMIT 1;
    SELECT id INTO _agent_sales_id FROM public.agents WHERE name = 'Agente de Vendas' LIMIT 1;
    SELECT id INTO _agent_support_id FROM public.agents WHERE name = 'Agente de Suporte' LIMIT 1;

    -- Criar se não existirem
    IF _agent_intents_id IS NULL THEN
        _agent_intents_id := gen_random_uuid();
        INSERT INTO public.agents (
            id, name, type, function, gender, persona, personality_tone,
            communication_medium, objective, is_intent_agent, created_at
        )
        VALUES (
            _agent_intents_id, 'Agente de Intenções', 'Reativo', 'Atendimento', NULL,
            'Detecta a intenção do cliente e direciona para o agente adequado.', 'Neutro e objetivo',
            'WhatsApp', 'Classificar e rotear conversas.', TRUE, NOW()
        );
    END IF;

    IF _agent_sales_id IS NULL THEN
        _agent_sales_id := gen_random_uuid();
        INSERT INTO public.agents (
            id, name, type, function, gender, persona, personality_tone,
            communication_medium, objective, is_intent_agent, created_at
        )
        VALUES (
            _agent_sales_id, 'Agente de Vendas', 'Ativo', 'Vendas', 'Feminino',
            'Uma vendedora simpática e persuasiva, focada em fechar negócios.', 'Amigável e confiante',
            'WhatsApp', 'Apresentar produtos e converter vendas.', FALSE, NOW()
        );
    END IF;

    IF _agent_support_id IS NULL THEN
        _agent_support_id := gen_random_uuid();
        INSERT INTO public.agents (
            id, name, type, function, gender, persona, personality_tone,
            communication_medium, objective, is_intent_agent, created_at
        )
        VALUES (
            _agent_support_id, 'Agente de Suporte', 'Reativo', 'Atendimento', 'Masculino',
            'Um especialista em suporte técnico, paciente e didático.', 'Educado e prestativo',
            'WhatsApp', 'Resolver problemas e tirar dúvidas.', FALSE, NOW()
        );
    END IF;
END $$;

-- ============================================
-- 5. VERIFICAR SE OS DADOS FORAM INSERIDOS
-- ============================================

SELECT 'Feature Modules' as tabela, COUNT(*) as total FROM public.feature_modules
UNION ALL
SELECT 'NeuroCores', COUNT(*) FROM public.neurocores
UNION ALL
SELECT 'Tenants', COUNT(*) FROM public.tenants
UNION ALL
SELECT 'Agents', COUNT(*) FROM public.agents;

-- ============================================
-- NOTA: Dados adicionais (contacts, conversations, messages, etc.)
-- podem ser inseridos conforme necessário através da aplicação
-- ou através de scripts adicionais se necessário
-- ============================================

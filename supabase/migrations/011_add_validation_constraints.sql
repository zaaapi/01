-- Migration: 011_add_validation_constraints.sql
-- Adiciona constraints de validação para garantir integridade dos dados

-- ============================================
-- 1. VALIDAÇÃO DE CNPJ
-- ============================================

-- Função para validar formato de CNPJ (básico)
-- Nota: Validação completa de CNPJ seria mais complexa (dígitos verificadores)
ALTER TABLE public.tenants 
ADD CONSTRAINT check_cnpj_format 
CHECK (cnpj ~ '^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$');

-- ============================================
-- 2. VALIDAÇÃO DE TELEFONE
-- ============================================

-- Validação básica de telefone brasileiro (+55 XX XXXXX-XXXX ou +55 XX XXXX-XXXX)
ALTER TABLE public.tenants 
ADD CONSTRAINT check_phone_format 
CHECK (phone ~ '^\+55\s\d{2}\s\d{4,5}-\d{4}$');

ALTER TABLE public.users 
ADD CONSTRAINT check_whatsapp_number_format 
CHECK (whatsapp_number ~ '^\+55\d{10,11}$' OR whatsapp_number ~ '^\+55\s\d{2}\s\d{4,5}-\d{4}$');

ALTER TABLE public.contacts 
ADD CONSTRAINT check_contact_phone_format 
CHECK (phone ~ '^\+55\d{10,11}$' OR phone ~ '^\+55\s\d{2}\s\d{4,5}-\d{4}$');

-- ============================================
-- 3. VALIDAÇÃO DE EMAIL
-- ============================================

-- Validação básica de formato de email
ALTER TABLE public.users 
ADD CONSTRAINT check_email_format 
CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

-- ============================================
-- 4. VALIDAÇÃO DE CPF (OPCIONAL)
-- ============================================

-- Validação básica de formato de CPF (se fornecido)
ALTER TABLE public.contacts 
ADD CONSTRAINT check_cpf_format 
CHECK (cpf IS NULL OR cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$');

-- ============================================
-- 5. VALIDAÇÃO DE DOMÍNIOS ESPECÍFICOS (OPCIONAL)
-- ============================================

-- Se necessário, adicionar validações específicas de domínio
-- Exemplo: garantir que emails de super_admin sejam de domínio específico
-- Isso pode ser feito via trigger ou constraint CHECK mais complexa

-- ============================================
-- 6. COMENTÁRIOS EXPLICATIVOS
-- ============================================

COMMENT ON CONSTRAINT check_cnpj_format ON public.tenants IS 'Valida formato básico de CNPJ (XX.XXX.XXX/XXXX-XX)';
COMMENT ON CONSTRAINT check_phone_format ON public.tenants IS 'Valida formato de telefone brasileiro (+55 XX XXXXX-XXXX)';
COMMENT ON CONSTRAINT check_email_format ON public.users IS 'Valida formato básico de email';
COMMENT ON CONSTRAINT check_cpf_format ON public.contacts IS 'Valida formato básico de CPF (XXX.XXX.XXX-XX)';


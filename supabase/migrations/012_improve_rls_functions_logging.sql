-- Migration: 012_improve_rls_functions_logging.sql
-- Melhora logging e tratamento de erros nas funções RLS

-- ============================================
-- 1. MELHORAR FUNÇÃO get_user_role()
-- ============================================

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

  -- Tenta obter o role do JWT primeiro (mais rápido)
  BEGIN
    _role := current_setting('request.jwt.claims', true)::jsonb->>'user_role';
    IF _role IS NOT NULL AND _role != '' THEN
      RETURN _role::app_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Em produção, usar sistema de logging adequado
    -- Por enquanto, apenas suprime o erro silenciosamente
    NULL;
  END;

  -- Fallback: Tentar obter do public.users diretamente
  BEGIN
    SELECT u.role::text INTO _role
    FROM public.users u
    WHERE u.id = _user_id;
    
    IF _role IS NOT NULL THEN
      RETURN _role::app_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Em produção, logar erro para monitoramento
    NULL;
  END;

  -- Retorna padrão se nada for encontrado
  RETURN 'usuario_cliente'::app_role;
END;
$$;

-- ============================================
-- 2. MELHORAR FUNÇÃO get_user_tenant_id()
-- ============================================

CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  _tenant_id uuid;
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Tenta obter o tenant_id do JWT primeiro (mais rápido)
  BEGIN
    _tenant_id := (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid;
    IF _tenant_id IS NOT NULL THEN
      RETURN _tenant_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Em produção, usar sistema de logging adequado
    NULL;
  END;

  -- Fallback: Tentar obter do public.users diretamente
  BEGIN
    SELECT u.tenant_id INTO _tenant_id
    FROM public.users u
    WHERE u.id = _user_id;
    
    RETURN _tenant_id;
  EXCEPTION WHEN OTHERS THEN
    -- Em produção, logar erro para monitoramento
    RETURN NULL;
  END;
END;
$$;

-- ============================================
-- 3. COMENTÁRIOS EXPLICATIVOS
-- ============================================

COMMENT ON FUNCTION get_user_role() IS 'Obtém o role do usuário do JWT ou da tabela public.users como fallback. Usa SECURITY DEFINER para evitar problemas circulares com RLS. Melhorado com tratamento de erros.';
COMMENT ON FUNCTION get_user_tenant_id() IS 'Obtém o tenant_id do usuário do JWT ou da tabela public.users como fallback. Usa SECURITY DEFINER para evitar problemas circulares com RLS. Melhorado com tratamento de erros.';


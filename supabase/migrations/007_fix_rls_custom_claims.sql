-- Fix RLS Custom Claims Access
-- Garante que os custom claims sejam acessíveis corretamente nas políticas RLS
-- IMPORTANTE: Esta função não deve tentar ler de public.users durante o processo de autenticação
-- para evitar problemas circulares com RLS

-- Versão melhorada da função get_user_role que tenta múltiplos caminhos
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS app_role LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  _role text;
  _user_id uuid;
BEGIN
  -- Primeiro, verifica se há um usuário autenticado
  _user_id := auth.uid();
  
  -- Se não há usuário autenticado, retorna padrão
  IF _user_id IS NULL THEN
    RETURN 'usuario_cliente'::app_role;
  END IF;

  -- Tenta obter o role de diferentes caminhos possíveis no JWT
  -- Caminho 1: request.jwt.claims (padrão do Supabase)
  BEGIN
    _role := current_setting('request.jwt.claims', true)::jsonb->>'user_role';
    IF _role IS NOT NULL AND _role != '' THEN
      RETURN _role::app_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Caminho 2: Tentar obter do public.users diretamente (fallback)
  -- Usa SECURITY DEFINER para bypassar RLS temporariamente
  BEGIN
    SELECT u.role::text INTO _role
    FROM public.users u
    WHERE u.id = _user_id;
    
    IF _role IS NOT NULL THEN
      RETURN _role::app_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Retorna 'usuario_cliente' como padrão se nada for encontrado
  RETURN 'usuario_cliente'::app_role;
END;
$$;

-- Versão melhorada da função get_user_tenant_id()
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  _tenant_id uuid;
  _user_id uuid;
BEGIN
  -- Primeiro, verifica se há um usuário autenticado
  _user_id := auth.uid();
  
  -- Se não há usuário autenticado, retorna NULL
  IF _user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Tenta obter o tenant_id de diferentes caminhos possíveis no JWT
  BEGIN
    _tenant_id := (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid;
    IF _tenant_id IS NOT NULL THEN
      RETURN _tenant_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Fallback: Tentar obter do public.users diretamente
  -- Usa SECURITY DEFINER para bypassar RLS temporariamente
  BEGIN
    SELECT u.tenant_id INTO _tenant_id
    FROM public.users u
    WHERE u.id = _user_id;
    
    RETURN _tenant_id;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION get_user_role() IS 'Obtém o role do usuário do JWT ou da tabela public.users como fallback. Usa SECURITY DEFINER para evitar problemas circulares com RLS.';
COMMENT ON FUNCTION get_user_tenant_id() IS 'Obtém o tenant_id do usuário do JWT ou da tabela public.users como fallback. Usa SECURITY DEFINER para evitar problemas circulares com RLS.';


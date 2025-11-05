-- Fix RLS Login Circular Dependency
-- Resolve o problema de dependência circular onde get_user_role() precisa ler de public.users
-- mas as políticas RLS dependem de get_user_role() para funcionar

-- Primeiro, vamos garantir que as funções usem SECURITY DEFINER para bypassar RLS
-- (já feito na migration 007, mas vamos garantir que está correto)

-- Versão melhorada da função get_user_role() com SECURITY DEFINER
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

  -- Tenta obter o role do JWT primeiro
  BEGIN
    _role := current_setting('request.jwt.claims', true)::jsonb->>'user_role';
    IF _role IS NOT NULL AND _role != '' THEN
      RETURN _role::app_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Fallback: Tentar obter do public.users diretamente
  -- SECURITY DEFINER permite bypassar RLS temporariamente
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

-- Versão melhorada da função get_user_tenant_id() com SECURITY DEFINER
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

  -- Tenta obter o tenant_id do JWT primeiro
  BEGIN
    _tenant_id := (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid;
    IF _tenant_id IS NOT NULL THEN
      RETURN _tenant_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Fallback: Tentar obter do public.users diretamente
  -- SECURITY DEFINER permite bypassar RLS temporariamente
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

-- Garantir que a política "Users can view their own profile" está funcionando corretamente
-- Esta política deve ter prioridade sobre as outras para evitar problemas durante o login
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
FOR SELECT USING (auth.uid() = id);

-- Comentários explicativos
COMMENT ON FUNCTION get_user_role() IS 'Obtém o role do usuário do JWT ou da tabela public.users como fallback. Usa SECURITY DEFINER para evitar problemas circulares com RLS durante o login.';
COMMENT ON FUNCTION get_user_tenant_id() IS 'Obtém o tenant_id do usuário do JWT ou da tabela public.users como fallback. Usa SECURITY DEFINER para evitar problemas circulares com RLS durante o login.';


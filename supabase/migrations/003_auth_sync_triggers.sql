-- Task 4: Funções e Triggers para Sincronização de Autenticação
-- Execute este SQL no Supabase via MCP ou SQL Editor

-- Função para criar ou atualizar o perfil do usuário na tabela public.users
-- e sincronizar roles/tenant_id com os metadados do auth.users para o JWT.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    _tenant_id uuid;
    _user_role public.app_role := 'usuario_cliente';
BEGIN
    -- Se o usuário não tem um email verificado ou é um novo usuário
    IF NEW.email_confirmed_at IS NOT NULL OR NEW.raw_app_meta_data IS NULL THEN
        -- Insere o usuário na tabela public.users se ele ainda não existir
        INSERT INTO public.users (id, email, full_name, whatsapp_number, role, avatar_url, is_active, last_sign_in_at)
        VALUES (NEW.id, NEW.email, NEW.email, '5511000000000', _user_role, NULL, TRUE, NOW())
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            last_sign_in_at = NOW(),
            updated_at = NOW();

        -- Pega o tenant_id e role do public.users para incluir no JWT
        SELECT u.tenant_id, u.role INTO _tenant_id, _user_role
        FROM public.users u
        WHERE u.id = NEW.id;

        -- Atualiza os metadados do app no auth.users para incluir role e tenant_id
        UPDATE auth.users
        SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object(
            'user_role', _user_role::text,
            'tenant_id', _tenant_id::text
        )::jsonb
        WHERE id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar handle_new_user SEMPRE que um usuário é INSERIDO em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para executar handle_new_user quando email_confirmed_at é definido
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL)
EXECUTE FUNCTION public.handle_new_user();

-- Trigger para executar handle_new_user quando raw_app_meta_data muda
DROP TRIGGER IF EXISTS on_auth_user_meta_updated ON auth.users;
CREATE TRIGGER on_auth_user_meta_updated
AFTER UPDATE OF raw_app_meta_data ON auth.users
FOR EACH ROW
WHEN (NEW.raw_app_meta_data IS DISTINCT FROM OLD.raw_app_meta_data)
EXECUTE FUNCTION public.handle_new_user();

-- Função para sincronizar as mudanças de role/tenant_id em public.users para auth.users.raw_app_meta_data
CREATE OR REPLACE FUNCTION public.sync_user_profile_changes()
RETURNS TRIGGER AS $$
DECLARE
    _tenant_id uuid;
    _user_role public.app_role;
BEGIN
    _tenant_id := NEW.tenant_id;
    _user_role := NEW.role;

    -- Atualiza os metadados do app no auth.users
    UPDATE auth.users
    SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object(
        'user_role', _user_role::text,
        'tenant_id', _tenant_id::text
    )::jsonb
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar sync_user_profile_changes SEMPRE que role ou tenant_id são atualizados em public.users
DROP TRIGGER IF EXISTS on_public_user_profile_updated ON public.users;
CREATE TRIGGER on_public_user_profile_updated
AFTER UPDATE OF role, tenant_id ON public.users
FOR EACH ROW EXECUTE FUNCTION public.sync_user_profile_changes();

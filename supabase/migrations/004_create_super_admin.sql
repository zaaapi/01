-- Seed Inicial: Criar Super Admin
-- INSTRUÇÕES IMPORTANTES:
-- 
-- PASSO 1: Crie o usuário via Dashboard do Supabase primeiro!
--   1. Acesse Authentication > Users
--   2. Clique em "Add User" > "Create New User"
--   3. Email: admin@livia.com
--   4. Password: Admin123!@# (ou outra senha)
--   5. Marque "Auto Confirm User"
--   6. Clique em "Create User"
--
-- PASSO 2: Execute este SQL para atualizar o role para super_admin

-- Atualizar o usuário criado para super_admin
DO $$
DECLARE
    _admin_email VARCHAR := 'admin@livia.com';
    _admin_id UUID;
BEGIN
    -- Buscar o ID do usuário pelo email
    SELECT id INTO _admin_id
    FROM auth.users
    WHERE email = _admin_email;

    IF _admin_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado! Crie o usuário primeiro via Dashboard do Supabase (Authentication > Users > Add User). Email: %', _admin_email;
    END IF;

    RAISE NOTICE 'Usuário encontrado com ID: %', _admin_id;

    -- Aguardar um pouco para o trigger executar (se necessário)
    PERFORM pg_sleep(0.1);

    -- Atualizar o registro em public.users para super_admin
    UPDATE public.users
    SET 
        role = 'super_admin',
        full_name = 'Admin Geral LIVIA',
        whatsapp_number = '+55 11 99999-9999',
        avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        is_active = TRUE,
        modules = ARRAY[]::text[],
        last_sign_in_at = NOW()
    WHERE id = _admin_id;

    -- Sincronizar os custom claims no auth.users
    UPDATE auth.users
    SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object(
        'user_role', 'super_admin',
        'tenant_id', NULL::text
    )::jsonb
    WHERE id = _admin_id;

    RAISE NOTICE 'Super Admin atualizado com sucesso!';
    RAISE NOTICE 'Email: %', _admin_email;
    RAISE NOTICE 'ID: %', _admin_id;
END $$;

-- Verificar se foi criado/atualizado corretamente
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.is_active,
    au.raw_app_meta_data->>'user_role' as jwt_role,
    au.raw_app_meta_data->>'tenant_id' as jwt_tenant_id
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'admin@livia.com';


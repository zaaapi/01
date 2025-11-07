# Task 4 - Setup de Autenticação Supabase

Este documento descreve os passos necessários para completar a configuração da autenticação com Supabase.

## 1. Configurar Variáveis de Ambiente

📖 **Guia Completo**: Veja o arquivo `docs/SUPABASE_ENV_SETUP.md` para um guia passo a passo detalhado de como obter as credenciais do Supabase.

**Resumo rápido:**

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Vá em **Settings** > **API**
3. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copie o arquivo `env.example.txt` para `.env.local` na raiz do projeto
5. Preencha as variáveis no `.env.local`
6. Reinicie o servidor de desenvolvimento (`npm run dev`)

## 2. Executar Migração SQL no Supabase

Execute o arquivo SQL `supabase/migrations/003_auth_sync_triggers.sql` no Supabase:

### Opção A: Via SQL Editor do Supabase (Recomendado)

1. Acesse o [SQL Editor](https://app.supabase.com/project/_/sql) no dashboard do Supabase
2. Clique em **New Query**
3. Cole o conteúdo do arquivo `supabase/migrations/003_auth_sync_triggers.sql`
4. Clique em **Run** ou pressione `Ctrl+Enter`

### Opção B: Via Supabase CLI

Se você tiver o Supabase CLI instalado:

```bash
supabase db push
```

Ou execute manualmente:

```bash
supabase db execute --file supabase/migrations/003_auth_sync_triggers.sql
```

## 3. Configurar Authentication no Supabase

No dashboard do Supabase:

1. Vá em **Authentication > Settings**
2. Certifique-se de que **Email Sign-in** está habilitado
3. Em **Site URL**, adicione:
   - `http://localhost:3000` (desenvolvimento)
   - Sua URL de produção (se aplicável)
4. Em **Redirect URLs**, adicione:
   - `http://localhost:3000/auth/callback` (se usar callback)
   - `http://localhost:3000/**` (para desenvolvimento)

## 4. Atualizar Super Admin (se já existir)

Se você já criou um usuário super_admin no seed:

1. Execute no SQL Editor do Supabase:
   ```sql
   UPDATE auth.users
   SET raw_app_meta_data = raw_app_meta_data || '{"user_role": "super_admin"}'::jsonb
   WHERE id = (SELECT id FROM public.users WHERE role = 'super_admin' LIMIT 1);
   ```

Ou atualize manualmente o registro em `public.users` para disparar o trigger:

```sql
UPDATE public.users
SET role = 'super_admin'
WHERE email = 'email-do-super-admin@exemplo.com';
```

## 5. Testar o Fluxo

1. **Inicie o servidor de desenvolvimento:**

   ```bash
   npm run dev
   ```

2. **Teste o Signup:**
   - Acesse `http://localhost:3000/signup`
   - Crie uma nova conta
   - Verifique se recebeu o email de confirmação (se habilitado)

3. **Teste o Login:**
   - Acesse `http://localhost:3000/login`
   - Faça login com as credenciais criadas
   - Verifique se foi redirecionado para o dashboard correto baseado na role

4. **Verificar Custom Claims:**
   - No Supabase Dashboard, vá em **Authentication > Users**
   - Selecione um usuário
   - Verifique se `raw_app_meta_data` contém `user_role` e `tenant_id`

## Troubleshooting

### Erro: "Missing Supabase environment variables"

- Verifique se o arquivo `.env.local` existe e contém as variáveis corretas
- Reinicie o servidor de desenvolvimento após adicionar variáveis

### Erro: "User profile not found"

- Verifique se os triggers foram executados corretamente
- Execute manualmente a função `handle_new_user()` se necessário

### Redirecionamento não funciona

- Verifique se o `role` do usuário está correto em `public.users`
- Verifique se os custom claims estão no `raw_app_meta_data` do `auth.users`

### RLS bloqueando queries

- Verifique se as políticas RLS estão configuradas corretamente (Task 2)
- Verifique se os custom claims estão sendo incluídos no JWT

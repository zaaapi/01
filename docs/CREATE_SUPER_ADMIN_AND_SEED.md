# Criar Super Admin e Seed do Banco - Guia Passo a Passo

Este guia mostra como criar o usuário super admin e popular o banco com dados iniciais.

## Passo 1: Criar Usuário Super Admin via Dashboard

**Método Recomendado** - Via Dashboard do Supabase:

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Authentication** > **Users**
4. Clique em **Add User** > **Create New User**
5. Preencha:
   - **Email**: `admin@livia.com`
   - **Password**: `Admin123!@#` (ou outra senha segura)
   - **Auto Confirm User**: ✅ Marque esta checkbox
6. Clique em **Create User**

## Passo 2: Executar SQL para Atualizar Role do Super Admin

Após criar o usuário via Dashboard:

1. Acesse o **SQL Editor** no Supabase Dashboard
2. Execute o arquivo `supabase/migrations/004_create_super_admin.sql`
   - Este script atualiza o usuário criado para ter role `super_admin`
   - Sincroniza os custom claims no JWT

## Passo 3: Executar Seed de Dados Iniciais

1. Ainda no **SQL Editor**, execute o arquivo `supabase/migrations/005_seed_initial_data.sql`
   - Este script cria:
     - ✅ Feature Modules (5 módulos)
     - ✅ NeuroCores (2 neurocores)
     - ✅ Tenants (3 empresas)
     - ✅ Agents (3 agentes de IA)

## Passo 4: Verificar os Dados

Execute este SQL para verificar se tudo foi criado:

```sql
-- Verificar contagens
SELECT 'Feature Modules' as tabela, COUNT(*) as total FROM public.feature_modules
UNION ALL
SELECT 'NeuroCores', COUNT(*) FROM public.neurocores
UNION ALL
SELECT 'Tenants', COUNT(*) FROM public.tenants
UNION ALL
SELECT 'Agents', COUNT(*) FROM public.agents
UNION ALL
SELECT 'Users', COUNT(*) FROM public.users;
```

## Credenciais do Super Admin

Após executar os scripts:

- **Email**: `admin@livia.com`
- **Senha**: A senha que você definiu no Dashboard
- **Role**: `super_admin`

## Testar Login

1. Acesse `http://localhost:3000/login`
2. Faça login com as credenciais acima
3. Você deve ser redirecionado para `/super-admin`

## Troubleshooting

### Erro: "Usuário não encontrado!"

- Verifique se você criou o usuário via Dashboard primeiro
- Verifique se o email está correto: `admin@livia.com`

### Erro ao executar seed

- Verifique se executou as migrations anteriores (`001_initial_schema.sql`, `002_rls_policies.sql`, `003_auth_sync_triggers.sql`)
- Verifique se não há dados duplicados (os scripts usam `ON CONFLICT DO NOTHING`)

### Super Admin não consegue fazer login

- Verifique se o `role` está como `super_admin` em `public.users`
- Verifique se os custom claims estão no `raw_app_meta_data` do `auth.users`

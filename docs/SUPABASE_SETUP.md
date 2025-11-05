# Configuração do Supabase - LIVIA

Este documento descreve como configurar o Supabase para o projeto LIVIA.

## 📋 Pré-requisitos

1. Conta no Supabase (https://supabase.com)
2. Projeto criado no Supabase

## 🔧 Configuração Inicial

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

**Como obter essas variáveis:**
1. Acesse o painel do Supabase: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Executar Migrações

Execute as migrações SQL no Supabase:

1. Acesse o SQL Editor no painel do Supabase
2. Execute o arquivo `supabase/migrations/001_initial_schema.sql`
3. Execute o arquivo `supabase/migrations/002_rls_policies.sql`

Ou use a CLI do Supabase:

```bash
# Se você tiver a CLI instalada
supabase db push
```

## 🔐 Segurança (RLS)

O projeto usa **Row Level Security (RLS)** para garantir que:

- **Super Admin**: Tem acesso total a todas as tabelas
- **Usuários Cliente**: Só podem acessar dados do seu próprio tenant

As políticas RLS estão configuradas em `supabase/migrations/002_rls_policies.sql`.

## 📚 Uso do Cliente Supabase

### No Servidor (Server Components / Server Actions)

```typescript
import { createSupabaseServerClient } from '@/db';
import { getCurrentUserWithProfile } from '@/db/auth-helpers';

// Em Server Components
export default async function MyPage() {
  const supabase = createSupabaseServerClient();
  const user = await getCurrentUserWithProfile();
  
  // ...
}
```

### No Cliente (Client Components)

```typescript
'use client';

import { createSupabaseClient } from '@/db';
import { useEffect, useState } from 'react';

export function MyComponent() {
  const [user, setUser] = useState(null);
  const supabase = createSupabaseClient();
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);
  
  // ...
}
```

## 🔑 Helpers de Autenticação

Os helpers estão disponíveis em `db/auth-helpers.ts`:

- `getCurrentUser()` - Obtém o usuário autenticado
- `getCurrentUserWithProfile()` - Obtém usuário com dados da tabela `users`
- `isSuperAdmin()` - Verifica se o usuário é super admin
- `getCurrentUserTenantId()` - Obtém o tenant_id do usuário atual

## 📝 Próximos Passos

Após configurar o Supabase:

1. ✅ Task 2: Modelagem e Criação do Banco de Dados (FEITO)
2. ⏭️ Task 3: Preenchimento do Banco de Dados (Seed)
3. ⏭️ Task 4: Integração de Autenticação

## 🐛 Troubleshooting

### Erro: "Missing Supabase environment variables"

Certifique-se de que o arquivo `.env.local` existe e contém as variáveis corretas.

### Erro: "Row Level Security policy violation"

Verifique se:
1. As migrações RLS foram executadas
2. O usuário está autenticado
3. O usuário tem permissões adequadas (super_admin ou pertence ao tenant)

### Erro ao criar cliente no servidor

Certifique-se de usar `createSupabaseServerClient()` em Server Components/Actions e `createSupabaseClient()` em Client Components.



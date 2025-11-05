# Configuração de Variáveis de Ambiente - Supabase

Este guia mostra passo a passo como obter as variáveis de ambiente necessárias do Supabase para configurar o projeto.

## Passo 1: Acessar o Dashboard do Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Faça login com sua conta (ou crie uma conta se ainda não tiver)
3. Selecione seu projeto ou crie um novo projeto

## Passo 2: Obter as Credenciais da API

### Método 1: Via Settings > API (Recomendado)

1. No menu lateral esquerdo, clique em **Settings** (⚙️)
2. Clique em **API** no submenu
3. Você verá duas seções importantes:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   - Esta é a `NEXT_PUBLIC_SUPABASE_URL`
   - Copie este valor completo

   **Project API keys:**
   - **`anon` `public`** - Esta é a chave que você precisa
   - Esta é a `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Clique no ícone de **cópia** (📋) ao lado da chave `anon` `public`
   - ⚠️ **IMPORTANTE**: Use a chave `anon` `public`, NÃO a chave `service_role` (ela tem permissões administrativas e não deve ser exposta no frontend)

### Método 2: Via Project Settings > General

1. No menu lateral, clique em **Settings** > **General**
2. Role até a seção **Reference ID**
3. Você verá:
   - **Reference ID**: ID do projeto
   - **Project URL**: URL do projeto (mesma do método 1)

## Passo 3: Criar o Arquivo .env.local

1. Na raiz do projeto, crie um arquivo chamado `.env.local`
   - **Windows**: Você pode criar via PowerShell ou Explorer
   - **Linux/Mac**: Use `touch .env.local` no terminal

2. Copie o conteúdo abaixo e preencha com suas credenciais:

```env
# Supabase Configuration
# Obtenha essas informações no dashboard do Supabase: https://app.supabase.com
# Settings > API

NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
```

3. Substitua:
   - `https://seu-projeto.supabase.co` pela sua **Project URL** copiada
   - `sua-chave-anon-key-aqui` pela sua chave **anon public** copiada

### Exemplo de arquivo .env.local preenchido:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.ExemploDeChaveAnonPublicLonga123456789
```

## Passo 4: Verificar se o Arquivo Está Configurado Corretamente

### Verificações Importantes:

✅ **NEXT_PUBLIC_SUPABASE_URL**:
- Deve começar com `https://`
- Deve terminar com `.supabase.co`
- Exemplo: `https://abcdefghijklmnop.supabase.co`

✅ **NEXT_PUBLIC_SUPABASE_ANON_KEY**:
- Deve ser uma string longa (JWT token)
- Deve começar com `eyJ` (base64 encoded)
- Deve ter aproximadamente 100-200 caracteres
- ⚠️ NÃO use a chave `service_role` (ela é secreta e só deve ser usada no backend)

## Passo 5: Reiniciar o Servidor de Desenvolvimento

Após criar/atualizar o arquivo `.env.local`:

1. **Pare o servidor** se estiver rodando (Ctrl+C)
2. **Reinicie o servidor**:
   ```bash
   npm run dev
   ```

⚠️ **IMPORTANTE**: O Next.js só carrega variáveis de ambiente na inicialização. Sempre reinicie o servidor após alterar o `.env.local`.

## Passo 6: Verificar se Está Funcionando

1. Acesse `http://localhost:3000`
2. Tente fazer login ou signup
3. Se aparecer erro sobre "Missing Supabase environment variables", verifique:
   - Se o arquivo `.env.local` está na raiz do projeto
   - Se os nomes das variáveis estão corretos (exatamente como acima)
   - Se você reiniciou o servidor após criar o arquivo

## Troubleshooting

### Erro: "Missing Supabase environment variables"
- ✅ Verifique se o arquivo `.env.local` existe na raiz do projeto
- ✅ Verifique se os nomes das variáveis estão corretos (case-sensitive)
- ✅ Reinicie o servidor de desenvolvimento

### Erro: "Invalid API key"
- ✅ Verifique se copiou a chave completa (ela é muito longa)
- ✅ Certifique-se de usar a chave `anon` `public`, não a `service_role`
- ✅ Verifique se não há espaços extras ou quebras de linha

### Erro: "Failed to fetch"
- ✅ Verifique se a URL está correta (deve terminar com `.supabase.co`)
- ✅ Verifique se o projeto está ativo no Supabase Dashboard
- ✅ Verifique sua conexão com a internet

## Localização das Configurações no Supabase Dashboard

```
Dashboard do Supabase
└── Settings (⚙️)
    ├── General
    │   └── Reference ID / Project URL
    └── API ⭐ (AQUI ESTÃO AS CHAVES)
        ├── Project URL
        ├── Project API keys
        │   ├── anon public ⭐ (USE ESTA)
        │   └── service_role (NÃO USE NO FRONTEND)
        └── Config
```

## Segurança

⚠️ **IMPORTANTE - Regras de Segurança**:

1. ✅ **NUNCA** commite o arquivo `.env.local` (já está no `.gitignore`)
2. ✅ **NUNCA** compartilhe suas chaves em repositórios públicos
3. ✅ **SEMPRE** use a chave `anon` `public` no frontend
4. ✅ **NUNCA** use a chave `service_role` no frontend (ela bypassa RLS)
5. ✅ Para produção, configure as variáveis no painel da Vercel ou sua plataforma de deploy

## Próximos Passos

Após configurar as variáveis de ambiente:

1. ✅ Execute a migração SQL (`003_auth_sync_triggers.sql`)
2. ✅ Configure Authentication no Supabase Dashboard
3. ✅ Teste o fluxo de signup/login
4. ✅ Verifique se os custom claims estão sendo incluídos no JWT


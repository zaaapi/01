# 🚀 Configuração N8N - Guia Passo a Passo

Este guia irá te ajudar a configurar a integração com N8N para enviar mensagens via WhatsApp e outras automações.

## 📋 O que foi implementado

✅ **Cliente N8N** (`lib/n8n-client.ts`)

- Funções para enviar mensagens WhatsApp
- Pausar/Retomar IA em conversas
- Encerrar conversas
- Gerenciar Synapses
- Treinar NeuroCore

✅ **API Route Segura** (`app/api/n8n/route.ts`)

- Proxy seguro que mantém a senha JWT no backend
- Autenticação JWT automática (HS256)
- Tratamento de erros

✅ **Integração Live Chat**

- Botão "Enviar Mensagem" agora envia via WhatsApp
- Botão "Pausar/Retomar IA" integrado com N8N
- Novo botão "Encerrar Conversa"

## 🔧 Configuração (VOCÊ PRECISA FAZER)

### Passo 1: Criar arquivo .env.local

Na **raiz do projeto**, crie um arquivo chamado `.env.local` (se não existir):

```bash
# Copie tudo abaixo e cole no arquivo .env.local
```

### Passo 2: Adicionar suas credenciais

Abra o arquivo `.env.local` e adicione:

```bash
# Supabase (você já deve ter isso)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui

# N8N - Ligeira Telecom (PRODUÇÃO)
NEXT_PUBLIC_N8N_BASE_URL=https://acesse.ligeiratelecom.com.br/webhook
N8N_JWT_SECRET=NdnpQeMzrlvi1TnluSJwSpibok45FfT4
```

**⚠️ IMPORTANTE:**

- A URL do N8N é: `https://acesse.ligeiratelecom.com.br/webhook`
- A senha `N8N_JWT_SECRET` é: `NdnpQeMzrlvi1TnluSJwSpibok45FfT4`
- **NUNCA commite o arquivo .env.local** (ele já está no .gitignore)

### Passo 3: Reiniciar o servidor

Após configurar as variáveis de ambiente:

```bash
# Pare o servidor (Ctrl+C)
# Depois inicie novamente:
npm run dev
```

## 🧪 Como Testar

### 1. Testar Envio de Mensagem

1. Abra o Live Chat: `/cliente/live-chat`
2. Selecione um contato
3. Selecione uma conversa
4. Digite uma mensagem no campo de texto
5. Clique em "Enviar" (ícone de avião)
6. ✅ A mensagem deve ser enviada via WhatsApp através do N8N

**O que acontece nos bastidores:**

```
Frontend → API Route (/api/n8n)
         → Gera JWT
         → Chama N8N (/send_whatsapp_message)
         → N8N processa e envia WhatsApp
         → N8N salva mensagem no Supabase
         → Frontend recarrega mensagens
```

### 2. Testar Pausar/Retomar IA

1. Na mesma tela de Live Chat
2. Clique em "Pausar IA" (botão com ícone de pause)
3. ✅ A IA deve ser pausada via N8N
4. Clique em "Retomar IA" (botão com ícone de play)
5. ✅ A IA deve ser retomada via N8N

### 3. Testar Encerrar Conversa

1. Na mesma tela de Live Chat
2. Clique em "Encerrar" (botão vermelho)
3. Confirme a ação
4. ✅ A conversa deve ser encerrada via N8N

## 🔍 Troubleshooting

### Erro: "N8N_BASE_URL não configurada"

**Causa:** Você não configurou a variável de ambiente.

**Solução:**

1. Verifique se o arquivo `.env.local` existe na raiz do projeto
2. Verifique se a linha `NEXT_PUBLIC_N8N_BASE_URL=...` está presente
3. Reinicie o servidor (`npm run dev`)

### Erro: "N8N Error: 401 - Unauthorized"

**Causa:** A senha JWT está incorreta ou o N8N não está aceitando.

**Solução:**

1. Verifique se `N8N_JWT_SECRET` está correto
2. Confirme com o time do N8N se a senha está ativa
3. Verifique se a credencial JWT no N8N está configurada com:
   - Algoritmo: HS256
   - Keytype: passphrase
   - Senha: `NdnpQeMzrlvi1TnluSJwSpibok45FfT4`

### Erro: "Network Error" ou "Failed to Fetch"

**Causa:** O N8N está inacessível ou a URL está incorreta.

**Solução:**

1. Verifique se a URL do N8N está correta
2. Teste a URL diretamente no navegador ou Postman
3. Verifique se há firewall bloqueando a conexão
4. Confirme se o N8N está rodando

### Como ver logs detalhados

Abra o **Console do Navegador** (F12):

- Erros aparecerão em vermelho
- Logs com `console.error()` mostrarão detalhes do erro
- Você verá exatamente qual endpoint falhou

## 📡 Endpoints N8N Disponíveis

Todos os endpoints são **POST** e usam autenticação JWT (HS256).

**Base URL:** `https://acesse.ligeiratelecom.com.br/webhook`

### 1. Enviar Mensagem WhatsApp

```
POST https://acesse.ligeiratelecom.com.br/webhook/send_whatsapp_message
Body: { tenantId, contactId, conversationId, message }
```

### 2. Pausar IA Conversa

```
POST https://acesse.ligeiratelecom.com.br/webhook/pause_ia_conversation
Body: { tenantId, conversationId }
```

### 3. Retomar IA Conversa

```
POST https://acesse.ligeiratelecom.com.br/webhook/resume_ia_conversation
Body: { tenantId, conversationId }
```

### 4. Gerenciar Synapse

```
POST https://acesse.ligeiratelecom.com.br/webhook/manage_synapse
Body: { action, tenantId, synapseId (opcional), data {...} }
```

### 5. Treinar NeuroCore

```
POST https://acesse.ligeiratelecom.com.br/webhook/train_neurocore
Body: { tenantId, question }
```

### 6. Encerrar Conversa

```
POST https://acesse.ligeiratelecom.com.br/webhook/end_conversation
Body: { tenantId, conversationId, contactId }
```

### Autenticação JWT

- **Algoritmo:** HS256
- **Keytype:** passphrase
- **Secret:** NdnpQeMzrlvi1TnluSJwSpibok45FfT4
- **Expiração:** 1 hora
- **Header:** `Authorization: Bearer <token>`

## 🔐 Segurança

### ✅ O que está seguro:

- Senha JWT fica **apenas no backend** (API Route)
- Frontend não tem acesso direto à senha
- JWT expira em 1 hora automaticamente
- Todas as requisições passam por proxy seguro

### ⚠️ NUNCA faça:

- ❌ Commitar o arquivo `.env.local`
- ❌ Expor `N8N_JWT_SECRET` no frontend
- ❌ Compartilhar suas credenciais

## 📝 Próximos Passos (Futuro)

Outras integrações que podem ser adicionadas:

- [ ] Página de Treinamento usar N8N
- [ ] Base de Conhecimento gerenciar Synapses via N8N
- [ ] Notificações em tempo real
- [ ] Dashboard com métricas do N8N

## 🆘 Precisa de Ajuda?

Se algo não funcionou:

1. Verifique o console do navegador (F12)
2. Verifique os logs do servidor Next.js
3. Teste os endpoints do N8N diretamente (Postman)
4. Entre em contato com o time de suporte

---

**Desenvolvido com ❤️ para LIVIA - Projeto Avocado**

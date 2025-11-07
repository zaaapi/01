# 🐛 Guia de Debug - Live Chat Actions

## 📋 Checklist de Verificação

### ✅ Passo 1: Verificar Schema do Supabase

**Problema:** Coluna `overall_feedback` não existe
**Solução:** Execute o SQL em `docs/SUPABASE_SCHEMA_FIX.md`

```sql
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS overall_feedback JSONB DEFAULT NULL;
```

---

### ✅ Passo 2: Verificar Variáveis de Ambiente

Abra seu `.env.local` e verifique se tem **TODAS** estas variáveis:

```bash
# Supabase (OBRIGATÓRIO)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# N8N (OBRIGATÓRIO para ações do Live Chat)
NEXT_PUBLIC_N8N_BASE_URL=https://seu-n8n.com  # SEM barra no final!
N8N_JWT_SECRET=seu_secret_minimo_32_caracteres
```

**⚠️ IMPORTANTE:** Após alterar o `.env.local`:

1. Pare o servidor (Ctrl+C)
2. Reinicie: `npm run dev`
3. Recarregue a página (Ctrl+F5)

---

### ✅ Passo 3: Verificar Logs no Console

Agora **com os logs ativados**, quando você tentar:

#### **Enviar Mensagem:**

**No Console do Navegador (F12 → Console):**

```
[n8nFetch] Chamando endpoint: /send_whatsapp_message com dados: {...}
[n8nFetch] Status da resposta: 200  ← Deve ser 200!
[n8nFetch] Resposta: { success: true, ... }
```

**No Terminal (onde roda npm run dev):**

```
[sendWhatsAppMessage] Iniciando envio: { tenantId: '...', ... }
[sendWhatsAppMessage] Resposta N8N: { success: true, ... }
[sendWhatsAppMessage] Sucesso!
```

#### **Se aparecer erro 500:**

```
[n8nFetch] Status da resposta: 500
[n8nFetch] Erro: N8N_BASE_URL não configurada
```

**Solução:** Adicione a variável no `.env.local` e reinicie

#### **Se aparecer erro 401:**

```
[n8nFetch] Status da resposta: 401
[n8nFetch] Erro: Unauthorized
```

**Solução:** O `N8N_JWT_SECRET` está incorreto. Verifique se é o mesmo do N8N

#### **Se aparecer erro 404:**

```
[n8nFetch] Status da resposta: 404
[n8nFetch] Erro: Not Found
```

**Solução:** O webhook `/send_whatsapp_message` não existe no N8N. Configure os webhooks.

---

### ✅ Passo 4: Testar Cada Ação Separadamente

#### **1. Enviar Mensagem**

1. Abra o console (F12)
2. Digite uma mensagem
3. Clique em "Enviar"
4. **Observe os logs:**
   - ✅ Se aparecer `[sendWhatsAppMessage] Sucesso!` → Funcionou!
   - ❌ Se aparecer erro → Cole o erro aqui

#### **2. Pausar IA**

1. Abra o console (F12)
2. Clique em "Pausar IA"
3. **Observe os logs:**
   - ✅ Deve aparecer `[n8nFetch] Chamando endpoint: /pause_ia_conversation`
   - ✅ Deve mostrar Status 200
   - ❌ Se erro → Cole o erro

#### **3. Encerrar Conversa**

1. Abra o console (F12)
2. Clique em "Encerrar"
3. Confirme no dialog
4. **Observe os logs:**
   - ✅ Deve aparecer `[n8nFetch] Chamando endpoint: /end_conversation`
   - ✅ Deve mostrar Status 200
   - ❌ Se erro → Cole o erro

---

## 🔍 Interpretando os Erros

### Erro: "N8N_BASE_URL não configurada"

```
❌ ERRO: { error: 'N8N_BASE_URL não configurada' }
```

**Causa:** Variável `NEXT_PUBLIC_N8N_BASE_URL` não existe no `.env.local`

**Solução:**

```bash
# Adicione no .env.local
NEXT_PUBLIC_N8N_BASE_URL=https://seu-n8n.com
```

---

### Erro: "N8N_JWT_SECRET não configurada"

```
❌ ERRO: { error: 'N8N_JWT_SECRET não configurada' }
```

**Causa:** Variável `N8N_JWT_SECRET` não existe no `.env.local`

**Solução:**

```bash
# Adicione no .env.local
N8N_JWT_SECRET=seu_secret_seguro_min_32_caracteres
```

---

### Erro: Network / Failed to fetch

```
❌ ERRO: TypeError: Failed to fetch
```

**Possíveis Causas:**

1. N8N está offline
2. URL do N8N está incorreta
3. CORS bloqueando

**Soluções:**

1. Teste se o N8N está rodando: abra `https://seu-n8n.com` no navegador
2. Verifique a URL no `.env.local` (sem barra no final!)
3. Configure CORS no N8N se necessário

---

### Erro: 401 Unauthorized

```
❌ ERRO: N8N Error: 401 - Unauthorized
```

**Causa:** JWT secret incorreto

**Solução:**

1. Verifique se o `N8N_JWT_SECRET` no `.env.local` é o mesmo do N8N
2. Certifique-se que tem no mínimo 32 caracteres
3. Reinicie o servidor após alterar

---

### Erro: 404 Not Found

```
❌ ERRO: N8N Error: 404 - Not Found
```

**Causa:** Webhook não configurado no N8N

**Solução:**
Configure estes webhooks no N8N:

- `/send_whatsapp_message`
- `/pause_ia_conversation`
- `/resume_ia_conversation`
- `/end_conversation`

---

## 📊 Tabela de Status Esperados

| Ação              | Endpoint N8N              | Status Esperado | O que deve acontecer          |
| ----------------- | ------------------------- | --------------- | ----------------------------- |
| Enviar Mensagem   | `/send_whatsapp_message`  | 200             | Mensagem aparece no chat      |
| Pausar IA         | `/pause_ia_conversation`  | 200             | Status muda para "IA Pausada" |
| Retomar IA        | `/resume_ia_conversation` | 200             | Status muda para "IA Ativa"   |
| Encerrar Conversa | `/end_conversation`       | 200             | Status muda para "ENCERRADA"  |
| Feedback          | _(Apenas Supabase)_       | ✅              | Toast "Feedback enviado"      |

---

## 🧪 Teste Manual da API

Se quiser testar a API diretamente, use este comando no terminal:

```bash
curl -X POST http://localhost:3000/api/n8n \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/send_whatsapp_message",
    "data": {
      "tenantId": "test",
      "contactId": "test",
      "conversationId": "test",
      "message": "teste"
    }
  }'
```

**Respostas possíveis:**

✅ **Sucesso (N8N configurado):**

```json
{
  "success": true,
  "messageId": "xxx"
}
```

❌ **Erro (N8N não configurado):**

```json
{
  "error": "N8N_BASE_URL não configurada"
}
```

---

## 📝 Resumo: O que fazer agora?

1. ✅ **Execute o SQL** para adicionar a coluna `overall_feedback`
2. ✅ **Verifique o `.env.local`** (tem todas as variáveis?)
3. ✅ **Reinicie o servidor** (Ctrl+C e `npm run dev`)
4. ✅ **Abra o console** (F12) e o terminal (logs do servidor)
5. ✅ **Teste cada ação** e **cole os logs** que aparecerem

---

## 💬 Exemplo de Logs Corretos

### ✅ Quando tudo funciona:

**Console do Navegador:**

```
[n8nFetch] Chamando endpoint: /send_whatsapp_message com dados: {tenantId: "...", ...}
[n8nFetch] Status da resposta: 200
[n8nFetch] Resposta: {success: true, messageId: "msg_123"}
```

**Terminal do Servidor:**

```
[sendWhatsAppMessage] Iniciando envio: { tenantId: '...', contactId: '...', conversationId: '...'}
[sendWhatsAppMessage] Resposta N8N: { success: true, messageId: 'msg_123' }
[sendWhatsAppMessage] Sucesso!
```

**Toast:** "Mensagem enviada ✓"

---

**Cole aqui os logs exatos que aparecem para eu ajudar melhor!** 🚀

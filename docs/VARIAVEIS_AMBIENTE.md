# 🔐 Variáveis de Ambiente Necessárias

## Checklist de Variáveis

### ✅ Supabase (Obrigatórias)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ✅ N8N Integration (Obrigatórias para Live Chat)

```bash
NEXT_PUBLIC_N8N_BASE_URL=https://seu-n8n.com
N8N_JWT_SECRET=seu_secret_aqui_min_32_caracteres
```

**IMPORTANTE:**

- `NEXT_PUBLIC_N8N_BASE_URL` deve incluir o protocolo (`https://`)
- `N8N_JWT_SECRET` deve ter no mínimo 32 caracteres
- **NÃO** adicione barra no final da URL

## Como Verificar se Está Funcionando

### 1. No Terminal (Server Side)

Abra o terminal onde o Next.js está rodando e procure por:

```
[sendWhatsAppMessage] Iniciando envio: { tenantId: '...', ... }
```

### 2. No Console do Navegador (Client Side)

Abra o DevTools (F12) e na aba **Console**, procure por:

- Erros de rede (Failed to fetch)
- Erros de Server Action

### 3. Na Aba Network

- Procure por requisições para `/api/n8n`
- Verifique se retorna **200 OK** ou algum erro
- Veja a resposta no Preview/Response

## Erros Comuns

### Erro: "N8N_BASE_URL não configurada"

❌ **Causa:** Variável `NEXT_PUBLIC_N8N_BASE_URL` não existe ou está vazia
✅ **Solução:** Adicione no `.env.local`:

```bash
NEXT_PUBLIC_N8N_BASE_URL=https://seu-n8n.com
```

### Erro: "N8N_JWT_SECRET não configurada"

❌ **Causa:** Variável `N8N_JWT_SECRET` não existe ou está vazia
✅ **Solução:** Adicione no `.env.local`:

```bash
N8N_JWT_SECRET=seu_secret_de_pelo_menos_32_caracteres
```

### Erro: "N8N Error: 401 - Unauthorized"

❌ **Causa:** JWT secret incorreto ou expirado
✅ **Solução:** Verifique se o secret no `.env.local` é o mesmo configurado no N8N

### Erro: "N8N Error: 404 - Not Found"

❌ **Causa:** Endpoint não existe no N8N
✅ **Solução:** Verifique se os webhooks estão configurados no N8N:

- `/send_whatsapp_message`
- `/pause_ia_conversation`
- `/resume_ia_conversation`
- `/end_conversation`

### Erro: "Failed to fetch" ou "Network Error"

❌ **Causa:** N8N está offline ou URL incorreta
✅ **Solução:**

1. Verifique se o N8N está rodando
2. Teste a URL no navegador: `https://seu-n8n.com`
3. Verifique se não há CORS bloqueando

## Testando Manualmente

### 1. Testar a API Route

Crie um arquivo `test-n8n.http` (ou use Postman):

```http
POST http://localhost:3000/api/n8n
Content-Type: application/json

{
  "endpoint": "/send_whatsapp_message",
  "data": {
    "tenantId": "test",
    "contactId": "test",
    "conversationId": "test",
    "message": "teste"
  }
}
```

### 2. Verificar Logs do Server

Reinicie o servidor com:

```bash
npm run dev
```

E tente enviar uma mensagem. Você deve ver no terminal:

```
[sendWhatsAppMessage] Iniciando envio: { ... }
[sendWhatsAppMessage] Resposta N8N: { ... }
[sendWhatsAppMessage] Sucesso!
```

## Estrutura Esperada do .env.local

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiYzEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjMwMDAwMDAwLCJleHAiOjE5NDU1NzYwMDB9.xxx

# N8N
NEXT_PUBLIC_N8N_BASE_URL=https://n8n.seudominio.com
N8N_JWT_SECRET=um_secret_muito_seguro_com_pelo_menos_32_caracteres_aqui

# NextAuth (opcional)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=outro_secret_seguro_aqui
```

## Após Configurar

1. ✅ Pare o servidor (Ctrl+C)
2. ✅ Reinicie: `npm run dev`
3. ✅ Limpe o cache do navegador (Ctrl+Shift+Delete)
4. ✅ Recarregue a página (Ctrl+F5)
5. ✅ Teste novamente no Live Chat

## Ainda com Problema?

1. **Verifique o console do navegador** (F12 → Console)
2. **Verifique o terminal do servidor** (onde roda `npm run dev`)
3. **Teste a URL do N8N direto no navegador**
4. **Verifique se o Supabase está conectado** (teste outras funcionalidades)

---

**Última atualização:** Novembro 2024

# Checklist de Testes - Sistema Supabase

Este documento contém um checklist completo de testes para validar as correções implementadas após a análise.

---

## 🔐 Testes de Permissões RLS

### Como Super Admin

- [ ] **Acesso Total a Todas as Tabelas**
  - [ ] Conseguir visualizar todos os tenants
  - [ ] Conseguir criar, editar e excluir tenants
  - [ ] Conseguir visualizar todos os usuários
  - [ ] Conseguir criar, editar e excluir usuários
  - [ ] Conseguir visualizar todos os neurocores
  - [ ] Conseguir criar, editar e excluir neurocores
  - [ ] Conseguir visualizar todos os agents
  - [ ] Conseguir criar, editar e excluir agents
  - [ ] Conseguir visualizar todos os contacts
  - [ ] Conseguir visualizar todas as conversations
  - [ ] Conseguir visualizar todas as messages
  - [ ] Conseguir visualizar todos os feedbacks

### Como Usuário Cliente

- [ ] **Acesso Apenas ao Próprio Tenant**
  - [ ] Conseguir visualizar apenas o próprio tenant
  - [ ] Conseguir editar apenas o próprio tenant
  - [ ] NÃO conseguir visualizar outros tenants
  - [ ] NÃO conseguir criar, editar ou excluir outros tenants

- [ ] **Acesso a Dados do Próprio Tenant**
  - [ ] Conseguir visualizar apenas contacts do próprio tenant
  - [ ] Conseguir criar, editar e excluir contacts do próprio tenant
  - [ ] NÃO conseguir visualizar contacts de outros tenants
  - [ ] Conseguir visualizar apenas conversations do próprio tenant
  - [ ] Conseguir criar, editar e excluir conversations do próprio tenant
  - [ ] NÃO conseguir visualizar conversations de outros tenants
  - [ ] Conseguir visualizar apenas messages de conversations do próprio tenant
  - [ ] Conseguir criar messages em conversations do próprio tenant
  - [ ] NÃO conseguir visualizar messages de outros tenants

- [ ] **Acesso a Neurocores e Agents Associados**
  - [ ] Conseguir visualizar apenas o neurocore associado ao próprio tenant
  - [ ] NÃO conseguir visualizar neurocores de outros tenants
  - [ ] Conseguir visualizar apenas agents associados ao neurocore do próprio tenant
  - [ ] NÃO conseguir visualizar agents não associados

- [ ] **Acesso a Bases de Conhecimento e Synapses**
  - [ ] Conseguir visualizar apenas base_conhecimentos do próprio tenant
  - [ ] Conseguir criar, editar e excluir base_conhecimentos do próprio tenant
  - [ ] Conseguir visualizar apenas synapses do próprio tenant
  - [ ] Conseguir criar, editar e excluir synapses do próprio tenant
  - [ ] NÃO conseguir visualizar dados de outros tenants

### Requisições Não Autenticadas

- [ ] **Tentativas de Acesso Sem Autenticação**
  - [ ] Tentar acessar qualquer tabela sem autenticação → Deve retornar erro 401
  - [ ] Tentar criar registros sem autenticação → Deve retornar erro 401
  - [ ] Tentar editar registros sem autenticação → Deve retornar erro 401
  - [ ] Tentar excluir registros sem autenticação → Deve retornar erro 401

---

## ⚡ Testes de Performance

### Queries Principais

- [ ] **fetchTenants**
  - [ ] Query executa em < 100ms com 10 tenants
  - [ ] Query executa em < 500ms com 100 tenants
  - [ ] Query executa em < 1s com 1000 tenants
  - [ ] Índices estão sendo usados (verificar com EXPLAIN ANALYZE)

- [ ] **fetchUsersByTenant**
  - [ ] Query executa em < 100ms com 10 usuários
  - [ ] Query executa em < 500ms com 100 usuários
  - [ ] Índices estão sendo usados

- [ ] **fetchConversations**
  - [ ] Query executa em < 100ms com 10 conversas
  - [ ] Query executa em < 500ms com 100 conversas
  - [ ] Índices compostos estão sendo usados

- [ ] **fetchMessages**
  - [ ] Query executa em < 100ms com 50 mensagens
  - [ ] Query executa em < 500ms com 500 mensagens
  - [ ] Índices compostos estão sendo usados

### Paginação

- [ ] **Paginação Funciona Corretamente**
  - [ ] Primeira página carrega corretamente (primeiros 50 itens)
  - [ ] Próxima página carrega próximos itens sem duplicar
  - [ ] Indicador de "hasMore" funciona corretamente
  - [ ] Botão "Carregar Mais" desaparece quando não há mais itens
  - [ ] Total de registros está correto

### Queries N+1

- [ ] **Verificar Ausência de Queries N+1**
  - [ ] Abrir DevTools → Network
  - [ ] Carregar página de empresas
  - [ ] Verificar que há apenas 1-2 queries ao invés de N+1
  - [ ] Verificar que não há queries sequenciais em loop

### EXPLAIN ANALYZE

Execute os seguintes comandos SQL e verifique que índices estão sendo usados:

```sql
-- Verificar uso de índices em fetchTenants
EXPLAIN ANALYZE
SELECT * FROM public.tenants
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 50;

-- Verificar uso de índices em fetchConversations
EXPLAIN ANALYZE
SELECT * FROM public.conversations
WHERE tenant_id = 'tenant-uuid-here'
AND status = 'Conversando'
ORDER BY last_message_at DESC;

-- Verificar uso de índices em fetchMessages
EXPLAIN ANALYZE
SELECT * FROM public.messages
WHERE conversation_id = 'conversation-uuid-here'
ORDER BY timestamp DESC;
```

- [ ] Todos os EXPLAIN ANALYZE mostram uso de índices (Index Scan ou Index Only Scan)
- [ ] Não há Sequential Scan em tabelas grandes (> 1000 registros)

---

## 🔗 Testes de Integração Frontend-Supabase

### Carregamento de Dados

- [ ] **Feature Modules**
  - [ ] Carregam corretamente do Supabase
  - [ ] Aparecem na UI
  - [ ] Fallback para mock funciona se Supabase falhar

- [ ] **Tenants**
  - [ ] Carregam corretamente do Supabase
  - [ ] Filtros (all/active/inactive) funcionam
  - [ ] Dados são exibidos corretamente na tabela

- [ ] **Users**
  - [ ] Carregam corretamente do Supabase
  - [ ] Associação com tenants está correta
  - [ ] Dados são exibidos corretamente

### CRUD Operations

- [ ] **Criar Tenant**
  - [ ] Formulário valida dados antes de enviar
  - [ ] Criação bem-sucedida no Supabase
  - [ ] Toast de sucesso é exibido
  - [ ] Lista é atualizada sem recarregar página
  - [ ] Erros são tratados e exibidos adequadamente

- [ ] **Editar Tenant**
  - [ ] Formulário pré-preenche com dados existentes
  - [ ] Validação funciona
  - [ ] Atualização bem-sucedida no Supabase
  - [ ] Toast de sucesso é exibido
  - [ ] Lista é atualizada sem recarregar página

- [ ] **Excluir Tenant**
  - [ ] Modal de confirmação aparece
  - [ ] Exclusão bem-sucedida no Supabase
  - [ ] Toast de sucesso é exibido
  - [ ] Lista é atualizada sem recarregar página
  - [ ] Erro é exibido se tenant tem dependências

### Sincronização de Estado

- [ ] **Sem Duplicação de Estado**
  - [ ] Dados são salvos apenas no Supabase (não localStorage)
  - [ ] localStorage é usado apenas para configurações de UI
  - [ ] Não há inconsistências entre localStorage e Supabase
  - [ ] Recarregar página mantém dados do Supabase

### Tratamento de Erros

- [ ] **Erros São Tratados Adequadamente**
  - [ ] Erro de permissão (403) exibe mensagem amigável
  - [ ] Erro de não encontrado (404) exibe mensagem amigável
  - [ ] Erro de validação (400) exibe mensagens específicas
  - [ ] Erro de servidor (500) exibe mensagem genérica
  - [ ] Console não mostra erros não tratados

---

## 🔌 Testes de Integração N8N

### Live Chat

- [ ] **Enviar Mensagem**
  - [ ] Chamada para API route funciona
  - [ ] API route chama workflow N8N corretamente
  - [ ] N8N recebe e processa requisição
  - [ ] Resposta do N8N é tratada adequadamente
  - [ ] Mensagem aparece no chat após envio
  - [ ] Erros são tratados e exibidos

- [ ] **Pausar/Retomar IA**
  - [ ] Botão funciona corretamente
  - [ ] Chamada para N8N funciona
  - [ ] Estado é atualizado na UI
  - [ ] Erros são tratados

- [ ] **Encerrar Conversa**
  - [ ] Botão funciona corretamente
  - [ ] Chamada para N8N funciona
  - [ ] Conversa é marcada como encerrada
  - [ ] Erros são tratados

### Treinamento NeuroCore

- [ ] **Perguntar à IA**
  - [ ] Input de pergunta funciona
  - [ ] Chamada para N8N funciona
  - [ ] Resposta da IA é exibida
  - [ ] Synapses relevantes são destacadas
  - [ ] Erros são tratados

- [ ] **Publicar Sinapse**
  - [ ] Botão funciona corretamente
  - [ ] Chamada para N8N funciona
  - [ ] Sinapse é marcada como publicada
  - [ ] Status é atualizado na UI
  - [ ] Erros são tratados

### Autenticação N8N

- [ ] **JWT no Header**
  - [ ] Token JWT é enviado no header Authorization
  - [ ] N8N valida o token corretamente
  - [ ] Requisições sem token são rejeitadas

---

## 🔒 Testes de Segurança

### Validação de Dados

- [ ] **CNPJ**
  - [ ] CNPJ inválido é rejeitado
  - [ ] CNPJ em formato correto é aceito
  - [ ] Mensagem de erro é clara

- [ ] **Telefone**
  - [ ] Telefone inválido é rejeitado
  - [ ] Telefone em formato correto é aceito
  - [ ] Mensagem de erro é clara

- [ ] **Email**
  - [ ] Email inválido é rejeitado
  - [ ] Email em formato correto é aceito
  - [ ] Mensagem de erro é clara

### Constraints do Banco

- [ ] **Unicidade**
  - [ ] Tentar criar CNPJ duplicado → Deve falhar
  - [ ] Tentar criar email duplicado → Deve falhar
  - [ ] Mensagem de erro é clara

- [ ] **Foreign Keys**
  - [ ] Tentar criar tenant com neurocore_id inexistente → Deve falhar
  - [ ] Tentar excluir neurocore em uso → Deve falhar
  - [ ] Mensagem de erro é clara

### RLS Policies

- [ ] **Políticas Funcionam Corretamente**
  - [ ] Super admin tem acesso total
  - [ ] Usuário cliente tem acesso apenas ao próprio tenant
  - [ ] Tentativas de acesso não autorizado são bloqueadas
  - [ ] Mensagens de erro são adequadas (não expõem informações sensíveis)

---

## 📊 Testes de Performance Geral

### Tempo de Carregamento

- [ ] **Páginas Principais**
  - [ ] Dashboard carrega em < 2s
  - [ ] Lista de empresas carrega em < 2s
  - [ ] Live Chat carrega em < 2s
  - [ ] Base de Conhecimento carrega em < 2s

### Operações CRUD

- [ ] **Tempo de Resposta**
  - [ ] Criar tenant: < 1s
  - [ ] Editar tenant: < 1s
  - [ ] Excluir tenant: < 1s
  - [ ] Criar usuário: < 1s
  - [ ] Criar conversa: < 500ms
  - [ ] Enviar mensagem: < 500ms

### Escalabilidade

- [ ] **Com Muitos Dados**
  - [ ] Sistema funciona com 1000+ tenants
  - [ ] Sistema funciona com 10000+ conversas
  - [ ] Sistema funciona com 100000+ mensagens
  - [ ] Paginação funciona corretamente
  - [ ] Performance não degrada significativamente

---

## 🐛 Testes de Edge Cases

### Casos Especiais

- [ ] **Dados Vazios**
  - [ ] Sistema funciona com nenhum tenant
  - [ ] Sistema funciona com nenhuma conversa
  - [ ] Mensagens apropriadas são exibidas

- [ ] **Conectividade**
  - [ ] Sistema funciona quando Supabase está offline
  - [ ] Mensagens de erro são adequadas
  - [ ] Sistema recupera quando conexão é restaurada

- [ ] **Sessão Expirada**
  - [ ] Usuário é redirecionado para login
  - [ ] Dados não são perdidos (se possível)
  - [ ] Mensagem apropriada é exibida

---

## ✅ Resultado Final

Após completar todos os testes:

- [ ] **Todos os testes críticos passaram**
- [ ] **Todos os testes de performance estão dentro dos limites**
- [ ] **Todos os testes de segurança passaram**
- [ ] **Documentação atualizada**
- [ ] **Problemas encontrados foram corrigidos**

---

## 📝 Notas de Teste

Use este espaço para documentar problemas encontrados durante os testes:

```
Data: ___________
Testador: ___________

Problemas Encontrados:
1. 
2. 
3. 

Observações:
- 
- 
- 
```

---

**Última Atualização**: 2024-12-19  
**Versão**: 1.0


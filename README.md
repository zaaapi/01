# LIVIA - Plataforma de Atendimento com IA 🤖

> Plataforma de atendimento ao cliente multiusuário e multiempresa que integra WhatsApp com agentes de Inteligência Artificial

## 📋 Sobre o Projeto

LIVIA é uma aplicação web full-stack que oferece duas plataformas distintas:

### 👨‍💼 Plataforma Super Admin

Gestão completa do sistema com:

- Dashboard executivo com KPIs
- Gerenciamento de empresas (tenants)
- Configuração de NeuroCores
- Administração de Agentes de IA
- Análise de feedbacks

### 💼 Plataforma Cliente (Tenant)

Interface para empresas gerenciarem seus atendimentos:

- Dashboard com métricas de conversas
- Live Chat em tempo real (3 colunas)
- Base de Conhecimento com Synapses
- Personalização de Agentes IA
- Treinamento do NeuroCore
- Gestão de perfil

## 🚀 Stack Tecnológica

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript (strict mode)
- **Estilização**: Tailwind CSS
- **Componentes UI**: Shadcn/ui
- **Temas**: next-themes (dark/light mode)
- **Ícones**: Lucide React
- **Tipografia**: Montserrat (Google Fonts)

### Cores do Design

- **Primary Green**: `#1ab356` (Verde principal)
- **Secondary Blue**: `#2135df` (Azul secundário)

### Gerenciamento de Dados

- **Estado**: React Hooks + localStorage
- **Mock Data**: Sistema de seed com `livia_data_v1`
- **Tipos**: TypeScript interfaces completas

### Futuro (Backend)

- **Database & Auth**: Supabase
- **Automação**: N8N
- **Formulários**: React Hook Form + Zod
- **Server Actions**: next-safe-action
- **Deploy**: Vercel

## 📁 Estrutura do Projeto

```
Projeto-avocado/
├── app/
│   ├── super-admin/          # Plataforma Super Admin
│   │   ├── empresas/         # Gerenciar Empresas
│   │   ├── neurocores/       # Gerenciar NeuroCores
│   │   ├── agentes/          # Gerenciar Agentes IA
│   │   ├── feedbacks/        # Gerenciar Feedbacks
│   │   └── perfil/           # Perfil Super Admin
│   ├── cliente/              # Plataforma Cliente
│   │   ├── live-chat/        # Chat em tempo real
│   │   ├── base-conhecimento/ # Bases e Synapses
│   │   ├── personalizacao/   # Config de Agentes
│   │   ├── treinamento/      # Teste do NeuroCore
│   │   └── perfil/           # Perfil Cliente
│   ├── layout.tsx            # Layout raiz com tema
│   └── page.tsx              # Página inicial
├── components/
│   ├── ui/                   # Componentes Shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   └── shared/               # Componentes compartilhados
│       ├── sidebar.tsx       # Menu lateral
│       ├── theme-toggle.tsx  # Alternador de tema
│       ├── page-container.tsx
│       └── page-header.tsx
├── lib/
│   ├── utils.ts              # Utilitários (cn)
│   ├── theme-provider.tsx    # Provider de tema
│   ├── local-storage.ts      # Gerenciamento localStorage
│   └── seed-data.ts          # Dados mock iniciais
├── types/
│   └── index.ts              # Tipos TypeScript completos
├── constants/                # Constantes da aplicação
├── hooks/                    # Custom React hooks
└── actions/                  # Server Actions (futuro)
```

## 🎨 Design System

### Tipografia

- **Fonte**: Montserrat (pesos: 300, 400, 500, 600, 700, 800, 900)
- **Hierarquia**: Estabelecida através de weights variados

### Temas

- ☀️ **Light Mode**: Cores neutras com acentos vibrantes
- 🌙 **Dark Mode**: Suporte completo com contraste otimizado
- 🔄 **Sistema**: Segue preferência do SO

### Componentes

Todos os componentes UI seguem o padrão Shadcn/ui com personalização para:

- Cores de marca (Primary Green, Secondary Blue)
- Espaçamento consistente
- Animações suaves
- Estados hover/focus bem definidos

## 🏃‍♂️ Como Executar

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/zaaapi/01.git
cd 01

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev
```

Acesse: `http://localhost:3000`

### Comandos Disponíveis

```bash
npm run dev        # Inicia servidor de desenvolvimento
npm run build      # Build para produção
npm start          # Inicia servidor de produção
npm run lint       # Executa ESLint
npm run type-check # Verifica tipos TypeScript
```

## 🗂️ Dados Mock

O sistema utiliza `localStorage` com a chave `livia_data_v1` para persistir dados entre sessões.

### Dados Incluídos

- 3 Empresas (2 ativas, 1 inativa)
- 2 NeuroCores (Varejo e Saúde)
- 3 Agentes IA
- 4 Usuários (1 Super Admin + 3 Clientes)
- 2 Contatos com conversas
- Mensagens de exemplo
- Bases de Conhecimento e Synapses
- Feedbacks
- Respostas rápidas

### Reset de Dados

Acesse o perfil e clique em "Recarregar dados de exemplo" para restaurar o seed inicial.

## ✅ Funcionalidades Implementadas

### ✔️ Plataforma Super Admin

- [x] Dashboard com KPIs executivos
- [x] Gerenciar Empresas (listar, filtrar, ações)
- [x] Gerenciar NeuroCores (CRUD básico)
- [x] Gerenciar Agentes IA (listagem e ações)
- [x] Visualizar Feedbacks (com status)
- [x] Perfil do Super Admin

### ✔️ Plataforma Cliente

- [x] Dashboard com métricas do tenant
- [x] Live Chat com 3 colunas (contatos, mensagens, dados)
- [x] Base de Conhecimento (listagem)
- [x] Personalização de Agentes (cards com destaque)
- [x] Treinamento do NeuroCore (chat interativo)
- [x] Perfil do Cliente (pessoal + empresa)

### ✔️ Sistema

- [x] Layout responsivo com sidebar
- [x] Dark/Light mode com toggle
- [x] Navegação entre plataformas
- [x] Tipos TypeScript completos
- [x] Mock data com localStorage
- [x] Componentes UI reutilizáveis

## 🔄 Próximos Passos

### 📌 Melhorias Pendentes

- [ ] Adicionar microinterações (toasts, loading states)
- [ ] Implementar empty states amigáveis
- [ ] Adicionar atalhos de teclado
- [ ] Revisar acessibilidade WCAG AA
- [ ] Otimizar responsividade mobile
- [ ] Adicionar animações de transição

### 🚧 Funcionalidades Avançadas (Futuro)

- [ ] Modais funcionais (adicionar/editar)
- [ ] Integração com backend real (Supabase)
- [ ] Autenticação e autorização
- [ ] Server Actions com next-safe-action
- [ ] Gráficos interativos (Recharts)
- [ ] Upload de imagens
- [ ] Filtros avançados e busca
- [ ] Paginação de tabelas
- [ ] Exportação de dados
- [ ] Notificações em tempo real

## 📝 Padrões de Código

### Nomenclatura

- **Arquivos/pastas**: kebab-case (`user-profile.tsx`)
- **Componentes React**: PascalCase (`UserProfile`)
- **Funções/variáveis**: camelCase (`getUserData`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Princípios

- ✅ SOLID e Clean Code
- ✅ DRY (Don't Repeat Yourself)
- ✅ Componentes pequenos e focados
- ✅ TypeScript strict mode
- ✅ 100% Tailwind CSS (sem CSS modules)

## 🤝 Contribuindo

1. Siga as regras em `.cursorrules`
2. Use conventional commits (`feat:`, `fix:`, `docs:`, etc.)
3. Mantenha código limpo e documentado
4. Execute `npm run lint` antes de commitar
5. Teste em ambos os temas (light/dark)

## 📄 Licença

Este projeto está em desenvolvimento privado.

---

**Desenvolvido com 💚 utilizando Next.js, TypeScript e Shadcn/ui**

**Versão**: 1.0.0  
**Status**: 🚀 Em desenvolvimento ativo

# Projeto Avocado 🥑

Projeto full-stack usando Next.js 14+, TypeScript, Tailwind CSS, Shadcn/ui e Supabase.

## Stack Tecnológica

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript (strict mode)
- **Estilização**: Tailwind CSS
- **Componentes UI**: Shadcn/ui
- **Formulários**: React Hook Form + Zod
- **Server Actions**: next-safe-action
- **Datas**: dayjs
- **Máscaras**: react-number-format

### Backend

- **Database & Auth**: Supabase
- **Automação**: N8N
- **Deploy**: Vercel

## Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação
│   ├── (protected)/       # Rotas protegidas
│   └── api/               # API Routes
├── components/
│   ├── ui/                # Componentes Shadcn/ui
│   └── shared/            # Componentes reutilizáveis
├── actions/               # Server Actions (next-safe-action)
├── lib/                   # Utilitários e helpers
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types e interfaces
├── db/                    # Database client (Supabase)
└── constants/             # Constantes da aplicação
```

## Começando

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Rodar em desenvolvimento
npm run dev
```

## Padrões de Código

- Arquivos e pastas: **kebab-case**
- Componentes React: **PascalCase**
- Funções/variáveis: **camelCase**
- Constantes: **UPPER_SNAKE_CASE**

## Contribuindo

Siga os princípios SOLID e Clean Code. Veja `.cursorrules` para regras detalhadas.

---

Desenvolvido com 💚

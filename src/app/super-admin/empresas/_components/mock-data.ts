// Mock data para empresas e usuários

export interface Usuario {
  id: string
  nome: string
  email: string
  whatsapp: string
  isActive: boolean
  modulosAtribuidos: string[]
  empresaId: string
}

export interface Empresa {
  id: string
  name: string
  neurocore: string
  isActive: boolean
}

export interface Modulo {
  id: string
  nome: string
  descricao: string
  icon: string // Nome do ícone Lucide
}

export const MODULOS_DISPONIVEIS: Modulo[] = [
  {
    id: "MOD_LIVE_CHAT",
    nome: "Live Chat",
    descricao: "Atendimento em tempo real com clientes",
    icon: "MessageSquare",
  },
  {
    id: "MOD_BASE_CONHECIMENTO",
    nome: "Base de Conhecimento",
    descricao: "Gerenciamento de artigos e documentação",
    icon: "BookOpen",
  },
  {
    id: "MOD_PERSONALIZACAO",
    nome: "Personalização",
    descricao: "Configurações de aparência e branding",
    icon: "Palette",
  },
  {
    id: "MOD_RELATORIOS",
    nome: "Relatórios",
    descricao: "Visualização de métricas e analytics",
    icon: "BarChart3",
  },
  {
    id: "MOD_AUTOMACAO",
    nome: "Automação",
    descricao: "Fluxos automatizados e triggers",
    icon: "Zap",
  },
  {
    id: "MOD_INTEGRACAO",
    nome: "Integrações",
    descricao: "Conexões com sistemas externos",
    icon: "Plug",
  },
]

export const mockEmpresas: Empresa[] = [
  {
    id: "tenant-1",
    name: "Loja Tech Store",
    neurocore: "NeuroCore Varejo",
    isActive: true,
  },
  {
    id: "tenant-2",
    name: "Clínica Vida Saudável",
    neurocore: "NeuroCore Saúde",
    isActive: true,
  },
  {
    id: "tenant-3",
    name: "Empresa Inativa",
    neurocore: "NeuroCore Varejo",
    isActive: false,
  },
  {
    id: "tenant-4",
    name: "Consultoria Pro",
    neurocore: "NeuroCore Serviços",
    isActive: true,
  },
]

export const mockUsuarios: Usuario[] = [
  {
    id: "user-1",
    nome: "João Silva",
    email: "joao@techstore.com",
    whatsapp: "+55 11 98765-4321",
    isActive: true,
    modulosAtribuidos: ["MOD_LIVE_CHAT", "MOD_BASE_CONHECIMENTO", "MOD_RELATORIOS"],
    empresaId: "tenant-1",
  },
  {
    id: "user-2",
    nome: "Maria Santos",
    email: "maria@techstore.com",
    whatsapp: "+55 11 91234-5678",
    isActive: true,
    modulosAtribuidos: ["MOD_LIVE_CHAT", "MOD_PERSONALIZACAO"],
    empresaId: "tenant-1",
  },
  {
    id: "user-3",
    nome: "Dr. Pedro Oliveira",
    email: "pedro@vidasaudavel.com",
    whatsapp: "+55 21 99876-5432",
    isActive: true,
    modulosAtribuidos: ["MOD_LIVE_CHAT", "MOD_BASE_CONHECIMENTO", "MOD_AUTOMACAO"],
    empresaId: "tenant-2",
  },
  {
    id: "user-4",
    nome: "Ana Costa",
    email: "ana@inativa.com",
    whatsapp: "+55 11 95555-1234",
    isActive: false,
    modulosAtribuidos: ["MOD_LIVE_CHAT"],
    empresaId: "tenant-3",
  },
  {
    id: "user-5",
    nome: "Carlos Pereira",
    email: "carlos@inativa.com",
    whatsapp: "+55 11 94444-5678",
    isActive: true,
    modulosAtribuidos: ["MOD_BASE_CONHECIMENTO", "MOD_RELATORIOS"],
    empresaId: "tenant-3",
  },
  {
    id: "user-6",
    nome: "Fernanda Lima",
    email: "fernanda@consultoriapro.com",
    whatsapp: "+55 31 98888-7777",
    isActive: true,
    modulosAtribuidos: [
      "MOD_LIVE_CHAT",
      "MOD_BASE_CONHECIMENTO",
      "MOD_PERSONALIZACAO",
      "MOD_RELATORIOS",
      "MOD_AUTOMACAO",
      "MOD_INTEGRACAO",
    ],
    empresaId: "tenant-4",
  },
]

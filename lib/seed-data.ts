import { v4 as uuidv4 } from "uuid"
import {
  MockAppState,
  UserRole,
  AgentType,
  AgentFunction,
  AgentGender,
  ContactStatus,
  ConversationStatus,
  MessageSenderType,
  FeedbackType,
  FeedbackStatus,
  SynapseStatus,
  GlobalFilterPeriod,
  GlobalFilterConversationSelection,
  FeatureModule,
  Tenant,
  User,
  NeuroCore,
  Agent,
  Contact,
  Conversation,
  Message,
  BaseConhecimento,
  Synapse,
  Feedback,
  QuickReplyTemplate,
} from "@/types"

export const generateMockSeed = (): MockAppState => {
  const now = new Date().toISOString()

  // Feature Modules
  const featureModules: FeatureModule[] = [
    {
      id: uuidv4(),
      key: "MOD_DASHBOARD",
      name: "Dashboard",
      description: "Visualização de métricas e KPIs",
      icon: "gauge",
    },
    {
      id: uuidv4(),
      key: "MOD_LIVE_CHAT",
      name: "Live Chat",
      description: "Gerenciamento de conversas em tempo real",
      icon: "messages-square",
    },
    {
      id: uuidv4(),
      key: "MOD_BASE_CONHECIMENTO",
      name: "Base de Conhecimento",
      description: "Gestão de bases de conhecimento e synapses",
      icon: "book",
    },
    {
      id: uuidv4(),
      key: "MOD_PERSONALIZACAO_NEUROCORE",
      name: "Personalização NeuroCore",
      description: "Configuração de agentes de IA",
      icon: "settings",
    },
    {
      id: uuidv4(),
      key: "MOD_TREINAMENTO_NEUROCORE",
      name: "Treinamento NeuroCore",
      description: "Teste e treinamento da IA",
      icon: "wand",
    },
  ]

  // IDs para referências
  const superAdminId = uuidv4()
  const tenant1Id = uuidv4()
  const tenant2Id = uuidv4()
  const tenant3Id = uuidv4()

  const neurocore1Id = uuidv4()
  const neurocore2Id = uuidv4()

  const agentIntentsId = uuidv4()
  const agentSalesId = uuidv4()
  const agentSupportId = uuidv4()

  // Users
  const userSuperAdmin: User = {
    id: superAdminId,
    tenantId: null,
    fullName: "Admin Geral LIVIA",
    email: "admin@livia.com",
    whatsappNumber: "+55 11 99999-9999",
    role: UserRole.SUPER_ADMIN,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
    modules: [],
    isActive: true,
    lastSignInAt: now,
    createdAt: now,
  }

  const userTenant1Id = uuidv4()
  const userTenant1: User = {
    id: userTenant1Id,
    tenantId: tenant1Id,
    fullName: "Roberto Costa",
    email: "roberto@techstore.com",
    whatsappNumber: "+55 11 98765-5555",
    role: UserRole.USUARIO_CLIENTE,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto",
    modules: featureModules.map((m) => m.key),
    isActive: true,
    lastSignInAt: now,
    createdAt: now,
  }

  const userTenant1_2Id = uuidv4()
  const userTenant1_2: User = {
    id: userTenant1_2Id,
    tenantId: tenant1Id,
    fullName: "Fernanda Alves",
    email: "fernanda@techstore.com",
    whatsappNumber: "+55 11 98765-6666",
    role: UserRole.USUARIO_CLIENTE,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fernanda",
    modules: ["MOD_DASHBOARD", "MOD_LIVE_CHAT"],
    isActive: true,
    lastSignInAt: null,
    createdAt: now,
  }

  const userTenant2Id = uuidv4()
  const userTenant2: User = {
    id: userTenant2Id,
    tenantId: tenant2Id,
    fullName: "Dr. Ricardo Mendes",
    email: "ricardo@vidasaudavel.com",
    whatsappNumber: "+55 21 97654-7777",
    role: UserRole.USUARIO_CLIENTE,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo",
    modules: ["MOD_DASHBOARD", "MOD_LIVE_CHAT", "MOD_BASE_CONHECIMENTO"],
    isActive: true,
    lastSignInAt: now,
    createdAt: now,
  }

  const userTenant3Id = uuidv4()
  const userTenant3: User = {
    id: userTenant3Id,
    tenantId: tenant3Id,
    fullName: "Pedro Silva",
    email: "pedro@inativa.com",
    whatsappNumber: "+55 11 91111-5555",
    role: UserRole.USUARIO_CLIENTE,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
    modules: ["MOD_DASHBOARD"],
    isActive: true,
    lastSignInAt: null,
    createdAt: now,
  }

  // Tenants
  const tenant1: Tenant = {
    id: tenant1Id,
    name: "Loja Tech Store",
    neurocoreId: neurocore1Id,
    isActive: true,
    cnpj: "12.345.678/0001-90",
    phone: "+55 11 98765-4321",
    responsibleTech: {
      name: "Carlos Silva",
      whatsapp: "+55 11 98765-1111",
      email: "carlos@techstore.com",
    },
    responsibleFinance: {
      name: "Maria Santos",
      whatsapp: "+55 11 98765-2222",
      email: "maria@techstore.com",
    },
    plan: "Premium",
    createdAt: now,
  }

  const tenant2: Tenant = {
    id: tenant2Id,
    name: "Clínica Vida Saudável",
    neurocoreId: neurocore2Id,
    isActive: true,
    cnpj: "98.765.432/0001-10",
    phone: "+55 21 97654-3210",
    responsibleTech: {
      name: "João Pedro",
      whatsapp: "+55 21 97654-1111",
      email: "joao@vidasaudavel.com",
    },
    responsibleFinance: {
      name: "Ana Costa",
      whatsapp: "+55 21 97654-2222",
      email: "ana@vidasaudavel.com",
    },
    plan: "Business",
    createdAt: now,
  }

  const tenant3: Tenant = {
    id: tenant3Id,
    name: "Empresa Inativa",
    neurocoreId: neurocore1Id,
    isActive: false,
    cnpj: "11.222.333/0001-44",
    phone: "+55 11 91111-2222",
    responsibleTech: {
      name: "Pedro Oliveira",
      whatsapp: "+55 11 91111-3333",
      email: "pedro@inativa.com",
    },
    responsibleFinance: {
      name: "Julia Lima",
      whatsapp: "+55 11 91111-4444",
      email: "julia@inativa.com",
    },
    plan: "Basic",
    createdAt: now,
  }

  // NeuroCores
  const neurocore1: NeuroCore = {
    id: neurocore1Id,
    name: "NeuroCore Varejo",
    description: "NeuroCore especializado em atendimento para varejo",
    niche: "Varejo",
    apiUrl: "https://api.neurocore.example.com/varejo",
    apiSecret: "secret_varejo_123",
    isActive: true,
    associatedAgents: [agentIntentsId, agentSalesId],
    createdAt: now,
  }

  const neurocore2: NeuroCore = {
    id: neurocore2Id,
    name: "NeuroCore Saúde",
    description: "NeuroCore especializado em atendimento para área da saúde",
    niche: "Saúde",
    apiUrl: "https://api.neurocore.example.com/saude",
    apiSecret: "secret_saude_456",
    isActive: true,
    associatedAgents: [agentIntentsId, agentSupportId],
    createdAt: now,
  }

  // Agents
  const agentIntents: Agent = {
    id: agentIntentsId,
    name: "Agente de Intenções",
    type: AgentType.REATIVO,
    function: AgentFunction.ATENDIMENTO,
    gender: null,
    persona: "Detecta a intenção do cliente e direciona para o agente adequado.",
    personalityTone: "Neutro e objetivo",
    communicationMedium: "WhatsApp",
    objective: "Classificar e rotear conversas.",
    instructions: [
      {
        id: uuidv4(),
        title: "Saudação Inicial",
        description: "Sempre cumprimente o cliente de forma cordial",
        isActive: true,
        order: 1,
      },
    ],
    limitations: [],
    conversationRoteiro: [
      {
        id: uuidv4(),
        title: "Identificar necessidade",
        mainInstruction: "Pergunte como pode ajudar",
        subTasks: ["Ouvir ativamente", "Fazer perguntas de clarificação"],
        isActive: true,
        order: 1,
      },
    ],
    otherInstructions: [],
    isIntentAgent: true,
    associatedNeuroCores: [neurocore1Id, neurocore2Id],
    createdAt: now,
  }

  const agentSales: Agent = {
    id: agentSalesId,
    name: "Agente de Vendas",
    type: AgentType.ATIVO,
    function: AgentFunction.VENDAS,
    gender: AgentGender.FEMININO,
    persona: "Uma vendedora simpática e persuasiva, focada em fechar negócios.",
    personalityTone: "Amigável e confiante",
    communicationMedium: "WhatsApp",
    objective: "Apresentar produtos e converter vendas.",
    instructions: [
      {
        id: uuidv4(),
        title: "Saudação de Vendas",
        description: "Sempre inicie com uma saudação calorosa e convide à exploração.",
        isActive: true,
        order: 1,
      },
    ],
    limitations: [],
    conversationRoteiro: [],
    otherInstructions: [],
    isIntentAgent: false,
    associatedNeuroCores: [neurocore1Id],
    createdAt: now,
  }

  const agentSupport: Agent = {
    id: agentSupportId,
    name: "Agente de Suporte",
    type: AgentType.REATIVO,
    function: AgentFunction.ATENDIMENTO,
    gender: AgentGender.MASCULINO,
    persona: "Um especialista em suporte técnico, paciente e didático.",
    personalityTone: "Educado e prestativo",
    communicationMedium: "WhatsApp",
    objective: "Resolver problemas e tirar dúvidas.",
    instructions: [
      {
        id: uuidv4(),
        title: "Confirmação de Problema",
        description: "Sempre confirme o problema do cliente antes de propor uma solução.",
        isActive: true,
        order: 1,
      },
    ],
    limitations: [],
    conversationRoteiro: [],
    otherInstructions: [],
    isIntentAgent: false,
    associatedNeuroCores: [neurocore2Id],
    createdAt: now,
  }

  // Contacts - 5 por tenant (15 total)
  const contacts: Contact[] = []
  const conversations: Conversation[] = []
  const messages: Message[] = []

  // Tenant 1 - 5 contatos
  for (let i = 0; i < 5; i++) {
    const contactId = uuidv4()
    const contact: Contact = {
      id: contactId,
      tenantId: tenant1Id,
      name: `Cliente ${i + 1} - Tech Store`,
      phone: `+55 11 91234-${String(i + 1).padStart(4, "0")}`,
      phoneSecondary: i % 2 === 0 ? `+55 11 3333-${String(i + 1).padStart(4, "0")}` : null,
      email: `cliente${i + 1}@email.com`,
      country: "Brasil",
      city: i % 2 === 0 ? "São Paulo" : "Rio de Janeiro",
      zipCode: `${String(i + 1).padStart(5, "0")}000-000`,
      addressStreet: i % 2 === 0 ? "Av. Paulista" : "Rua das Flores",
      addressNumber: String((i + 1) * 100),
      addressComplement: i % 3 === 0 ? `Apto ${i + 1}01` : null,
      cpf: `${String(i + 1).padStart(3, "0")}.${String(i + 1).padStart(3, "0")}.${String(i + 1).padStart(3, "0")}-00`,
      rg: i % 2 === 0 ? `${String(i + 1).padStart(2, "0")}.${String(i + 1).padStart(3, "0")}.${String(i + 1).padStart(3, "0")}-${i + 1}` : null,
      lastInteraction: new Date(Date.now() - i * 3600000).toISOString(),
      status: i === 0 ? ContactStatus.COM_IA : i === 1 ? ContactStatus.PAUSADA : i === 2 ? ContactStatus.ABERTO : ContactStatus.ENCERRADA,
      customerDataExtracted: i === 0 ? { interesse: "Produto X", valor: "1500" } : {},
      tags: i === 0 ? ["VIP", "recorrente"] : i === 1 ? ["novo"] : [],
      lastNegotiation: i === 0 ? { produto: "Notebook Dell", valor: 3500, status: "Em Negociação" } : null,
      createdAt: new Date(Date.now() - (i + 1) * 24 * 3600 * 1000).toISOString(),
    }
    contacts.push(contact)

    // Criar conversa para cada contato
    const convId = uuidv4()
    const conversation: Conversation = {
      id: convId,
      contactId: contactId,
      tenantId: tenant1Id,
      status: i === 0 ? ConversationStatus.CONVERSANDO : i === 1 ? ConversationStatus.PAUSADA : ConversationStatus.ENCERRADA,
      iaActive: i === 0,
      lastMessageAt: new Date(Date.now() - i * 600000).toISOString(),
      overallFeedback: i === 1 ? { type: FeedbackType.DISLIKE, text: "IA não entendeu meu problema." } : null,
      createdAt: new Date(Date.now() - (i + 1) * 24 * 3600 * 1000).toISOString(),
    }
    conversations.push(conversation)

    // Criar mensagens para algumas conversas
    if (i < 3) {
      messages.push({
        id: uuidv4(),
        conversationId: convId,
        senderType: MessageSenderType.CUSTOMER,
        senderId: null,
        content: `Olá, gostaria de saber sobre produtos ${i + 1}`,
        timestamp: new Date(Date.now() - (i + 1) * 600000).toISOString(),
        feedback: null,
      })

      messages.push({
        id: uuidv4(),
        conversationId: convId,
        senderType: MessageSenderType.IA,
        senderId: agentIntentsId,
        content: `Olá! Seja bem-vindo à Tech Store! Claro, ficarei feliz em ajudar com produtos ${i + 1}.`,
        timestamp: new Date(Date.now() - (i + 1) * 540000).toISOString(),
        feedback: i === 0 ? { type: FeedbackType.LIKE, text: "Resposta muito educada" } : null,
      })

      if (i === 0) {
        messages.push({
          id: uuidv4(),
          conversationId: convId,
          senderType: MessageSenderType.CUSTOMER,
          senderId: null,
          content: "Para trabalho, preciso de algo potente",
          timestamp: new Date(Date.now() - 480000).toISOString(),
          feedback: null,
        })

        messages.push({
          id: uuidv4(),
          conversationId: convId,
          senderType: MessageSenderType.IA,
          senderId: agentSalesId,
          content: "Perfeito! Para trabalho, temos ótimas opções. Recomendo o Dell Inspiron 15 com Intel i7, 16GB RAM e SSD 512GB por R$ 3.500,00.",
          timestamp: new Date(Date.now() - 420000).toISOString(),
          feedback: null,
        })
      }
    }
  }

  // Tenant 2 - 5 contatos
  for (let i = 0; i < 5; i++) {
    const contactId = uuidv4()
    const contact: Contact = {
      id: contactId,
      tenantId: tenant2Id,
      name: `Paciente ${i + 1} - Clínica`,
      phone: `+55 21 92345-${String(i + 1).padStart(4, "0")}`,
      phoneSecondary: null,
      email: `paciente${i + 1}@email.com`,
      country: "Brasil",
      city: "Rio de Janeiro",
      zipCode: `${String(i + 1).padStart(5, "0")}000-000`,
      addressStreet: "Av. Atlântica",
      addressNumber: String((i + 1) * 200),
      addressComplement: null,
      cpf: `${String(i + 5).padStart(3, "0")}.${String(i + 5).padStart(3, "0")}.${String(i + 5).padStart(3, "0")}-00`,
      rg: `${String(i + 5).padStart(2, "0")}.${String(i + 5).padStart(3, "0")}.${String(i + 5).padStart(3, "0")}-${i + 5}`,
      lastInteraction: new Date(Date.now() - (i + 5) * 3600000).toISOString(),
      status: i === 0 ? ContactStatus.COM_IA : i === 1 ? ContactStatus.PAUSADA : ContactStatus.ENCERRADA,
      customerDataExtracted: {},
      tags: i === 0 ? ["consulta"] : [],
      lastNegotiation: null,
      createdAt: new Date(Date.now() - (i + 6) * 24 * 3600 * 1000).toISOString(),
    }
    contacts.push(contact)

    const convId = uuidv4()
    const conversation: Conversation = {
      id: convId,
      contactId: contactId,
      tenantId: tenant2Id,
      status: i === 0 ? ConversationStatus.CONVERSANDO : ConversationStatus.ENCERRADA,
      iaActive: i === 0,
      lastMessageAt: new Date(Date.now() - (i + 5) * 600000).toISOString(),
      overallFeedback: null,
      createdAt: new Date(Date.now() - (i + 6) * 24 * 3600 * 1000).toISOString(),
    }
    conversations.push(conversation)

    if (i === 0) {
      messages.push({
        id: uuidv4(),
        conversationId: convId,
        senderType: MessageSenderType.CUSTOMER,
        senderId: null,
        content: "Olá, gostaria de agendar uma consulta",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        feedback: null,
      })

      messages.push({
        id: uuidv4(),
        conversationId: convId,
        senderType: MessageSenderType.IA,
        senderId: agentSupportId,
        content: "Olá! Ficaria feliz em ajudar com o agendamento. Qual especialidade você precisa?",
        timestamp: new Date(Date.now() - 540000).toISOString(),
        feedback: null,
      })
    }
  }

  // Tenant 3 - 5 contatos (inativa)
  for (let i = 0; i < 5; i++) {
    const contactId = uuidv4()
    const contact: Contact = {
      id: contactId,
      tenantId: tenant3Id,
      name: `Cliente ${i + 1} - Inativa`,
      phone: `+55 11 93456-${String(i + 1).padStart(4, "0")}`,
      phoneSecondary: null,
      email: `cliente${i + 1}@inativa.com`,
      country: "Brasil",
      city: "São Paulo",
      zipCode: `${String(i + 10).padStart(5, "0")}000-000`,
      addressStreet: "Rua Teste",
      addressNumber: String((i + 1) * 300),
      addressComplement: null,
      cpf: `${String(i + 10).padStart(3, "0")}.${String(i + 10).padStart(3, "0")}.${String(i + 10).padStart(3, "0")}-00`,
      rg: null,
      lastInteraction: new Date(Date.now() - (i + 30) * 24 * 3600 * 1000).toISOString(),
      status: ContactStatus.ENCERRADA,
      customerDataExtracted: {},
      tags: [],
      lastNegotiation: null,
      createdAt: new Date(Date.now() - (i + 30) * 24 * 3600 * 1000).toISOString(),
    }
    contacts.push(contact)

    const convId = uuidv4()
    const conversation: Conversation = {
      id: convId,
      contactId: contactId,
      tenantId: tenant3Id,
      status: ConversationStatus.ENCERRADA,
      iaActive: false,
      lastMessageAt: new Date(Date.now() - (i + 30) * 24 * 3600 * 1000).toISOString(),
      overallFeedback: null,
      createdAt: new Date(Date.now() - (i + 30) * 24 * 3600 * 1000).toISOString(),
    }
    conversations.push(conversation)
  }

  // Base de Conhecimento
  const baseConhecimento1Id = uuidv4()
  const baseConhecimento1: BaseConhecimento = {
    id: baseConhecimento1Id,
    tenantId: tenant1Id,
    name: "Base Produtos Tech Store",
    description: "Informações sobre produtos eletrônicos",
    neurocoreId: neurocore1Id,
    isActive: true,
    createdAt: now,
  }

  const baseConhecimento2Id = uuidv4()
  const baseConhecimento2: BaseConhecimento = {
    id: baseConhecimento2Id,
    tenantId: tenant2Id,
    name: "Base Procedimentos Clínica",
    description: "Procedimentos e tratamentos oferecidos",
    neurocoreId: neurocore2Id,
    isActive: true,
    createdAt: now,
  }

  const baseConhecimento3Id = uuidv4()
  const baseConhecimento3: BaseConhecimento = {
    id: baseConhecimento3Id,
    tenantId: tenant1Id,
    name: "Base FAQ Tech Store",
    description: "Perguntas frequentes sobre produtos e serviços",
    neurocoreId: neurocore1Id,
    isActive: true,
    createdAt: now,
  }

  // Synapses
  const synapses: Synapse[] = [
    {
      id: uuidv4(),
      baseConhecimentoId: baseConhecimento1Id,
      tenantId: tenant1Id,
      title: "Notebooks Dell",
      description: "Linha completa de notebooks Dell com especificações técnicas e preços",
      imageUrl: null,
      status: SynapseStatus.PUBLICANDO,
      createdAt: now,
    },
    {
      id: uuidv4(),
      baseConhecimentoId: baseConhecimento1Id,
      tenantId: tenant1Id,
      title: "Política de Garantia",
      description: "Informações sobre garantia e trocas de produtos",
      imageUrl: null,
      status: SynapseStatus.RASCUNHO,
      createdAt: now,
    },
    {
      id: uuidv4(),
      baseConhecimentoId: baseConhecimento1Id,
      tenantId: tenant1Id,
      title: "Smartphones Samsung",
      description: "Catálogo completo de smartphones Samsung disponíveis",
      imageUrl: null,
      status: SynapseStatus.PUBLICANDO,
      createdAt: now,
    },
    {
      id: uuidv4(),
      baseConhecimentoId: baseConhecimento1Id,
      tenantId: tenant1Id,
      title: "Formas de Pagamento",
      description: "Opções de pagamento aceitas: cartão, boleto, PIX",
      imageUrl: null,
      status: SynapseStatus.INDEXANDO,
      createdAt: now,
    },
    {
      id: uuidv4(),
      baseConhecimentoId: baseConhecimento2Id,
      tenantId: tenant2Id,
      title: "Consultas Médicas",
      description: "Tipos de consultas e especialidades disponíveis",
      imageUrl: null,
      status: SynapseStatus.PUBLICANDO,
      createdAt: now,
    },
    {
      id: uuidv4(),
      baseConhecimentoId: baseConhecimento2Id,
      tenantId: tenant2Id,
      title: "Exames Disponíveis",
      description: "Lista completa de exames oferecidos pela clínica",
      imageUrl: null,
      status: SynapseStatus.PUBLICANDO,
      createdAt: now,
    },
    {
      id: uuidv4(),
      baseConhecimentoId: baseConhecimento3Id,
      tenantId: tenant1Id,
      title: "Horário de Atendimento",
      description: "Segunda a sexta das 9h às 18h, sábado das 9h às 13h",
      imageUrl: null,
      status: SynapseStatus.PUBLICANDO,
      createdAt: now,
    },
    {
      id: uuidv4(),
      baseConhecimentoId: baseConhecimento3Id,
      tenantId: tenant1Id,
      title: "Frete e Entrega",
      description: "Informações sobre frete grátis acima de R$ 200 e prazo de entrega",
      imageUrl: null,
      status: SynapseStatus.ERROR,
      createdAt: now,
    },
  ]

  // Feedbacks
  const feedbacks: Feedback[] = [
    {
      id: uuidv4(),
      tenantId: tenant1Id,
      userId: userTenant1Id,
      conversationId: conversations[0].id,
      messageId: messages[1]?.id || null,
      feedbackType: FeedbackType.LIKE,
      feedbackText: "Resposta muito educada e prestativa",
      feedbackStatus: FeedbackStatus.EM_ABERTO,
      superAdminComment: null,
      createdAt: new Date(Date.now() - 540000).toISOString(),
    },
    {
      id: uuidv4(),
      tenantId: tenant1Id,
      userId: userTenant1Id,
      conversationId: conversations[1]?.id || conversations[0].id,
      messageId: null,
      feedbackType: FeedbackType.DISLIKE,
      feedbackText: "A IA demorou muito para responder e deu informações incorretas",
      feedbackStatus: FeedbackStatus.SENDO_TRATADO,
      superAdminComment: "Vamos revisar o tempo de resposta do agente",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ]

  // Quick Reply Templates
  const quickReplyTemplates: QuickReplyTemplate[] = [
    {
      id: uuidv4(),
      tenantId: tenant1Id,
      title: "Saudação",
      message: "Olá! Como posso ajudá-lo hoje?",
      icon: "👋",
      usageCount: 50,
      createdAt: now,
    },
    {
      id: uuidv4(),
      tenantId: tenant1Id,
      title: "Agradecimento",
      message: "Obrigado por entrar em contato! Estamos à disposição.",
      icon: "🙏",
      usageCount: 35,
      createdAt: now,
    },
    {
      id: uuidv4(),
      tenantId: tenant1Id,
      title: "Horário de Atendimento",
      message: "Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.",
      icon: "🕐",
      usageCount: 20,
      createdAt: now,
    },
    {
      id: uuidv4(),
      tenantId: tenant1Id,
      title: "Preços e Planos",
      message: "Nossos planos começam em R$99. Você pode ver mais detalhes em nosso site.",
      icon: "💰",
      usageCount: 15,
      createdAt: now,
    },
    {
      id: uuidv4(),
      tenantId: tenant1Id,
      title: "Promoção Especial",
      message: "Temos uma promoção especial esta semana! Entre em contato para saber mais.",
      icon: "🎉",
      usageCount: 12,
      createdAt: now,
    },
    {
      id: uuidv4(),
      tenantId: tenant2Id,
      title: "Agendamento",
      message: "Para agendar uma consulta, por favor informe seu nome e a especialidade desejada.",
      icon: "📅",
      usageCount: 25,
      createdAt: now,
    },
    {
      id: uuidv4(),
      tenantId: tenant2Id,
      title: "Exames",
      message: "Oferecemos diversos tipos de exames. Qual você precisa realizar?",
      icon: "🏥",
      usageCount: 18,
      createdAt: now,
    },
  ]

  return {
    tenants: [tenant1, tenant2, tenant3],
    users: [userSuperAdmin, userTenant1, userTenant1_2, userTenant2, userTenant3],
    featureModules: featureModules,
    neurocores: [neurocore1, neurocore2],
    agents: [agentIntents, agentSales, agentSupport],
    contacts: contacts,
    conversations: conversations,
    messages: messages,
    baseConhecimentos: [baseConhecimento1, baseConhecimento2, baseConhecimento3],
    synapses: synapses,
    feedbacks: feedbacks,
    quickReplyTemplates: quickReplyTemplates,
    globalFilters: {
      period: GlobalFilterPeriod.THIRTY_DAYS,
      conversationSelection: GlobalFilterConversationSelection.ALL,
    },
    currentAuthUser: null,
  }
}

// Export seed data diretamente
export const seedData = generateMockSeed()

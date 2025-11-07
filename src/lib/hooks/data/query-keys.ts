/**
 * Query Keys para React Query
 * Estrutura hierárquica para facilitar invalidação e organização
 */

export const queryKeys = {
  // Tenants
  tenants: {
    all: ["tenants"] as const,
    lists: () => [...queryKeys.tenants.all, "list"] as const,
    list: (filter: string) => [...queryKeys.tenants.lists(), filter] as const,
    details: () => [...queryKeys.tenants.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.tenants.details(), id] as const,
  },

  // Users
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (tenantId: string) => [...queryKeys.users.lists(), tenantId] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // Feature Modules
  featureModules: {
    all: ["featureModules"] as const,
    list: () => [...queryKeys.featureModules.all, "list"] as const,
  },

  // NeuroCores
  neurocores: {
    all: ["neurocores"] as const,
    lists: () => [...queryKeys.neurocores.all, "list"] as const,
    list: () => [...queryKeys.neurocores.lists()] as const,
    details: () => [...queryKeys.neurocores.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.neurocores.details(), id] as const,
  },

  // Agents
  agents: {
    all: ["agents"] as const,
    lists: () => [...queryKeys.agents.all, "list"] as const,
    list: () => [...queryKeys.agents.lists()] as const,
    details: () => [...queryKeys.agents.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.agents.details(), id] as const,
  },

  // Contacts
  contacts: {
    all: ["contacts"] as const,
    lists: () => [...queryKeys.contacts.all, "list"] as const,
    list: (tenantId: string) => [...queryKeys.contacts.lists(), tenantId] as const,
    details: () => [...queryKeys.contacts.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.contacts.details(), id] as const,
  },

  // Conversations
  conversations: {
    all: ["conversations"] as const,
    lists: () => [...queryKeys.conversations.all, "list"] as const,
    listByTenant: (tenantId: string) =>
      [...queryKeys.conversations.lists(), "tenant", tenantId] as const,
    listByContact: (contactId: string) =>
      [...queryKeys.conversations.lists(), "contact", contactId] as const,
    details: () => [...queryKeys.conversations.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.conversations.details(), id] as const,
  },

  // Messages
  messages: {
    all: ["messages"] as const,
    lists: () => [...queryKeys.messages.all, "list"] as const,
    list: (conversationId: string) => [...queryKeys.messages.lists(), conversationId] as const,
    details: () => [...queryKeys.messages.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.messages.details(), id] as const,
  },

  // Base Conhecimentos
  baseConhecimentos: {
    all: ["baseConhecimentos"] as const,
    lists: () => [...queryKeys.baseConhecimentos.all, "list"] as const,
    list: (tenantId: string) => [...queryKeys.baseConhecimentos.lists(), tenantId] as const,
    details: () => [...queryKeys.baseConhecimentos.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.baseConhecimentos.details(), id] as const,
  },

  // Synapses
  synapses: {
    all: ["synapses"] as const,
    lists: () => [...queryKeys.synapses.all, "list"] as const,
    listByBase: (baseId: string) => [...queryKeys.synapses.lists(), "base", baseId] as const,
    listByTenant: (tenantId: string) =>
      [...queryKeys.synapses.lists(), "tenant", tenantId] as const,
    details: () => [...queryKeys.synapses.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.synapses.details(), id] as const,
  },

  // Feedbacks
  feedbacks: {
    all: ["feedbacks"] as const,
    lists: () => [...queryKeys.feedbacks.all, "list"] as const,
    listByTenant: (tenantId: string) =>
      [...queryKeys.feedbacks.lists(), "tenant", tenantId] as const,
    listAll: () => [...queryKeys.feedbacks.lists(), "all"] as const,
    details: () => [...queryKeys.feedbacks.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.feedbacks.details(), id] as const,
  },

  // Quick Replies
  quickReplies: {
    all: ["quickReplies"] as const,
    lists: () => [...queryKeys.quickReplies.all, "list"] as const,
    list: (tenantId: string) => [...queryKeys.quickReplies.lists(), tenantId] as const,
    details: () => [...queryKeys.quickReplies.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.quickReplies.details(), id] as const,
  },
} as const

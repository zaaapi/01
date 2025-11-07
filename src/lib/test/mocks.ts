import { vi } from "vitest"

/**
 * Mock do cliente Supabase
 */
export function createMockSupabaseClient() {
  return {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    auth: {
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  }
}

/**
 * Mock do toast do Shadcn
 */
export function createMockToast() {
  return {
    toast: vi.fn(),
    dismiss: vi.fn(),
    toasts: [],
  }
}

/**
 * Mock de dados de Agent
 */
export function createMockAgent(overrides = {}) {
  return {
    id: "agent-1",
    name: "Agent Test",
    type: "ATENDENTE",
    function: "TRIAGEM",
    status: "ativo",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  }
}

/**
 * Mock de dados de Contact
 */
export function createMockContact(overrides = {}) {
  return {
    id: "contact-1",
    name: "Contact Test",
    phone: "+5511999999999",
    email: "test@example.com",
    tenantId: "tenant-1",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  }
}

/**
 * Mock de dados de Conversation
 */
export function createMockConversation(overrides = {}) {
  return {
    id: "conversation-1",
    contactId: "contact-1",
    tenantId: "tenant-1",
    status: "active",
    channel: "whatsapp",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  }
}

/**
 * Mock de dados de Message
 */
export function createMockMessage(overrides = {}) {
  return {
    id: "message-1",
    conversationId: "conversation-1",
    content: "Test message",
    sender: "user",
    status: "sent",
    createdAt: "2024-01-01T00:00:00Z",
    ...overrides,
  }
}

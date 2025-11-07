import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useAgents, useCreateAgent, useUpdateAgent, useDeleteAgent } from "../use-agents"
import * as agentsService from "@/lib/services/agents.service"
import { createMockAgent } from "@/lib/test/mocks"
import { ReactNode } from "react"

// Mock dos services
vi.mock("@/lib/services/agents.service")
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe("useAgents", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("deve buscar agentes com sucesso", async () => {
    const mockAgents = [createMockAgent(), createMockAgent({ id: "agent-2" })]
    vi.mocked(agentsService.fetchAgents).mockResolvedValue(mockAgents)

    const { result } = renderHook(() => useAgents(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockAgents)
    expect(agentsService.fetchAgents).toHaveBeenCalledTimes(1)
  })

  it("deve lidar com erro ao buscar agentes", async () => {
    const mockError = new Error("Erro ao buscar agentes")
    vi.mocked(agentsService.fetchAgents).mockRejectedValue(mockError)

    const { result } = renderHook(() => useAgents(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeTruthy()
  })
})

describe("useCreateAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("deve criar agente com sucesso", async () => {
    const newAgent = createMockAgent()
    vi.mocked(agentsService.createAgent).mockResolvedValue(newAgent)

    const { result } = renderHook(() => useCreateAgent(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      name: "New Agent",
      type: "ATENDENTE",
      function: "TRIAGEM",
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(newAgent)
  })

  it("deve lidar com erro ao criar agente", async () => {
    const mockError = new Error("Erro ao criar agente")
    vi.mocked(agentsService.createAgent).mockRejectedValue(mockError)

    const { result } = renderHook(() => useCreateAgent(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      name: "New Agent",
      type: "ATENDENTE",
      function: "TRIAGEM",
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeTruthy()
  })
})

describe("useUpdateAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("deve atualizar agente com sucesso", async () => {
    const updatedAgent = createMockAgent({ name: "Updated Agent" })
    vi.mocked(agentsService.updateAgent).mockResolvedValue(updatedAgent)

    const { result } = renderHook(() => useUpdateAgent(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      id: "agent-1",
      data: { name: "Updated Agent" },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(updatedAgent)
  })
})

describe("useDeleteAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("deve deletar agente com sucesso", async () => {
    vi.mocked(agentsService.deleteAgent).mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteAgent(), {
      wrapper: createWrapper(),
    })

    result.current.mutate("agent-1")

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(agentsService.deleteAgent).toHaveBeenCalled()
    expect(vi.mocked(agentsService.deleteAgent).mock.calls[0][0]).toBe("agent-1")
  })
})

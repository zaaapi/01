import { ReactElement, ReactNode } from "react"
import { render, RenderOptions } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

/**
 * Cria um QueryClient para testes
 * Desabilita retry e configurações que causam delays
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  })
}

/**
 * Wrapper com providers necessários para testes
 */
interface ProvidersProps {
  children: ReactNode
  queryClient?: QueryClient
}

function Providers({ children, queryClient }: ProvidersProps) {
  const client = queryClient || createTestQueryClient()

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

/**
 * Custom render que inclui providers automaticamente
 */
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient
}

export function renderWithProviders(ui: ReactElement, options?: CustomRenderOptions) {
  const { queryClient, ...renderOptions } = options || {}

  return render(ui, {
    wrapper: ({ children }) => <Providers queryClient={queryClient}>{children}</Providers>,
    ...renderOptions,
  })
}

// Re-exporta tudo do testing-library
export * from "@testing-library/react"
export { renderWithProviders as render }

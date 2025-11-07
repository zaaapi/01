import { QueryClient, DefaultOptions } from "@tanstack/react-query"
import { handleApiError, logError, isNetworkError } from "./error-handler"
import { ApiError } from "@/types/react-query"

/**
 * Configurações padrão para queries
 */
export const defaultQueryOptions: DefaultOptions = {
  queries: {
    // Tempo que dados são considerados "frescos"
    staleTime: 1000 * 60, // 1 minuto

    // Tempo que dados permanecem em cache
    gcTime: 1000 * 60 * 5, // 5 minutos

    // Retry logic
    retry: (failureCount, error) => {
      // Não retry para erros de auth ou validação
      const apiError = handleApiError(error)
      if (apiError.status === 401 || apiError.status === 422) {
        return false
      }

      // Retry até 2 vezes para erros de rede
      if (isNetworkError(error)) {
        return failureCount < 2
      }

      // 1 retry para outros erros
      return failureCount < 1
    },

    // Delay exponencial entre retries
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Revalidar ao focar na janela
    refetchOnWindowFocus: true,

    // Revalidar ao reconectar
    refetchOnReconnect: true,
  },

  mutations: {
    // Mutations não fazem retry por padrão
    retry: 0,

    // Handler global de erro para mutations
    onError: (error: unknown) => {
      const apiError = handleApiError(error)
      logError(apiError, "Mutation")
    },
  },
}

/**
 * Cria um QueryClient com configurações customizadas
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: defaultQueryOptions,
  })
}

/**
 * Configurações específicas por tipo de query
 */
export const queryConfigs = {
  // Queries que não devem ser revalidadas automaticamente
  static: {
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },

  // Queries de dados em tempo real
  realtime: {
    staleTime: 0,
    gcTime: 1000 * 60, // 1 minuto
    refetchInterval: 5000, // Poll a cada 5 segundos
  },

  // Queries de dados que mudam raramente
  longCache: {
    staleTime: 1000 * 60 * 10, // 10 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
  },

  // Queries de dados pesados/grandes
  heavyData: {
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    refetchOnWindowFocus: false,
  },
} as const

/**
 * Helper para invalidar queries relacionadas
 */
export function getInvalidationQueries(baseKey: readonly unknown[]) {
  return {
    // Invalida todas as queries com esse prefixo
    all: { queryKey: baseKey },

    // Invalida apenas listas
    lists: { queryKey: [...baseKey, "list"] },

    // Invalida apenas detalhes
    details: { queryKey: [...baseKey, "detail"] },
  }
}

/**
 * Tipo auxiliar para extrair erro tipado
 */
export function getTypedError(error: unknown): ApiError {
  return handleApiError(error)
}


"use client"

import { QueryClient } from "@tanstack/react-query"
import { defaultQueryOptions } from "./query-config"
import { handleApiError, logError } from "./error-handler"

/**
 * Cliente React Query compartilhado
 * Usa configurações centralizadas de query-config.ts
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    ...defaultQueryOptions,
    queries: {
      ...defaultQueryOptions.queries,
      // Handler global de erro para queries
      // @ts-expect-error - onError é válido mas não está nos types oficiais
      onError: (error: unknown) => {
        const apiError = handleApiError(error)
        logError(apiError, "Query")
      },
    },
  },
})

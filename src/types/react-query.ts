import { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query"

/**
 * Tipo de erro padrão da API
 */
export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: Record<string, unknown>
}

/**
 * Resposta paginada padrão
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/**
 * Tipo auxiliar para Query Options tipado
 */
export type TypedQueryOptions<
  TData = unknown,
  TError = ApiError,
  TQueryKey extends readonly unknown[] = readonly unknown[],
> = Omit<UseQueryOptions<TData, TError, TData, TQueryKey>, "queryKey" | "queryFn">

/**
 * Tipo auxiliar para Mutation Options tipado
 */
export type TypedMutationOptions<
  TData = unknown,
  TError = ApiError,
  TVariables = void,
  TContext = unknown,
> = UseMutationOptions<TData, TError, TVariables, TContext>

/**
 * Status de requisição
 */
export type RequestStatus = "idle" | "loading" | "success" | "error"

/**
 * Metadata de paginação
 */
export interface PaginationMeta {
  currentPage: number
  pageSize: number
  totalPages: number
  totalItems: number
}

/**
 * Filtros de query padrão
 */
export interface QueryFilters {
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page?: number
  pageSize?: number
}

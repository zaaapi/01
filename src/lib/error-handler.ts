import { ApiError } from "@/types/react-query"

/**
 * Classe customizada para erros da API
 */
export class ApiErrorClass extends Error implements ApiError {
  code?: string
  status?: number
  details?: Record<string, unknown>

  constructor(
    message: string,
    options?: {
      code?: string
      status?: number
      details?: Record<string, unknown>
    }
  ) {
    super(message)
    this.name = "ApiError"
    this.code = options?.code
    this.status = options?.status
    this.details = options?.details

    // Mantém o stack trace correto
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiErrorClass)
    }
  }
}

/**
 * Trata erros de forma consistente e retorna ApiError
 */
export function handleApiError(error: unknown): ApiError {
  // Se já é um ApiError, retorna direto
  if (error instanceof ApiErrorClass) {
    return error
  }

  // Se é um Error padrão
  if (error instanceof Error) {
    return {
      message: error.message,
      code: "UNKNOWN_ERROR",
    }
  }

  // Se é um objeto com formato de erro
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>

    return {
      message: (err.message as string) || "Ocorreu um erro desconhecido",
      code: (err.code as string) || "UNKNOWN_ERROR",
      status: err.status as number,
      details: err.details as Record<string, unknown>,
    }
  }

  // Fallback para qualquer outro tipo
  return {
    message: "Ocorreu um erro desconhecido",
    code: "UNKNOWN_ERROR",
  }
}

/**
 * Formata mensagem de erro para exibição ao usuário
 */
export function formatErrorMessage(error: ApiError): string {
  // Mensagens customizadas por código
  const errorMessages: Record<string, string> = {
    NETWORK_ERROR: "Erro de conexão. Verifique sua internet.",
    UNAUTHORIZED: "Você não tem permissão para esta ação.",
    NOT_FOUND: "Recurso não encontrado.",
    VALIDATION_ERROR: "Dados inválidos. Verifique os campos.",
    TIMEOUT: "A requisição demorou muito. Tente novamente.",
  }

  // Retorna mensagem customizada ou a original
  return error.code && errorMessages[error.code] ? errorMessages[error.code] : error.message
}

/**
 * Verifica se é um erro de rede
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("network") ||
      error.message.includes("fetch") ||
      error.message.includes("NetworkError")
    )
  }
  return false
}

/**
 * Verifica se é um erro de autenticação
 */
export function isAuthError(error: unknown): boolean {
  const apiError = handleApiError(error)
  return apiError.status === 401 || apiError.code === "UNAUTHORIZED"
}

/**
 * Verifica se é um erro de validação
 */
export function isValidationError(error: unknown): boolean {
  const apiError = handleApiError(error)
  return apiError.status === 422 || apiError.code === "VALIDATION_ERROR"
}

/**
 * Log de erro para desenvolvimento
 */
export function logError(error: unknown, context?: string) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[Error${context ? ` - ${context}` : ""}]:`, error)
  }
}

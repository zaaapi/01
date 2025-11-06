import { Loader2 } from "lucide-react"

/**
 * LoadingScreen
 * 
 * Componente de loading profissional usado durante estados de carregamento
 * da autenticação. Exibe logo LIVIA, spinner animado e mensagem.
 * 
 * Usado por:
 * - AuthGuard (durante isLoadingAuth)
 * - Páginas que aguardam carregamento de dados críticos
 */
export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        {/* Logo LIVIA */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shrink-0">
            <span className="text-2xl font-bold text-white">L</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            LIVIA
          </h1>
        </div>

        {/* Spinner Animado */}
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>

        {/* Texto de Carregamento */}
        <p className="text-sm text-muted-foreground">
          Carregando...
        </p>
      </div>
    </div>
  )
}


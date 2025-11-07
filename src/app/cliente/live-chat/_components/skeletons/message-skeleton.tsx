import { Skeleton } from "@/components/ui/skeleton"

export function MessageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Mensagens do cliente (esquerda) */}
      {[...Array(2)].map((_, i) => (
        <div key={`cliente-${i}`} className="flex justify-start">
          <div className="max-w-[70%] space-y-2">
            <Skeleton className="h-16 w-64 rounded-lg" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}

      {/* Mensagens do atendente/IA (direita) */}
      {[...Array(2)].map((_, i) => (
        <div key={`atendente-${i}`} className="flex justify-end">
          <div className="max-w-[70%] space-y-2">
            <Skeleton className="h-16 w-72 rounded-lg" />
            <Skeleton className="h-3 w-20 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  )
}

import { Skeleton } from "@/components/ui/skeleton"

export function ConversationSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2 p-3 border rounded-lg">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  )
}

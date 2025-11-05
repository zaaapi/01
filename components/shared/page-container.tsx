import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto p-6 md:p-8", className)}>
      <div className="mx-auto max-w-7xl space-y-6">{children}</div>
    </div>
  )
}




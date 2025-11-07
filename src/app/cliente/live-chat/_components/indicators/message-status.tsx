import { Check, CheckCheck, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export enum MessageDeliveryStatus {
  SENDING = "sending",
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
}

interface MessageStatusProps {
  status?: MessageDeliveryStatus | string
  className?: string
}

export function MessageStatus({ status, className }: MessageStatusProps) {
  if (!status) return null

  const iconMap = {
    [MessageDeliveryStatus.SENDING]: <Clock className="h-3 w-3 text-muted-foreground" />,
    [MessageDeliveryStatus.SENT]: <Check className="h-3 w-3 text-muted-foreground" />,
    [MessageDeliveryStatus.DELIVERED]: <CheckCheck className="h-3 w-3 text-muted-foreground" />,
    [MessageDeliveryStatus.READ]: <CheckCheck className="h-3 w-3 text-blue-500" />,
    [MessageDeliveryStatus.FAILED]: <AlertCircle className="h-3 w-3 text-destructive" />,
  }

  return (
    <span className={cn("inline-flex items-center", className)}>
      {iconMap[status as MessageDeliveryStatus] || null}
    </span>
  )
}

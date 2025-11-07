"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { MessageSquare, BookOpen, Palette, BarChart3, Zap, Plug, LucideIcon } from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  MessageSquare,
  BookOpen,
  Palette,
  BarChart3,
  Zap,
  Plug,
}

interface ModuloCardProps {
  id: string
  nome: string
  descricao: string
  icon: string
  isActive: boolean
  onToggle: (id: string, isActive: boolean) => void
}

export function ModuloCard({ id, nome, descricao, icon, isActive, onToggle }: ModuloCardProps) {
  const Icon = ICON_MAP[icon] || MessageSquare

  return (
    <Card className={isActive ? "border-primary" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${isActive ? "bg-primary/10" : "bg-muted"}`}>
              <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div>
              <CardTitle className="text-base">{nome}</CardTitle>
              <CardDescription className="text-sm mt-1">{descricao}</CardDescription>
            </div>
          </div>
          <Switch checked={isActive} onCheckedChange={(checked) => onToggle(id, checked)} />
        </div>
      </CardHeader>
    </Card>
  )
}

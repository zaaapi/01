"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import {
  Gauge,
  Building,
  Brain,
  Bot,
  MessageSquare,
  User,
  MessagesSquare,
  Book,
  Settings,
  Wand,
  LucideIcon,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useData } from "@/lib/contexts/data-provider"

interface MenuItem {
  name: string
  href: string
  icon: LucideIcon
  position?: "top" | "bottom"
}

interface SidebarProps {
  platform: "super-admin" | "cliente"
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

const superAdminMenu: MenuItem[] = [
  { name: "Dashboard", href: "/super-admin", icon: Gauge, position: "top" },
  { name: "Empresas", href: "/super-admin/empresas", icon: Building, position: "top" },
  { name: "NeuroCores", href: "/super-admin/neurocores", icon: Brain, position: "top" },
  { name: "Agentes IA", href: "/super-admin/agentes-ia", icon: Bot, position: "top" },
  { name: "Feedbacks", href: "/super-admin/feedbacks", icon: MessageSquare, position: "top" },
  { name: "Meu Perfil", href: "/super-admin/perfil", icon: User, position: "bottom" },
]

const clienteMenu: MenuItem[] = [
  { name: "Dashboard", href: "/cliente", icon: Gauge, position: "top" },
  { name: "Live Chat", href: "/cliente/live-chat", icon: MessagesSquare, position: "top" },
  { name: "Base de Conhecimento", href: "/cliente/base-conhecimento", icon: Book, position: "top" },
  { name: "Personalização NeuroCore", href: "/cliente/personalizacao", icon: Settings, position: "top" },
  { name: "Treinamento NeuroCore", href: "/cliente/treinamento", icon: Wand, position: "top" },
  { name: "Meu Perfil", href: "/cliente/perfil", icon: User, position: "bottom" },
]

// Limites por plano (mock)
const PLAN_LIMITS: Record<string, { conversations: number; messages: number; synapses: number }> = {
  Basic: { conversations: 100, messages: 1000, synapses: 50 },
  Business: { conversations: 500, messages: 5000, synapses: 200 },
  Premium: { conversations: 2000, messages: 20000, synapses: 1000 },
  Enterprise: { conversations: -1, messages: -1, synapses: -1 }, // Ilimitado
}

function UsagePanel({ isCollapsed }: { isCollapsed: boolean }) {
  const { user } = useAuth()
  const { state } = useData()

  const tenant = user?.tenantId
    ? state.tenants.find((t) => t.id === user.tenantId)
    : null

  if (!tenant || user?.role === "super_admin") {
    return null
  }

  const planLimits = PLAN_LIMITS[tenant.plan] || PLAN_LIMITS.Basic

  // Calcular uso atual
  const conversationsCount = state.conversations.filter((c) => c.tenantId === tenant.id).length
  const messagesCount = state.messages.filter((m) => {
    const conversation = state.conversations.find((c) => c.id === m.conversationId)
    return conversation?.tenantId === tenant.id
  }).length
  const synapsesCount = state.synapses.filter((s) => s.tenantId === tenant.id).length

  const conversationsUsage =
    planLimits.conversations === -1 ? 0 : (conversationsCount / planLimits.conversations) * 100
  const messagesUsage =
    planLimits.messages === -1 ? 0 : (messagesCount / planLimits.messages) * 100
  const synapsesUsage =
    planLimits.synapses === -1 ? 0 : (synapsesCount / planLimits.synapses) * 100

  return (
    <motion.div
      initial={false}
      animate={{ opacity: isCollapsed ? 0 : 1 }}
      transition={{ duration: 0.2 }}
      className={cn("px-3 py-2", isCollapsed && "hidden")}
    >
      <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <BarChart3 className="h-3 w-3" />
          <span>Uso do Plano</span>
        </div>

        <div className="space-y-1.5">
          <div className="space-y-0.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Conversas</span>
              <span className="font-medium">
                {conversationsCount}
                {planLimits.conversations !== -1 && ` / ${planLimits.conversations}`}
              </span>
            </div>
            {planLimits.conversations !== -1 && (
              <Progress value={Math.min(conversationsUsage, 100)} className="h-1" />
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Mensagens</span>
              <span className="font-medium">
                {messagesCount}
                {planLimits.messages !== -1 && ` / ${planLimits.messages}`}
              </span>
            </div>
            {planLimits.messages !== -1 && (
              <Progress value={Math.min(messagesUsage, 100)} className="h-1" />
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Synapses</span>
              <span className="font-medium">
                {synapsesCount}
                {planLimits.synapses !== -1 && ` / ${planLimits.synapses}`}
              </span>
            </div>
            {planLimits.synapses !== -1 && (
              <Progress value={Math.min(synapsesUsage, 100)} className="h-1" />
            )}
          </div>
        </div>

        <div className="pt-1 border-t">
          <div className="text-xs text-muted-foreground">
            Plano: <span className="font-medium text-foreground">{tenant.plan}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function Sidebar({ platform, isCollapsed: externalCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const [internalCollapsed, setInternalCollapsed] = useState(externalCollapsed ?? false)
  
  // Usar controle externo se fornecido, senão usar interno
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed))

  const menuItems = platform === "super-admin" ? superAdminMenu : clienteMenu

  const topItems = menuItems.filter((item) => item.position !== "bottom")
  const bottomItems = menuItems.filter((item) => item.position === "bottom")

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "flex flex-col h-full border-r bg-card overflow-hidden"
      )}
    >
      {/* Header */}
      <div className="p-6 relative">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary shrink-0">
            <span className="text-lg font-bold text-white">L</span>
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.h1
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent whitespace-nowrap overflow-hidden"
              >
                LIVIA
              </motion.h1>
            )}
          </AnimatePresence>
        </Link>
      </div>

      <Separator />

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="flex flex-col gap-1 px-3">
          {topItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: isCollapsed ? 0 : 2 }}
                  transition={{ duration: 0.15 }}
                >
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 transition-colors",
                      isCollapsed && "justify-center px-0",
                      isActive && "bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.15 }}
                          className="whitespace-nowrap overflow-hidden"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Usage Panel (apenas para cliente) */}
      {platform === "cliente" && <UsagePanel isCollapsed={isCollapsed} />}

      <Separator />

      {/* Bottom Menu */}
      <div className="p-3">
        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: isCollapsed ? 0 : 2 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 transition-colors",
                    isCollapsed && "justify-center px-0",
                    isActive && "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  {isCollapsed ? (
                    <Icon className="h-5 w-5 shrink-0" />
                  ) : (
                    <>
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <AnimatePresence mode="wait">
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.15 }}
                          className="whitespace-nowrap overflow-hidden"
                        >
                          {item.name}
                        </motion.span>
                      </AnimatePresence>
                    </>
                  )}
                </Button>
              </motion.div>
            </Link>
          )
        })}
      </div>

      {/* Toggle Button */}
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          className="w-full justify-center"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </motion.div>
  )
}

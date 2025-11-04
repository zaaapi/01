"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
} from "lucide-react"

interface MenuItem {
  name: string
  href: string
  icon: LucideIcon
  position?: "top" | "bottom"
}

interface SidebarProps {
  platform: "super-admin" | "cliente"
  isCollapsed?: boolean
}

const superAdminMenu: MenuItem[] = [
  { name: "Dashboard", href: "/super-admin", icon: Gauge, position: "top" },
  { name: "Empresas", href: "/super-admin/empresas", icon: Building, position: "top" },
  { name: "NeuroCores", href: "/super-admin/neurocores", icon: Brain, position: "top" },
  { name: "Agentes IA", href: "/super-admin/agentes", icon: Bot, position: "top" },
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

export function Sidebar({ platform, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const menuItems = platform === "super-admin" ? superAdminMenu : clienteMenu

  const topItems = menuItems.filter((item) => item.position !== "bottom")
  const bottomItems = menuItems.filter((item) => item.position === "bottom")

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r bg-card",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
            <span className="text-lg font-bold text-white">L</span>
          </div>
          {!isCollapsed && (
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              LIVIA
            </h1>
          )}
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
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isCollapsed && "justify-center px-0",
                    isActive && "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>

      <Separator />

      {/* Bottom Menu */}
      <div className="p-3">
        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isCollapsed && "justify-center px-0",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                {isCollapsed ? (
                  <Icon className="h-5 w-5" />
                ) : (
                  <>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <span>{item.name}</span>
                  </>
                )}
              </Button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/shared/sidebar"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { AuthGuard } from "@/components/shared/auth-guard"

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(pathname === "/cliente/live-chat")

  // Atualizar estado quando mudar de rota
  useEffect(() => {
    setIsCollapsed(pathname === "/cliente/live-chat")
  }, [pathname])

  return (
    <AuthGuard allowedRoles={["usuario_cliente"]}>
      <div className="flex h-screen overflow-hidden">
      <Sidebar 
        platform="cliente" 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-muted-foreground">
              Plataforma Cliente
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
    </AuthGuard>
  )
}

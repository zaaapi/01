"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/lib/contexts/auth-context"
import { useData } from "@/lib/contexts/data-provider"
import { UserRole } from "@/types"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { state } = useData()
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [selectedTenantId, setSelectedTenantId] = useState<string>("")
  const [selectedUserId, setSelectedUserId] = useState<string>("")

  const superAdminUsers = state.users.filter((u) => u.role === UserRole.SUPER_ADMIN)
  const clientUsers = state.users.filter((u) => u.role === UserRole.USUARIO_CLIENTE)
  const tenants = state.tenants.filter((t) => t.isActive)

  const filteredClientUsers = selectedTenantId
    ? clientUsers.filter((u) => u.tenantId === selectedTenantId)
    : []

  const handleLogin = () => {
    if (!selectedUserId) return

    const user = state.users.find((u) => u.id === selectedUserId)
    if (!user) return

    login(user)

    // Redirecionar para o dashboard apropriado
    if (user.role === UserRole.SUPER_ADMIN) {
      router.push("/super-admin")
    } else {
      router.push("/cliente")
    }
  }

  const canLogin = selectedRole === UserRole.SUPER_ADMIN
    ? selectedUserId !== ""
    : selectedTenantId !== "" && selectedUserId !== ""

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login - LIVIA</CardTitle>
          <CardDescription>
            Selecione um usuário para entrar na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Tipo de Usuário</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecione o tipo de usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                <SelectItem value={UserRole.USUARIO_CLIENTE}>Cliente (Tenant)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedRole === UserRole.USUARIO_CLIENTE && (
            <div className="space-y-2">
              <Label htmlFor="tenant">Empresa (Tenant)</Label>
              <Select
                value={selectedTenantId}
                onValueChange={(value) => {
                  setSelectedTenantId(value)
                  setSelectedUserId("")
                }}
              >
                <SelectTrigger id="tenant">
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="user">Usuário</Label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              disabled={
                selectedRole === UserRole.USUARIO_CLIENTE && !selectedTenantId
              }
            >
              <SelectTrigger id="user">
                <SelectValue placeholder="Selecione o usuário" />
              </SelectTrigger>
              <SelectContent>
                {selectedRole === UserRole.SUPER_ADMIN
                  ? superAdminUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.fullName} ({user.email})
                      </SelectItem>
                    ))
                  : filteredClientUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.fullName} ({user.email})
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleLogin}
            disabled={!canLogin}
            className="w-full"
            size="lg"
          >
            Entrar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


"use client"

import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LogOut, RefreshCcw } from "lucide-react"

export default function PerfilSuperAdminPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Meu Perfil"
        description="Gerencie suas informações pessoais e preferências"
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value="Admin Super" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value="admin@livia.com" disabled />
            </div>
            <div className="space-y-2">
              <Label>Idioma</Label>
              <Input value="Português (pt-BR)" disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferências do App</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Persistência Local</p>
                <p className="text-sm text-muted-foreground">
                  Dados salvos no localStorage
                </p>
              </div>
              <Badge variant="default">Ativado</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Recarregar Dados de Exemplo</p>
                <p className="text-sm text-muted-foreground">
                  Restaura os dados iniciais do seed
                </p>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Recarregar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessão</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full sm:w-auto">
              <LogOut className="mr-2 h-4 w-4" />
              Logout (Simulado)
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}


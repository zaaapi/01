"use client"

import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Save } from "lucide-react"

export default function PerfilClientePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Meu Perfil"
        description="Gerencie suas informações pessoais e da empresa"
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto" />
                <AvatarFallback>RC</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                Alterar Avatar
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input id="nome" defaultValue="Roberto Costa" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" defaultValue="roberto@techstore.com" disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" defaultValue="+55 11 98765-5555" />
            </div>

            <Button>
              <Save className="mr-2 h-4 w-4" />
              Salvar Informações Pessoais
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="empresa">Nome da Empresa</Label>
              <Input id="empresa" defaultValue="Loja Tech Store" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" defaultValue="12.345.678/0001-90" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" defaultValue="+55 11 98765-4321" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plano">Plano Contratado</Label>
              <Input id="plano" defaultValue="Premium" disabled />
            </div>

            <Button>
              <Save className="mr-2 h-4 w-4" />
              Salvar Informações da Empresa
            </Button>
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


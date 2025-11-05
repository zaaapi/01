"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LogOut, Save, Upload } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useData } from "@/lib/contexts/data-provider"
import { useToast } from "@/hooks/use-toast"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"

const perfilPessoalSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  whatsapp: z.string().min(10, "WhatsApp inválido"),
})

const empresaSchema = z.object({
  name: z.string().min(3, "Nome da empresa deve ter no mínimo 3 caracteres"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  phone: z.string().min(10, "Telefone inválido"),
})

type PerfilPessoalFormValues = z.infer<typeof perfilPessoalSchema>
type EmpresaFormValues = z.infer<typeof empresaSchema>

export default function PerfilClientePage() {
  const router = useRouter()
  const { currentAuthUser, logout } = useAuth()
  const { state, updateUser, updateTenant } = useData()
  const { toast } = useToast()

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const perfilForm = useForm<PerfilPessoalFormValues>({
    resolver: zodResolver(perfilPessoalSchema),
    defaultValues: {
      name: "",
      whatsapp: "",
    },
  })

  const empresaForm = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      phone: "",
    },
  })

  const tenant = useMemo(() => {
    if (!currentAuthUser?.tenantId) return null
    return state.tenants.find((t) => t.id === currentAuthUser.tenantId)
  }, [state.tenants, currentAuthUser])

  useEffect(() => {
    if (currentAuthUser) {
      perfilForm.reset({
        name: currentAuthUser.fullName,
        whatsapp: currentAuthUser.whatsappNumber || "",
      })

      if (tenant) {
        empresaForm.reset({
          name: tenant.name,
          cnpj: tenant.cnpj || "",
          phone: tenant.phone || "",
        })
      }
    }
  }, [currentAuthUser, tenant, perfilForm, empresaForm])

  // Atalhos de teclado
  useKeyboardShortcuts({
    onNavigate1: () => router.push("/cliente"),
    onNavigate2: () => router.push("/cliente/perfil"),
    onNavigate3: () => router.push("/cliente/perfil"),
  })

  const handleUploadAvatar = () => {
    // Upload simulado
    const randomSeed = Math.random().toString(36).substring(7)
    const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`
    setAvatarUrl(newAvatarUrl)
    toast({
      title: "Avatar atualizado",
      description: "O avatar foi atualizado com sucesso (simulado).",
    })
  }

  const handleSavePerfil = async (data: PerfilPessoalFormValues) => {
    if (!currentAuthUser) return

    try {
      await updateUser(currentAuthUser.id, {
        fullName: data.name,
        whatsappNumber: data.whatsapp,
      })
      toast({
        title: "Perfil atualizado",
        description: "Suas informações pessoais foram salvas com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      })
    }
  }

  const handleSaveEmpresa = async (data: EmpresaFormValues) => {
    if (!tenant) return

    try {
      await updateTenant(tenant.id, {
        name: data.name,
        cnpj: data.cnpj,
        phone: data.phone,
      })
      toast({
        title: "Empresa atualizada",
        description: "As informações da empresa foram salvas com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a empresa.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/logged-out")
  }

  if (!currentAuthUser) {
    return null
  }

  const displayAvatarUrl = avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentAuthUser.fullName}`

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
                <AvatarImage src={displayAvatarUrl} />
                <AvatarFallback>
                  {currentAuthUser.fullName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={handleUploadAvatar}>
                <Upload className="mr-2 h-4 w-4" />
                Alterar Avatar
              </Button>
            </div>

            <Form {...perfilForm}>
              <form onSubmit={perfilForm.handleSubmit(handleSavePerfil)} className="space-y-4">
                <FormField
                  control={perfilForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={currentAuthUser.email} disabled />
                </div>

                <FormField
                  control={perfilForm.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+55 11 98765-4321" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Informações Pessoais
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...empresaForm}>
              <form onSubmit={empresaForm.handleSubmit(handleSaveEmpresa)} className="space-y-4">
                <FormField
                  control={empresaForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={empresaForm.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="12.345.678/0001-90" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={empresaForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+55 11 98765-4321" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plano">Plano Contratado</Label>
                  <Input id="plano" value={tenant?.plan || "Premium"} disabled />
                </div>

                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Informações da Empresa
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessão</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full sm:w-auto" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout (Simulado)
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

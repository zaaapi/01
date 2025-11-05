"use client"

import { useState, useEffect } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LogOut, RefreshCcw } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useData } from "@/lib/contexts/data-provider"
import { useToast } from "@/hooks/use-toast"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { seedData } from "@/lib/seed-data"

const perfilSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido"),
})

type FormValues = z.infer<typeof perfilSchema>

export default function PerfilSuperAdminPage() {
  const router = useRouter()
  const { user, signOut, refreshUser } = useAuth()
  const { resetData, fetchUserProfile, updateUserProfile } = useData()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  // Carregar dados do Supabase
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const userProfile = await fetchUserProfile(user.id)
        
        if (userProfile) {
          form.reset({
            name: userProfile.fullName,
            email: userProfile.email,
          })
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar o perfil.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user?.id, fetchUserProfile, form, toast])

  // Atalhos de teclado
  useKeyboardShortcuts({
    onNavigate1: () => router.push("/super-admin"),
    onNavigate2: () => router.push("/super-admin/perfil"),
    onNavigate3: () => router.push("/super-admin/perfil"),
  })

  const handleSave = async (data: FormValues) => {
    if (!user?.id) return

    try {
      setIsSaving(true)
      await updateUserProfile(user.id, {
        fullName: data.name,
      })

      // Atualizar AuthContext
      await refreshUser()

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao salvar perfil:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o perfil.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRecarregarDados = () => {
    resetData()
    toast({
      title: "Dados recarregados",
      description: "Os dados de exemplo foram restaurados.",
    })
  }

  const handleLogout = async () => {
    await signOut()
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="Meu Perfil"
          description="Gerencie suas informações pessoais e preferências"
        />
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    )
  }

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
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Fictício</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail Fictício</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Input value="Português (pt-BR)" disabled />
                </div>

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Salvando..." : "Salvar Informações Pessoais"}
                </Button>
              </form>
            </Form>
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
              <Button variant="outline" size="sm" onClick={handleRecarregarDados}>
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

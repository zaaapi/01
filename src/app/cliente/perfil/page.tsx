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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LogOut, Save } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useData } from "@/lib/contexts/data-provider"
import { useToast } from "@/hooks/use-toast"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"

// Validação de WhatsApp (aceita +55 11 98765-4321 ou similar)
const whatsappRegex = /^\+?[1-9]\d{1,14}$/

// Validação de CNPJ (aceita formato com ou sem máscara)
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/

const perfilPessoalSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  whatsapp: z
    .string()
    .min(10, "WhatsApp inválido")
    .refine((val) => whatsappRegex.test(val.replace(/\s/g, "")), {
      message: "Formato de WhatsApp inválido. Use +55 11 98765-4321",
    }),
  avatarUrl: z.string().url("URL inválida").optional().or(z.literal("")),
})

const empresaSchema = z.object({
  name: z.string().min(3, "Nome da empresa deve ter no mínimo 3 caracteres"),
  cnpj: z
    .string()
    .min(14, "CNPJ inválido")
    .refine((val) => cnpjRegex.test(val.replace(/\D/g, "")), {
      message: "Formato de CNPJ inválido. Use 12.345.678/0001-90",
    }),
  phone: z
    .string()
    .min(10, "Telefone inválido")
    .refine((val) => whatsappRegex.test(val.replace(/\s/g, "")), {
      message: "Formato de telefone inválido",
    }),
  responsibleTechName: z.string().min(3, "Nome do responsável técnico é obrigatório"),
  responsibleTechWhatsapp: z
    .string()
    .min(10, "WhatsApp do responsável técnico inválido")
    .refine((val) => whatsappRegex.test(val.replace(/\s/g, "")), {
      message: "Formato de WhatsApp inválido",
    }),
  responsibleTechEmail: z.string().email("E-mail do responsável técnico inválido"),
  responsibleFinanceName: z.string().min(3, "Nome do responsável financeiro é obrigatório"),
  responsibleFinanceWhatsapp: z
    .string()
    .min(10, "WhatsApp do responsável financeiro inválido")
    .refine((val) => whatsappRegex.test(val.replace(/\s/g, "")), {
      message: "Formato de WhatsApp inválido",
    }),
  responsibleFinanceEmail: z.string().email("E-mail do responsável financeiro inválido"),
})

type PerfilPessoalFormValues = z.infer<typeof perfilPessoalSchema>
type EmpresaFormValues = z.infer<typeof empresaSchema>

export default function PerfilClientePage() {
  const router = useRouter()
  const { user, signOut, refreshUser } = useAuth()
  const { fetchUserProfile, fetchTenantProfile, updateUserProfile, updateTenantProfile } = useData()
  const { toast } = useToast()
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isLoadingTenant, setIsLoadingTenant] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingTenant, setIsSavingTenant] = useState(false)

  const perfilForm = useForm<PerfilPessoalFormValues>({
    resolver: zodResolver(perfilPessoalSchema),
    defaultValues: {
      name: "",
      whatsapp: "",
      avatarUrl: "",
    },
  })

  const empresaForm = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      phone: "",
      responsibleTechName: "",
      responsibleTechWhatsapp: "",
      responsibleTechEmail: "",
      responsibleFinanceName: "",
      responsibleFinanceWhatsapp: "",
      responsibleFinanceEmail: "",
    },
  })

  // Carregar dados pessoais do Supabase
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setIsLoadingProfile(false)
        return
      }

      try {
        setIsLoadingProfile(true)
        const userProfile = await fetchUserProfile(user.id)

        if (userProfile) {
          perfilForm.reset({
            name: userProfile.fullName,
            whatsapp: userProfile.whatsappNumber || "",
            avatarUrl: userProfile.avatarUrl || "",
          })
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar o perfil pessoal.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingProfile(false)
      }
    }

    loadProfile()
  }, [user?.id, fetchUserProfile, perfilForm, toast])

  // Carregar dados da empresa do Supabase
  useEffect(() => {
    const loadTenant = async () => {
      if (!user?.tenantId) {
        setIsLoadingTenant(false)
        return
      }

      try {
        setIsLoadingTenant(true)
        const tenantProfile = await fetchTenantProfile(user.tenantId)

        if (tenantProfile) {
          empresaForm.reset({
            name: tenantProfile.name,
            cnpj: tenantProfile.cnpj || "",
            phone: tenantProfile.phone || "",
            responsibleTechName: tenantProfile.responsibleTech?.name || "",
            responsibleTechWhatsapp: tenantProfile.responsibleTech?.whatsapp || "",
            responsibleTechEmail: tenantProfile.responsibleTech?.email || "",
            responsibleFinanceName: tenantProfile.responsibleFinance?.name || "",
            responsibleFinanceWhatsapp: tenantProfile.responsibleFinance?.whatsapp || "",
            responsibleFinanceEmail: tenantProfile.responsibleFinance?.email || "",
          })
        }
      } catch (error) {
        console.error("Erro ao carregar empresa:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da empresa.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingTenant(false)
      }
    }

    loadTenant()
  }, [user?.tenantId, fetchTenantProfile, empresaForm, toast])

  // Atalhos de teclado
  useKeyboardShortcuts({
    onNavigate1: () => router.push("/cliente"),
    onNavigate2: () => router.push("/cliente/perfil"),
    onNavigate3: () => router.push("/cliente/perfil"),
  })

  const handleSavePerfil = async (data: PerfilPessoalFormValues) => {
    if (!user?.id) return

    try {
      setIsSavingProfile(true)
      await updateUserProfile(user.id, {
        fullName: data.name,
        whatsappNumber: data.whatsapp,
        avatarUrl: data.avatarUrl || "",
      })

      // Atualizar AuthContext
      await refreshUser()

      toast({
        title: "Perfil atualizado",
        description: "Suas informações pessoais foram salvas com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao salvar perfil:", error)
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Não foi possível atualizar o perfil.",
        variant: "destructive",
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSaveEmpresa = async (data: EmpresaFormValues) => {
    if (!user?.tenantId) return

    try {
      setIsSavingTenant(true)
      await updateTenantProfile(user.tenantId, {
        name: data.name,
        cnpj: data.cnpj,
        phone: data.phone,
        responsibleTech: {
          name: data.responsibleTechName,
          whatsapp: data.responsibleTechWhatsapp,
          email: data.responsibleTechEmail,
        },
        responsibleFinance: {
          name: data.responsibleFinanceName,
          whatsapp: data.responsibleFinanceWhatsapp,
          email: data.responsibleFinanceEmail,
        },
      })

      toast({
        title: "Empresa atualizada",
        description: "As informações da empresa foram salvas com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao salvar empresa:", error)
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Não foi possível atualizar a empresa.",
        variant: "destructive",
      })
    } finally {
      setIsSavingTenant(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  if (!user) {
    return null
  }

  const displayAvatarUrl =
    perfilForm.watch("avatarUrl") ||
    user.avatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`

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
            {isLoadingProfile ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-48" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={displayAvatarUrl} />
                    <AvatarFallback>
                      {user.fullName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
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
                            <Input {...field} disabled={isSavingProfile} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" type="email" value={user.email} disabled />
                    </div>

                    <FormField
                      control={perfilForm.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="+55 11 98765-4321"
                              disabled={isSavingProfile}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={perfilForm.control}
                      name="avatarUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL do Avatar</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://..."
                              disabled={isSavingProfile}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isSavingProfile}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSavingProfile ? "Salvando..." : "Salvar Informações Pessoais"}
                    </Button>
                  </form>
                </Form>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTenant ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-48" />
              </div>
            ) : (
              <Form {...empresaForm}>
                <form onSubmit={empresaForm.handleSubmit(handleSaveEmpresa)} className="space-y-4">
                  <FormField
                    control={empresaForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isSavingTenant} />
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
                            <Input
                              {...field}
                              placeholder="12.345.678/0001-90"
                              disabled={isSavingTenant}
                            />
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
                          <FormLabel>Telefone da Empresa</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="+55 11 98765-4321"
                              disabled={isSavingTenant}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">Responsável Técnico</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={empresaForm.control}
                        name="responsibleTechName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isSavingTenant} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={empresaForm.control}
                        name="responsibleTechWhatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="+55 11 98765-4321"
                                disabled={isSavingTenant}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={empresaForm.control}
                        name="responsibleTechEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} disabled={isSavingTenant} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">Responsável Financeiro</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={empresaForm.control}
                        name="responsibleFinanceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isSavingTenant} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={empresaForm.control}
                        name="responsibleFinanceWhatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="+55 11 98765-4321"
                                disabled={isSavingTenant}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={empresaForm.control}
                        name="responsibleFinanceEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} disabled={isSavingTenant} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plano">Plano Contratado</Label>
                    <Input id="plano" value={user.tenantId ? "Premium" : "N/A"} disabled />
                  </div>

                  <Button type="submit" disabled={isSavingTenant}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSavingTenant ? "Salvando..." : "Salvar Informações da Empresa"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessão</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full sm:w-auto" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

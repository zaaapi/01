"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useData } from "@/lib/contexts/data-provider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"
import { User, FeatureModuleKey } from "@/types"
import { MessageSquare, BookOpen, Palette, BarChart3, Zap, Plug, LucideIcon } from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  MessageSquare,
  BookOpen,
  Palette,
  BarChart3,
  Zap,
  Plug,
}

const usuarioSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  whatsappNumber: z.string().min(10, "WhatsApp inválido"),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof usuarioSchema>

interface UsuarioSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario?: User | null
  mode: "view" | "edit" | "add"
  tenantId: string
  onSave: (data: FormValues & { modules: FeatureModuleKey[] }) => void
}

export function UsuarioSheet({
  open,
  onOpenChange,
  usuario,
  mode,
  tenantId,
  onSave,
}: UsuarioSheetProps) {
  const { state } = useData()
  const [modulosAtivos, setModulosAtivos] = useState<FeatureModuleKey[]>(
    usuario?.modules || []
  )

  const isViewMode = mode === "view"
  const isEditMode = mode === "edit"
  const isAddMode = mode === "add"

  const form = useForm<FormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      fullName: usuario?.fullName || "",
      email: usuario?.email || "",
      whatsappNumber: usuario?.whatsappNumber || "",
      isActive: usuario?.isActive ?? true,
    },
  })

  useEffect(() => {
    if (usuario) {
      form.reset({
        fullName: usuario.fullName,
        email: usuario.email,
        whatsappNumber: usuario.whatsappNumber,
        isActive: usuario.isActive,
      })
      setModulosAtivos(usuario.modules)
    } else {
      form.reset({
        fullName: "",
        email: "",
        whatsappNumber: "",
        isActive: true,
      })
      setModulosAtivos([])
    }
  }, [usuario, form])

  const handleToggleModulo = (moduloKey: FeatureModuleKey, isActive: boolean) => {
    if (isViewMode) return
    
    if (isActive) {
      setModulosAtivos([...modulosAtivos, moduloKey])
    } else {
      setModulosAtivos(modulosAtivos.filter((key) => key !== moduloKey))
    }
  }

  const onSubmit = (data: FormValues) => {
    onSave({
      ...data,
      modules: modulosAtivos,
    })
    form.reset()
    setModulosAtivos([])
    onOpenChange(false)
  }

  const getTitle = () => {
    if (isViewMode) return "Visualizar Usuário"
    if (isEditMode) return "Editar Usuário"
    return "Adicionar Novo Usuário"
  }

  const getDescription = () => {
    if (isViewMode) return "Detalhes do usuário e módulos atribuídos."
    if (isEditMode) return "Atualize as informações do usuário."
    return "Preencha os dados para criar um novo usuário."
  }

  const availableModules = state.featureModules

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] w-full">
        <SheetHeader>
          <SheetTitle>{getTitle()}</SheetTitle>
          <SheetDescription>{getDescription()}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: João Silva"
                        {...field}
                        disabled={isViewMode}
                      />
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
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="joao@empresa.com"
                        {...field}
                        disabled={isViewMode || isEditMode}
                        readOnly={isEditMode}
                      />
                    </FormControl>
                    <FormMessage />
                    {isEditMode && (
                      <p className="text-xs text-muted-foreground">
                        O email não pode ser alterado após a criação do usuário.
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de WhatsApp</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+55 11 98765-4321"
                        {...field}
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status</FormLabel>
                      <FormDescription>
                        {field.value ? "Usuário ativo" : "Usuário inativo"}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isViewMode}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Módulos de Acesso</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isViewMode
                      ? "Módulos atribuídos ao usuário"
                      : "Selecione os módulos que o usuário terá acesso"}
                  </p>
                </div>

                <div className="grid gap-3">
                  {availableModules.map((modulo) => {
                    const Icon = ICON_MAP[modulo.icon] || MessageSquare
                    return (
                      <div key={modulo.key} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`rounded-lg p-2 ${modulosAtivos.includes(modulo.key) ? "bg-primary/10" : "bg-muted"}`}>
                              <Icon className={`h-5 w-5 ${modulosAtivos.includes(modulo.key) ? "text-primary" : "text-muted-foreground"}`} />
                            </div>
                            <div>
                              <Label className="text-base font-semibold">{modulo.name}</Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                {modulo.description}
                              </p>
                            </div>
                          </div>
                          {!isViewMode && (
                            <Switch
                              checked={modulosAtivos.includes(modulo.key)}
                              onCheckedChange={(checked) => handleToggleModulo(modulo.key, checked)}
                            />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </form>
          </Form>
        </ScrollArea>

        {!isViewMode && (
          <SheetFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset()
                setModulosAtivos([])
                onOpenChange(false)
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
              Salvar Alterações
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

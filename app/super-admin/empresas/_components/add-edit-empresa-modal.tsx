"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tenant, ResponsibleContact } from "@/types"
import { useData } from "@/lib/contexts/data-provider"

const empresaSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  neurocoreId: z.string().min(1, "Selecione um NeuroCore"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  plan: z.string().min(1, "Selecione um plano"),
  responsibleTechName: z.string().min(1, "Nome do responsável técnico é obrigatório"),
  responsibleTechWhatsapp: z.string().min(10, "WhatsApp inválido"),
  responsibleTechEmail: z.string().email("Email inválido"),
  responsibleFinanceName: z.string().min(1, "Nome do responsável financeiro é obrigatório"),
  responsibleFinanceWhatsapp: z.string().min(10, "WhatsApp inválido"),
  responsibleFinanceEmail: z.string().email("Email inválido"),
  masterIntegrationUrl: z.string().optional(),
  masterIntegrationActive: z.boolean().default(false),
})

type FormValues = z.infer<typeof empresaSchema>

interface AddEditEmpresaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  empresa?: Tenant | null
  onSave: (data: {
    name: string
    neurocoreId: string
    cnpj: string
    phone: string
    plan: string
    responsibleTech: ResponsibleContact
    responsibleFinance: ResponsibleContact
    masterIntegrationUrl?: string
    masterIntegrationActive: boolean
  }) => void
}

export function AddEditEmpresaModal({
  open,
  onOpenChange,
  empresa,
  onSave,
}: AddEditEmpresaModalProps) {
  const { state } = useData()
  const isEditMode = !!empresa

  const form = useForm<z.infer<typeof empresaSchema>>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      name: "",
      neurocoreId: "",
      cnpj: "",
      phone: "",
      plan: "",
      responsibleTechName: "",
      responsibleTechWhatsapp: "",
      responsibleTechEmail: "",
      responsibleFinanceName: "",
      responsibleFinanceWhatsapp: "",
      responsibleFinanceEmail: "",
      masterIntegrationUrl: "",
      masterIntegrationActive: false,
    },
  })

  useEffect(() => {
    if (empresa) {
      form.reset({
        name: empresa.name,
        neurocoreId: empresa.neurocoreId,
        cnpj: empresa.cnpj,
        phone: empresa.phone,
        plan: empresa.plan,
        responsibleTechName: empresa.responsibleTech?.name || "",
        responsibleTechWhatsapp: empresa.responsibleTech?.whatsapp || "",
        responsibleTechEmail: empresa.responsibleTech?.email || "",
        responsibleFinanceName: empresa.responsibleFinance?.name || "",
        responsibleFinanceWhatsapp: empresa.responsibleFinance?.whatsapp || "",
        responsibleFinanceEmail: empresa.responsibleFinance?.email || "",
        masterIntegrationUrl: (empresa as any).masterIntegrationUrl || "",
        masterIntegrationActive: (empresa as any).masterIntegrationActive ?? false,
      })
    } else {
      form.reset({
        name: "",
        neurocoreId: "",
        cnpj: "",
        phone: "",
        plan: "",
        responsibleTechName: "",
        responsibleTechWhatsapp: "",
        responsibleTechEmail: "",
        responsibleFinanceName: "",
        responsibleFinanceWhatsapp: "",
        responsibleFinanceEmail: "",
        masterIntegrationUrl: "",
        masterIntegrationActive: false,
      })
    }
  }, [empresa, form])

  const onSubmit = (data: z.infer<typeof empresaSchema>) => {
    onSave({
      name: data.name,
      neurocoreId: data.neurocoreId,
      cnpj: data.cnpj,
      phone: data.phone,
      plan: data.plan,
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
      masterIntegrationUrl: data.masterIntegrationUrl || undefined,
      masterIntegrationActive: data.masterIntegrationActive,
    })
    form.reset()
    onOpenChange(false)
  }

  const neurocores = state.neurocores.filter((nc) => nc.isActive)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Empresa" : "Adicionar Nova Empresa"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Atualize as informações da empresa."
              : "Preencha os dados para criar uma nova empresa."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Loja Tech Store" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="neurocoreId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NeuroCore Associado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um NeuroCore" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {neurocores.map((neurocore) => (
                          <SelectItem key={neurocore.id} value={neurocore.id}>
                            {neurocore.name} ({neurocore.niche})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000/0001-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="+55 11 98765-4321" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plano</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um plano" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Starter">Starter</SelectItem>
                        <SelectItem value="Basic">Basic</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Responsável Técnico</h3>
                <FormField
                  control={form.control}
                  name="responsibleTechName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="responsibleTechWhatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="+55 11 98765-4321" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="responsibleTechEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Responsável Financeiro</h3>
                <FormField
                  control={form.control}
                  name="responsibleFinanceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="responsibleFinanceWhatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="+55 11 98765-4321" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="responsibleFinanceEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Integração Master</h3>
                <FormField
                  control={form.control}
                  name="masterIntegrationUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de Integração</FormLabel>
                      <FormControl>
                        <Input placeholder="https://api.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="masterIntegrationActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Integração Ativa</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Ativar integração master para esta empresa
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset()
              onOpenChange(false)
            }}
          >
            Cancelar
          </Button>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
            {isEditMode ? "Salvar Alterações" : "Adicionar Empresa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

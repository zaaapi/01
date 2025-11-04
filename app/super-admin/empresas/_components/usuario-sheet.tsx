"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Usuario, MODULOS_DISPONIVEIS } from "./mock-data";
import { ModuloCard } from "./modulo-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";

const usuarioSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  whatsapp: z.string().min(10, "WhatsApp inválido"),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof usuarioSchema>;

interface UsuarioSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario?: Usuario | null;
  mode: "view" | "edit" | "add";
  onSave: (data: FormValues & { modulosAtribuidos: string[] }) => void;
}

export function UsuarioSheet({
  open,
  onOpenChange,
  usuario,
  mode,
  onSave,
}: UsuarioSheetProps) {
  const [modulosAtivos, setModulosAtivos] = useState<string[]>(
    usuario?.modulosAtribuidos || []
  );

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isAddMode = mode === "add";

  const form = useForm<FormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nome: usuario?.nome || "",
      email: usuario?.email || "",
      whatsapp: usuario?.whatsapp || "",
      isActive: usuario?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (usuario) {
      form.reset({
        nome: usuario.nome,
        email: usuario.email,
        whatsapp: usuario.whatsapp,
        isActive: usuario.isActive,
      });
      setModulosAtivos(usuario.modulosAtribuidos);
    } else {
      form.reset({
        nome: "",
        email: "",
        whatsapp: "",
        isActive: true,
      });
      setModulosAtivos([]);
    }
  }, [usuario, form]);

  const handleToggleModulo = (moduloId: string, isActive: boolean) => {
    if (isViewMode) return;
    
    if (isActive) {
      setModulosAtivos([...modulosAtivos, moduloId]);
    } else {
      setModulosAtivos(modulosAtivos.filter((id) => id !== moduloId));
    }
  };

  const onSubmit = (data: FormValues) => {
    onSave({
      ...data,
      modulosAtribuidos: modulosAtivos,
    });
    form.reset();
    setModulosAtivos([]);
    onOpenChange(false);
  };

  const getTitle = () => {
    if (isViewMode) return "Visualizar Usuário";
    if (isEditMode) return "Editar Usuário";
    return "Adicionar Novo Usuário";
  };

  const getDescription = () => {
    if (isViewMode) return "Detalhes do usuário e módulos atribuídos.";
    if (isEditMode) return "Atualize as informações do usuário.";
    return "Preencha os dados para criar um novo usuário.";
  };

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
                name="nome"
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
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp"
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
                  {MODULOS_DISPONIVEIS.map((modulo) => (
                    <ModuloCard
                      key={modulo.id}
                      id={modulo.id}
                      nome={modulo.nome}
                      descricao={modulo.descricao}
                      icon={modulo.icon}
                      isActive={modulosAtivos.includes(modulo.id)}
                      onToggle={handleToggleModulo}
                    />
                  ))}
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
                form.reset();
                setModulosAtivos([]);
                onOpenChange(false);
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
  );
}


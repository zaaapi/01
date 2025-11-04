"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Empresa } from "./mock-data";

const empresaSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  neurocore: z.string().min(1, "Selecione um NeuroCore"),
});

type FormValues = z.infer<typeof empresaSchema>;

interface AddEditEmpresaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa?: Empresa | null;
  onSave: (data: FormValues) => void;
}

const NEUROCORES = [
  "NeuroCore Varejo",
  "NeuroCore Saúde",
  "NeuroCore Serviços",
  "NeuroCore Educação",
  "NeuroCore Financeiro",
];

export function AddEditEmpresaModal({
  open,
  onOpenChange,
  empresa,
  onSave,
}: AddEditEmpresaModalProps) {
  const isEditMode = !!empresa;

  const form = useForm<FormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      name: empresa?.name || "",
      neurocore: empresa?.neurocore || "",
    },
  });

  const onSubmit = (data: FormValues) => {
    onSave(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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
              name="neurocore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NeuroCore Associado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um NeuroCore" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {NEUROCORES.map((neurocore) => (
                        <SelectItem key={neurocore} value={neurocore}>
                          {neurocore}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {isEditMode ? "Salvar Alterações" : "Adicionar Empresa"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


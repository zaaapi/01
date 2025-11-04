"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { Usuario, mockUsuarios, MODULOS_DISPONIVEIS } from "./mock-data";
import { UsuarioSheet } from "./usuario-sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GerenciarUsuariosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresaId: string;
  empresaNome: string;
}

export function GerenciarUsuariosModal({
  open,
  onOpenChange,
  empresaId,
  empresaNome,
}: GerenciarUsuariosModalProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(
    mockUsuarios.filter((u) => u.empresaId === empresaId)
  );

  const [sheetState, setSheetState] = useState<{
    open: boolean;
    mode: "view" | "edit" | "add";
    usuario: Usuario | null;
  }>({
    open: false,
    mode: "view",
    usuario: null,
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    usuario: Usuario | null;
  }>({
    open: false,
    usuario: null,
  });

  const handleOpenSheet = (
    mode: "view" | "edit" | "add",
    usuario: Usuario | null = null
  ) => {
    setSheetState({ open: true, mode, usuario });
  };

  const handleSaveUsuario = (
    data: {
      nome: string;
      email: string;
      whatsapp: string;
      isActive: boolean;
      modulosAtribuidos: string[];
    }
  ) => {
    if (sheetState.mode === "add") {
      const newUsuario: Usuario = {
        id: `user-${Date.now()}`,
        empresaId,
        ...data,
      };
      setUsuarios([...usuarios, newUsuario]);
    } else if (sheetState.mode === "edit" && sheetState.usuario) {
      setUsuarios(
        usuarios.map((u) =>
          u.id === sheetState.usuario?.id ? { ...u, ...data } : u
        )
      );
    }
  };

  const handleDeleteUsuario = () => {
    if (deleteDialog.usuario) {
      setUsuarios(usuarios.filter((u) => u.id !== deleteDialog.usuario?.id));
      setDeleteDialog({ open: false, usuario: null });
    }
  };

  const getModuloNome = (moduloId: string) => {
    const modulo = MODULOS_DISPONIVEIS.find((m) => m.id === moduloId);
    return modulo?.nome || moduloId;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Gerenciar Usuários - {empresaNome}</DialogTitle>
            <DialogDescription>
              Gerencie os usuários e suas permissões de acesso.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {usuarios.length} usuário{usuarios.length !== 1 ? "s" : ""} cadastrado
                {usuarios.length !== 1 ? "s" : ""}
              </p>
              <Button onClick={() => handleOpenSheet("add")}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Novo Usuário
              </Button>
            </div>

            <ScrollArea className="h-[400px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Módulos Atribuídos</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <p className="text-muted-foreground">
                          Nenhum usuário cadastrado nesta empresa.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    usuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell className="font-medium">{usuario.nome}</TableCell>
                        <TableCell>{usuario.email}</TableCell>
                        <TableCell>{usuario.whatsapp}</TableCell>
                        <TableCell>
                          {usuario.isActive ? (
                            <Badge variant="default">Ativo</Badge>
                          ) : (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {usuario.modulosAtribuidos.slice(0, 2).map((moduloId) => (
                              <Badge key={moduloId} variant="outline" className="text-xs">
                                {getModuloNome(moduloId)}
                              </Badge>
                            ))}
                            {usuario.modulosAtribuidos.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{usuario.modulosAtribuidos.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenSheet("view", usuario)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenSheet("edit", usuario)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setDeleteDialog({ open: true, usuario })
                              }
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <UsuarioSheet
        open={sheetState.open}
        onOpenChange={(open) =>
          setSheetState({ ...sheetState, open })
        }
        usuario={sheetState.usuario}
        mode={sheetState.mode}
        onSave={handleSaveUsuario}
      />

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário{" "}
              <strong>{deleteDialog.usuario?.nome}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUsuario}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


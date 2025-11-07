"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Pencil, Trash2, Plus, User } from "lucide-react"
import { useData } from "@/lib/contexts/data-provider"
import { useToast } from "@/hooks/use-toast"
import { User as UserType, UserRole, FeatureModuleKey } from "@/types"
import { UsuarioSheet } from "./usuario-sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EmptyState } from "@/components/shared/empty-state"
import { Skeleton } from "@/components/ui/skeleton"

interface GerenciarUsuariosModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  empresaId: string
  empresaNome: string
}

export function GerenciarUsuariosModal({
  open,
  onOpenChange,
  empresaId,
  empresaNome,
}: GerenciarUsuariosModalProps) {
  const { state, createUser, updateUser, deleteUser, fetchUsersByTenant } = useData()
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState<UserType[]>([])
  const [isLoadingUsuarios, setIsLoadingUsuarios] = useState(true)

  // Buscar usuários do tenant quando o modal abrir
  useEffect(() => {
    if (open && empresaId) {
      const loadUsuarios = async () => {
        setIsLoadingUsuarios(true)
        try {
          const fetchedUsers = await fetchUsersByTenant(empresaId)
          setUsuarios(fetchedUsers)
        } catch {
          console.error("Erro ao carregar usuários:", error)
          toast({
            title: "Erro",
            description: "Não foi possível carregar os usuários.",
            variant: "destructive",
          })
        } finally {
          setIsLoadingUsuarios(false)
        }
      }
      loadUsuarios()
    }
  }, [open, empresaId, fetchUsersByTenant, toast])

  const [sheetState, setSheetState] = useState<{
    open: boolean
    mode: "view" | "edit" | "add"
    usuario: UserType | null
  }>({
    open: false,
    mode: "view",
    usuario: null,
  })

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    usuario: UserType | null
  }>({
    open: false,
    usuario: null,
  })

  const handleOpenSheet = (mode: "view" | "edit" | "add", usuario: UserType | null = null) => {
    setSheetState({ open: true, mode, usuario })
  }

  const handleSaveUsuario = async (data: {
    fullName: string
    email: string
    whatsappNumber: string
    isActive: boolean
    modules: FeatureModuleKey[]
  }) => {
    try {
      if (sheetState.mode === "add") {
        await createUser({
          tenantId: empresaId,
          fullName: data.fullName,
          email: data.email,
          whatsappNumber: data.whatsappNumber,
          role: UserRole.USUARIO_CLIENTE,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.fullName}`,
          modules: data.modules,
          isActive: data.isActive,
          lastSignInAt: null,
        })
        toast({
          title: "Usuário criado",
          description: "O usuário foi criado com sucesso.",
        })

        // Recarregar usuários após criar
        const fetchedUsers = await fetchUsersByTenant(empresaId)
        setUsuarios(fetchedUsers)
      } else if (sheetState.mode === "edit" && sheetState.usuario) {
        await updateUser(sheetState.usuario.id, {
          fullName: data.fullName,
          email: data.email,
          whatsappNumber: data.whatsappNumber,
          modules: data.modules,
          isActive: data.isActive,
        })
        toast({
          title: "Usuário atualizado",
          description: "O usuário foi atualizado com sucesso.",
        })

        // Recarregar usuários após atualizar
        const fetchedUsers = await fetchUsersByTenant(empresaId)
        setUsuarios(fetchedUsers)
      }
      setSheetState({ open: false, mode: "view", usuario: null })
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o usuário.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUsuario = async () => {
    if (deleteDialog.usuario) {
      try {
        await deleteUser(deleteDialog.usuario.id)
        toast({
          title: "Usuário excluído",
          description: "O usuário foi excluído com sucesso.",
        })
        setDeleteDialog({ open: false, usuario: null })

        // Recarregar usuários após excluir
        const fetchedUsers = await fetchUsersByTenant(empresaId)
        setUsuarios(fetchedUsers)
      } catch {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o usuário.",
          variant: "destructive",
        })
      }
    }
  }

  const getModuloNome = (moduloKey: string) => {
    const modulo = state.featureModules.find((m) => m.key === moduloKey)
    return modulo?.name || moduloKey
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Gerenciar Usuários - {empresaNome}</DialogTitle>
            <DialogDescription>Gerencie os usuários e suas permissões de acesso.</DialogDescription>
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

            {isLoadingUsuarios ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : usuarios.length === 0 ? (
              <EmptyState
                icon={User}
                title="Nenhum usuário cadastrado"
                description="Adicione usuários para esta empresa"
                actionLabel="Adicionar Usuário"
                onAction={() => handleOpenSheet("add")}
              />
            ) : (
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
                    {usuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell className="font-medium">{usuario.fullName}</TableCell>
                        <TableCell>{usuario.email}</TableCell>
                        <TableCell>{usuario.whatsappNumber}</TableCell>
                        <TableCell>
                          {usuario.isActive ? (
                            <Badge variant="default">Ativo</Badge>
                          ) : (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {usuario.modules.slice(0, 2).map((moduloKey) => (
                              <Badge key={moduloKey} variant="outline" className="text-xs">
                                {getModuloNome(moduloKey)}
                              </Badge>
                            ))}
                            {usuario.modules.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{usuario.modules.length - 2}
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
                              onClick={() => setDeleteDialog({ open: true, usuario })}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <UsuarioSheet
        open={sheetState.open}
        onOpenChange={(open) => setSheetState({ ...sheetState, open })}
        usuario={sheetState.usuario}
        mode={sheetState.mode}
        tenantId={empresaId}
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
              <strong>{deleteDialog.usuario?.fullName}</strong>? Esta ação não pode ser desfeita.
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
  )
}

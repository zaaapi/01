"use client"

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2, Check, X } from "lucide-react"
import { useData } from "@/lib/contexts/data-provider"
import { useToast } from "@/hooks/use-toast"
import { BaseConhecimento, Synapse, SynapseStatus } from "@/types"
import { EmptyState } from "@/components/shared/empty-state"
import { Sparkles } from "lucide-react"
import { AddEditSynapseModal } from "./add-edit-synapse-modal"
import { PublicarSynapseModal } from "./publicar-synapse-modal"
import { DeleteSynapseModal } from "./delete-synapse-modal"

interface GerenciarSynapsesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  base: BaseConhecimento | null
}

export function GerenciarSynapsesModal({
  open,
  onOpenChange,
  base,
}: GerenciarSynapsesModalProps) {
  const { state, createSynapse, updateSynapse, deleteSynapse } = useData()
  const { toast } = useToast()

  const [addEditModal, setAddEditModal] = useState<{
    open: boolean
    synapse: Synapse | null
  }>({
    open: false,
    synapse: null,
  })

  const [publicarModal, setPublicarModal] = useState<{
    open: boolean
    synapse: Synapse | null
  }>({
    open: false,
    synapse: null,
  })

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    synapse: Synapse | null
  }>({
    open: false,
    synapse: null,
  })

  const baseSynapses = useMemo(() => {
    if (!base) return []
    return state.synapses
      .filter((s) => s.baseConhecimentoId === base.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [state.synapses, base])

  const handleSaveSynapse = async (data: {
    title: string
    description: string
    imageUrl: string | null
  }) => {
    if (!base) return

    try {
      if (addEditModal.synapse) {
        await updateSynapse(addEditModal.synapse.id, {
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl,
        })
        toast({
          title: "Synapse atualizada",
          description: "A synapse foi atualizada com sucesso.",
        })
      } else {
        await createSynapse({
          baseConhecimentoId: base.id,
          tenantId: base.tenantId,
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl,
          status: SynapseStatus.RASCUNHO,
        })
        toast({
          title: "Synapse criada",
          description: "A synapse foi criada com sucesso.",
        })
      }
      setAddEditModal({ open: false, synapse: null })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a synapse.",
        variant: "destructive",
      })
    }
  }

  const handlePublicarSynapse = (synapse: Synapse) => {
    setPublicarModal({ open: true, synapse })
  }

  const handleConfirmPublicar = async () => {
    if (publicarModal.synapse) {
      try {
        await updateSynapse(publicarModal.synapse.id, {
          status: SynapseStatus.PUBLICANDO,
        })
        toast({
          title: "Synapse publicada",
          description: "A synapse está sendo publicada.",
        })
        setPublicarModal({ open: false, synapse: null })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível publicar a synapse.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteSynapse = (synapse: Synapse) => {
    setDeleteModal({ open: true, synapse })
  }

  const handleConfirmDelete = async () => {
    if (deleteModal.synapse) {
      try {
        await deleteSynapse(deleteModal.synapse.id)
        toast({
          title: "Synapse excluída",
          description: "A synapse foi excluída com sucesso.",
        })
        setDeleteModal({ open: false, synapse: null })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir a synapse.",
          variant: "destructive",
        })
      }
    }
  }

  if (!base) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Gerenciar Synapses - {base.name}</DialogTitle>
            <DialogDescription>
              Gerencie as synapses desta base de conhecimento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {baseSynapses.length} synapse{baseSynapses.length !== 1 ? "s" : ""} cadastrada
                {baseSynapses.length !== 1 ? "s" : ""}
              </p>
              <Button onClick={() => setAddEditModal({ open: true, synapse: null })}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Synapse
              </Button>
            </div>

            <ScrollArea className="h-[500px] rounded-md border">
              {baseSynapses.length === 0 ? (
                <div className="flex items-center justify-center h-full p-8">
                  <EmptyState
                    icon={Sparkles}
                    title="Nenhuma synapse cadastrada"
                    description="Crie sua primeira synapse para esta base"
                    actionLabel="Nova Synapse"
                    onAction={() => setAddEditModal({ open: true, synapse: null })}
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {baseSynapses.map((synapse) => (
                      <TableRow key={synapse.id}>
                        <TableCell className="font-medium">{synapse.title}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {synapse.description}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              synapse.status === SynapseStatus.PUBLICANDO
                                ? "default"
                                : synapse.status === SynapseStatus.INDEXANDO
                                ? "secondary"
                                : synapse.status === SynapseStatus.ERROR
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {synapse.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {synapse.status === SynapseStatus.RASCUNHO && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePublicarSynapse(synapse)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Publicar
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAddEditModal({ open: true, synapse })}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSynapse(synapse)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modais de Synapse */}
      <AddEditSynapseModal
        open={addEditModal.open}
        onOpenChange={(open) => setAddEditModal({ ...addEditModal, open })}
        synapse={addEditModal.synapse}
        onSave={handleSaveSynapse}
      />

      <PublicarSynapseModal
        open={publicarModal.open}
        onOpenChange={(open) => setPublicarModal({ ...publicarModal, open })}
        synapseNome={publicarModal.synapse?.title || ""}
        onConfirm={handleConfirmPublicar}
      />

      <DeleteSynapseModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
        synapseNome={deleteModal.synapse?.title || ""}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}


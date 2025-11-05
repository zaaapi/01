"use client"

import { useState, useRef, useEffect } from "react"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { Send, Book, Sparkles, Pencil, Check, Trash2 } from "lucide-react"
import Link from "next/link"
import { useData } from "@/lib/contexts/data-provider"
import { useAuth } from "@/lib/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useRouter } from "next/navigation"
import { Synapse, SynapseStatus } from "@/types"
import { motion, AnimatePresence } from "framer-motion"
import { EditSynapseModal } from "./_components/edit-synapse-modal"
import { PublicarSynapseModal } from "../base-conhecimento/_components/publicar-synapse-modal"
import { DeleteSynapseModal } from "../base-conhecimento/_components/delete-synapse-modal"

interface ChatMessage {
  id: string
  type: "user" | "ia"
  message: string
  synapses?: Array<{ id: string; title: string; status: SynapseStatus }>
  timestamp: string
}

export default function TreinamentoPage() {
  const router = useRouter()
  const { state, isLoading, updateSynapse, deleteSynapse } = useData()
  const { user } = useAuth()
  const { toast } = useToast()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const tenantId = user?.tenantId

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const [editSynapseModal, setEditSynapseModal] = useState<{
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

  // Atalhos de teclado
  useKeyboardShortcuts({
    onNavigate1: () => router.push("/cliente"),
    onNavigate2: () => router.push("/cliente/base-conhecimento"),
    onNavigate3: () => router.push("/cliente/perfil"),
  })

  // Buscar synapses do tenant
  const tenantSynapses = state.synapses.filter((s) => s.tenantId === tenantId)

  // Scroll para última mensagem
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Simular resposta da IA
  const simulateAIResponse = async (userMessage: string): Promise<ChatMessage> => {
    setIsProcessing(true)

    // Simular delay de processamento
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

    // Buscar synapses relevantes (simulação)
    const relevantSynapses = tenantSynapses
      .filter((s) => s.status === SynapseStatus.PUBLICANDO)
      .slice(0, Math.floor(Math.random() * 3) + 1)
      .map((s) => ({
        id: s.id,
        title: s.title,
        status: s.status,
      }))

    // Gerar resposta simulada
    const responses = [
      "Esta é uma resposta simulada da IA. Em produção, isso seria processado pelo NeuroCore.",
      "Com base nas informações disponíveis, posso ajudar você com isso.",
      "Deixe-me consultar a base de conhecimento para fornecer a melhor resposta.",
      "Encontrei informações relevantes. Aqui está o que preciso compartilhar:",
    ]

    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    setIsProcessing(false)

    return {
      id: `msg-${Date.now()}`,
      type: "ia",
      message: randomResponse,
      synapses: relevantSynapses,
      timestamp: new Date().toISOString(),
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isProcessing) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: "user",
      message: inputValue,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    const aiResponse = await simulateAIResponse(inputValue)
    setMessages((prev) => [...prev, aiResponse])
  }

  const handleEditSynapse = (synapseId: string) => {
    const synapse = state.synapses.find((s) => s.id === synapseId)
    if (synapse) {
      setEditSynapseModal({ open: true, synapse })
    }
  }

  const handleSaveSynapse = async (data: {
    title: string
    description: string
    imageUrl: string | null
  }) => {
    if (!editSynapseModal.synapse) return

    try {
      await updateSynapse(editSynapseModal.synapse.id, {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
      })
      toast({
        title: "Synapse atualizada",
        description: "A synapse foi atualizada com sucesso.",
      })
      setEditSynapseModal({ open: false, synapse: null })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a synapse.",
        variant: "destructive",
      })
    }
  }

  const handlePublicarSynapse = (synapseId: string) => {
    const synapse = state.synapses.find((s) => s.id === synapseId)
    if (synapse) {
      setPublicarModal({ open: true, synapse })
    }
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

  const handleDeleteSynapse = (synapseId: string) => {
    const synapse = state.synapses.find((s) => s.id === synapseId)
    if (synapse) {
      setDeleteModal({ open: true, synapse })
    }
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

  if (!tenantId) {
    return (
      <PageContainer>
        <PageHeader title="Treinamento do NeuroCore" description="Teste e treine seu NeuroCore com perguntas" />
        <EmptyState
          icon={Book}
          title="Usuário não associado a um tenant"
          description="Entre em contato com o administrador"
        />
      </PageContainer>
    )
  }

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Treinamento do NeuroCore" description="Teste e treine seu NeuroCore com perguntas" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Treinamento do NeuroCore"
        description="Teste e treine seu NeuroCore com perguntas"
      >
        <Link href="/cliente/base-conhecimento">
          <Button variant="outline">
            <Book className="mr-2 h-4 w-4" />
            Base de Conhecimento
          </Button>
        </Link>
      </PageHeader>

      <Card className="h-[calc(100vh-300px)] flex flex-col">
        <CardHeader>
          <CardTitle className="text-base">Chat de Treinamento</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          {/* Mensagens */}
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="space-y-4 pr-4">
              {messages.length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  title="Nenhuma conversa iniciada"
                  description="Faça uma pergunta para começar a treinar o NeuroCore"
                />
              ) : (
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div
                        className={`flex ${
                          msg.type === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.type === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>

                      {/* Synapses usadas */}
                      {msg.type === "ia" && msg.synapses && msg.synapses.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="mt-2 ml-2 space-y-2"
                        >
                          <p className="text-xs text-muted-foreground">Synapses utilizadas:</p>
                          <div className="flex gap-2 flex-wrap">
                            {msg.synapses.map((synapse) => {
                              const fullSynapse = state.synapses.find((s) => s.id === synapse.id)
                              if (!fullSynapse) return null

                              return (
                                <div key={synapse.id} className="flex items-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => handleEditSynapse(synapse.id)}
                                  >
                                    <Book className="mr-1 h-3 w-3" />
                                    {synapse.title}
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
                                      className="ml-2 text-[10px] px-1"
                                    >
                                      {synapse.status}
                                    </Badge>
                                  </Button>
                                  {synapse.status === SynapseStatus.RASCUNHO && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => handlePublicarSynapse(synapse.id)}
                                      >
                                        <Check className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-destructive"
                                        onClick={() => handleDeleteSynapse(synapse.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                      <span className="text-xs text-muted-foreground">Processando...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Digite sua pergunta para testar o NeuroCore..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              disabled={isProcessing}
            />
            <Button onClick={handleSend} disabled={isProcessing || !inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modais */}
      <EditSynapseModal
        open={editSynapseModal.open}
        onOpenChange={(open) => setEditSynapseModal({ ...editSynapseModal, open })}
        synapse={editSynapseModal.synapse}
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
    </PageContainer>
  )
}

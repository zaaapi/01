"use client"

import { useState } from "react"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Book } from "lucide-react"
import Link from "next/link"

const mockChat = [
  {
    type: "user" as const,
    message: "Quais notebooks você tem disponível?",
  },
  {
    type: "ia" as const,
    message: "Temos várias opções de notebooks! O Dell Inspiron 15 com Intel i7, 16GB RAM e SSD 512GB por R$ 3.500,00, e o Lenovo ThinkPad por R$ 4.200,00.",
    synapses: [
      { id: "syn-1", title: "Notebooks Dell", status: "PUBLICANDO" },
    ],
  },
]

export default function TreinamentoPage() {
  const [messages, setMessages] = useState(mockChat)
  const [inputValue, setInputValue] = useState("")

  const handleSend = () => {
    if (!inputValue.trim()) return

    setMessages([
      ...messages,
      { type: "user", message: inputValue },
      {
        type: "ia",
        message: "Esta é uma resposta simulada da IA. Em produção, isso seria processado pelo NeuroCore.",
        synapses: [],
      },
    ])
    setInputValue("")
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
          <div className="flex-1 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx}>
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
                  <div className="mt-2 ml-2 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Synapses utilizadas:
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {msg.synapses.map((synapse) => (
                        <Button
                          key={synapse.id}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          <Book className="mr-1 h-3 w-3" />
                          {synapse.title}
                          <Badge
                            variant="secondary"
                            className="ml-2 text-[10px] px-1"
                          >
                            {synapse.status}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Digite sua pergunta para testar o NeuroCore..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}


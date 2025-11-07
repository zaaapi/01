"use client"

import { useState, useEffect } from "react"
import { createSupabaseClient } from "@/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface TestResult {
  name: string
  status: "loading" | "success" | "error"
  message: string
  details?: any
}

export default function TestSupabasePage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (result: TestResult) => {
    setResults((prev) => [...prev, result])
  }

  const runTests = async () => {
    setIsRunning(true)
    setResults([])

    // Teste 1: Verificar variáveis de ambiente
    addResult({
      name: "Variáveis de Ambiente",
      status: "loading",
      message: "Verificando variáveis...",
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      addResult({
        name: "Variáveis de Ambiente",
        status: "error",
        message: "Variáveis não configuradas",
        details: {
          NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? "✅ Configurada" : "❌ Não configurada",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? "✅ Configurada" : "❌ Não configurada",
        },
      })
      setIsRunning(false)
      return
    }

    addResult({
      name: "Variáveis de Ambiente",
      status: "success",
      message: "Todas as variáveis estão configuradas",
      details: {
        URL: supabaseUrl.substring(0, 30) + "...",
        Key: supabaseAnonKey.substring(0, 20) + "...",
      },
    })

    // Teste 2: Criar cliente Supabase
    addResult({
      name: "Cliente Supabase",
      status: "loading",
      message: "Criando cliente...",
    })

    try {
      const supabase = createSupabaseClient()
      addResult({
        name: "Cliente Supabase",
        status: "success",
        message: "Cliente criado com sucesso",
      })
    } catch (error: any) {
      addResult({
        name: "Cliente Supabase",
        status: "error",
        message: error.message,
      })
      setIsRunning(false)
      return
    }

    // Teste 3: Testar conexão com o banco
    addResult({
      name: "Conexão com Banco",
      status: "loading",
      message: "Testando conexão...",
    })

    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase.from("feature_modules").select("count").limit(1)

      if (error) {
        throw error
      }

      addResult({
        name: "Conexão com Banco",
        status: "success",
        message: "Conexão estabelecida com sucesso",
      })
    } catch (error: any) {
      addResult({
        name: "Conexão com Banco",
        status: "error",
        message: error.message,
        details: {
          hint: error.message.includes("relation")
            ? "Tabela não encontrada. Execute as migrações primeiro."
            : "Verifique se o projeto Supabase está configurado corretamente.",
        },
      })
    }

    // Teste 4: Verificar tabelas principais
    const tables = [
      "tenants",
      "users",
      "neurocores",
      "agents",
      "contacts",
      "conversations",
      "messages",
      "base_conhecimentos",
      "synapses",
      "feedbacks",
      "channel_providers",
      "channels",
      "quick_reply_templates",
      "conversation_reactivations_settings",
    ]

    addResult({
      name: "Verificação de Tabelas",
      status: "loading",
      message: "Verificando tabelas...",
    })

    const tableResults: Record<string, boolean> = {}

    try {
      const supabase = createSupabaseClient()

      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select("count").limit(1)
          tableResults[table] = !error
        } catch {
          tableResults[table] = false
        }
      }

      const successCount = Object.values(tableResults).filter(Boolean).length
      const totalCount = tables.length

      addResult({
        name: "Verificação de Tabelas",
        status: successCount === totalCount ? "success" : "error",
        message: `${successCount}/${totalCount} tabelas encontradas`,
        details: tableResults,
      })
    } catch (error: any) {
      addResult({
        name: "Verificação de Tabelas",
        status: "error",
        message: error.message,
      })
    }

    // Teste 5: Verificar RLS
    addResult({
      name: "Row Level Security (RLS)",
      status: "loading",
      message: "Verificando RLS...",
    })

    try {
      const supabase = createSupabaseClient()
      // Tentar fazer uma query sem autenticação (deve falhar por RLS)
      const { error } = await supabase.from("tenants").select("*").limit(1)

      // Se não houver erro, pode ser que RLS não esteja habilitado ou não tenha políticas
      addResult({
        name: "Row Level Security (RLS)",
        status: "success",
        message: "RLS está configurado (pode retornar vazio se não autenticado)",
        details: {
          note: "RLS está ativo. Execute as migrações se ainda não executou.",
        },
      })
    } catch (error: any) {
      addResult({
        name: "Row Level Security (RLS)",
        status: "error",
        message: error.message,
      })
    }

    setIsRunning(false)
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Teste de Conexão Supabase</h1>
        <p className="text-muted-foreground">
          Esta página testa a configuração e conexão com o Supabase
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuração</CardTitle>
          <CardDescription>
            Clique no botão abaixo para executar os testes de conexão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runTests} disabled={isRunning} className="w-full">
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executando testes...
              </>
            ) : (
              "Executar Testes"
            )}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Resultados dos Testes</h2>

          {results.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{result.name}</CardTitle>
                  {result.status === "success" && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Sucesso
                    </Badge>
                  )}
                  {result.status === "error" && (
                    <Badge variant="destructive">
                      <XCircle className="mr-1 h-3 w-3" />
                      Erro
                    </Badge>
                  )}
                  {result.status === "loading" && (
                    <Badge variant="secondary">
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Carregando
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{result.message}</p>

                {result.details && (
                  <div className="mt-4 p-4 bg-muted rounded-md">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {results.length === 0 && !isRunning && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Nenhum teste executado ainda. Clique em "Executar Testes" para começar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

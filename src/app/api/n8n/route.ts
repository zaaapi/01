import { NextRequest, NextResponse } from "next/server"
import { sign } from "jsonwebtoken"

/**
 * API Route para proxy seguro ao N8N
 * Mantém a senha JWT no backend, longe do cliente
 */
export async function POST(request: NextRequest) {
  try {
    const { endpoint, data } = await request.json()

    // Validar que as variáveis de ambiente estão configuradas
    if (!process.env.NEXT_PUBLIC_N8N_BASE_URL) {
      return NextResponse.json({ error: "N8N_BASE_URL não configurada" }, { status: 500 })
    }

    if (!process.env.N8N_JWT_SECRET) {
      return NextResponse.json({ error: "N8N_JWT_SECRET não configurada" }, { status: 500 })
    }

    // Gerar token JWT
    const token = sign(
      {
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hora
      },
      process.env.N8N_JWT_SECRET,
      { algorithm: "HS256" }
    )

    // Fazer requisição ao N8N
    const n8nResponse = await fetch(`${process.env.NEXT_PUBLIC_N8N_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error("Erro ao chamar N8N:", errorText)
      return NextResponse.json(
        { error: `N8N Error: ${n8nResponse.status} - ${errorText}` },
        { status: n8nResponse.status }
      )
    }

    const result = await n8nResponse.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Erro na API Route N8N:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    )
  }
}

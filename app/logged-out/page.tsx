"use client"

import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import Link from "next/link"

export default function LoggedOutPage() {
  return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold">Você foi desconectado</h1>
              <p className="text-muted-foreground">
                Você saiu da sua conta com sucesso. Para continuar, faça login novamente.
              </p>
              <Link href="/login">
                <Button className="w-full">
                  <LogIn className="mr-2 h-4 w-4" />
                  Fazer Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}


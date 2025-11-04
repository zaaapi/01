import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 gap-8">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          LIVIA
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Plataforma de Atendimento ao Cliente com Inteligência Artificial
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <Card className="border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">👨‍💼</span>
              Super Admin
            </CardTitle>
            <CardDescription>
              Gestão completa de empresas, NeuroCores e agentes de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="lg">
              Acessar Plataforma Super Admin
            </Button>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 hover:border-secondary/40 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💼</span>
              Cliente
            </CardTitle>
            <CardDescription>
              Gerenciamento de atendimentos e personalização da IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full" size="lg">
              Acessar Plataforma Cliente
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>🚀 Projeto em desenvolvimento - v1.0.0</p>
        <p>Stack: Next.js 14 • TypeScript • Tailwind CSS • Shadcn/ui</p>
      </div>
    </main>
  )
}


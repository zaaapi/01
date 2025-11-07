import { Card, CardContent } from "@/components/ui/card"

export function EmptyTenantState() {
  return (
    <div className="flex h-[calc(100vh-64px)] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Usuário não associado a um tenant. Entre em contato com o administrador.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

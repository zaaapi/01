import { createSupabaseServerClient } from '@/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

async function testServerConnection() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        success: false,
        message: 'Variáveis de ambiente não configuradas',
        details: {
          NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: !!supabaseAnonKey,
        },
      };
    }

    const supabase = createSupabaseServerClient();
    
    // Testar conexão básica
    const { data, error } = await supabase.from('feature_modules').select('count').limit(1);

    if (error) {
      return {
        success: false,
        message: error.message,
        details: {
          hint: error.message.includes('relation') 
            ? 'Tabela não encontrada. Execute as migrações primeiro.' 
            : 'Verifique se o projeto Supabase está configurado corretamente.',
        },
      };
    }

    return {
      success: true,
      message: 'Conexão estabelecida com sucesso',
      details: {
        url: supabaseUrl.substring(0, 30) + '...',
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Erro desconhecido',
    };
  }
}

export default async function TestSupabaseServerPage() {
  const serverTest = await testServerConnection();

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Teste de Conexão Supabase (Server)</h1>
        <p className="text-muted-foreground">
          Este componente testa a conexão usando Server Components
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Teste de Conexão Servidor</CardTitle>
            {serverTest.success ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Sucesso
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="mr-1 h-3 w-3" />
                Erro
              </Badge>
            )}
          </div>
          <CardDescription>
            Teste executado no servidor durante o build/render
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">{serverTest.message}</p>
          
          {serverTest.details && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(serverTest.details, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
            <p className="text-sm font-semibold mb-2">💡 Próximos passos:</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Se as variáveis não estão configuradas, crie um arquivo `.env.local`</li>
              <li>Se as tabelas não foram encontradas, execute as migrações no Supabase</li>
              <li>Verifique o console do servidor para mais detalhes</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <p className="text-sm text-muted-foreground">
          Para testar também no cliente, acesse:{' '}
          <a href="/test-supabase" className="text-primary hover:underline">
            /test-supabase
          </a>
        </p>
      </div>
    </div>
  );
}



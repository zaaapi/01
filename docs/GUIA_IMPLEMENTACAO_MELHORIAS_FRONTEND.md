# Guia de Implementação - Melhorias Frontend-Supabase

Este documento contém exemplos de código para implementar as melhorias propostas no Relatório de Análise.

---

## 1. Corrigir Queries N+1

### Problema

No arquivo `app/super-admin/empresas/page.tsx`, há um loop que executa uma query por tenant:

```typescript
// ❌ PROBLEMA: N+1 queries
for (const tenant of tenants) {
  const tenantUsers = await fetchUsersByTenant(tenant.id);
  allUsers.push(...tenantUsers);
}
```

### Solução

**1. Adicionar função otimizada no `data-provider.tsx`:**

```typescript
// Adicionar ao DataContextType
fetchAllUsers: () => Promise<User[]>;

// Implementar função
const fetchAllUsers = useCallback(async (): Promise<User[]> => {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar usuários:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map((u) => ({
      id: u.id,
      tenantId: u.tenant_id || null,
      fullName: u.full_name || u.email,
      email: u.email,
      whatsappNumber: u.whatsapp_number || "",
      role: u.role as User["role"],
      avatarUrl: u.avatar_url || "",
      modules: (u.modules || []) as User["modules"],
      isActive: u.is_active ?? true,
      lastSignInAt: u.last_sign_in_at || null,
      createdAt: u.created_at || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Exceção ao buscar usuários:", error);
    return [];
  }
}, []);

// Adicionar ao value do contexto
const value: DataContextType = {
  // ... outros valores
  fetchAllUsers,
};
```

**2. Atualizar componente para usar função otimizada:**

```typescript
// ✅ SOLUÇÃO: Uma única query
const loadTenants = async () => {
  setIsLoadingTenants(true);
  try {
    const tenantsData = await fetchTenants(filter);
    setTenants(tenantsData);

    // Buscar todos os usuários de uma vez
    const allUsersData = await fetchAllUsers();
    setUsers(allUsersData);
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    toast({
      title: "Erro",
      description: "Não foi possível carregar os dados.",
      variant: "destructive",
    });
  } finally {
    setIsLoadingTenants(false);
  }
};
```

---

## 2. Remover Duplicação de Estado (localStorage + Supabase)

### Problema

O `data-provider.tsx` mantém dados tanto no localStorage quanto no Supabase, causando inconsistências.

### Solução

**1. Refatorar `createTenant` para usar apenas Supabase:**

```typescript
const createTenant = useCallback(
  async (tenant: Omit<Tenant, "id" | "createdAt">) => {
    try {
      const supabase = createSupabaseClient();

      const insertData = {
        name: tenant.name,
        neurocore_id: tenant.neurocoreId,
        is_active: tenant.isActive,
        cnpj: tenant.cnpj,
        phone: tenant.phone,
        responsible_tech_name: tenant.responsibleTech.name,
        responsible_tech_whatsapp: tenant.responsibleTech.whatsapp,
        responsible_tech_email: tenant.responsibleTech.email,
        responsible_finance_name: tenant.responsibleFinance.name,
        responsible_finance_whatsapp: tenant.responsibleFinance.whatsapp,
        responsible_finance_email: tenant.responsibleFinance.email,
        plan: tenant.plan,
        master_integration_url: (tenant as any).masterIntegrationUrl || null,
        master_integration_active:
          (tenant as any).masterIntegrationActive ?? false,
      };

      const { data, error } = await supabase
        .from("tenants")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar tenant: ${error.message}`);
      }

      // Mapear dados retornados
      const mappedTenant: Tenant = {
        id: data.id,
        name: data.name,
        neurocoreId: data.neurocore_id,
        isActive: data.is_active ?? true,
        cnpj: data.cnpj || "",
        phone: data.phone || "",
        responsibleTech: {
          name: data.responsible_tech_name || "",
          whatsapp: data.responsible_tech_whatsapp || "",
          email: data.responsible_tech_email || "",
        },
        responsibleFinance: {
          name: data.responsible_finance_name || "",
          whatsapp: data.responsible_finance_whatsapp || "",
          email: data.responsible_finance_email || "",
        },
        plan: data.plan || "Basic",
        createdAt: data.created_at || new Date().toISOString(),
      };

      // Atualizar apenas o estado React (não localStorage)
      setState((prev) => ({
        ...prev,
        tenants: [...prev.tenants, mappedTenant],
      }));
    } catch (error) {
      console.error("Erro ao criar tenant:", error);
      throw error;
    }
  },
  []
);
```

**2. Manter localStorage apenas para configurações de UI:**

```typescript
// Criar função separada para persistir apenas configurações de UI
const STORAGE_UI_KEY = "livia_ui_config";

interface UIConfig {
  globalFilters: GlobalFilters;
  theme?: "light" | "dark";
  sidebarCollapsed?: boolean;
}

export function getUIConfig(): Partial<UIConfig> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const data = localStorage.getItem(STORAGE_UI_KEY);
    if (!data) return {};
    return JSON.parse(data) as UIConfig;
  } catch (error) {
    console.error("Erro ao carregar configurações de UI:", error);
    return {};
  }
}

export function setUIConfig(config: Partial<UIConfig>): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_UI_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Erro ao salvar configurações de UI:", error);
  }
}
```

---

## 3. Implementar Paginação

### Solução

**1. Criar tipo para resposta paginada:**

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface PaginationOptions {
  limit?: number;
  offset?: number;
}
```

**2. Atualizar `fetchTenants` para suportar paginação:**

```typescript
const fetchTenants = useCallback(
  async (
    filter: "all" | "active" | "inactive" = "all",
    options?: PaginationOptions
  ): Promise<PaginatedResponse<Tenant>> => {
    try {
      const supabase = createSupabaseClient();
      const limit = options?.limit || 50;
      const offset = options?.offset || 0;

      let query = supabase.from("tenants").select("*", { count: "exact" });

      if (filter === "active") {
        query = query.eq("is_active", true);
      } else if (filter === "inactive") {
        query = query.eq("is_active", false);
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Erro ao buscar tenants:", error);
        return {
          data: [],
          total: 0,
          limit,
          offset,
          hasMore: false,
        };
      }

      if (!data) {
        return {
          data: [],
          total: 0,
          limit,
          offset,
          hasMore: false,
        };
      }

      const mappedData = data.map((t) => ({
        id: t.id,
        name: t.name,
        neurocoreId: t.neurocore_id,
        isActive: t.is_active ?? true,
        cnpj: t.cnpj || "",
        phone: t.phone || "",
        responsibleTech: {
          name: t.responsible_tech_name || "",
          whatsapp: t.responsible_tech_whatsapp || "",
          email: t.responsible_tech_email || "",
        },
        responsibleFinance: {
          name: t.responsible_finance_name || "",
          whatsapp: t.responsible_finance_whatsapp || "",
          email: t.responsible_finance_email || "",
        },
        plan: t.plan || "Basic",
        createdAt: t.created_at || new Date().toISOString(),
      }));

      return {
        data: mappedData,
        total: count || 0,
        limit,
        offset,
        hasMore: offset + limit < (count || 0),
      };
    } catch (error) {
      console.error("Exceção ao buscar tenants:", error);
      return {
        data: [],
        total: 0,
        limit: options?.limit || 50,
        offset: options?.offset || 0,
        hasMore: false,
      };
    }
  },
  []
);
```

**3. Usar paginação no componente:**

```typescript
const [page, setPage] = useState(0);
const [limit] = useState(50);

const loadTenants = async () => {
  setIsLoadingTenants(true);
  try {
    const result = await fetchTenants(filter, {
      limit,
      offset: page * limit,
    });

    if (page === 0) {
      setTenants(result.data);
    } else {
      setTenants((prev) => [...prev, ...result.data]);
    }

    setHasMore(result.hasMore);
  } catch (error) {
    // ... tratamento de erro
  } finally {
    setIsLoadingTenants(false);
  }
};

// Carregar mais itens
const loadMore = () => {
  if (!isLoadingTenants && hasMore) {
    setPage((prev) => prev + 1);
  }
};
```

---

## 4. Padronizar Tratamento de Erros

### Solução

**1. Criar helper centralizado:**

```typescript
// lib/supabase-error-handler.ts
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "SupabaseError";
  }
}

export function handleSupabaseError(error: any, context: string): never {
  console.error(`Erro em ${context}:`, error);

  // Mapear erros comuns do Supabase para mensagens amigáveis
  if (error.code === "PGRST116") {
    throw new SupabaseError("Recurso não encontrado", error.code, 404);
  }

  if (error.code === "42501") {
    throw new SupabaseError(
      "Você não tem permissão para realizar esta ação",
      error.code,
      403
    );
  }

  if (error.code === "23505") {
    throw new SupabaseError("Este registro já existe", error.code, 409);
  }

  if (error.code === "23503") {
    throw new SupabaseError(
      "Não é possível excluir este registro pois ele está em uso",
      error.code,
      400
    );
  }

  if (error.code === "23514") {
    throw new SupabaseError(
      "Dados inválidos. Verifique os campos obrigatórios.",
      error.code,
      400
    );
  }

  // Erro genérico
  throw new SupabaseError(
    error.message || "Erro desconhecido ao processar requisição",
    error.code,
    error.statusCode || 500
  );
}
```

**2. Usar em todas as funções:**

```typescript
import { handleSupabaseError } from "@/lib/supabase-error-handler";

const fetchTenants = useCallback(
  async (
    filter: "all" | "active" | "inactive" = "all",
    options?: PaginationOptions
  ): Promise<PaginatedResponse<Tenant>> => {
    try {
      const supabase = createSupabaseClient();
      // ... código da query

      if (error) {
        handleSupabaseError(error, "fetchTenants");
      }

      // ... resto do código
    } catch (error) {
      handleSupabaseError(error, "fetchTenants");
    }
  },
  []
);
```

**3. Tratar erros no componente:**

```typescript
try {
  await createTenant(tenantData);
  toast({
    title: "Sucesso",
    description: "Empresa criada com sucesso!",
  });
} catch (error) {
  if (error instanceof SupabaseError) {
    toast({
      title: "Erro",
      description: error.message,
      variant: "destructive",
    });
  } else {
    toast({
      title: "Erro",
      description: "Não foi possível criar a empresa.",
      variant: "destructive",
    });
  }
}
```

---

## 5. Adicionar Validação Zod no Frontend

### Solução

**1. Criar schemas de validação:**

```typescript
// lib/validations/tenant.ts
import { z } from "zod";

export const tenantSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(255),
  neurocoreId: z.string().uuid("ID do NeuroCore inválido"),
  isActive: z.boolean().default(true),
  cnpj: z
    .string()
    .regex(
      /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
      "CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX"
    ),
  phone: z
    .string()
    .regex(
      /^\+55\s\d{2}\s\d{4,5}-\d{4}$/,
      "Telefone deve estar no formato +55 XX XXXXX-XXXX"
    ),
  responsibleTech: z.object({
    name: z.string().min(3).max(255),
    whatsapp: z.string().regex(/^\+55\s\d{2}\s\d{4,5}-\d{4}$/),
    email: z.string().email("Email inválido"),
  }),
  responsibleFinance: z.object({
    name: z.string().min(3).max(255),
    whatsapp: z.string().regex(/^\+55\s\d{2}\s\d{4,5}-\d{4}$/),
    email: z.string().email("Email inválido"),
  }),
  plan: z.enum(["Basic", "Business", "Premium"]),
});

export type TenantFormData = z.infer<typeof tenantSchema>;
```

**2. Usar validação antes de enviar:**

```typescript
const createTenant = useCallback(
  async (tenant: Omit<Tenant, "id" | "createdAt">) => {
    try {
      // Validar antes de enviar
      const validated = tenantSchema.parse(tenant);

      const supabase = createSupabaseClient();
      // ... resto do código
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((e) => e.message).join(", ");
        throw new Error(`Dados inválidos: ${messages}`);
      }
      throw error;
    }
  },
  []
);
```

**3. Integrar com React Hook Form:**

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tenantSchema, TenantFormData } from "@/lib/validations/tenant";

const form = useForm<TenantFormData>({
  resolver: zodResolver(tenantSchema),
  defaultValues: {
    name: "",
    isActive: true,
    // ... outros campos
  },
});

const onSubmit = async (data: TenantFormData) => {
  try {
    await createTenant(data);
    toast({
      title: "Sucesso",
      description: "Empresa criada com sucesso!",
    });
  } catch (error) {
    // ... tratamento de erro
  }
};
```

---

## 6. Adicionar Loading States

### Solução

```typescript
const [isCreating, setIsCreating] = useState(false);

const handleCreate = async () => {
  setIsCreating(true);
  try {
    await createTenant(tenantData);
    toast({
      title: "Sucesso",
      description: "Empresa criada com sucesso!",
    });
  } catch (error) {
    // ... tratamento de erro
  } finally {
    setIsCreating(false);
  }
};

// No JSX
<Button onClick={handleCreate} disabled={isCreating}>
  {isCreating ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Criando...
    </>
  ) : (
    "Criar Empresa"
  )}
</Button>;
```

---

## Checklist de Implementação

- [ ] Corrigir queries N+1 (adicionar `fetchAllUsers`)
- [ ] Remover duplicação de estado (usar apenas Supabase)
- [ ] Implementar paginação em todas as listagens
- [ ] Criar helper centralizado de tratamento de erros
- [ ] Adicionar validação Zod no frontend
- [ ] Implementar loading states em todas as operações
- [ ] Adicionar toast notifications para feedback
- [ ] Testar todas as funcionalidades após mudanças

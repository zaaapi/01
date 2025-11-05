-- Fix: Adicionar política RLS para permitir que usuários vejam seu próprio perfil
-- Isso é necessário para o redirecionamento funcionar após o login

-- IMPORTANTE: Usuários podem sempre ver seu próprio perfil, independente de tenant_id ou custom claims
-- Isso garante que o fetchUserProfile funcione mesmo antes dos custom claims serem atualizados
CREATE POLICY "Users can view their own profile" ON public.users
FOR SELECT USING (auth.uid() = id);

-- Se a política já existe, fazer drop e recriar para garantir que está correta
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
FOR SELECT USING (auth.uid() = id);


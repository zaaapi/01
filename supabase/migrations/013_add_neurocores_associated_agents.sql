-- Migration: Add associated_agents column to neurocores table
-- Task 7: Integração Gerenciar NeuroCores com Supabase

-- Adicionar coluna associated_agents se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'neurocores' 
        AND column_name = 'associated_agents'
    ) THEN
        ALTER TABLE public.neurocores 
        ADD COLUMN associated_agents uuid[] NOT NULL DEFAULT '{}';
        
        COMMENT ON COLUMN public.neurocores.associated_agents IS 'Array de IDs dos agentes associados a este NeuroCore';
    END IF;
END $$;

-- Criar índice GIN para otimizar queries com arrays
CREATE INDEX IF NOT EXISTS idx_neurocores_associated_agents_gin 
ON public.neurocores USING GIN(associated_agents);

COMMENT ON INDEX idx_neurocores_associated_agents_gin IS 'Índice GIN para busca eficiente em array de agentes associados';

-- As políticas RLS existentes já cobrem esta coluna através da política "FOR ALL"
-- A política "Super admins can manage all neurocores" já permite INSERT/UPDATE/DELETE
-- para super admins, incluindo a coluna associated_agents.



-- Migration: 20251104010336

-- Migration: 20251104003006

-- Migration: 20251103235731
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE contract_status AS ENUM ('Vigente', 'Rescindido', 'Encerrado', 'Prorrogado');
CREATE TYPE modality AS ENUM ('Pregão', 'Dispensa', 'Inexigibilidade', 'Concorrência', 'Tomada de Preços');
CREATE TYPE amendment_type AS ENUM ('Aditivo de Valor', 'Aditivo de Prazo');
CREATE TYPE nomination_type AS ENUM ('Cláusula Contratual', 'Portaria');

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_number TEXT NOT NULL,
  gms_number TEXT NOT NULL,
  modality modality NOT NULL,
  object TEXT NOT NULL,
  contracted_company TEXT NOT NULL,
  contract_value DECIMAL(15,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status contract_status NOT NULL DEFAULT 'Vigente',
  process_number TEXT NOT NULL,
  has_extension_clause BOOLEAN DEFAULT false,
  manager_name TEXT,
  manager_email TEXT,
  manager_nomination nomination_type,
  supervisor_name TEXT,
  supervisor_email TEXT,
  supervisor_nomination nomination_type,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(contract_number)
);

-- Create contract amendments table
CREATE TABLE public.contract_amendments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  amendment_type amendment_type NOT NULL,
  new_value DECIMAL(15,2),
  new_end_date DATE,
  process_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_contracts_end_date ON public.contracts(end_date);
CREATE INDEX idx_contracts_created_by ON public.contracts(created_by);
CREATE INDEX idx_amendments_contract_id ON public.contract_amendments(contract_id);

-- Enable Row Level Security
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_amendments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contracts (public read, authenticated write)
CREATE POLICY "Anyone can view contracts"
  ON public.contracts
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert contracts"
  ON public.contracts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update contracts"
  ON public.contracts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contracts"
  ON public.contracts
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for amendments (public read, authenticated write)
CREATE POLICY "Anyone can view amendments"
  ON public.contract_amendments
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert amendments"
  ON public.contract_amendments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update amendments"
  ON public.contract_amendments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete amendments"
  ON public.contract_amendments
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO public.contracts (
  contract_number, gms_number, modality, object, contracted_company,
  contract_value, start_date, end_date, status, process_number,
  has_extension_clause, manager_name, manager_email, manager_nomination,
  supervisor_name, supervisor_email, supervisor_nomination
) VALUES
(
  '001/2024', 'GMS-2024-001', 'Pregão',
  'Contratação de empresa especializada em serviços de limpeza e conservação predial',
  'Limpa Bem Serviços Ltda', 450000.00, '2024-01-15', '2024-12-31',
  'Vigente', '23456.789/2023-10', true,
  'Maria Silva Santos', 'maria.silva@uenp.edu.br', 'Portaria',
  'João Pedro Costa', 'joao.costa@uenp.edu.br', 'Cláusula Contratual'
),
(
  '002/2024', 'GMS-2024-002', 'Dispensa',
  'Aquisição de materiais de expediente para uso administrativo',
  'Papelaria Central S.A.', 85000.00, '2024-02-01', '2024-08-15',
  'Vigente', '23456.790/2024-01', false,
  'Carlos Eduardo Lima', 'carlos.lima@uenp.edu.br', 'Cláusula Contratual',
  'Ana Paula Ferreira', 'ana.ferreira@uenp.edu.br', 'Portaria'
),
(
  '003/2024', 'GMS-2024-003', 'Pregão',
  'Prestação de serviços de manutenção preventiva e corretiva em equipamentos de TI',
  'Tech Solutions Informática', 320000.00, '2024-03-10', '2025-03-09',
  'Vigente', '23456.791/2024-02', true,
  'Roberto Alves Junior', 'roberto.alves@uenp.edu.br', 'Portaria',
  'Fernanda Souza', 'fernanda.souza@uenp.edu.br', 'Cláusula Contratual'
),
(
  '015/2023', 'GMS-2023-015', 'Concorrência',
  'Obras de reforma e adequação do prédio administrativo',
  'Construções Modernas Ltda', 1250000.00, '2023-06-01', '2024-05-31',
  'Vigente', '23456.755/2023-05', true,
  'Marcos Antonio Silva', 'marcos.silva@uenp.edu.br', 'Portaria',
  'Patricia Mendes', 'patricia.mendes@uenp.edu.br', 'Portaria'
),
(
  '008/2023', 'GMS-2023-008', 'Pregão',
  'Fornecimento de equipamentos de laboratório para pesquisas científicas',
  'Lab Equipment Brasil', 680000.00, '2023-08-20', '2024-02-15',
  'Encerrado', '23456.760/2023-07', false,
  'Dra. Lucia Campos', 'lucia.campos@uenp.edu.br', 'Cláusula Contratual',
  'Prof. Andre Martins', 'andre.martins@uenp.edu.br', 'Cláusula Contratual'
);

-- Migration: 20251104000637
-- Fix function search path security issue
DROP TRIGGER IF EXISTS update_contracts_updated_at ON public.contracts;
DROP FUNCTION IF EXISTS update_updated_at_column();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Migration: 20251104004526
-- Alterar campos de nomeação para texto livre
ALTER TABLE public.contracts 
  ALTER COLUMN manager_nomination TYPE text,
  ALTER COLUMN supervisor_nomination TYPE text;

-- Criar bucket de storage para documentos dos contratos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contract-documents', 
  'contract-documents', 
  false,
  10485760, -- 10MB
  ARRAY['application/pdf']
);

-- Criar tabela para gerenciar documentos dos contratos
CREATE TABLE public.contract_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN (
    'Contrato',
    'Publicação no Diário Oficial',
    'Termo Aditivo',
    'Apostilamento',
    'Extrato de Publicação do Aditivo',
    'Portaria'
  )),
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  uploaded_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.contract_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies para documentos
CREATE POLICY "Qualquer pessoa pode visualizar documentos"
  ON public.contract_documents
  FOR SELECT
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir documentos"
  ON public.contract_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar documentos"
  ON public.contract_documents
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies para storage
CREATE POLICY "Qualquer pessoa pode visualizar documentos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'contract-documents');

CREATE POLICY "Usuários autenticados podem fazer upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'contract-documents');

CREATE POLICY "Usuários autenticados podem deletar documentos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'contract-documents');

-- Criar tipo de role e tabela de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função para verificar se usuário tem role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Policy para user_roles
CREATE POLICY "Usuários podem ver suas próprias roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem inserir roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem deletar roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Migration: 20251104005047
-- Criar tabela para múltiplos fiscais
CREATE TABLE public.contract_supervisors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  supervisor_name text NOT NULL,
  supervisor_email text,
  supervisor_nomination text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contract_supervisors ENABLE ROW LEVEL SECURITY;

-- Migrar dados existentes de fiscais para a nova tabela
INSERT INTO public.contract_supervisors (contract_id, supervisor_name, supervisor_email, supervisor_nomination)
SELECT id, supervisor_name, supervisor_email, supervisor_nomination
FROM public.contracts
WHERE supervisor_name IS NOT NULL;

-- Remover colunas antigas de supervisor do contrato
ALTER TABLE public.contracts 
  DROP COLUMN IF EXISTS supervisor_name,
  DROP COLUMN IF EXISTS supervisor_email,
  DROP COLUMN IF EXISTS supervisor_nomination;

-- RLS Policies para fiscais
CREATE POLICY "Qualquer pessoa pode visualizar fiscais"
  ON public.contract_supervisors
  FOR SELECT
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir fiscais"
  ON public.contract_supervisors
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar fiscais"
  ON public.contract_supervisors
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar fiscais"
  ON public.contract_supervisors
  FOR DELETE
  TO authenticated
  USING (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_contract_supervisors_updated_at
  BEFORE UPDATE ON public.contract_supervisors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- Migration: 20251104010822
-- Adicionar novos valores ao tipo amendment_type
ALTER TYPE amendment_type ADD VALUE IF NOT EXISTS 'Aditivo de Valor e Prazo';
ALTER TYPE amendment_type ADD VALUE IF NOT EXISTS 'Apostilamento';

-- Migration: 20251104195202
-- Criar enum para tipos de apostilamento
CREATE TYPE endorsement_type AS ENUM (
  'Prorrogação de Prazo de Execução',
  'Reajuste por Índice',
  'Repactuação',
  'Alteração de Dotação Orçamentária'
);

-- Criar tabela de apostilamentos
CREATE TABLE public.contract_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL,
  endorsement_type endorsement_type NOT NULL,
  new_value NUMERIC,
  new_execution_date DATE,
  adjustment_index TEXT,
  process_number TEXT NOT NULL,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_contract FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE public.contract_endorsements ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para apostilamentos
CREATE POLICY "Qualquer pessoa pode visualizar apostilamentos"
  ON public.contract_endorsements
  FOR SELECT
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir apostilamentos"
  ON public.contract_endorsements
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar apostilamentos"
  ON public.contract_endorsements
  FOR UPDATE
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar apostilamentos"
  ON public.contract_endorsements
  FOR DELETE
  USING (true);

-- Adicionar coluna de número/identificação nos documentos
ALTER TABLE public.contract_documents
ADD COLUMN document_number TEXT;

COMMENT ON COLUMN public.contract_documents.document_number IS 'Identificação numérica do documento, ex: "4º Termo Aditivo", "2º Apostilamento"';

-- Migration: 20251104195453
-- Create contract_endorsements table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.contract_endorsements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  endorsement_type endorsement_type NOT NULL,
  new_value NUMERIC,
  new_execution_date DATE,
  adjustment_index TEXT,
  process_number TEXT NOT NULL,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS if not already enabled
ALTER TABLE public.contract_endorsements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Qualquer pessoa pode visualizar apostilamentos" ON public.contract_endorsements;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir apostilamentos" ON public.contract_endorsements;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar apostilamentos" ON public.contract_endorsements;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar apostilamentos" ON public.contract_endorsements;

CREATE POLICY "Qualquer pessoa pode visualizar apostilamentos"
  ON public.contract_endorsements
  FOR SELECT
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir apostilamentos"
  ON public.contract_endorsements
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar apostilamentos"
  ON public.contract_endorsements
  FOR UPDATE
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar apostilamentos"
  ON public.contract_endorsements
  FOR DELETE
  USING (true);

-- Update amendment_type enum to remove 'Apostilamento'
DO $$ 
BEGIN
  -- Check if 'Apostilamento' exists in the enum
  IF EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'Apostilamento' 
    AND enumtypid = 'amendment_type'::regtype
  ) THEN
    -- Create new enum without 'Apostilamento'
    CREATE TYPE amendment_type_new AS ENUM (
      'Aditivo de Valor',
      'Aditivo de Prazo',
      'Aditivo de Valor e Prazo'
    );

    -- Update the column to use new type
    ALTER TABLE public.contract_amendments 
      ALTER COLUMN amendment_type TYPE amendment_type_new 
      USING amendment_type::text::amendment_type_new;

    -- Drop old enum and rename new one
    DROP TYPE amendment_type;
    ALTER TYPE amendment_type_new RENAME TO amendment_type;
  END IF;
END $$;

-- Add document_number column to contract_documents if not exists
ALTER TABLE public.contract_documents 
  ADD COLUMN IF NOT EXISTS document_number TEXT;

-- Migration: 20251104195549
-- Create contract_endorsements table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.contract_endorsements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  endorsement_type endorsement_type NOT NULL,
  new_value NUMERIC,
  new_execution_date DATE,
  adjustment_index TEXT,
  process_number TEXT NOT NULL,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS if not already enabled
ALTER TABLE public.contract_endorsements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Qualquer pessoa pode visualizar apostilamentos" ON public.contract_endorsements;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir apostilamentos" ON public.contract_endorsements;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar apostilamentos" ON public.contract_endorsements;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar apostilamentos" ON public.contract_endorsements;

CREATE POLICY "Qualquer pessoa pode visualizar apostilamentos"
  ON public.contract_endorsements
  FOR SELECT
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir apostilamentos"
  ON public.contract_endorsements
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar apostilamentos"
  ON public.contract_endorsements
  FOR UPDATE
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar apostilamentos"
  ON public.contract_endorsements
  FOR DELETE
  USING (true);

-- Update amendment_type enum to remove 'Apostilamento'
DO $$ 
BEGIN
  -- Check if 'Apostilamento' exists in the enum
  IF EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'Apostilamento' 
    AND enumtypid = 'amendment_type'::regtype
  ) THEN
    -- Create new enum without 'Apostilamento'
    CREATE TYPE amendment_type_new AS ENUM (
      'Aditivo de Valor',
      'Aditivo de Prazo',
      'Aditivo de Valor e Prazo'
    );

    -- Update the column to use new type
    ALTER TABLE public.contract_amendments 
      ALTER COLUMN amendment_type TYPE amendment_type_new 
      USING amendment_type::text::amendment_type_new;

    -- Drop old enum and rename new one
    DROP TYPE amendment_type;
    ALTER TYPE amendment_type_new RENAME TO amendment_type;
  END IF;
END $$;

-- Add document_number column to contract_documents if not exists
ALTER TABLE public.contract_documents 
  ADD COLUMN IF NOT EXISTS document_number TEXT;

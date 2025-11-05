export type ContractStatus = 'Vigente' | 'Rescindido' | 'Encerrado' | 'Prorrogado';
export type Modality = 'Pregão' | 'Dispensa' | 'Inexigibilidade' | 'Concorrência' | 'Tomada de Preços' | 'Credenciamento' | 'Adesão';
export type AmendmentType = 'Aditivo de Valor' | 'Aditivo de Prazo' | 'Aditivo de Valor e Prazo';
export type EndorsementType = 'Prorrogação de Prazo de Execução' | 'Reajuste por Índice' | 'Repactuação' | 'Alteração de Dotação Orçamentária';
export type DocumentType = 'Contrato' | 'Extrato de Publicação do Contrato' | 'Termo Aditivo' | 'Extrato de Publicação do Aditivo' | 'Apostilamento' | 'Portaria';

export interface Contract {
  id: string;
  contract_number: string;
  gms_number?: string; // Tornando opcional
  modality: Modality;
  object: string;
  contracted_company: string;
  contract_value: number;
  start_date: string;
  end_date: string;
  status: ContractStatus;
  process_number: string;
  has_extension_clause: boolean;
  manager_name?: string;
  manager_email?: string;
  manager_nomination?: string;
}

export interface ContractAmendment {
  id: string;
  contract_id: string;
  amendment_type: AmendmentType;
  new_value?: number;
  new_end_date?: string;
  process_number: string;
  created_at: string;
}

export interface ContractDocument {
  id: string;
  contract_id: string;
  document_type: DocumentType;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by?: string;
  document_number?: string;
}

export interface ContractEndorsement {
  id: string;
  contract_id: string;
  endorsement_type: EndorsementType;
  new_value?: number;
  new_execution_date?: string;
  adjustment_index?: string;
  process_number: string;
  description?: string;
  created_at: string;
}

export interface ContractSupervisor {
  id: string;
  contract_id: string;
  supervisor_name: string;
  supervisor_email?: string;
  supervisor_nomination?: string;
  created_at: string;
  updated_at: string;
}
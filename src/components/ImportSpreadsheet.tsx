import { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Constants } from '@/integrations/supabase/types';
import { toTitleCase } from '@/lib/utils';

interface ImportSpreadsheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const ImportSpreadsheet = ({ open, onOpenChange, onSuccess }: ImportSpreadsheetProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const validModalities = Constants.public.Enums.modality;
  const validStatuses = Constants.public.Enums.contract_status;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const parseExcelDate = (excelDate: any): string => {
    if (typeof excelDate === 'string') {
      const date = new Date(excelDate);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      return excelDate;
    }
    
    if (typeof excelDate === 'number') {
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    
    return '';
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Selecione um arquivo');
      return;
    }

    setImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const contractsToInsert = [];
      const supervisorsToInsert = [];

      for (const row of jsonData) {
        const contract_value_raw = String(row['Valor'] || row['contract_value'] || '0').replace(/[^\d.,]/g, '').replace(',', '.');
        const contract_value = isNaN(parseFloat(contract_value_raw)) ? 0 : parseFloat(contract_value_raw);

        // Normaliza os valores de enum para garantir correspondência exata
        const modalityValueRaw = row['Modalidade'] || row['modality'];
        const statusValueRaw = row['Status'] || row['status'];
        
        const modalityValue = modalityValueRaw ? toTitleCase(String(modalityValueRaw)) : '';
        const statusValue = statusValueRaw ? toTitleCase(String(statusValueRaw)) : '';

        const contractData = {
          contract_number: row['Número do Contrato'] || row['numero_contrato'],
          gms_number: row['Número GMS'] || row['gms_number'] || null,
          modality: validModalities.includes(modalityValue) ? modalityValue : 'Pregão', // Fallback
          object: row['Objeto'] || row['object'],
          contracted_company: row['Empresa Contratada'] || row['contracted_company'],
          contract_value: contract_value,
          start_date: parseExcelDate(row['Data Início'] || row['start_date']),
          end_date: parseExcelDate(row['Data Fim'] || row['end_date']),
          status: validStatuses.includes(statusValue) ? statusValue : 'Vigente', // Fallback
          process_number: row['Número Processo'] || row['process_number'],
          has_extension_clause: row['Possui Prorrogação'] === 'Sim' || row['has_extension_clause'] === true,
          manager_name: row['Nome Gestor'] || row['manager_name'] || null,
          manager_email: row['Email Gestor'] || row['manager_email'] || null,
          manager_nomination: row['Nomeação Gestor'] || row['manager_nomination'] || null,
        };
        contractsToInsert.push(contractData);

        if (row['Nome Fiscal'] || row['supervisor_name']) {
          supervisorsToInsert.push({
            supervisor_name: row['Nome Fiscal'] || row['supervisor_name'],
            supervisor_email: row['Email Fiscal'] || row['supervisor_email'] || null,
            supervisor_nomination: row['Nomeação Fiscal'] || row['supervisor_nomination'] || null,
            original_contract_number: contractData.contract_number,
          });
        }
      }

      const { data: insertedContracts, error: contractsError } = await supabase
        .from('contracts')
        .insert(contractsToInsert)
        .select('id, contract_number');

      if (contractsError) throw contractsError;

      if (insertedContracts && supervisorsToInsert.length > 0) {
        const supervisorsWithContractId = supervisorsToInsert.map(tempSupervisor => {
          const correspondingContract = insertedContracts.find(
            ic => ic.contract_number === tempSupervisor.original_contract_number
          );
          if (correspondingContract) {
            return {
              contract_id: correspondingContract.id,
              supervisor_name: tempSupervisor.supervisor_name,
              supervisor_email: tempSupervisor.supervisor_email,
              supervisor_nomination: tempSupervisor.supervisor_nomination,
            };
          }
          return null;
        }).filter(Boolean);

        if (supervisorsWithContractId.length > 0) {
          const { error: supervisorsError } = await supabase
            .from('contract_supervisors')
            .insert(supervisorsWithContractId);
          if (supervisorsError) throw supervisorsError;
        }
      }

      toast.success(`${contractsToInsert.length} contrato(s) importado(s) com sucesso!`);
      onSuccess();
      onOpenChange(false);
      setFile(null);
    } catch (error: any) {
      console.error('Erro ao importar:', error);
      toast.error(`Erro ao importar: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Número do Contrato': '001/2024',
        'Número GMS': 'GMS-2024-001 (Opcional)',
        'Modalidade': 'Pregão, Dispensa, Inexigibilidade, Concorrência, Tomada de Preços, Credenciamento, Adesão',
        'Objeto': 'Descrição detalhada do objeto do contrato',
        'Empresa Contratada': 'Nome da Empresa Ltda',
        'Valor': '100000.00',
        'Data Início': '2024-01-15',
        'Data Fim': '2024-12-31',
        'Status': 'Vigente, Rescindido, Encerrado, Prorrogado',
        'Número Processo': '23456.789/2023-10',
        'Possui Prorrogação': 'Sim ou Não',
        'Nome Gestor': 'Nome do Gestor',
        'Email Gestor': 'gestor@uenp.edu.br',
        'Nomeação Gestor': 'Portaria',
        'Nome Fiscal': 'Nome do Fiscal',
        'Email Fiscal': 'fiscal@uenp.edu.br',
        'Nomeação Fiscal': 'Cláusula Contratual',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contratos');
    XLSX.writeFile(wb, 'template_contratos.xlsx');
    toast.success('Template baixado com sucesso!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Planilha de Contratos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Instruções:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Baixe o template e preencha com seus dados</li>
                  <li>Mantenha os nomes das colunas iguais ao template</li>
                  <li>Use formatos de data: AAAA-MM-DD (ex: 2024-01-15)</li>
                  <li>Valores numéricos sem símbolos (ex: 100000.00)</li>
                  <li>Status: Vigente, Rescindido, Encerrado ou Prorrogado</li>
                  <li>Modalidade: Pregão, Dispensa, Inexigibilidade, Concorrência, Tomada de Preços, Credenciamento, Adesão</li>
                  <li>**Importante**: A coluna 'Número GMS' agora aceita valores nulos.</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={downloadTemplate}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Baixar Template Excel
          </Button>

          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">
                {file ? file.name : 'Clique para selecionar arquivo'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Formatos: .xlsx, .xls, .csv
              </p>
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setFile(null);
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleImport}
              disabled={!file || importing}
            >
              {importing ? 'Importando...' : 'Importar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
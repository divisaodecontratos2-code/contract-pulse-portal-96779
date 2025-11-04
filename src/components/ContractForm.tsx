import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Upload, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Contract, ContractDocument, DocumentType, ContractSupervisor } from '@/types/contract';

const contractSchema = z.object({
  contract_number: z.string().min(1, 'Número do contrato obrigatório'),
  gms_number: z.string().min(1, 'Número GMS obrigatório'),
  modality: z.enum(['Pregão', 'Dispensa', 'Inexigibilidade', 'Concorrência', 'Tomada de Preços']),
  object: z.string().min(1, 'Objeto obrigatório'),
  contracted_company: z.string().min(1, 'Empresa contratada obrigatória'),
  contract_value: z.string().min(1, 'Valor obrigatório'),
  start_date: z.string().min(1, 'Data de início obrigatória'),
  end_date: z.string().min(1, 'Data de fim obrigatória'),
  status: z.enum(['Vigente', 'Rescindido', 'Encerrado', 'Prorrogado']),
  process_number: z.string().min(1, 'Número do processo obrigatório'),
  has_extension_clause: z.boolean(),
  manager_name: z.string().optional(),
  manager_email: z.string().email().optional().or(z.literal('')),
  manager_nomination: z.string().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface Amendment {
  amendment_type: 'Aditivo de Valor' | 'Aditivo de Prazo';
  new_value?: string;
  new_end_date?: string;
  process_number: string;
}

interface ContractFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: Contract;
  onSuccess: () => void;
}

export const ContractForm = ({ open, onOpenChange, contract, onSuccess }: ContractFormProps) => {
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [showAmendmentForm, setShowAmendmentForm] = useState(false);
  const [newAmendment, setNewAmendment] = useState<Amendment>({
    amendment_type: 'Aditivo de Valor',
    process_number: '',
  });
  const [documents, setDocuments] = useState<ContractDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [supervisors, setSupervisors] = useState<ContractSupervisor[]>([]);
  const [showSupervisorForm, setShowSupervisorForm] = useState(false);
  const [newSupervisor, setNewSupervisor] = useState({
    supervisor_name: '',
    supervisor_email: '',
    supervisor_nomination: '',
  });

  // Carregar documentos existentes quando editar um contrato
  const loadDocuments = async () => {
    if (!contract) return;
    
    try {
      const { data, error } = await supabase
        .from('contract_documents')
        .select('*')
        .eq('contract_id', contract.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data as ContractDocument[]);
    } catch (error: any) {
      console.error('Erro ao carregar documentos:', error);
    }
  };

  // Carregar fiscais existentes quando editar um contrato
  const loadSupervisors = async () => {
    if (!contract) return;
    
    try {
      const { data, error } = await supabase
        .from('contract_supervisors')
        .select('*')
        .eq('contract_id', contract.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSupervisors(data as ContractSupervisor[]);
    } catch (error: any) {
      console.error('Erro ao carregar fiscais:', error);
    }
  };

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: contract ? {
      ...contract,
      contract_value: contract.contract_value.toString(),
      manager_email: contract.manager_email || '',
    } : {
      status: 'Vigente',
      has_extension_clause: false,
    },
  });

  const has_extension_clause = watch('has_extension_clause');

  // Carregar documentos e fiscais quando o modal abrir com um contrato existente
  useEffect(() => {
    if (open && contract) {
      loadDocuments();
      loadSupervisors();
    } else if (open && !contract) {
      setSupervisors([]);
      setDocuments([]);
    }
  }, [open, contract]);

  const handleAddAmendment = () => {
    if (!newAmendment.process_number) {
      toast.error('Número do processo é obrigatório');
      return;
    }
    if (newAmendment.amendment_type === 'Aditivo de Valor' && !newAmendment.new_value) {
      toast.error('Novo valor é obrigatório para aditivo de valor');
      return;
    }
    if (newAmendment.amendment_type === 'Aditivo de Prazo' && !newAmendment.new_end_date) {
      toast.error('Nova data de fim é obrigatória para aditivo de prazo');
      return;
    }

    setAmendments([...amendments, newAmendment]);
    setNewAmendment({
      amendment_type: 'Aditivo de Valor',
      process_number: '',
    });
    setShowAmendmentForm(false);
    toast.success('Aditivo adicionado');
  };

  const handleRemoveAmendment = (index: number) => {
    setAmendments(amendments.filter((_, i) => i !== index));
    toast.success('Aditivo removido');
  };

  const handleAddSupervisor = async () => {
    if (!newSupervisor.supervisor_name) {
      toast.error('Nome do fiscal é obrigatório');
      return;
    }

    if (!contract) {
      // Se está criando novo contrato, apenas adiciona na lista local
      const tempSupervisor = {
        id: Date.now().toString(),
        contract_id: '',
        ...newSupervisor,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setSupervisors([...supervisors, tempSupervisor]);
      setNewSupervisor({ supervisor_name: '', supervisor_email: '', supervisor_nomination: '' });
      setShowSupervisorForm(false);
      toast.success('Fiscal adicionado');
      return;
    }

    // Se está editando, salva no banco
    try {
      const { data, error } = await supabase
        .from('contract_supervisors')
        .insert({
          contract_id: contract.id,
          ...newSupervisor,
        })
        .select()
        .single();

      if (error) throw error;

      setSupervisors([...supervisors, data as ContractSupervisor]);
      setNewSupervisor({ supervisor_name: '', supervisor_email: '', supervisor_nomination: '' });
      setShowSupervisorForm(false);
      toast.success('Fiscal adicionado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar fiscal');
    }
  };

  const handleRemoveSupervisor = async (supervisor: ContractSupervisor) => {
    if (!confirm('Deseja remover este fiscal?')) return;

    if (!contract) {
      // Se está criando novo contrato, apenas remove da lista local
      setSupervisors(supervisors.filter((s) => s.id !== supervisor.id));
      toast.success('Fiscal removido');
      return;
    }

    // Se está editando, deleta do banco
    try {
      const { error } = await supabase
        .from('contract_supervisors')
        .delete()
        .eq('id', supervisor.id);

      if (error) throw error;

      setSupervisors(supervisors.filter((s) => s.id !== supervisor.id));
      toast.success('Fiscal removido com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover fiscal');
    }
  };

  const onSubmit = async (data: ContractFormData) => {
    try {
      const contractData: any = {
        contract_number: data.contract_number,
        gms_number: data.gms_number,
        modality: data.modality,
        object: data.object,
        contracted_company: data.contracted_company,
        contract_value: parseFloat(data.contract_value),
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
        process_number: data.process_number,
        has_extension_clause: data.has_extension_clause,
        manager_name: data.manager_name || null,
        manager_email: data.manager_email || null,
        manager_nomination: data.manager_nomination || null,
      };

      if (contract) {
        // Update existing contract
        const { error } = await supabase
          .from('contracts')
          .update(contractData)
          .eq('id', contract.id);

        if (error) throw error;

        // Handle amendments
        for (const amendment of amendments) {
          await supabase.from('contract_amendments').insert({
            contract_id: contract.id,
            amendment_type: amendment.amendment_type,
            new_value: amendment.new_value ? parseFloat(amendment.new_value) : null,
            new_end_date: amendment.new_end_date || null,
            process_number: amendment.process_number,
          });
        }

        toast.success('Contrato atualizado com sucesso!');
      } else {
        // Create new contract
        const { data: newContract, error } = await supabase
          .from('contracts')
          .insert([contractData])
          .select()
          .single();

        if (error) throw error;

        // Handle amendments
        for (const amendment of amendments) {
          await supabase.from('contract_amendments').insert({
            contract_id: newContract.id,
            amendment_type: amendment.amendment_type,
            new_value: amendment.new_value ? parseFloat(amendment.new_value) : null,
            new_end_date: amendment.new_end_date || null,
            process_number: amendment.process_number,
          });
        }

        // Handle supervisors (fiscais)
        for (const supervisor of supervisors) {
          await supabase.from('contract_supervisors').insert({
            contract_id: newContract.id,
            supervisor_name: supervisor.supervisor_name,
            supervisor_email: supervisor.supervisor_email || null,
            supervisor_nomination: supervisor.supervisor_nomination || null,
          });
        }

        toast.success('Contrato criado com sucesso!');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar contrato');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contract ? 'Editar Contrato' : 'Novo Contrato'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="dados" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dados">Dados Principais</TabsTrigger>
              <TabsTrigger value="gestao">Gestão</TabsTrigger>
              <TabsTrigger value="aditivos">Aditivos</TabsTrigger>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contract_number">Número do Contrato *</Label>
                  <Input id="contract_number" {...register('contract_number')} />
                  {errors.contract_number && (
                    <p className="text-sm text-destructive">{errors.contract_number.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gms_number">Número GMS *</Label>
                  <Input id="gms_number" {...register('gms_number')} />
                  {errors.gms_number && (
                    <p className="text-sm text-destructive">{errors.gms_number.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modality">Modalidade *</Label>
                  <Select onValueChange={(value) => setValue('modality', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pregão">Pregão</SelectItem>
                      <SelectItem value="Dispensa">Dispensa</SelectItem>
                      <SelectItem value="Inexigibilidade">Inexigibilidade</SelectItem>
                      <SelectItem value="Concorrência">Concorrência</SelectItem>
                      <SelectItem value="Tomada de Preços">Tomada de Preços</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select onValueChange={(value) => setValue('status', value as any)} defaultValue="Vigente">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vigente">Vigente</SelectItem>
                      <SelectItem value="Rescindido">Rescindido</SelectItem>
                      <SelectItem value="Encerrado">Encerrado</SelectItem>
                      <SelectItem value="Prorrogado">Prorrogado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="object">Objeto do Contrato *</Label>
                <Textarea id="object" {...register('object')} rows={3} />
                {errors.object && (
                  <p className="text-sm text-destructive">{errors.object.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contracted_company">Empresa Contratada *</Label>
                <Input id="contracted_company" {...register('contracted_company')} />
                {errors.contracted_company && (
                  <p className="text-sm text-destructive">{errors.contracted_company.message}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contract_value">Valor Contratual (R$) *</Label>
                  <Input
                    id="contract_value"
                    type="number"
                    step="0.01"
                    {...register('contract_value')}
                  />
                  {errors.contract_value && (
                    <p className="text-sm text-destructive">{errors.contract_value.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">Início da Vigência *</Label>
                  <Input id="start_date" type="date" {...register('start_date')} />
                  {errors.start_date && (
                    <p className="text-sm text-destructive">{errors.start_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">Fim da Vigência *</Label>
                  <Input id="end_date" type="date" {...register('end_date')} />
                  {errors.end_date && (
                    <p className="text-sm text-destructive">{errors.end_date.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="process_number">Número do Processo *</Label>
                <Input id="process_number" {...register('process_number')} />
                {errors.process_number && (
                  <p className="text-sm text-destructive">{errors.process_number.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_extension_clause"
                  checked={has_extension_clause}
                  onCheckedChange={(checked) => setValue('has_extension_clause', checked as boolean)}
                />
                <Label htmlFor="has_extension_clause">Possui Cláusula de Prorrogação</Label>
              </div>
            </TabsContent>

            <TabsContent value="gestao" className="space-y-6 mt-4">
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Gestor do Contrato</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manager_name">Nome do Gestor</Label>
                    <Input id="manager_name" {...register('manager_name')} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manager_email">Email do Gestor</Label>
                    <Input id="manager_email" type="email" {...register('manager_email')} />
                    {errors.manager_email && (
                      <p className="text-sm text-destructive">{errors.manager_email.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manager_nomination">Nomeação do Gestor</Label>
                  <Input 
                    id="manager_nomination" 
                    {...register('manager_nomination')} 
                    placeholder="Ex: Portaria 342-2025, Cláusula 8ª"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg">Fiscais do Contrato</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSupervisorForm(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Fiscal
                  </Button>
                </div>

                {showSupervisorForm && (
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome do Fiscal *</Label>
                        <Input
                          value={newSupervisor.supervisor_name}
                          onChange={(e) => setNewSupervisor({ ...newSupervisor, supervisor_name: e.target.value })}
                          placeholder="Nome completo"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Email do Fiscal</Label>
                        <Input
                          type="email"
                          value={newSupervisor.supervisor_email}
                          onChange={(e) => setNewSupervisor({ ...newSupervisor, supervisor_email: e.target.value })}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Nomeação do Fiscal</Label>
                      <Input
                        value={newSupervisor.supervisor_nomination}
                        onChange={(e) => setNewSupervisor({ ...newSupervisor, supervisor_nomination: e.target.value })}
                        placeholder="Ex: Portaria 342-2025, Cláusula 8ª"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="button" onClick={handleAddSupervisor}>
                        Salvar Fiscal
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowSupervisorForm(false);
                          setNewSupervisor({ supervisor_name: '', supervisor_email: '', supervisor_nomination: '' });
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {supervisors.length > 0 && (
                  <div className="space-y-2">
                    {supervisors.map((supervisor) => (
                      <div key={supervisor.id} className="border rounded-lg p-4 flex justify-between items-start">
                        <div>
                          <p className="font-medium">{supervisor.supervisor_name}</p>
                          {supervisor.supervisor_email && (
                            <p className="text-sm text-muted-foreground">{supervisor.supervisor_email}</p>
                          )}
                          {supervisor.supervisor_nomination && (
                            <p className="text-sm text-muted-foreground">Nomeação: {supervisor.supervisor_nomination}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSupervisor(supervisor)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {supervisors.length === 0 && !showSupervisorForm && (
                  <p className="text-sm text-muted-foreground">Nenhum fiscal cadastrado.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="aditivos" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-lg">Aditivos do Contrato</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAmendmentForm(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Aditivo
                </Button>
              </div>

              {showAmendmentForm && (
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Aditivo</Label>
                    <Select
                      value={newAmendment.amendment_type}
                      onValueChange={(value) =>
                        setNewAmendment({ ...newAmendment, amendment_type: value as any })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aditivo de Valor">Aditivo de Valor</SelectItem>
                        <SelectItem value="Aditivo de Prazo">Aditivo de Prazo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newAmendment.amendment_type === 'Aditivo de Valor' && (
                    <div className="space-y-2">
                      <Label>Novo Valor Total (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newAmendment.new_value || ''}
                        onChange={(e) =>
                          setNewAmendment({ ...newAmendment, new_value: e.target.value })
                        }
                      />
                    </div>
                  )}

                  {newAmendment.amendment_type === 'Aditivo de Prazo' && (
                    <div className="space-y-2">
                      <Label>Nova Data de Fim de Vigência</Label>
                      <Input
                        type="date"
                        value={newAmendment.new_end_date || ''}
                        onChange={(e) =>
                          setNewAmendment({ ...newAmendment, new_end_date: e.target.value })
                        }
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Número do Processo do Aditivo</Label>
                    <Input
                      value={newAmendment.process_number}
                      onChange={(e) =>
                        setNewAmendment({ ...newAmendment, process_number: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" onClick={handleAddAmendment}>
                      Salvar Aditivo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAmendmentForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {amendments.length > 0 && (
                <div className="space-y-2">
                  {amendments.map((amendment, index) => (
                    <div key={index} className="border rounded-lg p-4 flex justify-between items-start">
                      <div>
                        <p className="font-medium">{amendment.amendment_type}</p>
                        {amendment.new_value && (
                          <p className="text-sm text-muted-foreground">
                            Novo Valor: R$ {parseFloat(amendment.new_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                        {amendment.new_end_date && (
                          <p className="text-sm text-muted-foreground">
                            Nova Data: {new Date(amendment.new_end_date).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Processo: {amendment.process_number}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAmendment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="documentos" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-lg">Documentos do Contrato</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={uploading || !contract}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? 'Enviando...' : 'Adicionar Documento'}
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !contract) return;

                    setUploading(true);
                    try {
                      const fileExt = file.name.split('.').pop();
                      const fileName = `${contract.id}/${Date.now()}.${fileExt}`;
                      
                      const { error: uploadError } = await supabase.storage
                        .from('contract-documents')
                        .upload(fileName, file);

                      if (uploadError) throw uploadError;

                      const documentType = prompt(
                        'Selecione o tipo de documento:\n1. Contrato\n2. Publicação no Diário Oficial\n3. Termo Aditivo\n4. Apostilamento\n5. Extrato de Publicação do Aditivo\n6. Portaria\n\nDigite o número:'
                      );

                      const typeMap: Record<string, DocumentType> = {
                        '1': 'Contrato',
                        '2': 'Extrato de Publicação do Contrato',
                        '3': 'Termo Aditivo',
                        '4': 'Extrato de Publicação do Aditivo',
                        '5': 'Apostilamento',
                        '6': 'Portaria',
                      };

                      const selectedType = typeMap[documentType || '1'];

                      const { data, error: dbError } = await supabase
                        .from('contract_documents')
                        .insert({
                          contract_id: contract.id,
                          document_type: selectedType,
                          file_name: file.name,
                          file_path: fileName,
                          file_size: file.size,
                        })
                        .select()
                        .single();

                      if (dbError) throw dbError;

                      setDocuments([...documents, data as ContractDocument]);
                      toast.success('Documento enviado com sucesso!');
                      e.target.value = '';
                    } catch (error: any) {
                      toast.error(error.message || 'Erro ao enviar documento');
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </div>

              {!contract && (
                <p className="text-sm text-muted-foreground">
                  Salve o contrato primeiro para poder adicionar documentos.
                </p>
              )}

              {documents.length > 0 && (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4 flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">{doc.document_type}</p>
                          <p className="text-sm text-muted-foreground">{doc.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(doc.file_size / 1024).toFixed(2)} KB • {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (!confirm('Deseja excluir este documento?')) return;
                          
                          try {
                            await supabase.storage
                              .from('contract-documents')
                              .remove([doc.file_path]);

                            await supabase
                              .from('contract_documents')
                              .delete()
                              .eq('id', doc.id);

                            setDocuments(documents.filter((d) => d.id !== doc.id));
                            toast.success('Documento excluído');
                          } catch (error: any) {
                            toast.error('Erro ao excluir documento');
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Contrato</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

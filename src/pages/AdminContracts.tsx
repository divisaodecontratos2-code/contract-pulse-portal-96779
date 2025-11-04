import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Pencil, Trash2 } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { ContractForm } from '@/components/ContractForm';
import { ImportSpreadsheet } from '@/components/ImportSpreadsheet';
import { supabase } from '@/integrations/supabase/client';
import { Contract } from '@/types/contract';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AdminContracts = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | undefined>(undefined);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [loadingContracts, setLoadingContracts] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchContracts();
    }
  }, [user]);

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      toast.error('Erro ao carregar contratos');
    } finally {
      setLoadingContracts(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este contrato?')) return;

    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContracts(contracts.filter((c) => c.id !== id));
      toast.success('Contrato excluído com sucesso');
    } catch (error: any) {
      toast.error('Erro ao excluir contrato');
    }
  };

  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedContract(undefined);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    fetchContracts();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciamento de Contratos</h1>
            <p className="text-muted-foreground">Crie, edite e gerencie todos os contratos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Importar Planilha
            </Button>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Contrato
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card overflow-hidden">
          {loadingContracts ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Carregando contratos...</p>
            </div>
          ) : (
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Nº Contrato</TableHead>
                <TableHead>Objeto</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Gestor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>
                    <StatusBadge status={contract.status} />
                  </TableCell>
                  <TableCell className="font-medium">{contract.contract_number}</TableCell>
                  <TableCell className="max-w-md truncate">{contract.object}</TableCell>
                  <TableCell>{contract.contracted_company}</TableCell>
                  <TableCell>{formatCurrency(contract.contract_value)}</TableCell>
                  <TableCell>{contract.manager_name || 'Não definido'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(contract)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(contract.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          )}
        </div>

        <ContractForm
          open={formOpen}
          onOpenChange={setFormOpen}
          contract={selectedContract}
          onSuccess={handleFormSuccess}
        />

        <ImportSpreadsheet
          open={importOpen}
          onOpenChange={setImportOpen}
          onSuccess={handleFormSuccess}
        />
      </main>
    </div>
  );
};

export default AdminContracts;

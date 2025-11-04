import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { PublicNavbar } from '@/components/PublicNavbar';
import { ContractFilters, FilterState } from '@/components/ContractFilters';
import { ContractTable } from '@/components/ContractTable';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Contract } from '@/types/contract';

const Contracts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({});
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      searchTerm === '' ||
      contract.object.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contracted_company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || contract.status === filters.status;
    const matchesModality = !filters.modality || contract.modality === filters.modality;
    const matchesStartDate = !filters.startDate || contract.start_date >= filters.startDate;

    return matchesSearch && matchesStatus && matchesModality && matchesStartDate;
  });

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Consulta Pública de Contratos</h1>
          <p className="text-muted-foreground">
            Consulte os contratos administrativos da UENP de forma transparente
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por objeto do contrato ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <ContractFilters onApplyFilters={setFilters} />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando contratos...</p>
          </div>
        ) : (
          <ContractTable contracts={filteredContracts} />
        )}
      </main>
    </div>
  );
};

export default Contracts;

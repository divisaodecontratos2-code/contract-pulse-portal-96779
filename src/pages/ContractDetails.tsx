import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Building, Calendar, Users } from 'lucide-react';
import { PublicNavbar } from '@/components/PublicNavbar';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Contract, ContractAmendment, ContractSupervisor, ContractEndorsement } from '@/types/contract';

const ContractDetails = () => {
  const { id } = useParams();
  const [contract, setContract] = useState<Contract | null>(null);
  const [amendments, setAmendments] = useState<ContractAmendment[]>([]);
  const [endorsements, setEndorsements] = useState<ContractEndorsement[]>([]);
  const [supervisors, setSupervisors] = useState<ContractSupervisor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContractDetails();
  }, [id]);

  const fetchContractDetails = async () => {
    try {
      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single();

      if (contractError) throw contractError;
      setContract(contractData);

      const { data: amendmentsData, error: amendmentsError } = await supabase
        .from('contract_amendments')
        .select('*')
        .eq('contract_id', id)
        .order('created_at', { ascending: true });

      if (amendmentsError) throw amendmentsError;
      setAmendments(amendmentsData || []);

      const { data: endorsementsData, error: endorsementsError } = await supabase
        .from('contract_endorsements')
        .select('*')
        .eq('contract_id', id)
        .order('created_at', { ascending: true });

      if (endorsementsError) throw endorsementsError;
      setEndorsements(endorsementsData || []);

      const { data: supervisorsData, error: supervisorsError } = await supabase
        .from('contract_supervisors')
        .select('*')
        .eq('contract_id', id)
        .order('created_at', { ascending: true });

      if (supervisorsError) throw supervisorsError;
      setSupervisors(supervisorsData || []);
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <main className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Carregando...</p>
        </main>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <main className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Contrato não encontrado.</p>
        </main>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Consulta
          </Button>
        </Link>

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Contrato {contract.contract_number}
            </h1>
            <p className="text-muted-foreground">GMS: {contract.gms_number}</p>
          </div>
          <StatusBadge status={contract.status} />
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Modalidade</p>
                  <p className="text-foreground">{contract.modality}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nº do Processo</p>
                  <p className="text-foreground">{contract.process_number}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Objeto do Contrato</p>
                <p className="text-foreground">{contract.object}</p>
              </div>

              <Separator />

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor Contratual</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(contract.contract_value)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Início da Vigência</p>
                  <p className="text-foreground">{formatDate(contract.start_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fim da Vigência</p>
                  <p className="text-foreground">{formatDate(contract.end_date)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Cláusula de Prorrogação</p>
                <p className="text-foreground">{contract.has_extension_clause ? 'Sim' : 'Não'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Empresa Contratada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-foreground">{contract.contracted_company}</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestão do Contrato
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome do Gestor</p>
                  <p className="text-foreground">{contract.manager_name || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-foreground">{contract.manager_email || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nomeação</p>
                  <p className="text-foreground">{contract.manager_nomination || 'Não informado'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Fiscalização do Contrato
                </CardTitle>
              </CardHeader>
              <CardContent>
                {supervisors.length > 0 ? (
                  <div className="space-y-4">
                    {supervisors.map((supervisor, index) => (
                      <div key={supervisor.id} className={index > 0 ? 'pt-4 border-t' : ''}>
                        <div className="grid gap-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Nome do Fiscal {supervisors.length > 1 ? `#${index + 1}` : ''}</p>
                            <p className="text-foreground">{supervisor.supervisor_name}</p>
                          </div>
                          {supervisor.supervisor_email && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Email</p>
                              <p className="text-foreground">{supervisor.supervisor_email}</p>
                            </div>
                          )}
                          {supervisor.supervisor_nomination && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Nomeação</p>
                              <p className="text-foreground">{supervisor.supervisor_nomination}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum fiscal cadastrado</p>
                )}
              </CardContent>
            </Card>
          </div>

          {amendments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Aditivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {amendments.map((amendment, index) => (
                    <div key={amendment.id} className="border-l-4 border-primary pl-4">
                      <p className="font-medium text-foreground">{index + 1}º Aditivo - {amendment.amendment_type}</p>
                      {amendment.new_value && (
                        <p className="text-sm text-muted-foreground">
                          Novo Valor: {formatCurrency(amendment.new_value)}
                        </p>
                      )}
                      {amendment.new_end_date && (
                        <p className="text-sm text-muted-foreground">
                          Nova Data de Término: {formatDate(amendment.new_end_date)}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Processo: {amendment.process_number}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {endorsements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Apostilamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {endorsements.map((endorsement, index) => (
                    <div key={endorsement.id} className="border-l-4 border-secondary pl-4">
                      <p className="font-medium text-foreground">{index + 1}º Apostilamento - {endorsement.endorsement_type}</p>
                      {endorsement.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {endorsement.description}
                        </p>
                      )}
                      {endorsement.new_value && (
                        <p className="text-sm text-muted-foreground">
                          Novo Valor: {formatCurrency(endorsement.new_value)}
                        </p>
                      )}
                      {endorsement.new_execution_date && (
                        <p className="text-sm text-muted-foreground">
                          Nova Data de Execução: {formatDate(endorsement.new_execution_date)}
                        </p>
                      )}
                      {endorsement.adjustment_index && (
                        <p className="text-sm text-muted-foreground">
                          Índice de Reajuste: {endorsement.adjustment_index}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Processo: {endorsement.process_number}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ContractDetails;

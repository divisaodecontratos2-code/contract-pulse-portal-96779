import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Contract } from '@/types/contract';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpiringContractsList } from '@/components/ExpiringContractsList';

// Helper function to calculate future date string (YYYY-MM-DD)
const getDateInDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [expiring90, setExpiring90] = useState<Contract[]>([]);
  const [expiring60, setExpiring60] = useState<Contract[]>([]);
  const [expiring45, setExpiring45] = useState<Contract[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchExpiringContracts();
    }
  }, [user]);

  const fetchExpiringContracts = async () => {
    setLoadingContracts(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Define date boundaries
      const date45 = getDateInDays(45);
      const date46 = getDateInDays(46);
      const date60 = getDateInDays(60);
      const date61 = getDateInDays(61);
      const date90 = getDateInDays(90);

      // 1. Contracts expiring within 45 days [Today, 45 days]
      const { data: data45, error: error45 } = await supabase
        .from('contracts')
        .select('*')
        .eq('status', 'Vigente')
        .gte('end_date', today)
        .lte('end_date', date45)
        .order('end_date', { ascending: true });
      
      if (error45) throw error45;
      setExpiring45(data45 as Contract[] || []);

      // 2. Contracts expiring between 46 and 60 days (45 days, 60 days]
      const { data: data60_range, error: error60_range } = await supabase
        .from('contracts')
        .select('*')
        .eq('status', 'Vigente')
        .gte('end_date', date46)
        .lte('end_date', date60)
        .order('end_date', { ascending: true });
      
      if (error60_range) throw error60_range;
      setExpiring60(data60_range as Contract[] || []);

      // 3. Contracts expiring between 61 and 90 days (60 days, 90 days]
      const { data: data90_range, error: error90_range } = await supabase
        .from('contracts')
        .select('*')
        .eq('status', 'Vigente')
        .gte('end_date', date61)
        .lte('end_date', date90)
        .order('end_date', { ascending: true });
      
      if (error90_range) throw error90_range;
      setExpiring90(data90_range as Contract[] || []);

    } catch (error) {
      console.error('Erro ao buscar contratos vencendo:', error);
    } finally {
      setLoadingContracts(false);
    }
  };

  const expiringGroups = [
    {
      title: `Vencem em até 45 dias (Ação Urgente)`,
      icon: AlertCircle,
      color: 'text-destructive',
      contracts: expiring45,
      value: 'item-1',
    },
    {
      title: `Vencem entre 46 e 60 dias (Atenção)`,
      icon: Clock,
      color: 'text-warning',
      contracts: expiring60,
      value: 'item-2',
    },
    {
      title: `Vencem entre 61 e 90 dias (Planejamento)`,
      icon: Calendar,
      color: 'text-primary',
      contracts: expiring90,
      value: 'item-3',
    },
  ];

  if (loading || loadingContracts) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Dashboard de Contratos</h1>
          <p className="text-muted-foreground">Carregando dados de vencimento...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard de Contratos</h1>
          <p className="text-muted-foreground">Acompanhe os contratos próximos do vencimento para tomada de decisão.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contratos Próximos ao Vencimento</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {expiringGroups.map((group) => {
                const Icon = group.icon;
                return (
                  <AccordionItem key={group.value} value={group.value}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${group.color}`} />
                        <span className="font-semibold">{group.title} ({group.contracts.length})</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ExpiringContractsList contracts={group.contracts} />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
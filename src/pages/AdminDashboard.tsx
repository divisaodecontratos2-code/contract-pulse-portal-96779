import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, AlertCircle, Clock } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [expiring90, setExpiring90] = useState(0);
  const [expiring60, setExpiring60] = useState(0);
  const [expiring45, setExpiring45] = useState(0);

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
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 90 days
      const date90 = new Date();
      date90.setDate(date90.getDate() + 90);
      const { count: count90 } = await supabase
        .from('contracts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Vigente')
        .gte('end_date', today)
        .lte('end_date', date90.toISOString().split('T')[0]);
      setExpiring90(count90 || 0);

      // 60 days
      const date60 = new Date();
      date60.setDate(date60.getDate() + 60);
      const { count: count60 } = await supabase
        .from('contracts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Vigente')
        .gte('end_date', today)
        .lte('end_date', date60.toISOString().split('T')[0]);
      setExpiring60(count60 || 0);

      // 45 days
      const date45 = new Date();
      date45.setDate(date45.getDate() + 45);
      const { count: count45 } = await supabase
        .from('contracts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Vigente')
        .gte('end_date', today)
        .lte('end_date', date45.toISOString().split('T')[0]);
      setExpiring45(count45 || 0);
    } catch (error) {
      console.error('Erro ao buscar vencimentos:', error);
    }
  };

  const kpis = [
    {
      title: 'Vencem em 90 dias',
      value: expiring90,
      icon: Calendar,
      description: 'Contratos próximos ao vencimento',
      color: 'text-primary',
    },
    {
      title: 'Vencem em 60 dias',
      value: expiring60,
      icon: Clock,
      description: 'Atenção necessária',
      color: 'text-warning',
    },
    {
      title: 'Vencem em 45 dias',
      value: expiring45,
      icon: AlertCircle,
      description: 'Ação urgente requerida',
      color: 'text-destructive',
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard de Contratos</h1>
          <p className="text-muted-foreground">Acompanhe os vencimentos e gerencie contratos</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                  <Icon className={cn('h-5 w-5', kpi.color)} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{kpi.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

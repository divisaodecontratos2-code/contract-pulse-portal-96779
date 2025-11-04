import { Building2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const PublicNavbar = () => {
  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Portal de Contratos</h1>
              <p className="text-sm text-muted-foreground">UENP - Universidade Estadual do Norte do Paraná</p>
            </div>
          </Link>
          <Link to="/auth">
            <Button variant="outline" size="sm">
              <Lock className="mr-2 h-4 w-4" />
              Acesso Administrativo
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

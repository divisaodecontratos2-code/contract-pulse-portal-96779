import { Contract } from '@/types/contract';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExpiringContractsListProps {
  contracts: Contract[];
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR');
};

export const ExpiringContractsList = ({ contracts }: ExpiringContractsListProps) => {
  if (contracts.length === 0) {
    return <p className="text-center text-muted-foreground py-4">Nenhum contrato encontrado neste período.</p>;
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nº Contrato</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Fim Vigência</TableHead>
            <TableHead>Cláusula Renovação</TableHead>
            <TableHead className="text-right">Detalhes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow key={contract.id}>
              <TableCell className="font-medium">{contract.contract_number}</TableCell>
              <TableCell>{contract.contracted_company}</TableCell>
              <TableCell>{formatDate(contract.end_date)}</TableCell>
              <TableCell>
                <Badge 
                  className={contract.has_extension_clause ? 'bg-success text-success-foreground hover:bg-success/90' : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'}
                >
                  {contract.has_extension_clause ? 'Sim' : 'Não'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Link to={`/contratos/${contract.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from './StatusBadge';
import { Contract } from '@/types/contract';

interface ContractTableProps {
  contracts: Contract[];
}

export const ContractTable = ({ contracts }: ContractTableProps) => {
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
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Nº Contrato</TableHead>
            <TableHead>Objeto</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Fim Vigência</TableHead>
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
              <TableCell>{formatDate(contract.end_date)}</TableCell>
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

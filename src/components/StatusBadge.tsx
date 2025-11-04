import { Badge } from '@/components/ui/badge';
import { ContractStatus } from '@/types/contract';

interface StatusBadgeProps {
  status: ContractStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const variants: Record<ContractStatus, { className: string }> = {
    'Vigente': { className: 'bg-success text-success-foreground hover:bg-success/90' },
    'Prorrogado': { className: 'bg-primary text-primary-foreground hover:bg-primary/90' },
    'Encerrado': { className: 'bg-muted text-muted-foreground hover:bg-muted/90' },
    'Rescindido': { className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90' },
  };

  return (
    <Badge className={variants[status].className}>
      {status}
    </Badge>
  );
};

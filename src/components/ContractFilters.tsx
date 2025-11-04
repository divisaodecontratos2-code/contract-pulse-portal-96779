import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContractStatus, Modality } from '@/types/contract';

interface ContractFiltersProps {
  onApplyFilters: (filters: FilterState) => void;
}

export interface FilterState {
  status?: ContractStatus;
  modality?: Modality;
  startDate?: string;
}

export const ContractFilters = ({ onApplyFilters }: ContractFiltersProps) => {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});

  const handleApply = () => {
    onApplyFilters(filters);
    setOpen(false);
  };

  const handleClear = () => {
    setFilters({});
    onApplyFilters({});
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filtros Avançados
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filtros Avançados</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value as ContractStatus })}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vigente">Vigente</SelectItem>
                <SelectItem value="Rescindido">Rescindido</SelectItem>
                <SelectItem value="Encerrado">Encerrado</SelectItem>
                <SelectItem value="Prorrogado">Prorrogado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="modality">Modalidade</Label>
            <Select
              value={filters.modality}
              onValueChange={(value) => setFilters({ ...filters, modality: value as Modality })}
            >
              <SelectTrigger id="modality">
                <SelectValue placeholder="Selecione a modalidade" />
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

          <div className="grid gap-2">
            <Label htmlFor="startDate">Início da Vigência</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleClear}>
            <X className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
          <Button onClick={handleApply}>Aplicar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

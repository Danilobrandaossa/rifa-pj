'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ticket, Reseller, Raffle } from '@/types';
import { useRaffle } from '@/contexts/RaffleContext';

interface NewSaleModalProps {
  raffles: Raffle[];
  resellers: Reseller[];
  ticketsSample: Ticket[]; // used to select numbers quickly in MVP
}

export function NewSaleModal({ raffles, resellers, ticketsSample }: NewSaleModalProps) {
  const { updateTicketStatus } = useRaffle();
  const [open, setOpen] = useState(false);
  const [raffleId, setRaffleId] = useState<string>(raffles[0]?.id ?? '');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [resellerId, setResellerId] = useState<string | undefined>(undefined);
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);

  const rafflePrice = useMemo(() => {
    return raffles.find(r => r.id === raffleId)?.price ?? 0;
  }, [raffles, raffleId]);

  const commissionRate = useMemo(() => {
    return resellers.find(r => r.id === resellerId)?.commissionRate ?? 0;
  }, [resellers, resellerId]);

  const totalAmount = useMemo(() => selectedNumbers.length * rafflePrice, [selectedNumbers, rafflePrice]);
  const commission = useMemo(() => (totalAmount * commissionRate) / 100, [totalAmount, commissionRate]);

  const quickSelect = (count: number) => {
    const avail = ticketsSample.filter(t => t.status === 'available').slice(0, count);
    setSelectedNumbers(avail.map(t => t.number));
  };

  const clearSelection = () => setSelectedNumbers([]);

  const handleConfirm = () => {
    if (selectedNumbers.length === 0) return;
    
    // In a real app we would pass buyer info too, but updateTicketStatus currently only takes status/reseller
    // We would need to update context to accept buyer info or just rely on the 'sold' status trigger in context 
    // which creates a generic sale record.
    // For now, let's just trigger the sale.
    updateTicketStatus(selectedNumbers, 'sold', resellerId);
    
    setOpen(false);
    setBuyerName('');
    setBuyerPhone('');
    setSelectedNumbers([]);
    setResellerId(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
          Registrar Venda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nova Venda</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="raffle">Rifa</Label>
              <Select value={raffleId} onValueChange={setRaffleId}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Selecione a rifa" />
                </SelectTrigger>
                <SelectContent>
                  {raffles.map(r => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.title} • R$ {r.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reseller">Revendedor (opcional)</Label>
              <Select value={resellerId ?? ''} onValueChange={(v) => setResellerId(v || undefined)}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {resellers.map(r => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} • Comissão {r.commissionRate}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cliente</Label>
              <Input placeholder="Nome do comprador" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input placeholder="(00) 00000-0000" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} className="mt-1" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Seleção rápida de números</Label>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => quickSelect(5)}>+5</Button>
              <Button variant="secondary" onClick={() => quickSelect(10)}>+10</Button>
              <Button variant="secondary" onClick={() => quickSelect(20)}>+20</Button>
              <Button variant="ghost" onClick={clearSelection}>Limpar</Button>
            </div>
            <div className="min-h-10 rounded-md border p-2 text-sm">
              {selectedNumbers.length > 0 ? selectedNumbers.join(', ') : 'Nenhum número selecionado.'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border rounded-md p-3">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Valor do bilhete</div>
              <div className="text-lg font-semibold">R$ {rafflePrice.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-lg font-semibold">R$ {totalAmount.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Comissão ({commissionRate}%)</div>
              <div className="text-lg font-semibold">R$ {commission.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Liquido</div>
              <div className="text-lg font-semibold">R$ {(totalAmount - commission).toFixed(2)}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button disabled={!buyerName || selectedNumbers.length === 0} onClick={handleConfirm}>Confirmar Venda</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

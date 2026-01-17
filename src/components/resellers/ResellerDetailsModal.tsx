'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Reseller } from '@/types';
import { useRaffle } from '@/contexts/RaffleContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Copy, Plus, X } from 'lucide-react';

interface ResellerDetailsModalProps {
  reseller: Reseller;
  isOpen: boolean;
  onClose: () => void;
}

export function ResellerDetailsModal({ reseller, isOpen, onClose }: ResellerDetailsModalProps) {
  const { 
    raffles, 
    tickets, 
    updateReseller, 
    assignTicketsToReseller, 
    revokeTicketsFromReseller, 
    cloneAllocations 
  } = useRaffle();

  const [activeTab, setActiveTab] = useState('details');
  const [editName, setEditName] = useState(reseller.name);
  const [editPhone, setEditPhone] = useState(reseller.phone || '');
  const [editPixKey, setEditPixKey] = useState(reseller.pixKey || '');
  const [editCommission, setEditCommission] = useState(String(reseller.commissionRate));

  // State for ticket assignment
  const [selectedRaffleId, setSelectedRaffleId] = useState<string>('');
  const [ticketInput, setTicketInput] = useState('');

  // State for cloning
  const [targetRaffleId, setTargetRaffleId] = useState<string>('');

  const handleSaveDetails = () => {
    updateReseller(reseller.id, {
      name: editName,
      phone: editPhone,
      pixKey: editPixKey,
      commissionRate: Number(editCommission),
    });
    alert('Dados atualizados com sucesso!');
  };

  const handleAssignTickets = () => {
    if (!selectedRaffleId || !ticketInput.trim()) return;

    const numbers: string[] = [];
    const parts = ticketInput.split(',');

    parts.forEach(part => {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(s => parseInt(s.trim()));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            numbers.push(i.toString().padStart(4, '0'));
          }
        }
      } else {
        const num = part.trim();
        if (num) numbers.push(num.padStart(4, '0'));
      }
    });

    assignTicketsToReseller(selectedRaffleId, reseller.id, numbers);
    setTicketInput('');
    alert('Bilhetes atribuídos com sucesso!');
  };

  const handleRevokeTickets = (raffleId: string, numbers: string[]) => {
    if (confirm(`Deseja remover ${numbers.length} bilhetes deste revendedor?`)) {
        revokeTicketsFromReseller(raffleId, reseller.id, numbers);
    }
  };

  const handleCloneAllocations = () => {
      if (!targetRaffleId || !selectedRaffleId) return;
      cloneAllocations(selectedRaffleId, targetRaffleId, reseller.id);
      alert('Alocações replicadas com sucesso!');
  };

  // Group tickets by raffle
  const ticketsByRaffle = raffles.map(raffle => {
    const resellerTickets = tickets.filter(t => t.resellerId === reseller.id && t.raffleId === raffle.id);
    return {
        raffle,
        tickets: resellerTickets,
        count: resellerTickets.length,
        soldCount: resellerTickets.filter(t => t.status === 'sold').length,
        reservedCount: resellerTickets.filter(t => t.status === 'reserved').length
    };
  }).filter(group => group.count > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Revendedor: {reseller.name}</DialogTitle>
          <DialogDescription>Gerencie dados, bilhetes e alocações.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Dados Cadastrais</TabsTrigger>
            <TabsTrigger value="tickets">Bilhetes e Alocações</TabsTrigger>
            <TabsTrigger value="actions">Ações Avançadas</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              </div>
              <div>
                <Label>Chave Pix</Label>
                <Input value={editPixKey} onChange={(e) => setEditPixKey(e.target.value)} />
              </div>
              <div>
                <Label>Comissão (%)</Label>
                <Input type="number" value={editCommission} onChange={(e) => setEditCommission(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleSaveDetails}>Salvar Alterações</Button>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
             <div className="space-y-4">
                <h3 className="text-lg font-medium">Atribuir Novos Bilhetes</h3>
                <div className="flex gap-2 items-end">
                    <div className="w-1/3">
                        <Label>Rifa</Label>
                        <Select value={selectedRaffleId} onValueChange={setSelectedRaffleId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a rifa" />
                            </SelectTrigger>
                            <SelectContent>
                                {raffles.map(r => (
                                    <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1">
                        <Label>Bilhetes (ex: 1,2,3 ou 10-20)</Label>
                        <Input value={ticketInput} onChange={(e) => setTicketInput(e.target.value)} placeholder="Digite os números..." />
                    </div>
                    <Button onClick={handleAssignTickets}><Plus className="mr-2 h-4 w-4" /> Adicionar</Button>
                </div>
             </div>

             <div className="space-y-4">
                <h3 className="text-lg font-medium">Bilhetes Alocados por Rifa</h3>
                {ticketsByRaffle.length === 0 ? (
                    <p className="text-muted-foreground">Este revendedor não possui bilhetes alocados.</p>
                ) : (
                    ticketsByRaffle.map(({ raffle, tickets, count, soldCount, reservedCount }) => (
                        <Card key={raffle.id}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex justify-between">
                                    <span>{raffle.title}</span>
                                    <Badge variant="outline">{count} bilhetes</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4 text-sm mb-4">
                                    <span className="text-green-600 font-medium">Vendidos: {soldCount}</span>
                                    <span className="text-yellow-600 font-medium">Reservados: {reservedCount}</span>
                                </div>
                                <ScrollArea className="h-32 rounded border p-2">
                                    <div className="flex flex-wrap gap-2">
                                        {tickets.map(t => (
                                            <Badge 
                                                key={t.number} 
                                                variant={t.status === 'sold' ? 'default' : 'secondary'}
                                                className={`cursor-pointer ${t.status === 'sold' ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
                                                onClick={() => {
                                                    if (t.status === 'reserved') {
                                                        handleRevokeTickets(raffle.id, [t.number]);
                                                    } else {
                                                        alert('Bilhetes vendidos não podem ser removidos aqui.');
                                                    }
                                                }}
                                            >
                                                {t.number}
                                                {t.status === 'reserved' && <X className="ml-1 h-3 w-3" />}
                                            </Badge>
                                        ))}
                                    </div>
                                </ScrollArea>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    Clique no X de um bilhete reservado para removê-lo do revendedor.
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
             </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
             <Card>
                 <CardHeader><CardTitle>Replicar Alocações</CardTitle></CardHeader>
                 <CardContent className="space-y-4">
                     <p className="text-sm text-muted-foreground">
                         Copie os números reservados deste revendedor em uma rifa para outra rifa (apenas números disponíveis na rifa destino).
                     </p>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <Label>Rifa de Origem</Label>
                             <Select value={selectedRaffleId} onValueChange={setSelectedRaffleId}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    {raffles.map(r => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
                                </SelectContent>
                             </Select>
                         </div>
                         <div>
                             <Label>Rifa de Destino</Label>
                             <Select value={targetRaffleId} onValueChange={setTargetRaffleId}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    {raffles.filter(r => r.id !== selectedRaffleId).map(r => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
                                </SelectContent>
                             </Select>
                         </div>
                     </div>
                     <Button onClick={handleCloneAllocations} className="w-full">
                         <Copy className="mr-2 h-4 w-4" /> Replicar Alocações
                     </Button>
                 </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
        <DialogFooter>
            <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

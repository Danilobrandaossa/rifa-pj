'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TicketGrid } from '@/components/raffles/TicketGrid';
import { ArrowLeft, Printer, Eye, Share2, Edit, Trash2, Ticket as TicketIcon } from 'lucide-react';
import Link from 'next/link';
import { NewSaleModal } from '@/components/sales/NewSaleModal';
import { ResellersTable } from '@/components/resellers/ResellersTable';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useRaffle } from '@/contexts/RaffleContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useParams } from 'next/navigation';

export default function RaffleDetailsPage() {
  const { tickets, raffles, resellers, updateTicketStatus, getFinancialStats, generateTicketsForRaffle } = useRaffle();
  const params = useParams();
  const routeId = params?.id as string | undefined;

  // Reservation Form State
  const [reservationResellerId, setReservationResellerId] = useState<string>('');
  const [reservationInput, setReservationInput] = useState<string>('');

  // Grid Reservation State
  const [isReserveDialogOpen, setIsReserveDialogOpen] = useState(false);
  const [selectedTicketsForReserve, setSelectedTicketsForReserve] = useState<string[]>([]);
  const [gridResellerId, setGridResellerId] = useState<string>('');

  const currentRaffle = raffles.find((r) => r.id === routeId) || raffles[0];
  const raffleTickets = currentRaffle ? tickets.filter((t) => t.raffleId === currentRaffle.id) : [];

  // Financial Calculations
  const financialStats = useMemo(() => getFinancialStats(currentRaffle?.id || '1'), [currentRaffle, getFinancialStats]);

  const handleReserveTickets = () => {
      if (!reservationResellerId) {
          alert("Selecione um revendedor.");
          return;
      }
      if (!reservationInput.trim()) {
          alert("Informe os números dos bilhetes.");
          return;
      }

      const numbersToReserve: string[] = [];
      const parts = reservationInput.split(',');

      parts.forEach(part => {
          if (part.includes('-')) {
              const [start, end] = part.split('-').map(s => parseInt(s.trim()));
              if (!isNaN(start) && !isNaN(end) && start <= end) {
                  for (let i = start; i <= end; i++) {
                      numbersToReserve.push(i.toString().padStart(4, '0'));
                  }
              }
          } else {
              const num = part.trim();
              if (num) numbersToReserve.push(num.padStart(4, '0'));
          }
      });

      const validNumbers = numbersToReserve.filter(n => {
          const ticket = tickets.find(t => t.number === n);
          return ticket && ticket.status === 'available';
      });

      if (validNumbers.length === 0) {
          alert("Nenhum bilhete válido ou disponível encontrado para reserva.");
          return;
      }

      updateTicketStatus(validNumbers, 'reserved', reservationResellerId);

      alert(`${validNumbers.length} bilhetes reservados com sucesso para o revendedor.`);
      setReservationInput('');
  };

  const openReserveDialog = (selected: string[]) => {
    setSelectedTicketsForReserve(selected);
    setIsReserveDialogOpen(true);
  };

  const handleConfirmReserveFromGrid = () => {
    if (!gridResellerId) {
      alert("Selecione um revendedor.");
      return;
    }
    updateTicketStatus(selectedTicketsForReserve, 'reserved', gridResellerId);
    setIsReserveDialogOpen(false);
    setGridResellerId('');
    setSelectedTicketsForReserve([]);
    alert(`${selectedTicketsForReserve.length} bilhetes reservados com sucesso.`);
  };

  const handleGenerateTickets = () => {
    if (!currentRaffle) return;
    if (raffleTickets.length > 0) {
      alert('Os bilhetes desta rifa já foram gerados.');
      return;
    }
    generateTicketsForRaffle(currentRaffle.id);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
           <Link href="/rifas">
             <Button variant="ghost" size="icon">
               <ArrowLeft className="h-4 w-4" />
             </Button>
           </Link>
           <div>
             <h2 className="text-2xl font-bold tracking-tight">A&A premiações Bros 160</h2>
             <p className="text-muted-foreground text-sm">(Milhar) 0000 à 9999</p>
           </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleGenerateTickets}
          >
            Gerar Bilhetes
          </Button>
          <Link href="/rifas/1/imprimir">
            <Button variant="secondary" size="sm">
              <Printer className="mr-2 h-4 w-4" /> Imprimir Bilhetes
            </Button>
          </Link>
           <Button
             variant="secondary"
             size="sm"
             onClick={() => alert('Visualização dedicada de bilhetes ainda não foi implementada.')}
           >
             <Eye className="mr-2 h-4 w-4" /> Ver Bilhetes
           </Button>
          <NewSaleModal raffles={raffles} resellers={resellers} ticketsSample={tickets} />
           <Button
             variant="outline"
             size="sm"
             className="text-green-600 border-green-600 hover:bg-green-50"
             onClick={() => alert('Envio automático para revendedor ainda não foi implementado.')}
           >
             <Share2 className="mr-2 h-4 w-4" /> Enviar para Revendedor
           </Button>
           <Button
             variant="outline"
             size="sm"
             onClick={() => alert('Edição de dados da rifa ainda não foi implementada.')}
           >
             <Edit className="mr-2 h-4 w-4" /> Editar
           </Button>
           <Button
             variant="destructive"
             size="sm"
             onClick={() => alert('Exclusão de rifa ainda não foi implementada.')}
           >
             <Trash2 className="mr-2 h-4 w-4" /> Excluir
           </Button>
        </div>
      </div>

      {/* Main Banner Card */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none">
        <CardContent className="p-6">
           <div className="flex justify-between items-start">
              <div>
                 <h3 className="text-xl font-bold">A&A premiações Bros 160</h3>
                 <p className="text-slate-300 text-sm mt-1">(Milhar) 0000 à 9999</p>
                 <div className="flex gap-4 mt-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">📅 Sorteio: 06/03/2026</span>
                    <span className="flex items-center gap-1">🎟️ {financialStats.soldCount} de {currentRaffle.totalTickets} bilhetes vendidos</span>
                    <span className="flex items-center gap-1">🕒 Criado: 08/01/2026</span>
                 </div>
              </div>
              <div className="text-right">
                 <Badge className="bg-green-500 hover:bg-green-600 mb-2">Ativa</Badge>
                 <div className="text-2xl font-bold">R$ 10,00</div>
              </div>
           </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="tickets">Bilhetes</TabsTrigger>
          <TabsTrigger value="financial">Caixa</TabsTrigger>
          <TabsTrigger value="resellers">Revendedores</TabsTrigger>
          <TabsTrigger value="reservation">Reserva de Bilhetes</TabsTrigger>
          <TabsTrigger value="regulation">Regulamento</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
             <CardHeader><CardTitle>Informações Gerais</CardTitle></CardHeader>
             <CardContent>Conteúdo de informações...</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Bilhetes</CardTitle>
            </CardHeader>
            <CardContent>
               {raffleTickets.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                    <div className="bg-slate-100 p-4 rounded-full">
                        <TicketIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">Nenhum bilhete gerado</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            Para visualizar e gerenciar os bilhetes (0000-9999), você precisa gerar a estrutura de blocos primeiro.
                        </p>
                    </div>
                    <Button onClick={handleGenerateTickets} size="lg" className="mt-4">
                        Gerar 10.000 Bilhetes
                    </Button>
                 </div>
               ) : (
                 <TicketGrid 
                   tickets={raffleTickets} 
                   onSelectionChange={(selected) => console.log('Selected:', selected)} 
                   onReserve={openReserveDialog}
                 />
               )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
           <Card>
             <CardHeader><CardTitle>Dashboard Financeiro</CardTitle></CardHeader>
             <CardContent>
               <div className="grid gap-4 md:grid-cols-4">
                 <div className="rounded-lg border p-4">
                   <div className="text-sm text-muted-foreground">Valor Total</div>
                   <div className="text-2xl font-bold">R$ 100.000,00</div>
                 </div>
                 <div className="rounded-lg border p-4">
                   <div className="text-sm text-muted-foreground">Vendas Totais</div>
                   <div className="text-2xl font-bold">0 bilhetes</div>
                 </div>
                 <div className="rounded-lg border p-4">
                   <div className="text-sm text-muted-foreground">Comissões</div>
                   <div className="text-2xl font-bold">R$ 1.500,00</div>
                 </div>
                 <div className="rounded-lg border p-4">
                   <div className="text-sm text-muted-foreground">Lucro Estimado</div>
                   <div className="text-2xl font-bold">R$ 3.250,00</div>
                 </div>
               </div>
               <div className="mt-4 text-sm text-muted-foreground">Resumo financeiro e gráficos podem ser conectados ao backend posteriormente.</div>
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resellers" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Revendedores</CardTitle></CardHeader>
            <CardContent>
              <ResellersTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reservation" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Reserva de Bilhetes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Selecione o Revendedor</Label>
                <Select value={reservationResellerId} onValueChange={setReservationResellerId}>
                  <SelectTrigger className="mt-1 w-[280px]">
                    <SelectValue placeholder="Selecione um revendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {resellers.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name} ({r.commissionRate}%)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Números dos Bilhetes</Label>
                <Input 
                    className="mt-1" 
                    placeholder="Ex: 1,2,3 ou 1-10,20-30" 
                    value={reservationInput}
                    onChange={(e) => setReservationInput(e.target.value)}
                />
                <p className="text-muted-foreground text-xs mt-1">Informe números individuais separados por vírgula ou intervalos (ex: 1-50).</p>
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleReserveTickets}
              >
                Reservar Bilhetes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="regulation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regulamento da Rifa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none whitespace-pre-wrap text-sm text-muted-foreground">
                {currentRaffle?.regulation && currentRaffle.regulation.trim().length > 0
                  ? currentRaffle.regulation
                  : "Nenhum regulamento cadastrado para esta rifa."}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Outras tabs... */}
      </Tabs>

      <Dialog open={isReserveDialogOpen} onOpenChange={setIsReserveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Reserva</DialogTitle>
            <DialogDescription>
              Você está prestes a reservar {selectedTicketsForReserve.length} bilhetes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Selecione o Revendedor</Label>
            <Select value={gridResellerId} onValueChange={setGridResellerId}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Selecione um revendedor" />
              </SelectTrigger>
              <SelectContent>
                {resellers.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name} ({r.commissionRate}%)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReserveDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmReserveFromGrid}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

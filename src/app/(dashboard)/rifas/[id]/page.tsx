'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TicketGrid } from '@/components/raffles/TicketGrid';
import { ArrowLeft, Printer, Eye, Share2, Edit, Trash2, Ticket as TicketIcon, FileText } from 'lucide-react';
import Link from 'next/link';
import { NewSaleModal } from '@/components/sales/NewSaleModal';
import { ResellersTable } from '@/components/resellers/ResellersTable';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useRaffle } from '@/contexts/RaffleContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function RaffleDetailsPage() {
  const { tickets, raffles, resellers, updateTicketStatus, getFinancialStats, generateTicketsForRaffle, regenerateTicketsForRaffle, updateRaffle, clearRaffleTickets, exportTicketsToPdf } = useRaffle();
  const params = useParams();
  const routeId = params?.id as string | undefined;

  const currentRaffle = raffles.find((r) => r.id === routeId) || raffles[0];
  const raffleTickets = currentRaffle ? tickets.filter((t) => t.raffleId === currentRaffle.id) : [];
  const hasSales = raffleTickets.some(t => t.status === 'sold');
  const hasReserved = raffleTickets.some(t => t.status === 'reserved');

  const handleClearTickets = () => {
      if (!currentRaffle) return;
      if (hasSales) {
          alert("Não é possível excluir bilhetes pois já existem vendas realizadas.");
          return;
      }
      if (confirm('Tem certeza que deseja apagar todos os bilhetes desta rifa? Esta ação é irreversível.')) {
          clearRaffleTickets(currentRaffle.id);
      }
  };

  const [activeTab, setActiveTab] = useState('tickets');

  // Reservation Form State
  const [reservationResellerId, setReservationResellerId] = useState<string>('');
  const [reservationInput, setReservationInput] = useState<string>('');

  // Grid Reservation State
  const [isReserveDialogOpen, setIsReserveDialogOpen] = useState(false);
  const [selectedTicketsForReserve, setSelectedTicketsForReserve] = useState<string[]>([]);
  const [gridResellerId, setGridResellerId] = useState<string>('');

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(currentRaffle?.title ?? '');
  const [editPrice, setEditPrice] = useState<string>(currentRaffle ? String(currentRaffle.price) : '');
  const [editDrawDate, setEditDrawDate] = useState<string>(
    currentRaffle?.drawDate ? currentRaffle.drawDate.slice(0, 10) : ''
  );
  const [editRegulation, setEditRegulation] = useState(currentRaffle?.regulation ?? '');

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

      updateTicketStatus(currentRaffle.id, validNumbers, 'reserved', reservationResellerId);

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
    updateTicketStatus(currentRaffle.id, selectedTicketsForReserve, 'reserved', gridResellerId);
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

  const handleRegenerateTickets = () => {
    if (!currentRaffle) return;
    if (!confirm('Regenerar os bilhetes desta rifa? Só é permitido se não houver reservas ou vendas.')) {
      return;
    }
    const success = regenerateTicketsForRaffle(currentRaffle.id);
    if (!success) {
      alert('Não foi possível regenerar: já existem bilhetes reservados ou vendidos.');
      return;
    }
    alert('Bilhetes regenerados com sucesso em ordem aleatória.');
  };

  // Image Upload State
  const [editImageUrl, setEditImageUrl] = useState<string>('');
  const [editBgUrl, setEditBgUrl] = useState<string>('');

  const handleOpenEditDialog = () => {
    if (!currentRaffle) return;
    setEditTitle(currentRaffle.title);
    setEditPrice(String(currentRaffle.price));
    setEditDrawDate(currentRaffle.drawDate ? currentRaffle.drawDate.slice(0, 10) : '');
    setEditRegulation(currentRaffle.regulation ?? '');
    setEditImageUrl(currentRaffle.imageUrl ?? '');
    setEditBgUrl(currentRaffle.ticketBackgroundUrl ?? '');
    setIsEditDialogOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveRaffleEdits = () => {
    if (!currentRaffle) return;
    updateRaffle(currentRaffle.id, {
      title: editTitle.trim() || currentRaffle.title,
      price: Number(editPrice) || currentRaffle.price,
      drawDate: editDrawDate ? new Date(editDrawDate).toISOString() : currentRaffle.drawDate,
      regulation: editRegulation,
      imageUrl: editImageUrl || undefined,
      ticketBackgroundUrl: editBgUrl || undefined,
    });
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
           <Link href="/rifas">
             <Button variant="ghost" size="icon" className="md:size-9">
               <ArrowLeft className="h-4 w-4" />
             </Button>
           </Link>
           <div>
             <h2 className="text-xl md:text-2xl font-bold tracking-tight line-clamp-2">{currentRaffle?.title}</h2>
             <p className="text-muted-foreground text-xs md:text-sm">({currentRaffle?.modality === 'ten_thousand' ? '0000-9999' : currentRaffle?.modality})</p>
           </div>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          {raffleTickets.length === 0 ? (
            <Button
                variant="default"
                size="sm"
                className="w-full sm:w-auto"
                onClick={handleGenerateTickets}
            >
                Gerar Bilhetes
            </Button>
          ) : !hasSales ? (
            <Button
                variant="destructive"
                size="sm"
                className="w-full sm:w-auto"
                onClick={handleClearTickets}
            >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir Bilhetes
            </Button>
          ) : null}
          <Link href={`/rifas/${currentRaffle.id}/imprimir`}>
            <Button variant="secondary" size="sm" className="w-full sm:w-auto">
              <Printer className="mr-2 h-4 w-4" /> Imprimir Bilhetes
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => exportTicketsToPdf(currentRaffle.id)}
          >
            <FileText className="mr-2 h-4 w-4" /> Exportar PDF
          </Button>
          <Button
             variant="secondary"
             size="sm"
             className="w-full sm:w-auto"
             onClick={() => setActiveTab('tickets')}
           >
             <Eye className="mr-2 h-4 w-4" /> Ver Bilhetes
           </Button>
          <NewSaleModal raffles={raffles} resellers={resellers} ticketsSample={tickets} />
           <Button
             variant="outline"
             size="sm"
             className="w-full sm:w-auto text-green-600 border-green-600 hover:bg-green-50"
             onClick={() => setActiveTab('reservation')}
           >
             <Share2 className="mr-2 h-4 w-4" /> Enviar para Revendedor
           </Button>
           <Button
             variant="outline"
             size="sm"
             className="w-full sm:w-auto"
             onClick={handleOpenEditDialog}
           >
             <Edit className="mr-2 h-4 w-4" /> Editar
           </Button>
           <Button
             variant="destructive"
             size="sm"
             className="w-full sm:w-auto"
             onClick={() => alert('Exclusão de rifa ainda não foi implementada.')}
           >
             <Trash2 className="mr-2 h-4 w-4" /> Excluir
           </Button>
        </div>
      </div>

      {/* Main Banner */}
      {currentRaffle?.imageUrl ? (
        <div className="relative w-full h-48 md:h-64 lg:h-80 rounded-xl overflow-hidden shadow-md">
           <Image 
              src={currentRaffle.imageUrl} 
              alt={currentRaffle.title}
              fill
              className="object-cover"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
           <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl font-bold shadow-sm">{currentRaffle.title}</h1>
              <div className="flex gap-4 mt-2 text-sm text-slate-200 font-medium">
                  <span className="flex items-center gap-1">📅 Sorteio: {currentRaffle?.drawDate ? new Date(currentRaffle.drawDate).toLocaleDateString() : 'Não definido'}</span>
                  <span className="flex items-center gap-1">💰 Preço: R$ {currentRaffle?.price.toFixed(2)}</span>
              </div>
           </div>
           <Badge className="absolute top-4 right-4 bg-green-500 hover:bg-green-600 text-base px-3 py-1">
             {currentRaffle?.status === 'active' ? 'Ativa' : 'Inativa'}
           </Badge>
        </div>
      ) : (
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none">
            <CardContent className="p-6">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold">{currentRaffle?.title}</h3>
                    <p className="text-slate-300 text-sm mt-1">{currentRaffle?.description || 'Sem descrição'}</p>
                    <div className="flex gap-4 mt-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">📅 Sorteio: {currentRaffle?.drawDate ? new Date(currentRaffle.drawDate).toLocaleDateString() : 'Não definido'}</span>
                        <span className="flex items-center gap-1">💰 Preço: R$ {currentRaffle?.price.toFixed(2)}</span>
                    </div>
                </div>
                <Badge className="bg-slate-500">
                    {currentRaffle?.status === 'active' ? 'Ativa' : 'Inativa'}
                </Badge>
            </div>
            </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="w-full justify-start sm:w-auto">
            <TabsTrigger value="tickets" className="flex-1 sm:flex-none">Bilhetes</TabsTrigger>
            <TabsTrigger value="details" className="flex-1 sm:flex-none">Detalhes</TabsTrigger>
            <TabsTrigger value="reservation" className="flex-1 sm:flex-none">Reservar</TabsTrigger>
          </TabsList>
        </div>

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
                 <>
                   <div className="flex justify-between items-center mb-4">
                     <div className="text-sm text-muted-foreground">
                       Total de bilhetes: {raffleTickets.length}
                     </div>
                     {!hasSales && !hasReserved && (
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={handleRegenerateTickets}
                       >
                         Regenerar Bilhetes (Aleatório)
                       </Button>
                     )}
                   </div>
                   <TicketGrid 
                     tickets={raffleTickets} 
                     onSelectionChange={(selected) => console.log('Selected:', selected)} 
                     onReserve={openReserveDialog}
                   />
                 </>
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
                   <div className="text-2xl font-bold">
                     {financialStats.totalPotentialValue.toLocaleString('pt-BR', {
                       style: 'currency',
                       currency: 'BRL',
                     })}
                   </div>
                 </div>
                 <div className="rounded-lg border p-4">
                   <div className="text-sm text-muted-foreground">Vendas Totais</div>
                   <div className="text-2xl font-bold">
                     {financialStats.soldCount} bilhetes
                   </div>
                 </div>
                 <div className="rounded-lg border p-4">
                   <div className="text-sm text-muted-foreground">Comissões</div>
                   <div className="text-2xl font-bold">
                     {financialStats.totalCommissions.toLocaleString('pt-BR', {
                       style: 'currency',
                       currency: 'BRL',
                     })}
                   </div>
                 </div>
                 <div className="rounded-lg border p-4">
                   <div className="text-sm text-muted-foreground">Lucro Estimado</div>
                   <div className="text-2xl font-bold">
                     {financialStats.estimatedProfit.toLocaleString('pt-BR', {
                       style: 'currency',
                       currency: 'BRL',
                     })}
                   </div>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Rifa</DialogTitle>
            <DialogDescription>
              Altere as informações da rifa abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input className="mt-1" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div>
              <Label>Preço do Bilhete</Label>
              <Input
                type="number"
                step="0.01"
                className="mt-1"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
              />
            </div>
            <div>
              <Label>Data do Sorteio</Label>
              <Input
                type="date"
                className="mt-1"
                value={editDrawDate}
                onChange={(e) => setEditDrawDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Imagem Principal (Banner/Capa)</Label>
              <div className="mt-1 flex items-center gap-4">
                 {editImageUrl && (
                   <div className="relative w-20 h-20 rounded border overflow-hidden shrink-0">
                     <Image src={editImageUrl} alt="Preview" fill className="object-cover" />
                     <button 
                       type="button"
                       onClick={() => setEditImageUrl('')}
                       className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl"
                     >
                       <Trash2 className="w-3 h-3" />
                     </button>
                   </div>
                 )}
                 <Input 
                   type="file" 
                   accept="image/*"
                   onChange={(e) => handleImageUpload(e, setEditImageUrl)}
                 />
              </div>
              <Input 
                 placeholder="Ou cole a URL da imagem aqui" 
                 className="mt-2" 
                 value={editImageUrl} 
                 onChange={(e) => setEditImageUrl(e.target.value)} 
              />
            </div>

            <div>
              <Label>Imagem de Fundo do Bilhete</Label>
              <div className="mt-1 flex items-center gap-4">
                 {editBgUrl && (
                   <div className="relative w-20 h-20 rounded border overflow-hidden shrink-0">
                     <Image src={editBgUrl} alt="Preview" fill className="object-cover" />
                     <button 
                       type="button"
                       onClick={() => setEditBgUrl('')}
                       className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl"
                     >
                       <Trash2 className="w-3 h-3" />
                     </button>
                   </div>
                 )}
                 <Input 
                   type="file" 
                   accept="image/*"
                   onChange={(e) => handleImageUpload(e, setEditBgUrl)}
                 />
              </div>
              <Input 
                 placeholder="Ou cole a URL da imagem aqui" 
                 className="mt-2" 
                 value={editBgUrl} 
                 onChange={(e) => setEditBgUrl(e.target.value)} 
              />
              <p className="text-xs text-muted-foreground mt-1">
                 Se deixar em branco, será usada a imagem principal com transparência.
              </p>
            </div>

            <div>
              <Label>Regulamento</Label>
              <Textarea
                className="mt-1"
                rows={6}
                value={editRegulation}
                onChange={(e) => setEditRegulation(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveRaffleEdits}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

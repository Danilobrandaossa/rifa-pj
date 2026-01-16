"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useRaffle } from "@/contexts/RaffleContext";
import { useState, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { Printer, Settings2, FileText, Layers, Copy } from "lucide-react";

// Tipos para configurações de impressão
type PaperSize = 'A4' | 'A5';
type PrintMode = 'standard' | 'dual';

interface LayoutConfig {
  top: number;
  left: number;
  width: number;
  height: number;
  qrTop: number;
  qrLeft: number;
  stubWidth: number; // Largura do canhoto
}

interface FontConfig {
  primary: number;
  id: number;
  secondary: number;
}

export default function ImprimirBilhetesPage() {
  const { tickets, raffles } = useRaffle();
  const params = useParams();
  const routeId = params?.id as string | undefined;

  // --- Estados de Filtro ---
  const [statusFilter, setStatusFilter] = useState<string>("reserved");
  const [letterFilter, setLetterFilter] = useState<string>("all");
  const [blockFilter, setBlockFilter] = useState<string>("");
  const [startNumber, setStartNumber] = useState<string>("");
  const [endNumber, setEndNumber] = useState<string>("");

  // --- Estados de Configuração de Impressão ---
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [printMode, setPrintMode] = useState<PrintMode>('standard');
  const [secondaryRaffleId, setSecondaryRaffleId] = useState<string>('none');

  // Configurações de Layout (Valores padrão em mm)
  const [layoutLeft, setLayoutLeft] = useState<LayoutConfig>({
    top: 8, left: 15, width: 90, height: 40, qrTop: 10, qrLeft: 60, stubWidth: 15
  });
  
  const [layoutRight, setLayoutRight] = useState<LayoutConfig>({
    top: 8, left: 110, width: 90, height: 40, qrTop: 10, qrLeft: 60, stubWidth: 15
  });

  const [fonts, setFonts] = useState<FontConfig>({
    primary: 14, id: 9, secondary: 10
  });

  // --- Dados ---
  const currentRaffle = raffles.find((r) => r.id === routeId) || raffles[0];
  const secondaryRaffle = raffles.find((r) => r.id === secondaryRaffleId);

  // Filtragem
  const filteredTickets = useMemo(() => {
    const currentTickets = tickets.filter((t) => t.raffleId === currentRaffle.id);
    return currentTickets.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (letterFilter !== "all" && t.groupLetter && t.groupLetter !== letterFilter) return false;
      if (blockFilter) {
        const blockValue = parseInt(blockFilter, 10);
        if (!Number.isNaN(blockValue) && t.block !== blockValue) return false;
      }
      if (startNumber && endNumber) {
        const start = parseInt(startNumber, 10);
        const end = parseInt(endNumber, 10);
        const current = parseInt(t.number, 10);
        if (!Number.isNaN(start) && !Number.isNaN(end) && (current < start || current > end)) {
          return false;
        }
      }
      return true;
    });
  }, [tickets, currentRaffle, statusFilter, letterFilter, blockFilter, startNumber, endNumber]);

  // Helpers de Formatação
  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('pt-BR') : '--/--/----';
  const formatCurrency = (val?: number) => val ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';

  // Handler de Impressão
  const handlePrint = () => {
    window.print();
  };

  // Componente de Bilhete (Renderizado dentro do loop)
  const TicketRenderer = ({ 
    ticket, 
    raffle, 
    layout, 
    isRightSide = false 
  }: { 
    ticket: any, 
    raffle: any, 
    layout: LayoutConfig, 
    isRightSide?: boolean 
  }) => {
    if (!ticket || !raffle) return <div style={{ width: `${layout.width}mm`, height: `${layout.height}mm` }} />;

    return (
      <div
        className="absolute border border-black overflow-hidden bg-white text-black"
        style={{
          top: `${layout.top}mm`,
          left: `${layout.left}mm`, // Posicionamento absoluto na folha
          width: `${layout.width}mm`,
          height: `${layout.height}mm`,
          fontSize: `${fonts.secondary}pt`
        }}
      >
        {/* Canhoto (Stub) */}
        <div 
          className="absolute top-0 bottom-0 border-r border-dashed border-black flex flex-col items-center justify-center text-center bg-gray-50"
          style={{ width: `${layout.stubWidth}mm`, left: 0 }}
        >
          <div className="writing-mode-vertical rotate-180 transform whitespace-nowrap text-[0.7em] font-bold">
            {raffle.title.substring(0, 15)}
          </div>
          <div className="writing-mode-vertical rotate-180 transform font-mono font-bold mt-2" style={{ fontSize: `${fonts.id}pt` }}>
            {ticket.number}
          </div>
        </div>

        {/* Corpo do Bilhete */}
        <div className="absolute top-0 bottom-0 right-0 p-2 flex flex-col justify-between" style={{ left: `${layout.stubWidth}mm` }}>
          {/* Cabeçalho */}
          <div className="border-b border-black pb-1 mb-1">
            <div className="font-bold uppercase truncate leading-tight" style={{ fontSize: `${fonts.primary}pt` }}>
              {raffle.title}
            </div>
            <div className="flex justify-between items-center text-[0.8em] mt-1 text-gray-600">
              <span>Sorteio: {formatDate(raffle.drawDate)}</span>
              <span className="font-mono">{formatCurrency(raffle.price)}</span>
            </div>
          </div>

          {/* Número Principal */}
          <div className="flex-1 flex items-center justify-center">
             <span className="font-bold font-mono tracking-widest" style={{ fontSize: `${fonts.primary + 8}pt` }}>
                {ticket.number}
             </span>
          </div>

          {/* Rodapé / Status */}
          <div className="text-[0.7em] flex justify-between items-end border-t border-gray-200 pt-1">
             <div>
               <div>ID: {raffle.id.substring(0,4)}-{ticket.number}</div>
               {ticket.buyerName && <div className="truncate max-w-[20mm]">{ticket.buyerName}</div>}
             </div>
             <div>
                {ticket.status === 'sold' && <Badge variant="default" className="h-4 text-[0.6em] px-1">PAGO</Badge>}
                {ticket.status === 'reserved' && <Badge variant="outline" className="h-4 text-[0.6em] px-1 border-yellow-600 text-yellow-700">RES</Badge>}
             </div>
          </div>
        </div>

        {/* QR Code Simulado */}
        <div 
            className="absolute border border-gray-300 bg-white flex items-center justify-center"
            style={{
                top: `${layout.qrTop}mm`,
                left: `${layout.qrLeft}mm`,
                width: '18mm',
                height: '18mm'
            }}
        >
            <div className="text-[6px] text-center text-gray-400">QR CODE</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-screen bg-slate-50/50 print:block print:bg-white print:h-auto print:min-h-0">
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 0mm;
          }
          body {
            background-color: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* Hide all elements that are not the print area if needed, 
             but our class-based approach is cleaner. 
             Just to be safe, we ensure the main wrapper is clean. */
        }
      `}</style>
      
      {/* --- SIDEBAR DE CONFIGURAÇÃO (Não imprime) --- */}
      <div className="w-full lg:w-[400px] flex-shrink-0 space-y-6 p-6 bg-white border-r h-full overflow-y-auto print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Impressão</h2>
          <p className="text-sm text-muted-foreground">Configure o layout e filtros.</p>
        </div>

        {/* 1. Filtros */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> Filtros de Seleção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
             <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                    <Label className="text-xs">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="available">Disponíveis</SelectItem>
                        <SelectItem value="reserved">Reservados</SelectItem>
                        <SelectItem value="sold">Pagos</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="text-xs">Início</Label>
                    <Input className="h-8" value={startNumber} onChange={e => setStartNumber(e.target.value)} placeholder="0000" />
                </div>
                <div>
                    <Label className="text-xs">Fim</Label>
                    <Input className="h-8" value={endNumber} onChange={e => setEndNumber(e.target.value)} placeholder="9999" />
                </div>
             </div>
             <div className="bg-blue-50 text-blue-700 p-2 rounded text-xs border border-blue-100">
                {filteredTickets.length} bilhetes selecionados
             </div>
          </CardContent>
        </Card>

        {/* 2. Modo de Impressão e Papel */}
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Printer className="w-4 h-4" /> Configuração de Página
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs">Tamanho do Papel</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Button 
                            variant={paperSize === 'A4' ? 'default' : 'outline'} 
                            onClick={() => setPaperSize('A4')}
                            className="h-20 flex flex-col gap-1"
                        >
                            <FileText className="w-6 h-6" />
                            <span>Folha A4</span>
                        </Button>
                        <Button 
                            variant={paperSize === 'A5' ? 'default' : 'outline'} 
                            onClick={() => setPaperSize('A5')}
                            className="h-20 flex flex-col gap-1"
                        >
                            <FileText className="w-5 h-5" />
                            <span>Folha A5</span>
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs">Modo de Impressão</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Button 
                            variant={printMode === 'standard' ? 'default' : 'outline'} 
                            onClick={() => setPrintMode('standard')}
                            className="h-16 flex flex-col gap-1"
                        >
                            <Copy className="w-4 h-4" />
                            <span className="text-xs">Padrão</span>
                        </Button>
                        <Button 
                            variant={printMode === 'dual' ? 'default' : 'outline'} 
                            onClick={() => setPrintMode('dual')}
                            className="h-16 flex flex-col gap-1"
                        >
                            <Layers className="w-4 h-4" />
                            <span className="text-xs">Modo Dual</span>
                        </Button>
                    </div>
                    {printMode === 'dual' && (
                         <div className="pt-2">
                            <Label className="text-xs">Segunda Rifa (Direita/Verso)</Label>
                            <Select value={secondaryRaffleId} onValueChange={setSecondaryRaffleId}>
                                <SelectTrigger className="h-8"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Nenhuma</SelectItem>
                                    {raffles.filter(r => r.id !== currentRaffle.id).map(r => (
                                        <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                         </div>
                    )}
                </div>
            </CardContent>
        </Card>

        {/* 3. Ajustes de Layout Fino */}
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Ajustes de Layout (mm)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Tabs defaultValue="left">
                    <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="left">Esquerdo</TabsTrigger>
                        <TabsTrigger value="right">Direito</TabsTrigger>
                    </TabsList>
                    
                    {/* Configuração Esquerda */}
                    <TabsContent value="left" className="space-y-3 pt-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div><Label className="text-[10px]">Top</Label><Input type="number" className="h-7" value={layoutLeft.top} onChange={e => setLayoutLeft({...layoutLeft, top: Number(e.target.value)})} /></div>
                            <div><Label className="text-[10px]">Left</Label><Input type="number" className="h-7" value={layoutLeft.left} onChange={e => setLayoutLeft({...layoutLeft, left: Number(e.target.value)})} /></div>
                            <div><Label className="text-[10px]">Width</Label><Input type="number" className="h-7" value={layoutLeft.width} onChange={e => setLayoutLeft({...layoutLeft, width: Number(e.target.value)})} /></div>
                            <div><Label className="text-[10px]">Height</Label><Input type="number" className="h-7" value={layoutLeft.height} onChange={e => setLayoutLeft({...layoutLeft, height: Number(e.target.value)})} /></div>
                            <div><Label className="text-[10px]">QR Top</Label><Input type="number" className="h-7" value={layoutLeft.qrTop} onChange={e => setLayoutLeft({...layoutLeft, qrTop: Number(e.target.value)})} /></div>
                            <div><Label className="text-[10px]">QR Left</Label><Input type="number" className="h-7" value={layoutLeft.qrLeft} onChange={e => setLayoutLeft({...layoutLeft, qrLeft: Number(e.target.value)})} /></div>
                        </div>
                    </TabsContent>

                    {/* Configuração Direita */}
                    <TabsContent value="right" className="space-y-3 pt-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div><Label className="text-[10px]">Top</Label><Input type="number" className="h-7" value={layoutRight.top} onChange={e => setLayoutRight({...layoutRight, top: Number(e.target.value)})} /></div>
                            <div><Label className="text-[10px]">Left</Label><Input type="number" className="h-7" value={layoutRight.left} onChange={e => setLayoutRight({...layoutRight, left: Number(e.target.value)})} /></div>
                            <div><Label className="text-[10px]">Width</Label><Input type="number" className="h-7" value={layoutRight.width} onChange={e => setLayoutRight({...layoutRight, width: Number(e.target.value)})} /></div>
                            <div><Label className="text-[10px]">Height</Label><Input type="number" className="h-7" value={layoutRight.height} onChange={e => setLayoutRight({...layoutRight, height: Number(e.target.value)})} /></div>
                            <div><Label className="text-[10px]">QR Top</Label><Input type="number" className="h-7" value={layoutRight.qrTop} onChange={e => setLayoutRight({...layoutRight, qrTop: Number(e.target.value)})} /></div>
                            <div><Label className="text-[10px]">QR Left</Label><Input type="number" className="h-7" value={layoutRight.qrLeft} onChange={e => setLayoutRight({...layoutRight, qrLeft: Number(e.target.value)})} /></div>
                        </div>
                    </TabsContent>
                </Tabs>
                
                <Separator />
                
                <div className="space-y-2">
                    <Label className="text-xs">Fontes (pt)</Label>
                    <div className="grid grid-cols-3 gap-2">
                        <div><Label className="text-[10px]">Principal</Label><Input type="number" className="h-7" value={fonts.primary} onChange={e => setFonts({...fonts, primary: Number(e.target.value)})} /></div>
                        <div><Label className="text-[10px]">ID</Label><Input type="number" className="h-7" value={fonts.id} onChange={e => setFonts({...fonts, id: Number(e.target.value)})} /></div>
                        <div><Label className="text-[10px]">Secundária</Label><Input type="number" className="h-7" value={fonts.secondary} onChange={e => setFonts({...fonts, secondary: Number(e.target.value)})} /></div>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg" onClick={handlePrint}>
            <Printer className="mr-2 h-5 w-5" /> Imprimir
        </Button>
      </div>

      {/* --- ÁREA DE PREVIEW (Central) --- */}
      <div className="flex-1 p-8 bg-slate-100 overflow-auto flex justify-center print:p-0 print:bg-white print:block print:overflow-visible print:w-full print:h-auto">
         <div 
            id="print-area"
            className="bg-white shadow-2xl relative print:shadow-none print:m-0 mx-auto"
            style={{
                width: paperSize === 'A4' ? '210mm' : '148mm',
                minHeight: paperSize === 'A4' ? '297mm' : '210mm',
                // Em modo print, deixamos o browser controlar a paginação, mas no preview fixamos
            }}
         >
            {/* 
                Lógica de Renderização dos Bilhetes 
                Assumindo A4 com 2 colunas por padrão ou conforme layout
            */}
            {filteredTickets.map((ticket, index) => {
                // Cálculo de posição na página para simulação de preview contínuo seria complexo.
                // Aqui vamos simplificar: renderizar blocos absolutos dentro de containers relativos
                // Mas para print real, CSS break-inside é melhor.
                
                // Vamos adotar estratégia de "Rows": cada linha tem 1 ou 2 bilhetes
                // Se for Modo Padrão: Bilhete Esquerdo = Ticket N, Bilhete Direito = Ticket N (cópia) ou N+1?
                // Geralmente em rifa: Folha com 2 canhotos iguais ou sequenciais?
                // O padrão "A4 Dual" do concorrente sugere 2 bilhetes por folha (ou por linha).
                
                // Vamos assumir que cada ITEM do map é uma LINHA de impressão se quisermos controlar posições absolutas "por linha"
                // Mas o map é de tickets.
                
                // Estratégia melhor: Renderizar Wrapper relativo com altura fixa, e dentro dele os absolutos.
                
                return (
                    <div 
                        key={ticket.number} 
                        className="relative break-inside-avoid print:break-inside-avoid"
                        style={{ height: '50mm', width: '100%' }} // Altura da linha de corte
                    >
                        {/* Bilhete Esquerdo */}
                        <TicketRenderer 
                            ticket={ticket} 
                            raffle={currentRaffle} 
                            layout={layoutLeft} 
                        />

                        {/* Bilhete Direito (Depende do Modo) */}
                        {printMode === 'standard' && (
                             // Modo Padrão: Repete o mesmo bilhete (cópia) OU próximo bilhete?
                             // Se for "2 por folha" geralmente é o mesmo número para entregar 2 vias?
                             // Ou aproveitamento de papel?
                             // Pela UI do concorrente "Modo Padrão: Bilhetes da mesma rifa, dois por folha",
                             // entende-se que imprime o MESMO bilhete ou sequencial?
                             // Vamos assumir CÓPIA para segurança, ou sequencial se o usuário quiser (futuro).
                             // Por enquanto: CÓPIA do mesmo ticket na direita.
                            <TicketRenderer 
                                ticket={ticket} 
                                raffle={currentRaffle} 
                                layout={layoutRight}
                                isRightSide 
                            />
                        )}

                        {printMode === 'dual' && secondaryRaffle && (
                            // Modo Dual: Imprime outra rifa na direita
                            // Precisamos de um ticket correspondente da outra rifa? 
                            // Ou apenas simular?
                            // Se for rifas independentes, qual número usar? O mesmo número?
                            <TicketRenderer 
                                ticket={{...ticket, raffleId: secondaryRaffle.id}} // Assume mesmo número
                                raffle={secondaryRaffle} 
                                layout={layoutRight}
                                isRightSide
                            />
                        )}
                        
                        {/* Linha de Corte (Opcional) */}
                        <div className="absolute w-full border-b border-dashed border-gray-300 print:border-gray-400" style={{ top: '49mm' }} />
                        <div className="absolute h-full border-r border-dashed border-gray-300 print:border-gray-400" style={{ left: '50%', top: 0 }} />
                    </div>
                );
            })}

            {filteredTickets.length === 0 && (
                <div className="p-10 text-center text-gray-400">
                    Nenhum bilhete selecionado para impressão.
                </div>
            )}
         </div>
      </div>

      <style jsx global>{`
        @media print {
            @page {
                size: ${paperSize} portrait;
                margin: 0;
            }
            body {
                background: white;
            }
            .print\\:hidden {
                display: none !important;
            }
            .print\\:block {
                display: block !important;
            }
            /* Garantir que o container ocupe 100% no print */
            #print-area {
                width: 100% !important;
                box-shadow: none !important;
                margin: 0 !important;
            }
        }
      `}</style>
    </div>
  );
}

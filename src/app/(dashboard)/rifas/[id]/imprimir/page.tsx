"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useRaffle } from "@/contexts/RaffleContext";
import { useState, useMemo, useEffect, ChangeEvent } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { Switch } from "@/components/ui/switch";
import { Printer, Settings2, FileText, Layers, Copy, Image as ImageIcon } from "lucide-react";
import { Raffle, Ticket } from "@/types";

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
  qrSize: number;
  stubWidth: number; // Largura do canhoto
  // Posicionamento de elementos (opcional, se 0 usa padrão)
  numberTop: number;
  numberLeft: number;
  idTop: number;
  idLeft: number;
}

interface FontConfig {
  primary: number;
  id: number;
  secondary: number;
}

interface TicketRendererProps {
  ticket: Ticket;
  raffle: Raffle;
  layout: LayoutConfig;
}

export default function ImprimirBilhetesPage() {
  const { tickets, raffles } = useRaffle();
  const params = useParams();
  const routeId = params?.id as string | undefined;

  // --- Estados de Filtro ---
  const [statusFilter, setStatusFilter] = useState<string>("reserved");
  const [startNumber, setStartNumber] = useState<string>("");
  const [endNumber, setEndNumber] = useState<string>("");

  // --- Estados de Configuração de Impressão ---
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [printMode, setPrintMode] = useState<PrintMode>('standard');
  const [secondaryRaffleId, setSecondaryRaffleId] = useState<string>('none');
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [printBg, setPrintBg] = useState<boolean>(false);

  // Configurações de Layout (Valores padrão em mm)
  const [layoutLeft, setLayoutLeft] = useState<LayoutConfig>({
    top: 8, left: 15, width: 90, height: 40, qrTop: 5, qrLeft: 65, qrSize: 20, stubWidth: 15,
    numberTop: 20, numberLeft: 45, idTop: 35, idLeft: 20
  });
  
  const [layoutRight, setLayoutRight] = useState<LayoutConfig>({
    top: 8, left: 110, width: 90, height: 40, qrTop: 5, qrLeft: 65, qrSize: 20, stubWidth: 15,
    numberTop: 20, numberLeft: 45, idTop: 35, idLeft: 20
  });

  const [fonts, setFonts] = useState<FontConfig>({
    primary: 14, id: 9, secondary: 10
  });

  // --- Persistência (Salvar) ---
  useEffect(() => {
    if (typeof window !== 'undefined' && routeId) {
        const configToSave = {
            layoutLeft,
            layoutRight,
            fonts,
            paperSize,
            printMode,
            bgImage,
            printBg
        };
        localStorage.setItem(`printConfig-${routeId}`, JSON.stringify(configToSave));
    }
  }, [layoutLeft, layoutRight, fonts, paperSize, printMode, bgImage, printBg, routeId]);

  // --- Dados ---
  const currentRaffle = raffles.find((r) => r.id === routeId) || raffles[0];
  const secondaryRaffle = raffles.find((r) => r.id === secondaryRaffleId);

  // Filtragem
  const filteredTickets = useMemo(() => {
    const currentTickets = tickets.filter((t) => t.raffleId === currentRaffle.id);
    return currentTickets.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
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
  }, [tickets, currentRaffle, statusFilter, startNumber, endNumber]);

  // Handler de Upload de Imagem
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Converter para Base64 para persistência
      const reader = new FileReader();
      reader.onloadend = () => {
          const base64String = reader.result as string;
          setBgImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler de Impressão
  const handlePrint = () => {
    window.print();
  };

  // Componente de Bilhete (Renderizado dentro do loop)
  const TicketRenderer = ({ 
    ticket, 
    raffle, 
    layout
  }: TicketRendererProps) => {
    if (!ticket || !raffle) return <div style={{ width: `${layout.width}mm`, height: `${layout.height}mm` }} />;

    return (
      <div
        className={`absolute border border-black overflow-hidden text-black ${!bgImage ? 'bg-white' : ''}`}
        style={{
          top: `${layout.top}mm`,
          left: `${layout.left}mm`, // Posicionamento absoluto na folha
          width: `${layout.width}mm`,
          height: `${layout.height}mm`,
          fontSize: `${fonts.secondary}pt`
        }}
      >
        {bgImage && (
          <div className={`absolute inset-0 ${!printBg ? 'print:hidden' : ''}`}>
            <Image
              src={bgImage}
              alt="Fundo do Bilhete"
              fill
              style={{ objectFit: "fill" }}
              sizes="100vw"
            />
          </div>
        )}

        {/* QR Code */}
        <div 
            className="absolute z-20"
            style={{
                top: `${layout.qrTop}mm`,
                left: `${layout.qrLeft}mm`,
                width: `${layout.qrSize}mm`,
                height: `${layout.qrSize}mm`
            }}
        >
            <QRCodeSVG 
                value={`${typeof window !== 'undefined' ? window.location.origin : 'https://rifagestor.com.br'}/verificar/${raffle.id}/${ticket.number}`} 
                size={100} 
                style={{ width: '100%', height: '100%' }}
                level="M"
            />
        </div>

        {/* Canhoto (Stub) - REMOVIDO A PEDIDO */}
        {/* Corpo do Bilhete (Apenas Textos Fixos) - REMOVIDO A PEDIDO */}

        {/* Número Principal (Absoluto) */}
        <div 
            className="absolute font-bold font-mono tracking-widest z-20"
            style={{ 
                top: `${layout.numberTop}mm`, 
                left: `${layout.numberLeft}mm`,
                fontSize: `${fonts.primary + 8}pt`
            }}
        >
            {ticket.number}
        </div>

        {/* ID (Absoluto) */}
        <div 
            className="absolute z-20"
            style={{ 
                top: `${layout.idTop}mm`, 
                left: `${layout.idLeft}mm`,
                fontSize: `${fonts.secondary}pt`
            }}
        >
            ID: {raffle.id.substring(0,4)}-{ticket.number}
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

        {/* Imagem de Fundo (Gabarito) */}
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Imagem de Fundo / Gabarito
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs">Upload de Imagem</Label>
                    <div className="flex items-center gap-2">
                         <Input type="file" accept="image/*" onChange={handleImageUpload} className="h-8 text-xs" />
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <Label className="text-xs">Imprimir Fundo?</Label>
                    <Switch checked={printBg} onCheckedChange={setPrintBg} />
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
                            <div><Label className="text-[10px]">QR Size</Label><Input type="number" className="h-7" value={layoutLeft.qrSize} onChange={e => setLayoutLeft({...layoutLeft, qrSize: Number(e.target.value)})} /></div>
                            <div><Label className="text-[10px]">Nº Top</Label><Input type="number" className="h-7" value={layoutLeft.numberTop} onChange={e => setLayoutLeft({...layoutLeft, numberTop: Number(e.target.value)})} /></div>
                            <div><Label className="text-[10px]">Nº Left</Label><Input type="number" className="h-7" value={layoutLeft.numberLeft} onChange={e => setLayoutLeft({...layoutLeft, numberLeft: Number(e.target.value)})} /></div>
                            <div><Label className="text-[10px]">ID Top</Label><Input type="number" className="h-7" value={layoutLeft.idTop} onChange={e => setLayoutLeft({...layoutLeft, idTop: Number(e.target.value)})} /></div>
                            <div><Label className="text-[10px]">ID Left</Label><Input type="number" className="h-7" value={layoutLeft.idLeft} onChange={e => setLayoutLeft({...layoutLeft, idLeft: Number(e.target.value)})} /></div>
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
                            <div><Label className="text-[10px]">QR Size</Label><Input type="number" className="h-7" value={layoutRight.qrSize} onChange={e => setLayoutRight({...layoutRight, qrSize: Number(e.target.value)})} /></div>
                            <div><Label className="text-[10px]">Nº Top</Label><Input type="number" className="h-7" value={layoutRight.numberTop} onChange={e => setLayoutRight({...layoutRight, numberTop: Number(e.target.value)})} /></div>
                            <div><Label className="text-[10px]">Nº Left</Label><Input type="number" className="h-7" value={layoutRight.numberLeft} onChange={e => setLayoutRight({...layoutRight, numberLeft: Number(e.target.value)})} /></div>
                            <div><Label className="text-[10px]">ID Top</Label><Input type="number" className="h-7" value={layoutRight.idTop} onChange={e => setLayoutRight({...layoutRight, idTop: Number(e.target.value)})} /></div>
                            <div><Label className="text-[10px]">ID Left</Label><Input type="number" className="h-7" value={layoutRight.idLeft} onChange={e => setLayoutRight({...layoutRight, idLeft: Number(e.target.value)})} /></div>
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
            {filteredTickets.map((ticket) => {
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

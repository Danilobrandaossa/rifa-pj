"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRaffle } from "@/contexts/RaffleContext";
import { useState } from "react";

export default function ImprimirBilhetesPage() {
  const { tickets, raffles } = useRaffle();
  const [statusFilter, setStatusFilter] = useState<string>("reserved");
  
  const currentRaffle = raffles[0];

  const filteredTickets = tickets.filter(t => {
      if (statusFilter === "all") return true;
      return t.status === statusFilter;
  });

  // Limit preview to avoid crashing browser with 1000 divs if 'all' selected, 
  // but for real print usually we want all. Let's limit to 80 (4 pages) for safety in MVP.
  const displayTickets = filteredTickets.slice(0, 80);

  const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (val: number) => {
      return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <h2 className="text-2xl font-bold">Impressão de Bilhetes</h2>
        <div className="flex gap-2">
          <Button variant="secondary">A4 Dual</Button>
          <Button variant="secondary">A5 Padrão</Button>
        </div>
      </div>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Filtrar por Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Bilhetes</SelectItem>
                <SelectItem value="available">Apenas Bilhetes Disponíveis</SelectItem>
                <SelectItem value="reserved">Reservados</SelectItem>
                <SelectItem value="sold">Vendidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Seleção de Grupo Principal</Label>
            <Select defaultValue="none">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum grupo principal</SelectItem>
                <SelectItem value="A">Grupo A</SelectItem>
                <SelectItem value="B">Grupo B</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Seleção por Subgrupos</Label>
            <Input placeholder="Selecione múltiplos subgrupos (CTRL+Click)" />
          </div>
        </CardContent>
      </Card>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Ajustes Layout A4 Normal (mm)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="font-medium">Lado Esquerdo</div>
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Top (mm)" defaultValue={8} />
              <Input placeholder="Left (mm)" defaultValue={15} />
              <Input placeholder="QR Left (mm)" defaultValue={60} />
              <Input placeholder="QR Top (mm)" defaultValue={40} />
              <Input placeholder="Bottom (mm)" defaultValue={155} />
              <Input placeholder="Canhoto Left (mm)" defaultValue={15} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-medium">Lado Direito</div>
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Top (mm)" defaultValue={8} />
              <Input placeholder="Right (mm)" defaultValue={70} />
              <Input placeholder="QR Right (mm)" defaultValue={100} />
              <Input placeholder="QR Top (mm)" defaultValue={40} />
              <Input placeholder="Bottom (mm)" defaultValue={155} />
              <Input placeholder="Canhoto Right (mm)" defaultValue={70} />
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <div className="font-medium">Tamanhos de Fonte</div>
            <div className="grid grid-cols-4 gap-2">
              <Input placeholder="Fonte Principal (pt)" defaultValue={15} />
              <Input placeholder="Fonte ID (pt)" defaultValue={10} />
              <Input placeholder="Fonte Inferior (pt)" defaultValue={11} />
              <Select defaultValue="none">
                <SelectTrigger>
                  <SelectValue placeholder="Impressão Dupla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma (impressão normal)</SelectItem>
                  <SelectItem value="A&A premiações Bros 160">A&A premiações Bros 160</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button onClick={() => window.print()}>Imprimir Bilhetes ({filteredTickets.length})</Button>
          </div>
        </CardContent>
      </Card>

      {/* Área de Impressão (Preview e Print) */}
      <div className="bg-white p-8 shadow-lg print:shadow-none print:p-0 min-h-[297mm] w-full max-w-[210mm] mx-auto print:max-w-none">
          {displayTickets.length > 0 ? (
              <div className="grid grid-cols-4 gap-4 print:grid-cols-4">
                  {displayTickets.map((ticket) => (
                      <div key={ticket.number} className="border border-black p-2 text-center h-[40mm] flex flex-col justify-between relative break-inside-avoid">
                          <div className="text-[10px] font-bold uppercase border-b border-black pb-1 mb-1 truncate">{currentRaffle?.title || 'Rifa'}</div>
                          <div className="text-xs">Sorteio: {currentRaffle ? formatDate(currentRaffle.drawDate) : '--/--/----'}</div>
                          <div className="text-2xl font-bold my-1">{ticket.number}</div>
                          <div className="text-[8px] mt-auto">
                              {currentRaffle ? formatCurrency(currentRaffle.price) : 'R$ 0,00'}
                              {ticket.status === 'reserved' && <span className="ml-1 font-bold">(RES)</span>}
                              {ticket.status === 'sold' && <span className="ml-1 font-bold">(VEND)</span>}
                          </div>
                          
                          {/* Canhoto simulado */}
                          <div className="absolute right-0 top-0 bottom-0 w-[20px] border-l border-dashed border-black flex items-center justify-center writing-mode-vertical text-[8px]">
                              <span className="rotate-90">{ticket.number}</span>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="flex items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">Nenhum bilhete encontrado com o filtro &quot;{statusFilter}&quot;.</p>
              </div>
          )}
      </div>
    </div>
  );
}

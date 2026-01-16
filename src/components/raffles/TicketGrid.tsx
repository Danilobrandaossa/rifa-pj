'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Ticket, TicketStatus } from '@/types';

interface TicketGridProps {
  tickets: Ticket[];
  onSelectionChange: (selectedNumbers: string[]) => void;
  onReserve?: (selectedNumbers: string[]) => void;
}

export function TicketGrid({ tickets, onSelectionChange, onReserve }: TicketGridProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | TicketStatus>('all');
  const [search, setSearch] = useState('');
  
  // Novos filtros de navegação estruturada
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [selectedBlock, setSelectedBlock] = useState<string>('1');

  // Extrair letras e blocos disponíveis garantindo tipos fortes
  const letters = useMemo<string[]>(() => {
    const set = new Set<string>();
    tickets.forEach((t) => {
      if (t.groupLetter) {
        set.add(t.groupLetter);
      }
    });
    return Array.from(set).sort();
  }, [tickets]);

  const blocks = useMemo<number[]>(() => {
    const set = new Set<number>();
    tickets.forEach((t) => {
      if (t.groupLetter === selectedLetter && typeof t.block === 'number') {
        set.add(t.block);
      }
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [tickets, selectedLetter]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // 1. Filtro hierárquico (Prioridade)
      // Se tivermos letras definidas nos tickets, usamos o modo de navegação por blocos
      const hasStructure = t.groupLetter && t.block;
      if (hasStructure) {
          if (t.groupLetter !== selectedLetter) return false;
          // Se quiser ver todos da letra, pode deixar block vazio, mas por padrão vamos focar no bloco
          if (selectedBlock && t.block !== parseInt(selectedBlock)) return false;
      }

      // 2. Filtros de Status e Busca (Aplicam-se sobre o bloco atual ou globalmente se não tiver estrutura)
      if (filter !== 'all' && t.status !== filter) return false;
      if (search && !t.number.includes(search)) return false;
      
      return true;
    });
  }, [tickets, filter, search, selectedLetter, selectedBlock]);

  const toggleTicket = (number: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(number)) {
      newSelected.delete(number);
    } else {
      newSelected.add(number);
    }
    setSelected(newSelected);
    onSelectionChange(Array.from(newSelected));
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'available': return 'bg-slate-50 text-slate-900 hover:bg-slate-100 border-slate-200';
      case 'reserved': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'sold': return 'bg-green-50 text-green-700 border-green-200';
      case 'blocked': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Navegação Estruturada (Letras e Blocos) */}
      {letters.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
            <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Selecione a Letra (Grupo)</label>
                <div className="flex flex-wrap gap-2">
                    {letters.map(letter => (
                        <button
                            key={letter}
                            onClick={() => { setSelectedLetter(letter); setSelectedBlock('1'); }}
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border",
                                selectedLetter === letter 
                                    ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                            )}
                        >
                            {letter}
                        </button>
                    ))}
                </div>
            </div>
            
            {blocks.length > 0 && (
                <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Selecione o Bloco (10 bilhetes)</label>
                    <select 
                        className="h-9 w-full md:w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={selectedBlock}
                        onChange={(e) => setSelectedBlock(e.target.value)}
                    >
                        {blocks.map(block => (
                            <option key={block} value={block}>
                                Bloco {block} ({selectedLetter}{block})
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                        Exibindo bilhetes do bloco {selectedLetter}{selectedBlock}
                    </p>
                </div>
            )}
        </div>
      )}

      {/* Filters & Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
           <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar bilhete..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-[200px]"
            />
          </div>
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={filter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const value = e.target.value as 'all' | TicketStatus;
              setFilter(value);
            }}
          >
            <option value="all">Status: Todos</option>
            <option value="available">Disponíveis</option>
            <option value="reserved">Reservados</option>
            <option value="sold">Vendidos</option>
          </select>
        </div>
        
        {/* Quick Range Select (Simplified) */}
        <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                    // Selecionar todos visíveis
                    const visibleIds = filteredTickets.filter(t => t.status === 'available').map(t => t.number);
                    const newSelected = new Set(selected);
                    visibleIds.forEach(id => newSelected.add(id));
                    setSelected(newSelected);
                    onSelectionChange(Array.from(newSelected));
                }}
            >
                Selecionar Todos do Bloco
            </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-3 sm:grid-cols-5 md:grid-cols-10">
        {filteredTickets.map((ticket) => {
          const isSelected = selected.has(ticket.number);
          const isAvailable = ticket.status === 'available';
          
          return (
            <button
              key={ticket.number}
              onClick={() => isAvailable && toggleTicket(ticket.number)}
              disabled={!isAvailable}
              className={cn(
                "flex flex-col h-14 w-full items-center justify-center rounded-lg border text-xs font-medium transition-all shadow-sm",
                getStatusColor(ticket.status),
                isSelected && isAvailable && "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 ring-2 ring-blue-300 ring-offset-1"
              )}
            >
              <span className="text-[10px] opacity-70">{ticket.groupLetter}{ticket.block}</span>
              <span className="text-sm font-bold">{ticket.number}</span>
            </button>
          );
        })}
      </div>
      
      {filteredTickets.length === 0 && (
          <div className="py-10 text-center text-muted-foreground">
              Nenhum bilhete encontrado.
          </div>
      )}
      
      {/* Summary Footer */}
      <div className="sticky bottom-0 mt-4 flex items-center justify-between rounded-lg border bg-background p-4 shadow-lg">
          <div className="flex gap-4">
              <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-slate-200 border border-slate-300"></div>
                  <span className="text-sm text-muted-foreground">Disponível</span>
              </div>
              <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-100 border border-yellow-200"></div>
                  <span className="text-sm text-muted-foreground">Reservado</span>
              </div>
              <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-100 border border-green-200"></div>
                  <span className="text-sm text-muted-foreground">Vendido</span>
              </div>
               <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-600 border border-blue-600"></div>
                  <span className="text-sm text-muted-foreground">Selecionado ({selected.size})</span>
              </div>
          </div>
          
          <Button 
            disabled={selected.size === 0}
            onClick={() => onReserve && onReserve(Array.from(selected))}
          >
              Reservar Selecionados ({selected.size})
          </Button>
      </div>
    </div>
  );
}

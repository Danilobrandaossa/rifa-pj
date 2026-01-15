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
  const [rangeInput, setRangeInput] = useState('');

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (filter !== 'all' && t.status !== filter) return false;
      if (search && !t.number.includes(search)) return false;
      return true;
    });
  }, [tickets, filter, search]);

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

  const handleRangeSelect = () => {
    // Ex: "1-50" or "10, 20, 30"
    const ranges = rangeInput.split(',').map(s => s.trim());
    const newSelected = new Set(selected);
    
    ranges.forEach(range => {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            // Pad start/end based on ticket format logic if needed, assumes number string matching
             // Simple check: find ticket with this number (as string)
             // For simplicity, assuming tickets are '0001' etc. logic outside, here just matching what's available
             // But actually, we should select based on existing tickets.
             // Let's assume ticket.number is numeric string.
             // Find matching ticket in props to ensure it exists and is available
             const ticket = tickets.find(t => parseInt(t.number) === i);
             if (ticket && ticket.status === 'available') {
                 newSelected.add(ticket.number);
             }
          }
        }
      } else {
          // Single number
          const ticket = tickets.find(t => t.number === range);
          if (ticket && ticket.status === 'available') {
              newSelected.add(ticket.number);
          }
      }
    });
    
    setSelected(newSelected);
    onSelectionChange(Array.from(newSelected));
    setRangeInput('');
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'available': return 'bg-slate-100 text-slate-900 hover:bg-slate-200 border-slate-200';
      case 'reserved': return 'bg-yellow-100 text-yellow-800 border-yellow-200 cursor-not-allowed';
      case 'sold': return 'bg-green-100 text-green-800 border-green-200 cursor-not-allowed';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200 cursor-not-allowed';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="space-y-4">
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
            <option value="all">Todos</option>
            <option value="available">Disponíveis</option>
            <option value="reserved">Reservados</option>
            <option value="sold">Vendidos</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
            <Input 
                placeholder="Ex: 1-50, 100" 
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                className="w-[150px]"
            />
            <Button onClick={handleRangeSelect} variant="secondary">Selecionar</Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15">
        {filteredTickets.map((ticket) => {
          const isSelected = selected.has(ticket.number);
          const isAvailable = ticket.status === 'available';
          
          return (
            <button
              key={ticket.number}
              onClick={() => isAvailable && toggleTicket(ticket.number)}
              disabled={!isAvailable}
              className={cn(
                "flex h-10 w-full items-center justify-center rounded-md border text-xs font-medium transition-all",
                getStatusColor(ticket.status),
                isSelected && isAvailable && "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 ring-2 ring-blue-300 ring-offset-1"
              )}
            >
              {ticket.number}
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

'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Raffle, Ticket, Reseller, TicketStatus, Sale } from '@/types';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

const shuffle = (arr: string[]): string[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
};

const buildTicketsForRaffle = (raffle: Raffle): Ticket[] => {
  const tickets: Ticket[] = [];

  if (raffle.modality === 'ten_thousand') {
    const numbers = shuffle(
      Array.from({ length: 10000 }, (_, n) => n.toString().padStart(4, '0')),
    );

    let currentIndex = 0;

    LETTERS.forEach((letter) => {
      for (let block = 1; block <= 100; block++) {
        for (let index = 1; index <= 10; index++) {
          const number = numbers[currentIndex];
          tickets.push({
            raffleId: raffle.id,
            number,
            status: 'available',
            groupLetter: letter,
            block,
            index,
          });
          currentIndex += 1;
        }
      }
    });

    return tickets;
  }

  if (raffle.modality === 'thousand') {
    const numbers = shuffle(
      Array.from({ length: 1000 }, (_, n) => n.toString().padStart(3, '0')),
    );

    numbers.forEach((number) => {
      tickets.push({
        raffleId: raffle.id,
        number,
        status: 'available',
      });
    });

    return tickets;
  }

  const numbers = shuffle(
    Array.from({ length: 100 }, (_, n) => n.toString().padStart(2, '0')),
  );

  numbers.forEach((number) => {
    tickets.push({
      raffleId: raffle.id,
      number,
      status: 'available',
    });
  });

  return tickets;
};

const initialTickets: Ticket[] = [];

const initialRafflesMock: Raffle[] = [
  {
    id: '1',
    title: 'A&A premiações Bros 160',
    price: 10,
    totalTickets: 10000,
    ticketsSold: 0,
    ticketsReserved: 0,
    status: 'active',
    modality: 'ten_thousand',
    drawDate: new Date().toISOString(),
  },
];

const initialResellersMock: Reseller[] = [
  { id: 'r1', name: 'Kevin', phone: '000', commissionRate: 10, totalSales: 0, balance: 0 },
  { id: 'r2', name: 'Jaildes', phone: '000', commissionRate: 5, totalSales: 0, balance: 0 },
  { id: 'r3', name: 'Cosmildo', phone: '000', commissionRate: 15, totalSales: 0, balance: 0 },
];

// --- Context Definition ---
interface RaffleContextType {
  raffles: Raffle[];
  tickets: Ticket[];
  resellers: Reseller[];
  sales: Sale[];
  createRaffle: (raffle: Raffle) => void;
  updateRaffle: (id: string, data: Partial<Raffle>) => void;
  updateTicketStatus: (raffleId: string, numbers: string[], status: TicketStatus, resellerId?: string) => void;
  generateTicketsForRaffle: (raffleId: string) => void;
  addReseller: (reseller: Omit<Reseller, 'id' | 'totalSales' | 'balance'>) => void;
  updateReseller: (id: string, data: Partial<Reseller>) => void;
  deleteReseller: (id: string) => void;
  safeDeleteReseller: (id: string) => void;
  cloneAllocations: (sourceRaffleId: string, targetRaffleId: string, specificResellerId?: string) => void;
  assignTicketsToReseller: (raffleId: string, resellerId: string, numbers: string[]) => void;
  revokeTicketsFromReseller: (raffleId: string, resellerId: string, numbers: string[]) => void;
  deleteTickets: (raffleId: string, numbers: string[]) => void;
  clearRaffleTickets: (raffleId: string) => void;
  getFinancialStats: (raffleId: string) => {
    totalPotentialValue: number;
    soldCount: number;
    reservedCount: number;
    totalSalesValue: number;
    totalCommissions: number;
    estimatedProfit: number;
  };
}

const RaffleContext = createContext<RaffleContextType | undefined>(undefined);

export function RaffleProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [raffles, setRaffles] = useState<Raffle[]>(initialRafflesMock);
  const [resellers, setResellers] = useState<Reseller[]>(initialResellersMock);
  const [sales, setSales] = useState<Sale[]>([]);

  // Load from localStorage on mount (client-side only) to avoid hydration mismatch
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rifa_gestor_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.tickets) setTickets(parsed.tickets);
          if (parsed.raffles) setRaffles(parsed.raffles);
          if (parsed.resellers) setResellers(parsed.resellers);
          if (parsed.sales) setSales(parsed.sales);
        } catch (e) {
          console.error('Failed to parse localStorage', e);
        }
      }
    }
  }, []);

  // Persist to localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rifa_gestor_data', JSON.stringify({ tickets, raffles, resellers, sales }));
    }
  }, [tickets, raffles, resellers, sales]);

  const createRaffle = useCallback((raffle: Raffle) => {
    setRaffles((prev) => [...prev, raffle]);
    setTickets((prev) => {
      const existing = prev.some((t) => t.raffleId === raffle.id);
      if (existing) return prev;
      const raffleTickets = buildTicketsForRaffle(raffle);
      return [...prev, ...raffleTickets];
    });
  }, []);

  const updateRaffle = useCallback((id: string, data: Partial<Raffle>) => {
    setRaffles(prevRaffles => {
      const index = prevRaffles.findIndex(r => r.id === id);
      if (index === -1) return prevRaffles;
      
      const currentRaffle = prevRaffles[index];
      // Check actual tickets state for sales/reservations
      const hasSales = tickets.some(t => t.raffleId === id && (t.status === 'sold' || t.status === 'reserved'));
      
      // Filter protected fields if sales exist
      const safeData = { ...data };
      if (hasSales) {
        const protectedFields: (keyof Raffle)[] = ['price', 'modality', 'totalTickets'];
        protectedFields.forEach(field => {
          if (safeData[field] !== undefined && safeData[field] !== currentRaffle[field]) {
            console.warn(`Blocked update of ${field} due to existing sales/reservations.`);
            delete safeData[field];
          }
        });
      }

      // Auto-update totalTickets if modality changes
      if (safeData.modality) {
          if (safeData.modality === 'ten_thousand') safeData.totalTickets = 10000;
          if (safeData.modality === 'thousand') safeData.totalTickets = 1000;
          if (safeData.modality === 'hundred') safeData.totalTickets = 100;
      }

      const updatedRaffle = { ...currentRaffle, ...safeData };
      
      // Check for regeneration needs
      // We regenerate if modality changed (and we are allowed to, i.e., no sales)
      const modalityChanged = safeData.modality && safeData.modality !== currentRaffle.modality;
      
      if (modalityChanged && !hasSales) {
          // Regenerate tickets
          const newTickets = buildTicketsForRaffle(updatedRaffle);
          setTickets(prev => {
              const otherTickets = prev.filter(t => t.raffleId !== id);
              return [...otherTickets, ...newTickets];
          });
      }

      const newRaffles = [...prevRaffles];
      newRaffles[index] = updatedRaffle;
      return newRaffles;
    });
  }, [tickets]);

  const updateTicketStatus = useCallback((raffleId: string, numbers: string[], status: TicketStatus, resellerId?: string) => {
    setTickets(prev => prev.map(t => {
      if (t.raffleId === raffleId && numbers.includes(t.number)) {
        return { 
          ...t, 
          status, 
          resellerId: resellerId || t.resellerId,
          reservedAt: status === 'reserved' ? new Date().toISOString() : t.reservedAt 
        };
      }
      return t;
    }));

    if (status === 'sold') {
      const raffle = raffles.find(r => r.id === raffleId);
      if (!raffle) return;

      const newSale: Sale = {
        id: Math.random().toString(36).substr(2, 9),
        raffleId: raffle.id,
        ticketNumbers: numbers,
        totalAmount: numbers.length * raffle.price,
        buyerName: 'Cliente Balcão',
        buyerPhone: '',
        resellerId,
        createdAt: new Date().toISOString(),
        paymentStatus: 'paid'
      };
      setSales(prev => [newSale, ...prev]);

      if (resellerId) {
        setResellers(prev => prev.map(r => {
          if (r.id === resellerId) {
            const saleAmount = numbers.length * raffle.price;
            return {
              ...r,
              totalSales: r.totalSales + saleAmount
            };
          }
          return r;
        }));
      }
    }
  }, [raffles]);

  const safeDeleteReseller = useCallback((id: string) => {
    setTickets(prev => prev.map(t => {
      if (t.resellerId === id) {
        if (t.status === 'reserved') {
          return { ...t, resellerId: undefined, status: 'available', reservedAt: undefined };
        }
        if (t.status === 'sold') {
            return { ...t, resellerDeleted: true };
        }
      }
      return t;
    }));
    setResellers(prev => prev.filter(r => r.id !== id));
  }, []);

  const cloneAllocations = useCallback((sourceRaffleId: string, targetRaffleId: string, specificResellerId?: string) => {
    setTickets(prev => {
        const sourceTickets = prev.filter(t => 
            t.raffleId === sourceRaffleId && 
            t.status === 'reserved' && 
            t.resellerId &&
            (!specificResellerId || t.resellerId === specificResellerId)
        );
        if (sourceTickets.length === 0) return prev;
        
        return prev.map(t => {
            if (t.raffleId === targetRaffleId && t.status === 'available') {
                const match = sourceTickets.find(st => st.number === t.number);
                if (match) {
                    return { ...t, status: 'reserved', resellerId: match.resellerId, reservedAt: new Date().toISOString() };
                }
            }
            return t;
        });
    });
  }, []);

  const assignTicketsToReseller = useCallback((raffleId: string, resellerId: string, numbers: string[]) => {
    setTickets(prev => prev.map(t => {
        if (t.raffleId === raffleId && numbers.includes(t.number) && t.status === 'available') {
            return { ...t, status: 'reserved', resellerId, reservedAt: new Date().toISOString() };
        }
        return t;
    }));
  }, []);

  const revokeTicketsFromReseller = useCallback((raffleId: string, resellerId: string, numbers: string[]) => {
    setTickets(prev => prev.map(t => {
        if (t.raffleId === raffleId && numbers.includes(t.number) && t.resellerId === resellerId && t.status === 'reserved') {
            return { ...t, status: 'available', resellerId: undefined, reservedAt: undefined };
        }
        return t;
    }));
  }, []);

  const deleteTickets = useCallback((raffleId: string, numbers: string[]) => {
    setTickets(prev => prev.filter(t => {
        if (t.raffleId === raffleId && numbers.includes(t.number)) {
            // Only delete if available
            return t.status !== 'available'; 
        }
        return true;
    }));
  }, []);

  const clearRaffleTickets = useCallback((raffleId: string) => {
    setTickets(prev => {
        const hasSales = prev.some(t => t.raffleId === raffleId && t.status === 'sold');
        if (hasSales) {
            console.warn('Cannot clear tickets: Raffle has sales.');
            return prev;
        }
        return prev.filter(t => t.raffleId !== raffleId);
    });
  }, []);

  const generateTicketsForRaffle = useCallback(
    (raffleId: string) => {
      setTickets((prev) => {
        const existing = prev.some((t) => t.raffleId === raffleId);
        if (existing) return prev;
        const raffle = raffles.find((r) => r.id === raffleId);
        if (!raffle) return prev;
        const raffleTickets = buildTicketsForRaffle(raffle);
        return [...prev, ...raffleTickets];
      });
    },
    [raffles],
  );

  const addReseller = useCallback((data: Omit<Reseller, 'id' | 'totalSales' | 'balance'>) => {
    const newReseller: Reseller = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      totalSales: 0,
      balance: 0
    };
    setResellers(prev => [...prev, newReseller]);
  }, []);

  const updateReseller = useCallback((id: string, data: Partial<Reseller>) => {
    setResellers(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  }, []);

  const deleteReseller = useCallback((id: string) => {
    setResellers(prev => prev.filter(r => r.id !== id));
  }, []);

  const getFinancialStats = useCallback((raffleId: string) => {
    const currentRaffle = raffles.find(r => r.id === raffleId);
    if (!currentRaffle) return {
        totalPotentialValue: 0,
        soldCount: 0,
        reservedCount: 0,
        totalSalesValue: 0,
        totalCommissions: 0,
        estimatedProfit: 0
    };

    const totalPotentialValue = currentRaffle.totalTickets * currentRaffle.price;
    const soldTickets = tickets.filter(t => t.status === 'sold');
    const reservedTickets = tickets.filter(t => t.status === 'reserved');
    const soldCount = soldTickets.length;
    const totalSalesValue = soldCount * currentRaffle.price;
    
    let totalCommissions = 0;
    soldTickets.forEach(ticket => {
        if (ticket.resellerId) {
            const reseller = resellers.find(r => r.id === ticket.resellerId);
            if (reseller) {
                totalCommissions += currentRaffle.price * (reseller.commissionRate / 100);
            }
        }
    });

    const estimatedProfit = totalSalesValue - totalCommissions;

    return {
        totalPotentialValue,
        soldCount,
        reservedCount: reservedTickets.length,
        totalSalesValue,
        totalCommissions,
        estimatedProfit
    };
  }, [tickets, raffles, resellers]);

  return (
    <RaffleContext.Provider value={{ 
      raffles, 
      tickets, 
      resellers, 
      sales,
      createRaffle,
      updateRaffle,
      updateTicketStatus, 
      generateTicketsForRaffle,
      addReseller,
      updateReseller,
      deleteReseller,
      safeDeleteReseller,
      cloneAllocations,
      assignTicketsToReseller,
      revokeTicketsFromReseller,
      deleteTickets,
      clearRaffleTickets,
      getFinancialStats 
    }}>
      {children}
    </RaffleContext.Provider>
  );
}

export const useRaffle = () => {
  const context = useContext(RaffleContext);
  if (!context) throw new Error('useRaffle must be used within a RaffleProvider');
  return context;
};

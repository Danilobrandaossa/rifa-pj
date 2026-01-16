'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Raffle, Ticket, Reseller, TicketStatus, Sale } from '@/types';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

const buildTicketsForRaffle = (raffle: Raffle): Ticket[] => {
  const tickets: Ticket[] = [];

  if (raffle.modality === 'ten_thousand') {
    const numbers = Array.from({ length: 10000 }, (_, n) => n.toString().padStart(4, '0'));

    for (let i = numbers.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = numbers[i];
      numbers[i] = numbers[j];
      numbers[j] = temp;
    }

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
    for (let n = 0; n < 1000; n++) {
      const number = n.toString().padStart(3, '0');
      tickets.push({
        raffleId: raffle.id,
        number,
        status: 'available',
      });
    }
    return tickets;
  }

  for (let n = 0; n < 100; n++) {
    const number = n.toString().padStart(2, '0');
    tickets.push({
      raffleId: raffle.id,
      number,
      status: 'available',
    });
  }

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
  updateTicketStatus: (numbers: string[], status: TicketStatus, resellerId?: string) => void;
  generateTicketsForRaffle: (raffleId: string) => void;
  addReseller: (reseller: Omit<Reseller, 'id' | 'totalSales' | 'balance'>) => void;
  updateReseller: (id: string, data: Partial<Reseller>) => void;
  deleteReseller: (id: string) => void;
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
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rifa_gestor_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.tickets) return parsed.tickets;
        } catch (e) {
          console.error('Failed to parse localStorage', e);
        }
      }
    }
    return initialTickets;
  });

  const [raffles, setRaffles] = useState<Raffle[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rifa_gestor_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.raffles) return parsed.raffles;
        } catch (e) {
          console.error('Failed to parse localStorage', e);
        }
      }
    }
    return initialRafflesMock;
  });

  const [resellers, setResellers] = useState<Reseller[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rifa_gestor_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.resellers) return parsed.resellers;
        } catch (e) {
          console.error('Failed to parse localStorage', e);
        }
      }
    }
    return initialResellersMock;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rifa_gestor_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.sales) return parsed.sales;
        } catch (e) {
          console.error('Failed to parse localStorage', e);
        }
      }
    }
    return [];
  });

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

  const updateTicketStatus = useCallback((numbers: string[], status: TicketStatus, resellerId?: string) => {
    setTickets(prev => prev.map(t => {
      if (numbers.includes(t.number)) {
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
      const raffle = raffles[0];
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
      updateTicketStatus, 
      generateTicketsForRaffle,
      addReseller,
      updateReseller,
      deleteReseller,
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

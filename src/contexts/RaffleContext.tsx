'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Raffle, Ticket, Reseller, TicketStatus, Sale } from '@/types';

// --- Mock Data Generation ---
const generateTickets = (count: number): Ticket[] => {
  return Array.from({ length: count }, (_, i) => {
    const num = i.toString().padStart(4, '0');
    // Random status distribution for demo
    const rand = Math.random();
    let status: TicketStatus = 'available';
    if (rand > 0.9) status = 'sold';
    else if (rand > 0.8) status = 'reserved';
    
    return {
      number: num,
      status,
    };
  });
};

const initialTickets = generateTickets(1000);

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
  updateTicketStatus: (numbers: string[], status: TicketStatus, resellerId?: string) => void;
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
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [raffles] = useState<Raffle[]>(initialRafflesMock);
  const [resellers, setResellers] = useState<Reseller[]>(initialResellersMock);
  const [sales, setSales] = useState<Sale[]>([]);

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

    // Se for venda, registrar venda
    if (status === 'sold') {
      const raffle = raffles[0]; // Simplificação para demo
      const newSale: Sale = {
        id: Math.random().toString(36).substr(2, 9),
        raffleId: raffle.id,
        ticketNumbers: numbers,
        totalAmount: numbers.length * raffle.price,
        buyerName: 'Cliente Balcão', // Em um fluxo real viria do input
        buyerPhone: '',
        resellerId,
        createdAt: new Date().toISOString(),
        paymentStatus: 'paid'
      };
      setSales(prev => [newSale, ...prev]);

      // Atualizar saldo do revendedor se houver
      if (resellerId) {
        setResellers(prev => prev.map(r => {
          if (r.id === resellerId) {
            const saleAmount = numbers.length * raffle.price;
            // A comissão é descontada do que ele deve pagar? Ou é crédito?
            // Geralmente: Ele deve pagar (Vendas - Comissão).
            // Aqui vamos somar ao totalSales. O cálculo de dívida será derivado.
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
      updateTicketStatus, 
      addReseller,
      updateReseller,
      deleteReseller,
      settleDebt,
      addRaffle,
      deleteRaffle,
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

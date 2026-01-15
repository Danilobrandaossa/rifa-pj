export type TicketStatus = 'available' | 'reserved' | 'sold' | 'blocked';

export interface Raffle {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  image2Url?: string;
  image3Url?: string;
  purpose?: string;
  prize?: string;
  regulation?: string;
  ticketBackgroundUrl?: string;
  price: number;
  totalTickets: number;
  drawDate: string; // ISO Date
  status: 'active' | 'closed' | 'draft';
  ticketsSold: number;
  ticketsReserved: number;
  modality: 'hundred' | 'thousand' | 'ten_thousand'; // 0-99, 000-999, etc.
}

export interface Ticket {
  raffleId?: string;
  number: string;
  status: TicketStatus;
  groupLetter?: string;
  block?: number;
  index?: number;
  resellerId?: string;
  buyerName?: string;
  buyerPhone?: string;
  reservedAt?: string;
}

export interface Reseller {
  id: string;
  name: string;
  phone: string;
  pixKey?: string;
  commissionRate: number; // percentage (e.g., 10 for 10%)
  totalSales: number;
  balance: number;
}

export interface Sale {
  id: string;
  raffleId: string;
  ticketNumbers: string[];
  totalAmount: number;
  buyerName: string;
  buyerPhone: string;
  resellerId?: string; // if sold by reseller
  createdAt: string;
  paymentStatus: 'pending' | 'paid';
}

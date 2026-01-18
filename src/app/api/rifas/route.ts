import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

type DbRaffle = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  drawDate: Date | null;
  status: string;
  modality: string;
};

const createRaffleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  price: z.number().positive(),
  drawDate: z.string().datetime().optional(),
  status: z.enum(['active', 'closed', 'draft']).default('active'),
  modality: z.enum(['hundred', 'thousand', 'ten_thousand']),
});

const mapDbRaffleToResponse = (raffle: DbRaffle) => {
  const modality =
    raffle.modality === 'hundred' ||
    raffle.modality === 'thousand' ||
    raffle.modality === 'ten_thousand'
      ? raffle.modality
      : 'ten_thousand';

  const totalTickets =
    modality === 'hundred' ? 100 : modality === 'thousand' ? 1000 : 10000;

  return {
    id: raffle.id,
    title: raffle.title,
    description: raffle.description ?? undefined,
    imageUrl: raffle.imageUrl ?? undefined,
    price: raffle.price,
    totalTickets,
    drawDate: raffle.drawDate
      ? new Date(raffle.drawDate).toISOString()
      : new Date().toISOString(),
    status:
      raffle.status === 'active' || raffle.status === 'closed'
        ? (raffle.status as 'active' | 'closed')
        : 'active',
    ticketsSold: 0,
    ticketsReserved: 0,
    modality,
  };
};

export async function GET() {
  const raffles = await prisma.raffle.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(raffles.map(mapDbRaffleToResponse));
}

export async function POST(request: Request) {
  const body = await request.json();

  const parsed = createRaffleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos para criação de rifa' },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const raffle = await prisma.raffle.create({
    data: {
      id: data.id,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      price: data.price,
      drawDate: data.drawDate ? new Date(data.drawDate) : null,
      status: data.status === 'closed' ? 'closed' : 'active',
      modality: data.modality,
    },
  });

  return NextResponse.json(mapDbRaffleToResponse(raffle), { status: 201 });
}

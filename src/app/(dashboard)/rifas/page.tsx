'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useRaffle } from '@/contexts/RaffleContext';

export default function RifasPage() {
  const { raffles, tickets } = useRaffle();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter">Rifas</h2>
        <Link href="/rifas/nova" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Nova Rifa
          </Button>
        </Link>
      </div>
 
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {raffles.map((raffle) => {
          const raffleTickets = tickets.filter((t) => t.raffleId === raffle.id);
          const soldCount = raffleTickets.filter((t) => t.status === 'sold').length;
          const reservedCount = raffleTickets.filter((t) => t.status === 'reserved').length;
          const progress = raffle.totalTickets
            ? ((soldCount + reservedCount) / raffle.totalTickets) * 100
            : 0;
          
          return (
            <Card key={raffle.id} className="overflow-hidden">
              <div className="aspect-video w-full bg-slate-100 relative">
                {raffle.imageUrl ? (
                  <Image
                    src={raffle.imageUrl}
                    alt={raffle.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Imagem da Rifa
                  </div>
                )}
                <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">
                  Ativa
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{raffle.title}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Sorteio: {raffle.drawDate ? new Date(raffle.drawDate).toLocaleDateString('pt-BR') : '--/--/----'}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{soldCount} vendidos</span>
                    <span>{raffle.totalTickets} total</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/rifas/${raffle.id}`} className="w-full">
                  <Button variant="outline" className="w-full">Gerenciar</Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

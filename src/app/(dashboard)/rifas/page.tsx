import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

const mockRaffles = [
  {
    id: '1',
    title: 'A&A premiações Bros 160',
    price: 10.00,
    totalTickets: 10000,
    ticketsSold: 0,
    ticketsReserved: 947,
    status: 'active',
    image: 'https://placehold.co/600x400/png', // Placeholder
    drawDate: '06/03/2026'
  },
  {
    id: '2',
    title: 'iPhone 15 Pro Max',
    price: 0.50,
    totalTickets: 100000,
    ticketsSold: 45000,
    ticketsReserved: 2000,
    status: 'active',
    image: 'https://placehold.co/600x400/png',
    drawDate: '15/04/2026'
  }
];

export default function RifasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Rifas</h2>
        <Button onClick={() => alert('Cadastro de novas rifas ainda não foi implementado neste MVP.')}>
          <Plus className="mr-2 h-4 w-4" /> Nova Rifa
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockRaffles.map((raffle) => {
          const progress = ((raffle.ticketsSold + raffle.ticketsReserved) / raffle.totalTickets) * 100;
          
          return (
            <Card key={raffle.id} className="overflow-hidden">
              <div className="aspect-video w-full bg-slate-100 relative">
                 {/* <img src={raffle.image} alt={raffle.title} className="object-cover w-full h-full" /> */}
                 <div className="flex items-center justify-center h-full text-muted-foreground">Imagem da Rifa</div>
                 <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">Ativa</Badge>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{raffle.title}</CardTitle>
                <div className="text-sm text-muted-foreground">Sorteio: {raffle.drawDate}</div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{raffle.ticketsSold} vendidos</span>
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

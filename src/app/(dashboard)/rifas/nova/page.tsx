'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRaffle } from '@/contexts/RaffleContext';
import { Raffle } from '@/types';

export default function NovaRifaPage() {
  const router = useRouter();
  const { createRaffle } = useRaffle();

  const [title, setTitle] = useState('');
  const [drawDate, setDrawDate] = useState('');
  const [price, setPrice] = useState('');
  const [modality, setModality] = useState<'hundred' | 'thousand' | 'ten_thousand'>('ten_thousand');
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [image2Url, setImage2Url] = useState<string | undefined>();
  const [image3Url, setImage3Url] = useState<string | undefined>();
  const [purpose, setPurpose] = useState('');
  const [prize, setPrize] = useState('');
  const [regulation, setRegulation] = useState('');
  const [backgroundUrl, setBackgroundUrl] = useState<string | undefined>();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, setValue: (value: string | undefined) => void) => {
    const file = event.target.files?.[0];
    if (!file) {
      setValue(undefined);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setValue(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!title.trim() || !drawDate || !price || !imageUrl) {
      alert('Preencha os campos obrigatórios e selecione a foto principal.');
      return;
    }

    const id = crypto.randomUUID();
    const raffle: Raffle = {
      id,
      title: title.trim(),
      description: purpose || undefined,
      imageUrl,
      image2Url,
      image3Url,
      purpose: purpose || undefined,
      prize: prize || undefined,
      regulation: regulation || undefined,
      ticketBackgroundUrl: backgroundUrl || imageUrl,
      price: parseFloat(price.replace(',', '.')),
      totalTickets: 10000,
      drawDate: new Date(drawDate).toISOString(),
      status: 'active',
      ticketsSold: 0,
      ticketsReserved: 0,
      modality,
    };

    createRaffle(raffle);
    router.push(`/rifas/${id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Cadastrar Rifa</h2>
        <p className="text-muted-foreground text-sm">Preencha os detalhes para criar uma nova rifa.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Título da Rifa*</Label>
            <Input
              placeholder="ex: Fiat Uno 4 Portas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Data do Sorteio*</Label>
            <Input
              type="date"
              value={drawDate}
              onChange={(e) => setDrawDate(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
          <div className="font-semibold">Nova funcionalidade: Geração otimizada de bilhetes</div>
          <p>
            Agora a criação de rifas é mais rápida. Os bilhetes não são gerados automaticamente durante a criação da rifa.
            Após criar a rifa, você deverá acessar a página da rifa e clicar no botão &quot;Gerar bilhetes&quot;.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Modalidade da Rifa*</Label>
            <Select value={modality} onValueChange={(value) => setModality(value as typeof modality)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ten_thousand">Milhar (0000 a 9999)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Valor do Bilhete*</Label>
            <Input
              placeholder="R$ 0,00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-2 lg:col-span-2">
            <Label>Foto Principal*</Label>
            <div className="border border-dashed rounded-md h-40 flex items-center justify-center text-sm text-muted-foreground mb-2">
              {imageUrl ? <img src={imageUrl} alt="Foto principal" className="h-full w-full object-cover" /> : 'Nenhuma imagem'}
            </div>
            <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setImageUrl)} />
          </div>
          <div className="space-y-2">
            <Label>Foto 2</Label>
            <div className="border border-dashed rounded-md h-40 flex items-center justify-center text-sm text-muted-foreground mb-2">
              {image2Url ? <img src={image2Url} alt="Foto 2" className="h-full w-full object-cover" /> : 'Nenhuma imagem'}
            </div>
            <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setImage2Url)} />
          </div>
          <div className="space-y-2">
            <Label>Foto 3</Label>
            <div className="border border-dashed rounded-md h-40 flex items-center justify-center text-sm text-muted-foreground mb-2">
              {image3Url ? <img src={image3Url} alt="Foto 3" className="h-full w-full object-cover" /> : 'Nenhuma imagem'}
            </div>
            <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setImage3Url)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Background da impressão (opcional)</Label>
          <div className="border border-dashed rounded-md h-32 flex items-center justify-center text-sm text-muted-foreground mb-2">
            {backgroundUrl ? <img src={backgroundUrl} alt="Background" className="h-full w-full object-cover" /> : 'Nenhuma imagem'}
          </div>
          <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setBackgroundUrl)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Propósito da Rifa</Label>
            <Textarea
              placeholder="Opcional: Pra que você está criando esta rifa?"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Prêmio</Label>
            <Textarea
              placeholder="Opcional: Descreva os detalhes do prêmio"
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Regulamento</Label>
            <Textarea
              placeholder="Opcional: Regras e regrinhas da rifa"
              value={regulation}
              onChange={(e) => setRegulation(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">Salvar Rifa</Button>
        </div>
      </form>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Reseller } from '@/types';
import { useRaffle } from '@/contexts/RaffleContext';
import { Trash2, Plus, Eye } from 'lucide-react';
import { ResellerDetailsModal } from './ResellerDetailsModal';

export function ResellersTable() {
  const { resellers, addReseller, safeDeleteReseller } = useRaffle();
  const [newRow, setNewRow] = useState<Partial<Reseller>>({});
  const [selectedReseller, setSelectedReseller] = useState<Reseller | null>(null);

  const handleAdd = () => {
    if (!newRow.name) return;
    addReseller({
      name: newRow.name,
      phone: newRow.phone || '',
      pixKey: newRow.pixKey || '',
      commissionRate: Number(newRow.commissionRate || 10),
    });
    setNewRow({});
  };

  const handleDelete = (id: string) => {
      if (confirm('Tem certeza que deseja excluir este revendedor? Bilhetes reservados serão liberados e histórico de vendas será mantido.')) {
          safeDeleteReseller(id);
      }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-2">
        <Input className="col-span-3" placeholder="Nome" value={newRow.name || ''} onChange={(e) => setNewRow({ ...newRow, name: e.target.value })} />
        <Input className="col-span-3" placeholder="Telefone (Opcional)" value={newRow.phone || ''} onChange={(e) => setNewRow({ ...newRow, phone: e.target.value })} />
        <Input className="col-span-2" placeholder="Comissão %" type="number" value={newRow.commissionRate || ''} onChange={(e) => setNewRow({ ...newRow, commissionRate: Number(e.target.value) })} />
        <Button className="col-span-2" onClick={handleAdd}><Plus className="mr-2 h-4 w-4"/> Adicionar</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Comissão (%)</TableHead>
            <TableHead>Vendas</TableHead>
            <TableHead>Saldo</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resellers.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.phone}</TableCell>
              <TableCell>{r.commissionRate}%</TableCell>
              <TableCell>R$ {r.totalSales.toFixed(2)}</TableCell>
              <TableCell>R$ {r.balance.toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedReseller(r)}>
                        <Eye className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {resellers.length === 0 && (
            <TableRow>
               <TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum revendedor cadastrado.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {selectedReseller && (
        <ResellerDetailsModal 
            reseller={selectedReseller} 
            isOpen={!!selectedReseller} 
            onClose={() => setSelectedReseller(null)} 
        />
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRaffle } from "@/contexts/RaffleContext";
import { Plus } from "lucide-react";

export function ResellerForm() {
  const { addReseller } = useRaffle();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pixKey: '',
    commissionRate: 10
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addReseller({
      name: formData.name,
      phone: formData.phone,
      pixKey: formData.pixKey,
      commissionRate: Number(formData.commissionRate)
    });
    setOpen(false);
    setFormData({ name: '', phone: '', pixKey: '', commissionRate: 10 });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Novo Revendedor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Revendedor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (Opcional)</Label>
            <Input 
              id="phone" 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pix">Chave PIX (Opcional)</Label>
            <Input 
              id="pix" 
              value={formData.pixKey} 
              onChange={e => setFormData({...formData, pixKey: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commission">Comissão (%)</Label>
            <Input 
              id="commission" 
              type="number" 
              min="0" 
              max="100" 
              value={formData.commissionRate} 
              onChange={e => setFormData({...formData, commissionRate: Number(e.target.value)})} 
              required 
            />
          </div>
          <Button type="submit" className="w-full">Salvar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

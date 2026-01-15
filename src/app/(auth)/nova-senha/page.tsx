'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulação de alteração
    setTimeout(() => {
      setLoading(false);
      alert('Senha alterada com sucesso!');
      router.push('/login');
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-2xl">Nova Senha</CardTitle>
        <CardDescription className="text-center">
          Crie uma nova senha segura para sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha</Label>
            <Input id="password" type="password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input id="confirmPassword" type="password" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Redefinir Senha'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

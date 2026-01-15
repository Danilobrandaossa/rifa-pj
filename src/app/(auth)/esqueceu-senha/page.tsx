'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-2xl">Recuperar Senha</CardTitle>
        <CardDescription className="text-center">
          Digite seu e-mail para receber o link de redefinição
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="admin@rifagestor.com" required />
            </div>
            <Button type="submit" className="w-full">
              Enviar Link
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 text-green-700 rounded-lg">
              Link de recuperação enviado com sucesso! Verifique sua caixa de entrada.
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">Voltar para Login</Link>
            </Button>
          </div>
        )}
      </CardContent>
      {!submitted && (
        <CardFooter className="justify-center">
          <Link 
            href="/login" 
            className="flex items-center text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Login
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}

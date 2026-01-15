'use client';

import { useRaffle } from "@/contexts/RaffleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";

export default function DebitosPage() {
  const { resellers } = useRaffle();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Débitos e Acertos</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contas a Receber (Revendedores)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Revendedor</TableHead>
                <TableHead>Total Vendido</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>A Pagar (Líquido)</TableHead>
                <TableHead className="w-[150px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resellers.map((reseller) => {
                const commission = reseller.totalSales * (reseller.commissionRate / 100);
                const debt = reseller.totalSales - commission;
                
                return (
                  <TableRow key={reseller.id}>
                    <TableCell className="font-medium">{reseller.name}</TableCell>
                    <TableCell>R$ {reseller.totalSales.toFixed(2)}</TableCell>
                    <TableCell>R$ {commission.toFixed(2)} ({reseller.commissionRate}%)</TableCell>
                    <TableCell className="font-bold text-red-600">R$ {debt.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" disabled={debt <= 0}>
                        <DollarSign className="mr-2 h-4 w-4" /> Baixar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {resellers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum revendedor encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

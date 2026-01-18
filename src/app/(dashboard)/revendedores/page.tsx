'use client';

import { useRaffle } from "@/contexts/RaffleContext";
import { ResellerForm } from "@/components/resellers/ResellerForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function ResellersPage() {
  const { resellers, deleteReseller } = useRaffle();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter">Revendedores</h2>
        <div className="w-full sm:w-auto">
          <ResellerForm />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Revendedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Vendas Totais</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resellers.map((reseller) => (
                  <TableRow key={reseller.id}>
                    <TableCell className="font-medium">{reseller.name}</TableCell>
                    <TableCell>{reseller.phone}</TableCell>
                    <TableCell>{reseller.commissionRate}%</TableCell>
                    <TableCell>R$ {reseller.totalSales.toFixed(2)}</TableCell>
                    <TableCell>R$ {reseller.balance.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteReseller(reseller.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {resellers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      Nenhum revendedor cadastrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

# Documentação Técnica: RifaGestor

Esta documentação descreve as funcionalidades, arquitetura visual e regras de negócio observadas no sistema RifaGestor (https://rifagestor-xi.vercel.app/).

## 1. Visão Geral
O RifaGestor é um sistema de gestão (SaaS/ERP) voltado para administradores de rifas e sorteios. Diferente de um site de vendas comum, sua interface é otimizada para o **gerenciamento manual**, controle de revendedores e monitoramento de desempenho.

## 2. Arquitetura de Páginas
- **Dashboard**: Centraliza KPIs (Rifas Ativas, Receita, Revendedores).
- **Rifas (/rifas)**:
    - Listagem de campanhas com status (Ativo/Finalizado).
    - Detalhes da Rifa: Gerenciamento de bilhetes e prêmios.
- **Vendas (/vendas)**: Histórico de transações e PDV manual (Nova Venda).
- **Revendedores**: Cadastro e controle de afiliados/vendedores.
- **Débitos**: Gestão financeira de acertos pendentes com revendedores.

## 3. Funcionalidades Detalhadas

### Gestão de Bilhetes
A funcionalidade mais complexa observada é a grade de bilhetes na página de detalhes da rifa:
- **Agrupamento**: Suporte a grandes volumes de números (ex: 10.000 números) organizados em "Grupos" e "Subgrupos".
- **Status Visual**: 
    - **Verde**: Disponível.
    - **Amarelo**: Reservado (temporal).
    - **Azul**: Pago (confirmado).
- **Seleção Dinâmica**: Campo de input que aceita formatos como `1,2,3` ou intervalos `10-20`.

### Fluxo de Venda Manual (PDV)
O sistema permite que o administrador registre vendas feitas "por fora" (ex: WhatsApp):
1. Seleção da Rifa.
2. Identificação do Cliente (Nome/Contato).
3. Atribuição a um Revendedor.
4. Seleção dos números.
5. Cálculo automático de valor total.

## 4. Stack Tecnológica (Inferida)
- **Frontend**: Next.js (Router App), React, TypeScript.
- **Estilização**: Tailwind CSS + Shadcn/UI (identificado pela consistência dos modais e botões).
- **Infraestrutura**: Vercel.

## 5. Design System
- **Paleta**: 
    - Primária: `#0f172a` (Slate-900 / Navy Blue).
    - Ação: Azul vibrante para botões principais.
    - Status: Padrão semafórico para bilhetes.
- **Tipografia**: Sans-serif moderna (provavelmente Inter ou Geist).
- **Layout**: Sidebar colapsável à esquerda com área de conteúdo centralizada.

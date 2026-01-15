# Prompt Profissional para Replicação do RifaGestor

Copie e cole este prompt em um modelo de linguagem avançado (GPT-4o, Claude 3.5 Sonnet) para gerar o código base do sistema.

---

### Prompt:

"Aja como um Arquiteto de Software e Desenvolvedor Fullstack Sênior especializado em ecossistemas Next.js. Seu objetivo é criar um sistema de **Gestão de Rifas (ERP/Admin)** inspirado no RifaGestor.

#### **Core Tech Stack:**
- **Framework**: Next.js 14/15 (App Router).
- **Linguagem**: TypeScript (Strict Mode).
- **Estilização**: Tailwind CSS.
- **Componentes**: Shadcn/UI (Radix UI).
- **Ícones**: Lucide React.
- **Charts**: Recharts.

#### **Requisitos Funcionais - MVP:**

1.  **Dashboard de Administração:**
    - Sidebar dark mode (`bg-slate-950`) com navegação: Dashboard, Rifas, Vendas, Revendedores, Débitos, Configurações.
    - Cards de resumo: Total de Rifas, Receita Bruta (R$), Comissões Pagas, Novos Clientes.
    - Gráfico de linha mostrando evolução de vendas nos últimos 7 dias.

2.  **Módulo de Gestão de Rifas:**
    - Página de listagem com cards (Imagem do prêmio, título, progresso da barra de vendas em %).
    - Página de Detalhes da Rifa:
        - Aba 'Bilhetes': Implementar uma grade interativa de números que suporte alta volumetria. Use paginação ou virtualização se necessário.
        - Filtro de bilhetes por status: Disponíveis, Reservados, Pagos.
        - Campo de seleção rápida aceitando range (ex: 10-50).

3.  **Sistema de Vendas (PDV Manual):**
    - Modal 'Nova Venda' que contenha:
        - Select para escolher a Rifa.
        - Searchable select para Cliente e Revendedor.
        - Grade de seleção de números simplificada.
        - Resumo de valores com cálculo de comissão.

4.  **Gestão de Revendedores:**
    - Tabela CRUD para gerenciar pessoas autorizadas a vender, com campos de nome, telefone, PIX e percentual de comissão fixo.

#### **Diretrizes de UI/UX:**
- A interface deve parecer um software Enterprise: sóbria, limpa e funcional.
- Use o tema Slate ou Zinc do Shadcn/UI.
- Feedback visual imediato ao clicar em bilhetes (mudança de cor).
- Responsividade total para uso em tablets e celulares por administradores.

#### **Entregável Esperado:**
1. Estrutura de pastas sugerida.
2. Arquivo `layout.tsx` com a Sidebar funcional.
3. Componente `TicketGrid.tsx` com a lógica de seleção de números e estados.
4. Exemplo de modelagem de dados (Typescript interfaces) para Rifas, Bilhetes e Vendas."
---

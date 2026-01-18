'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  DollarSign, 
  CreditCard, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/rifas', label: 'Rifas', icon: Ticket },
  { href: '/vendas', label: 'Vendas', icon: DollarSign },
  { href: '/revendedores', label: 'Revendedores', icon: Users },
  { href: '/debitos', label: 'Débitos', icon: CreditCard },
  { href: '/usuarios', label: 'Usuários', icon: Users },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

type SidebarContentProps = {
  onItemClick?: () => void;
};

export function SidebarContent({ onItemClick }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-slate-950 text-white">
      <div className="flex h-16 items-center justify-center border-b border-slate-800 px-6">
        <h1 className="text-xl font-bold tracking-tighter">RifaGestor</h1>
      </div>

      <div className="relative flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-2 font-medium">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center rounded-lg p-3 transition-colors group",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="ml-3">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="absolute bottom-4 left-0 w-full px-3">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center rounded-lg p-3 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="ml-3">Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-950 text-white transition-transform print:hidden hidden md:block">
      <SidebarContent />
    </aside>
  );
}

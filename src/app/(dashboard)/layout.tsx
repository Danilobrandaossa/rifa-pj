import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 overflow-y-auto h-screen print:ml-0 print:p-0 print:h-auto print:overflow-visible">
        {children}
      </main>
    </div>
  );
}

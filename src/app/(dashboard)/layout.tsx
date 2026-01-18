import { Sidebar, SidebarContent } from "@/components/layout/Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-slate-950 text-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-lg font-bold tracking-tight">RifaGestor</div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="flex-1 px-4 pb-6 pt-20 md:pt-8 md:px-8 md:ml-64 overflow-y-auto h-screen print:ml-0 print:p-0 print:h-auto print:overflow-visible">
        {children}
      </main>
    </div>
  );
}

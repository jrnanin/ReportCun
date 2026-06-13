import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Shield, FileText, Activity } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const isHome = location === "/";
  const isAdmin = location.startsWith("/admin");

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground shadow-sm">
        <div className="container flex h-14 items-center px-4 justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg" data-testid="link-home">
            <Shield className="h-5 w-5" />
            <span>ReportaMunicipio</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/track" className={`hover:text-primary-foreground/80 transition-colors ${location === '/track' ? 'opacity-100' : 'opacity-80'}`} data-testid="link-track">
              Seguimiento
            </Link>
            <Link href="/admin" className={`hover:text-primary-foreground/80 transition-colors ${isAdmin ? 'opacity-100' : 'opacity-80'}`} data-testid="link-admin">
              Admin
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full max-w-md mx-auto sm:max-w-xl md:max-w-3xl lg:max-w-5xl px-4 py-6 md:py-8 flex flex-col">
        {children}
      </main>
    </div>
  );
}

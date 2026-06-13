import { Link } from "wouter";
import { Droplet, AlertTriangle, Lightbulb, ShieldAlert, Trash2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const CATEGORIES = [
  { id: "water", label: "Agua y Alcantarillado", icon: Droplet, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "pothole", label: "Baches y Vialidad", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
  { id: "lighting", label: "Alumbrado Público", icon: Lightbulb, color: "text-yellow-500", bg: "bg-yellow-50" },
  { id: "security", label: "Seguridad Pública", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-50" },
  { id: "waste", label: "Recolección de Basura", icon: Trash2, color: "text-green-500", bg: "bg-green-50" },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground" data-testid="text-home-title">
          Reporte Ciudadano
        </h1>
        <p className="text-muted-foreground text-lg" data-testid="text-home-subtitle">
          Ayúdanos a mejorar nuestra ciudad. Selecciona el tipo de problema que deseas reportar.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link key={cat.id} href={`/report/new?category=${cat.id}`} data-testid={`link-category-${cat.id}`}>
              <Card className="hover-elevate cursor-pointer transition-all border-border hover:border-primary/50 group h-full">
                <CardContent className="p-5 flex items-center gap-4 h-full">
                  <div className={`p-3 rounded-full ${cat.bg} ${cat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 font-medium text-lg text-foreground group-hover:text-primary transition-colors">
                    {cat.label}
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 rounded-lg bg-primary/5 border border-primary/10 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
        <div className="p-3 bg-primary/10 rounded-full text-primary">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-1">¿Emergencia?</h3>
          <p className="text-muted-foreground text-sm mb-3">Si esto es una emergencia médica o de seguridad inmediata, por favor llama al 911.</p>
          <a href="tel:911" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2" data-testid="button-emergency">
            Llamar al 911
          </a>
        </div>
      </div>
    </div>
  );
}

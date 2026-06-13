import { useState } from "react";
import { useLocation } from "wouter";
import { useGetReportByFolio, getGetReportByFolioQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Calendar, Clock } from "lucide-react";
import { CATEGORIES } from "@/pages/home";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_MAP: Record<string, { label: string; color: string; progress: number }> = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", progress: 25 },
  in_progress: { label: "En Proceso", color: "bg-blue-100 text-blue-800", progress: 50 },
  resolved: { label: "Resuelto", color: "bg-green-100 text-green-800", progress: 100 },
  closed: { label: "Cerrado", color: "bg-gray-100 text-gray-800", progress: 100 },
};

export default function Track() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialFolio = searchParams.get("folio") || "";
  const [searchInput, setSearchInput] = useState(initialFolio);
  const [activeFolio, setActiveFolio] = useState(initialFolio);

  const { data: report, isLoading, isError } = useGetReportByFolio(activeFolio, {
    query: {
      enabled: !!activeFolio,
      queryKey: getGetReportByFolioQueryKey(activeFolio),
      retry: false,
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveFolio(searchInput.trim().toUpperCase());
      // Update URL without reload
      window.history.replaceState({}, "", `/track?folio=${searchInput.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Seguimiento de Reporte</h1>
        <p className="text-muted-foreground">Ingresa tu número de folio para conocer el estado actual de tu reporte.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input 
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Ej. WAT-123456" 
          className="flex-1 font-mono uppercase"
          data-testid="input-folio"
        />
        <Button type="submit" disabled={!searchInput.trim()} data-testid="btn-search-folio">
          <Search className="w-4 h-4 mr-2" /> Buscar
        </Button>
      </form>

      {isLoading && (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {isError && !isLoading && (
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-6 text-center text-destructive">
            No pudimos encontrar un reporte con ese folio. Verifica que esté escrito correctamente.
          </CardContent>
        </Card>
      )}

      {report && !isLoading && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-mono">{report.folio}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {CATEGORIES.find(c => c.id === report.category)?.label || report.category}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_MAP[report.status].color}`}>
                  {STATUS_MAP[report.status].label}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progreso</span>
                  <span className="font-medium">{STATUS_MAP[report.status].progress}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 ease-out" 
                    style={{ width: `${STATUS_MAP[report.status].progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Fecha de reporte</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(report.createdAt), "dd 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
                {report.estimatedResponseHours && (
                  <div className="flex gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Tiempo de respuesta estimado</p>
                      <p className="text-sm text-muted-foreground">{report.estimatedResponseHours} horas</p>
                    </div>
                  </div>
                )}
                <div className="flex gap-3 md:col-span-2">
                  <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Ubicación</p>
                    <p className="text-sm text-muted-foreground">
                      {report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Descripción</p>
                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-md">
                  {report.description}
                </p>
              </div>
              
              {report.notes && (
                <div>
                  <p className="text-sm font-medium mb-1">Notas del municipio</p>
                  <p className="text-sm text-muted-foreground bg-blue-50 text-blue-900 p-3 rounded-md">
                    {report.notes}
                  </p>
                </div>
              )}

              {report.photoUrls && report.photoUrls.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Evidencia fotográfica</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {report.photoUrls.map((url, i) => (
                      <img key={i} src={url} alt={`Evidencia ${i+1}`} className="w-full aspect-square object-cover rounded-md border" />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

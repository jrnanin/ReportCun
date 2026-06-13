import { useState } from "react";
import { useGetStats, useGetRecentReports, useUpdateReportStatus, getGetRecentReportsQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { ReportStatusPatchStatus } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Admin() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: reports, isLoading: reportsLoading } = useGetRecentReports({ limit: 50 });
  const updateStatus = useUpdateReportStatus();

  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});

  const handleStatusChange = (id: number, status: ReportStatusPatchStatus) => {
    setUpdatingId(id);
    updateStatus.mutate(
      { id, data: { status, notes: notes[id] } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetRecentReportsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          setUpdatingId(null);
        },
        onError: () => {
          setUpdatingId(null);
        }
      }
    );
  };

  const handleNoteChange = (id: number, val: string) => {
    setNotes(prev => ({ ...prev, [id]: val }));
  };

  if (statsLoading || reportsLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold mb-2">Panel Administrativo</h1>
        <p className="text-muted-foreground">Resumen municipal de reportes ciudadanos.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">En Proceso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">Resueltos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.resolved}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Reportes Recientes</h2>
        <div className="space-y-4">
          {reports?.length === 0 && (
            <p className="text-muted-foreground">No hay reportes recientes.</p>
          )}
          {reports?.map(report => (
            <Card key={report.id} className="overflow-hidden">
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-8">
                  <div className="flex gap-2 items-center mb-2">
                    <span className="font-mono text-primary font-bold">{report.folio}</span>
                    <Badge variant="outline">{report.category}</Badge>
                    <span className="text-xs text-muted-foreground ml-auto md:ml-0">
                      {format(new Date(report.createdAt), "dd MMM, HH:mm", { locale: es })}
                    </span>
                  </div>
                  <p className="text-sm mb-3">{report.description}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="font-medium">Ubicación:</span> {report.address || "Coordenadas"}
                  </p>
                </div>
                
                <div className="md:col-span-4 flex flex-col gap-2 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Estado</label>
                    <Select 
                      defaultValue={report.status} 
                      disabled={updatingId === report.id}
                      onValueChange={(val) => handleStatusChange(report.id, val as ReportStatusPatchStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="in_progress">En Proceso</SelectItem>
                        <SelectItem value="resolved">Resuelto</SelectItem>
                        <SelectItem value="closed">Cerrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Agregar Nota (visible al ciudadano)</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Resolución o detalle..." 
                        className="h-8 text-sm"
                        value={notes[report.id] ?? (report.notes || "")}
                        onChange={(e) => handleNoteChange(report.id, e.target.value)}
                      />
                      <Button 
                        size="sm" 
                        className="h-8"
                        disabled={updatingId === report.id || notes[report.id] === undefined || notes[report.id] === report.notes}
                        onClick={() => handleStatusChange(report.id, report.status as ReportStatusPatchStatus)}
                      >
                        {updatingId === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

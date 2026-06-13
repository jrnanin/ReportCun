import { useState } from "react";
import { useLocation } from "wouter";
import { CATEGORIES } from "@/pages/home";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MapSelector } from "@/components/map";
import { useCreateReport } from "@workspace/api-client-react";
import { ReportInputCategory } from "@workspace/api-client-react/src/generated/api.schemas";
import { Loader2, UploadCloud, CheckCircle2 } from "lucide-react";

export default function NewReport() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("category") as ReportInputCategory | null;

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<ReportInputCategory | null>(initialCategory);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [folio, setFolio] = useState<string | null>(null);

  const createReport = useCreateReport();

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/photos", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setPhotos([...photos, data.url]);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!category || !position || description.length < 10) return;

    createReport.mutate(
      {
        data: {
          category,
          latitude: position[0],
          longitude: position[1],
          address: address || "No proporcionada",
          description,
          photoUrls: photos,
          reporterName: name || undefined,
          reporterPhone: phone || undefined,
          reporterEmail: email || undefined,
        },
      },
      {
        onSuccess: (data) => {
          setFolio(data.folio);
          setStep(5);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto py-4">
      {step < 5 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Paso {step} de 4</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-right-4">
          <h2 className="text-2xl font-bold mb-4">¿Qué tipo de problema deseas reportar?</h2>
          <div className="grid grid-cols-1 gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <Card
                  key={cat.id}
                  className={`cursor-pointer transition-all ${isSelected ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}
                  onClick={() => setCategory(cat.id as ReportInputCategory)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`p-2 rounded-full ${cat.bg} ${cat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{cat.label}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Button className="w-full mt-6" disabled={!category} onClick={handleNext} data-testid="btn-next-1">
            Continuar
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-right-4">
          <h2 className="text-2xl font-bold mb-4">¿Dónde se ubica el problema?</h2>
          <p className="text-sm text-muted-foreground mb-4">Mueve el marcador a la ubicación exacta o permite que usemos tu ubicación actual.</p>
          <MapSelector position={position} setPosition={setPosition} />
          <div className="mt-4">
            <Label htmlFor="address">Referencia de dirección (opcional)</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ej. Frente a la tienda, esquina con..." className="mt-1" />
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={handlePrev}>Atrás</Button>
            <Button className="flex-1" disabled={!position} onClick={handleNext} data-testid="btn-next-2">Continuar</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-in fade-in slide-in-from-right-4">
          <h2 className="text-2xl font-bold mb-4">Agrega fotos (opcional)</h2>
          <p className="text-sm text-muted-foreground mb-4">Las fotos nos ayudan a evaluar mejor la situación y asignar los recursos correctos.</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {photos.map((url, i) => (
              <div key={i} className="aspect-square rounded-md overflow-hidden border relative group">
                <img src={url} alt="Evidencia" className="w-full h-full object-cover" />
              </div>
            ))}
            <label className="aspect-square rounded-md border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors">
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <UploadCloud className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium text-muted-foreground">Subir foto</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={isUploading} />
            </label>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={handlePrev}>Atrás</Button>
            <Button className="flex-1" onClick={handleNext} data-testid="btn-next-3">Continuar</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="animate-in fade-in slide-in-from-right-4">
          <h2 className="text-2xl font-bold mb-4">Detalles del reporte</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Descripción del problema *</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Describe el problema con el mayor detalle posible..." 
                className="mt-1 min-h-[100px]"
              />
              {description.length > 0 && description.length < 10 && (
                <p className="text-xs text-destructive mt-1">La descripción debe tener al menos 10 caracteres.</p>
              )}
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Tus datos (opcional)</h3>
              <p className="text-xs text-muted-foreground mb-4">Para contactarte en caso de necesitar más información.</p>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={handlePrev}>Atrás</Button>
            <Button 
              className="flex-1" 
              disabled={description.length < 10 || createReport.isPending} 
              onClick={handleSubmit}
              data-testid="btn-submit"
            >
              {createReport.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Enviar Reporte
            </Button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="text-center animate-in zoom-in-95 duration-500 py-8">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold mb-2">¡Reporte Enviado!</h2>
          <p className="text-muted-foreground mb-6">Gracias por ayudar a mejorar nuestra ciudad. Hemos recibido tu reporte correctamente.</p>
          
          <div className="bg-secondary/50 p-6 rounded-lg mb-8 inline-block mx-auto min-w-[250px]">
            <p className="text-sm font-medium text-muted-foreground mb-1">Tu número de folio es:</p>
            <p className="text-3xl font-mono font-bold tracking-wider text-primary">{folio}</p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button onClick={() => setLocation(`/track?folio=${folio}`)}>
              Rastrear mi reporte
            </Button>
            <Button variant="outline" onClick={() => setLocation("/")}>
              Volver al inicio
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

# ReportCun - App móvil web para reportes ciudadanos

Aplicación web progresiva (PWA) diseñada para dispositivos móviles que permite a los ciudadanos reportar incidentes de servicios públicos e inseguridad. Los reportes se canalizan automáticamente al área municipal correspondiente, agilizando la atención según la prioridad del incidente.

## 🚀 Características principales

- **Categorías de reportes**:  
  Agua, bacheo, alumbrado público, seguridad pública y servicios de desecho.
- **Tiempos de respuesta diferenciados** por tipo de incidencia (ver tabla más abajo).
- **Evidencia fotográfica**: Captura o selecciona imágenes desde tu dispositivo.
- **Geolocalización automática** con opción de ajuste manual en mapa.
- **Datos personales básicos** (nombre, teléfono, correo – solo para seguimiento).
- **Folio de seguimiento** único para cada reporte.
- **Diseño 100% responsive** y optimizado para dispositivos móviles.

## ⏱️ Tiempos de respuesta por categoría

| Categoría          | Tiempo estimado de primera respuesta |
|--------------------|---------------------------------------|
| Agua (falta de suministro) | 24 horas                      |
| Bacheo             | 7 días hábiles                        |
| Alumbrado público  | 48 horas                              |
| Seguridad pública  | 15 minutos (despacho a patrulla)      |
| Servicios de desecho | 72 horas                           |

> *Los tiempos son orientativos y dependen de la carga de trabajo municipal.*

## 📋 Flujo de funcionamiento

1. El usuario accede desde su navegador móvil.
2. Selecciona la categoría del problema.
3. Permite el acceso a su ubicación (o la selecciona en un mapa).
4. Adjunta una o más fotografías.
5. Completa sus datos personales (nombre, teléfono, email – opcional para seguimiento).
6. Envía el reporte.
7. Recibe un **folio** y puede consultar el estado en cualquier momento.

En el backend:
- El reporte se almacena con geolocalización, imagen y metadatos.
- Un sistema de enrutamiento asigna el área municipal automáticamente.
- Se notifica al departamento correspondiente (email, API o dashboard interno).

## 🛠️ Stack tecnológico recomendado

| Capa          | Tecnologías sugeridas                    |
|---------------|------------------------------------------|
| Frontend      | React + Vite, TailwindCSS, Leaflet (mapas) |
| Backend       | Node.js + Express (o Django REST)        |
| Base de datos | PostgreSQL con extensión PostGIS         |
| Almacenamiento de imágenes | Cloudinary / AWS S3           |
| Geolocalización | Browser Geolocation API + Nominatim (reverse geocoding) |

## 📱 Instalación y despliegue local

```bash
# Clonar repositorio
git clone https://github.com/tuusuario/reportamunicipio.git
cd reportamunicipio

# Instalar dependencias frontend
cd frontend
npm install
npm run dev

# Instalar dependencias backend (en otra terminal)
cd ../backend
npm install
npm run start:dev# ReportCun

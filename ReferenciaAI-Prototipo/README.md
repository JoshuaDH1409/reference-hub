# Referencia AI — Prototipo funcional

Sistema de gestión de referencias laborales automatizadas. **EstrategIA Tecnológica**.

Tecnología: **.NET 8 (ASP.NET Core minimal API + EF Core + SQLite)** y **React (Vite)**.

## Requisitos

1. **.NET 8 SDK** — descargar de https://dotnet.microsoft.com/download/dotnet/8.0
2. **Node.js 18+** — descargar de https://nodejs.org

Verifica en Terminal: `dotnet --version` y `node --version`.

## Cómo ejecutar

Abre **dos ventanas de Terminal**:

**Terminal 1 — Backend (API):**
```bash
cd backend
dotnet run
```
La API queda en `http://localhost:5155`. Al primer arranque crea la base SQLite
(`referencia_ai.db`) con **datos de demostración** (3 candidatos en distintas etapas).

**Terminal 2 — Frontend (web):**
```bash
cd frontend
npm install
npm run dev
```
Abre `http://localhost:5173` en tu navegador.

## Recorrido sugerido para la demo

1. **Dashboard** — estadísticas en tiempo real, avance por candidato, score y semáforo.
2. Entra al expediente de **María Fernanda López** (proceso completado): score automático
   por competencia, semáforo de riesgo, comentarios inteligentes (fortalezas / áreas de
   oportunidad resumidas) y línea de tiempo completa.
3. **Registrar candidato** — da de alta un candidato con sus referencias; la plataforma
   "envía" las invitaciones automáticamente.
4. **Correos enviados** — bandeja de demostración con los correos que se enviarían
   (en producción se conecta un servidor SMTP real). Cada correo incluye el enlace
   seguro del cuestionario.
5. En el expediente, usa **"Copiar enlace"** en una referencia pendiente y ábrelo en
   otra pestaña: verás el **cuestionario público** tal como lo ve el referente.
   Respóndelo y observa cómo se actualizan score, avance, timeline y estatus.
6. **Ver reporte** — reporte consolidado imprimible (botón *Imprimir / Guardar PDF*).

## Estructura

```
backend/
  Program.cs      → endpoints de la API
  Modelos.cs      → entidades y DTOs
  BaseDatos.cs    → DbContext + datos de demostración
  Servicios.cs    → score, semáforo, resumen de comentarios, correos
frontend/
  src/pages/      → Dashboard, NuevoCandidato, Expediente, Cuestionario, Reporte, Correos
```

## Notas del prototipo

- Los correos son **simulados** (se guardan en la base y se muestran en "Correos enviados").
  Para producción: integrar SMTP/SendGrid en `Servicios.cs`.
- Los recordatorios se envían manualmente con un botón; en producción serían un
  trabajo programado (background service) según la configuración del cliente.
- Sin autenticación de usuarios (fuera de alcance del prototipo).
- Para reiniciar los datos de demo: detén la API y borra `backend/referencia_ai.db`.

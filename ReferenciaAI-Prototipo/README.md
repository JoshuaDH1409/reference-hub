# Reference Hub

Prototipo para gestionar referencias laborales: invitas referentes, recolectas respuestas, puntúas candidatos y generas reportes.

## Stack

- **Frontend:** React + Vite + Tailwind
- **Backend:** .NET 8 (minimal API) + EF Core + SQLite
- **Extras:** Recharts, QuestPDF, bandeja de correo simulada

## Requisitos

- .NET 8 SDK
- Node.js 18+

## Cómo correrlo

Dos terminales. Si clonaste el repo, el código vive en `ReferenciaAI-Prototipo/`.

**API**

```bash
cd ReferenciaAI-Prototipo/backend
dotnet run
```

Queda en `http://localhost:5155`. Al arrancar crea `referencia_ai.db` con datos de demo.

**Frontend**

```bash
cd ReferenciaAI-Prototipo/frontend
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Qué puedes probar

- Dashboard con avance y semáforo de riesgo
- Expediente de un candidato terminado
- Alta de candidato + invitaciones a referentes
- Bandeja de correos de demo (SMTP opcional)
- Cuestionario público (copia el link de una referencia pendiente)
- Reportes / PDF

## Limitaciones

## Notas del prototipo

- Los correos son **simulados** (se guardan en la base y se muestran en "Correos enviados").
  Para producción: integrar SMTP/SendGrid en `Servicios.cs`.
- Los recordatorios se envían manualmente con un botón; en producción serían un
  trabajo programado (background service) según la configuración del cliente.
- Sin autenticación de usuarios (fuera de alcance del prototipo).
- Para reiniciar los datos de demo: detén la API y borra `backend/referencia_ai.db`.

## Despliegue en Azure

El repositorio incluye dos workflows de GitHub Actions:

- `deploy-api.yml`: publica `backend` en `referenciasai-api`.
- `deploy-web.yml`: construye `frontend/dist` y lo publica en `referenciasai-web`.

Configura estos secretos en GitHub, en **Settings > Secrets and variables > Actions**:

- `AZURE_WEBAPP_PUBLISH_PROFILE`: publish profile de `referenciasai-api`.
- `AZURE_WEBAPP_PUBLISH_PROFILE_WEB`: publish profile de `referenciasai-web`.

El frontend usa `https://referenciasai-api.azurewebsites.net` como URL de producción mediante `frontend/.env.production`.

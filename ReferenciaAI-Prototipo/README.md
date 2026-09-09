# Reference Hub

Portfolio prototype of an **automated employment-reference management platform**: invite referrers, collect structured feedback, score candidates, and generate printable reports.

Formerly developed as *Referencia AI*; rebranded for portfolio presentation as **Reference Hub**.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | **React** + **Vite** + **Tailwind CSS** |
| Backend | **.NET 8** (ASP.NET Core minimal API) + **EF Core** + **SQLite** |
| Extras | Charts (Recharts), PDF reports (QuestPDF), simulated email inbox |

## Requirements

1. **.NET 8 SDK** — https://dotnet.microsoft.com/download/dotnet/8.0
2. **Node.js 18+** — https://nodejs.org

Verify: `dotnet --version` and `node --version`.

## How to run

Open **two terminals**:

**Terminal 1 — Backend (API)**
```bash
cd ReferenciaAI-Prototipo/backend
dotnet run
```
API at `http://localhost:5155`. On first start it creates SQLite (`referencia_ai.db`) with demo data.

**Terminal 2 — Frontend**
```bash
cd ReferenciaAI-Prototipo/frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

> Paths assume you cloned the repo root. If your working directory is already `ReferenciaAI-Prototipo/`, use `cd backend` / `cd frontend`.

## Demo walkthrough

1. **Dashboard** — live stats, candidate progress, risk traffic-light scores.
2. Open a completed candidate expediente — competency scores, risk, comment summaries, timeline.
3. **Register candidate** — create a candidate with referrers; invitations are queued automatically.
4. **Messages** — demo mailbox of emails that would be sent (SMTP optional in production).
5. **Copy link** on a pending reference → public questionnaire as the referrer sees it.
6. **Reports** — consolidated printable / PDF report.

## Project structure

```
ReferenciaAI-Prototipo/
  backend/     Program.cs, models, EF Core, scoring & email services
  frontend/    Vite React app (pages, dashboard charts, Tailwind theme)
```

## Notes

- Emails can be **simulated** (stored in DB / demo inbox). Configure SMTP via `appsettings.json` / environment variables — **do not commit real passwords**.
- Reminders are manual in the prototype; production would use a background job.
- Auth UI is present for demo navigation; full multi-tenant auth is out of scope for this portfolio build.
- Reset demo data: stop the API and delete `backend/referencia_ai.db`.

## License / portfolio

Built as a functional prototype for portfolio showcase. Branding: **Reference Hub**.

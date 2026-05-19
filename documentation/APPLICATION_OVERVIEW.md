# VibeOps by OverYonder — Application Documentation

> A reference description of this codebase for an AI assistant (or new engineer)
> picking up the project. Written 2026-05-15.

---

## 1. What this application is

**VibeOps by OverYonder** is a premium, multi-tenant **AI Transformation Operating
System** — a single web platform that two distinct kinds of organizations use to
run their AI transformation work:

1. **Internal Enterprise / CIO organizations** — manage internal AI
   transformation: portfolio, intake, governance, security, adoption, migrations.
2. **Consulting / Services firms** — manage client delivery: clients, engagements,
   proposals, delivery operations, utilization, revenue, forecasting.

It is **one codebase, one platform** that visually and functionally reshapes
itself based on the active **operating mode**. The two modes share the shell,
design system, and routing infrastructure but present different sidebars,
dashboards, KPIs, and modules.

The product is currently a **front-end application with local mock data**. There
is a backend API server and a Postgres database wired into the repo and Docker
stack, but the UI does not yet call the API — all data is in-memory mock data
under `artifacts/vibeops/src/data/`.

---

## 2. Technology stack

- **Monorepo**: pnpm workspaces (`pnpm-workspace.yaml`). pnpm is pinned to
  `10.33.4` for Docker builds.
- **Frontend** (`artifacts/vibeops`): React 19, TypeScript 5.9, Vite 7,
  Tailwind CSS v4, Wouter (routing), TanStack Query, Recharts, Framer Motion,
  Lucide icons, Radix UI primitives (shadcn/ui component kit).
- **API server** (`artifacts/api-server`): Express 5, bundled with esbuild.
  Currently a skeleton — `/api` router with logging/CORS, no business routes yet.
- **Database** (`lib/db`): PostgreSQL + Drizzle ORM. The schema
  (`lib/db/src/schema/index.ts`) is currently **empty** — no tables defined.
- **Other workspace packages**: `lib/api-spec` (OpenAPI + Orval codegen),
  `lib/api-zod`, `lib/api-client-react`, `artifacts/mockup-sandbox`.
- **Containerization**: Docker + docker-compose — `postgres`, `api`, `web`
  services. Both app images build for `linux/amd64` (the repo's pnpm overrides
  strip every native binary except `linux-x64-gnu`).

### Running it

```bash
cp .env.example .env          # first time only
docker compose up --build     # postgres + api + web
```

- Web app: `http://localhost:4173` (host port configurable via `WEB_PORT`)
- API: `http://localhost:5001` → container port 5000 (`API_PORT`)
- Postgres: `localhost:5434` (`POSTGRES_PORT`)

(The default `.env.example` uses 4173/5000/5432; the local `.env` was shifted to
5001/5434 to avoid host port conflicts.)

For fast UI iteration you can run Postgres only (`docker compose up postgres -d`)
and run the app on the host.

---

## 3. Design system — "OverYonder" white/orange

The app uses a **light-first, enterprise SaaS** aesthetic. There is **no dark
mode** (it was removed). The look targets ServiceNow / Palantir / McKinsey
operational software.

Defined in `artifacts/vibeops/src/index.css` as CSS custom properties (HSL
triplets consumed via `hsl(var(--token))`, so the entire shadcn ui kit works
unchanged):

- **Background**: white `#ffffff`; surfaces warm light gray `#fafafa`.
- **Text**: charcoal `#2d2d2d`.
- **Primary / accent**: orange `#f97316` — used for the logo tile, active nav
  items, primary buttons, chart-1.
- **Success**: green `#22c55e`. **Destructive**: red `#dc2626`.
- **Chart palette**: orange, green, blue, purple, amber.
- Soft shadows, soft borders (`#e5e5e5`), `0.5rem` radius.
- The legacy `.glass` utility was repurposed to a plain light card so older
  components still render correctly.

Fonts: Inter (sans), JetBrains Mono (mono).

---

## 4. Application architecture

### Shell & layout

```
App.tsx
└── QueryClientProvider
    └── TooltipProvider
        └── AppContextProvider            (operating mode, tenant, role)
            └── ConsultingDataProvider     (consulting clients — mutable state)
                └── WouterRouter
                    └── AppShell
                        ├── TopNav         (components/layout/TopNav.tsx)
                        ├── Sidebar        (components/layout/Sidebar.tsx)
                        └── <main> Router  (the routed page)
```

- **`AppShell`** also runs `useUrlSyncedMode()` — any URL under `/consulting/*`
  forces the consulting operating mode; everything else is enterprise mode. This
  keeps deep links and back/forward navigation coherent with the visible nav.

### State / context

- **`AppContext`** (`context/AppContext.tsx`) — global app state:
  - `activeView`: `"enterprise" | "consulting"` (the operating mode)
  - `activeTenant`: one of 4 mock tenants
  - `activeRole`: one of the mock roles
- **`ConsultingDataContext`** (`context/ConsultingDataContext.tsx`) — holds the
  consulting **clients** list as mutable React state so the "New Client" create
  flow can append to it live. Engagements are exposed read-only here too.

### Operating mode

The mode is switchable from **two places**, both of which call `switchMode()` to
set the mode AND navigate to that mode's home dashboard:

1. The segmented toggle in the **top nav** (Internal Enterprise / Consulting
   Services).
2. The "Operating Mode" toggle at the top of the **sidebar** (Enterprise /
   Consulting).

Switching mode swaps the sidebar's grouped navigation sections and the routed
dashboards/modules.

### Top navigation (`TopNav.tsx`)

Contains: VibeOps logo + "by OverYonder", global search (Cmd+K hint), tenant
selector dropdown, role selector dropdown, green `PRODUCTION` environment badge,
the operating-mode segmented toggle, an AI-insights (sparkles) button,
notifications bell, and a user avatar.

### Sidebar (`Sidebar.tsx`)

White sidebar with an "Operating Mode" toggle at the top, then grouped nav
sections. Active item has an orange (primary) background. Navigation is
**Wouter `<Link>`-based** — routes are stable and never change between modes;
only which set of sections renders changes.

### Routing (`App.tsx`)

Wouter `<Switch>` with `<Route>` entries. Detail routes use params
(`/consulting/clients/:id`, `/consulting/engagements/:id`).

---

## 5. Operating Mode A — Internal Enterprise

Sidebar groups: Executive, Portfolio & Intake, Work Management, AI & Security,
Infrastructure, Administration.

### Status of enterprise modules

| Route | Page | State |
|---|---|---|
| `/dashboard` (and `/`) | CIO Operations Dashboard | **Fully built** — 8 KPI cards, 4 charts (cost savings, dept adoption, workflow automation, migration progress), active-initiatives + model-spend panels |
| `/portfolio` | AI Portfolio | **Built** — table of AI initiatives w/ filters, search, status badges, KPIs |
| `/intake` | Intake Center | **Built** — request table, KPIs, status lifecycle badges |
| `/assessments` | Assessments | **Built** — assessment cards w/ risk + score |
| `/approvals` | Approval Workflows | **Built** — kanban board by approval status |
| `/architecture` | Architecture Graph | **Built** — SVG topology graph w/ legend |
| `/tasks`, `/adoption`, `/security`, `/control-tower`, `/applications`, `/shadow-ai`, `/migrations`, `/governance`, `/executive-review`, `/resources`, `/forecasting`, `/admin` | various | **Polished placeholder** — render the `ModulePlaceholder` component (page header + KPI skeleton strip + empty state). Routes are wired; full UI not built yet. |

Enterprise mock data lives in `artifacts/vibeops/src/data/`:
`kpiData.ts`, `tenants.ts`, `roles.ts`, `initiatives.ts`, `intakeRequests.ts`,
`assessments.ts`, `approvals.ts`, `tasks.ts`, `applications.ts`.

---

## 6. Operating Mode B — Consulting Services (FULLY BUILT)

This mode is **completely built out** — all 14 modules are functional, plus 2
record detail pages. Sidebar groups: Executive, Client Management, Delivery,
Revenue & Resources, Administration.

### Consulting data layer (`artifacts/vibeops/src/data/consulting/`)

Internally consistent mock data — IDs cross-reference each other:

- **`clients.ts`** — 12 enterprise clients (Atlas Federal Bank, Veridian
  Manufacturing, Meridian Health, Sentinel Defense, etc.). Fields: ARR, health
  score, renewal risk, strategic tier, AI maturity, delivery risk, region,
  account owner, executive sponsor, stakeholders.
- **`consultants.ts`** — 18 consultants. Fields: level, practice, region,
  utilization target/actual, bill rate, skills, current engagements, future
  capacity %.
- **`engagements.ts`** — 12 engagements. Reference a client + delivery manager +
  team. Fields: type, phase, budget, revenue recognized, margin, health,
  progress, milestones, deliverables, activity feed, AI platforms, applications.
- **`proposals.ts`** — 15 proposals across 8 pipeline stages. Fields: value,
  probability, practice area, expected close, owner, next step, age.
- **`tasks.ts`** — 25 consulting tasks across 7 statuses. Reference engagement +
  owner. Fields: priority, billable, estimated/actual hours, risk, blocker.
- **`risks.ts`** — 10 delivery risks. Reference engagements. Fields: type,
  severity, likelihood, impact, mitigation plan, status.
- **`programs.ts`** — 4 multi-engagement transformation programs. Roll up
  engagements + workstreams + KPIs.
- **`revenue.ts`** — time-series + slice data (weekly/monthly/quarterly revenue,
  revenue by industry/practice, forecast scenarios, utilization forecast,
  margin trend, customer health trend).

### The 14 consulting modules

| Route | Module | What it contains |
|---|---|---|
| `/consulting/dashboard` | Services CEO Dashboard | 8 KPIs, revenue/utilization/margin charts, active engagements list |
| `/consulting/clients` | Client Portfolio | Client table, filters (tier/region), search, KPIs, status badges. Rows link to detail. |
| `/consulting/clients/:id` | **Client Detail** | 8 tabs: Overview, Engagements, Revenue, Risks, Stakeholders, AI Initiatives, Assessments, Activity Timeline |
| `/consulting/engagements` | Consulting Engagements | Engagement table w/ phase/health/margin, filters, KPIs |
| `/consulting/engagements/:id` | **Engagement Detail** | 9 tabs: Executive Summary, Timeline & Milestones, Financials, Team, Risks, Deliverables, Tasks, Linked (approvals/assessments/apps/AI platforms), Activity |
| `/consulting/proposals` | Proposal Pipeline | Kanban-by-stage + table view toggle, weighted forecast, aging indicators |
| `/consulting/health` | Customer Health | Scorecard KPIs, health trend chart, 7-dimension account heatmap |
| `/consulting/delivery` | Delivery Operations | PMO command center — at-risk engagements, escalations, upcoming milestones, blocked work, severity×likelihood risk heatmap |
| `/consulting/tasks` | Task Delivery | Kanban-by-status + table view toggle, blockers, billable tracking |
| `/consulting/programs` | AI Transformation Programs | Per-program cards w/ workstreams, engagements, KPIs (alignment/satisfaction/adoption) |
| `/consulting/risks` | Delivery Risks | Risk register table, severity×likelihood heatmap, escalation status, filters |
| `/consulting/revenue` | Revenue Operations | Weekly/monthly/quarterly KPIs + charts; revenue by industry/practice/client; forecast |
| `/consulting/utilization` | Resource Utilization | Consultant table w/ over/under-allocation flags, util bars |
| `/consulting/billable` | Billable Utilization | Billable % trends, forecast vs target, per-consultant bar comparison |
| `/consulting/capacity` | Consultant Capacity | Demand-vs-supply by practice, hiring indicators, forward capacity table |
| `/consulting/forecasting` | Forecasting | Revenue forecast band, utilization/margin forecasts, best/base/downside scenario cards |
| `/consulting/reporting` | Executive Reporting | Boardroom scorecards, revenue/margin/health charts, strategic insights & recommendations |
| `/consulting/admin` | Settings | Still a `ModulePlaceholder` |

### Create / edit flows

- **`NewClientDialog`** (`components/consulting/NewClientDialog.tsx`) is the
  **canonical, fully-wired** create flow — a multi-section modal that appends a
  new client to `ConsultingDataContext` state and toasts confirmation.
- **`CreateRecordDialog`** (`components/consulting/CreateRecordDialog.tsx`) is a
  **generic create modal** used by the other modules (New Engagement, New
  Proposal, New Task, New Risk, New Program). It renders a configurable field
  set and toasts on submit. These do not yet persist beyond the toast — they are
  consistent UI stubs pending the backing API.

---

## 7. Shared / reusable components

Under `artifacts/vibeops/src/components/`:

- **`layout/AppShell.tsx`** — shell + URL→mode sync.
- **`layout/TopNav.tsx`**, **`layout/Sidebar.tsx`** — global nav.
- **`layout/PageHeader.tsx`** — standard page header (title, description, badges,
  actions). Used by every page.
- **`dashboard/KpiCard.tsx`** — light KPI card w/ count-up animation, trend
  indicator, optional icon. (Note: count-up means screenshots taken mid-render
  show in-progress numbers.)
- **`dashboard/ChartCard.tsx`** — titled card wrapper for Recharts charts.
- **`dashboard/StatusBadge.tsx`** — pill badge w/ `statusToTone()` helper that
  maps free-form status strings ("Active", "At Risk", "Critical", …) to a tone.
- **`consulting/FilterBar.tsx`** + `FilterSelect` — standard search + filter
  strip for list views.
- **`consulting/format.ts`** — `money()` (compact `$1.4M`/`$850K`), `pct()`,
  `shortDate()`.
- **`consulting/NewClientDialog.tsx`**, **`consulting/CreateRecordDialog.tsx`** —
  create flows (see §6).
- **`ui/`** — the full shadcn/ui component kit (~50 Radix-based primitives).
- **`pages/ModulePlaceholder.tsx`** — the polished "coming soon" page for unbuilt
  routes.

---

## 8. Repository layout

```
OverYonder_VibeOps/
├── docker-compose.yml            postgres + api + web
├── .env.example / .env           env config
├── pnpm-workspace.yaml           workspace + pnpm catalog + native-binary overrides
├── replit.md                     run/operate notes
├── documentation/                <- this folder
├── artifacts/
│   ├── api-server/               Express 5 API skeleton + Dockerfile
│   ├── vibeops/                  THE MAIN FRONTEND APP + Dockerfile
│   │   └── src/
│   │       ├── App.tsx           routes + providers
│   │       ├── index.css         OverYonder theme tokens
│   │       ├── components/       layout, dashboard, consulting, ui
│   │       ├── context/          AppContext, ConsultingDataContext
│   │       ├── data/             enterprise mock data
│   │       │   └── consulting/   consulting mock data layer
│   │       └── pages/            route pages
│   │           └── consulting/   the 14 consulting modules + 2 detail pages
│   └── mockup-sandbox/           separate Vite mockup workspace
├── lib/
│   ├── db/                       Drizzle + Postgres (schema EMPTY)
│   ├── api-spec/                 OpenAPI + Orval
│   ├── api-zod/                  generated Zod schemas
│   └── api-client-react/         generated React Query hooks
└── scripts/                      workspace scripts
```

---

## 9. Current status & what is NOT done

**Done:**
- Full OverYonder white/orange design system; dark mode removed.
- Global shell, top nav, sidebar, operating-mode switching, tenant/role
  selectors.
- Enterprise mode: CIO dashboard + 5 concrete module pages; remaining ~12 routes
  are polished placeholders.
- Consulting mode: **all 14 modules + 2 detail pages fully built** on a
  consistent mock data layer.
- Docker stack (postgres + api + web) builds and runs; TypeScript typecheck
  passes clean.

**Not done / next candidates:**
- The API server has no business routes; the database schema is empty. The UI
  uses local mock data only and does not call the API.
- Most enterprise-mode modules (Task Management, AI Control Tower, Applications
  Inventory, Security, Adoption, Governance, Migrations, Executive Review Board,
  Resource Management, Forecasting, Admin, Shadow AI) are still
  `ModulePlaceholder` screens.
- Consulting create flows other than New Client are UI stubs (toast only, no
  persistence).
- No automated tests.
- No authentication.

---

## 10. Conventions a contributor should follow

- **Do not reintroduce dark mode.** Light-first only.
- **Reuse the design system**: `PageHeader`, `KpiCard`, `ChartCard`,
  `StatusBadge`, `FilterBar`, and the `ui/` kit. Don't invent new card styles.
- Colors come from CSS tokens (`bg-card`, `text-foreground`, `bg-primary`,
  `text-success`, etc.) — never hard-code hex.
- Routes are stable; the operating mode never changes route paths, only which
  sidebar sections render.
- Mock data lives in `src/data/` (enterprise) and `src/data/consulting/`
  (consulting). Keep cross-references (IDs) consistent.
- Docker images must build for `linux/amd64` and use pnpm `10.33.4`.

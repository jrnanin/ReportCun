# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ReportaMunicipio (ReportCun / Citizen-Report-Hub) is a mobile-first Progressive Web App that enables citizens to report public service incidents (water, potholes, lighting, security, waste) to their municipal government and track report status via unique folio numbers.

## Development Commands

### Running the Application
- `pnpm --filter @workspace/api-server run dev` — Start API server (port 8080)
- `pnpm --filter @workspace/reporta-municipio run dev` — Start frontend (Vite assigns port)

### Building & Validation
- `pnpm run typecheck` — Full typecheck across all workspace packages
- `pnpm run build` — Typecheck + build all packages

### API Development Workflow
- `pnpm --filter @workspace/api-spec run codegen` — Regenerate API hooks and Zod schemas from OpenAPI spec
  - **CRITICAL**: Always run this after modifying `lib/api-spec/openapi.yaml`

### Database Operations
- `pnpm --filter @workspace/db run push` — Push DB schema changes (development only)
- `pnpm --filter @workspace/db run push-force` — Force push schema changes

### Required Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required for all DB operations)
- `PORT` — API server port (required for api-server startup)

## Architecture

### Workspace Structure (pnpm monorepo)
```
lib/                           # Shared libraries
├── api-spec/                 # OpenAPI spec (source of truth for API contract)
├── api-client-react/         # Generated React Query hooks
├── api-zod/                  # Generated Zod validation schemas
└── db/                       # Drizzle ORM + database schema

artifacts/                     # Deployable applications
├── api-server/               # Express API server
└── reporta-municipio/        # React frontend (or mockup-sandbox)

scripts/                       # Build utilities and workspace scripts
```

### Technology Stack
- **Monorepo**: pnpm workspaces with catalog dependencies
- **Runtime**: Node.js 24, TypeScript 5.9
- **Frontend**: React 19, Vite 7, TailwindCSS 4, shadcn/ui, Wouter (routing), Leaflet (maps)
- **API**: Express 5, Pino (logging), Multer (file uploads)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod v4, drizzle-zod
- **API Codegen**: Orval (generates from OpenAPI spec)
- **Build**: esbuild (CJS bundle for api-server)

### Code Generation Flow
1. API contract is defined in `lib/api-spec/openapi.yaml`
2. Orval generates:
   - React Query hooks → `lib/api-client-react/src/generated/`
   - Zod schemas → `lib/api-zod/src/generated/`
3. These generated artifacts are consumed by frontend and backend

### Database Schema
- Primary table: `reportsTable` in `lib/db/src/schema/reports.ts`
- ORM: Drizzle with node-postgres driver
- Schema exports: `insertReportSchema`, `InsertReport`, `Report` types

### Photo Upload Architecture
- Photos are uploaded via direct `fetch` with FormData (not generated hooks)
- Stored on disk: `artifacts/api-server/uploads/`
- Served as static files: `/api/uploads/*`
- **Why not in OpenAPI spec**: multipart/form-data causes TS2308 type collisions in Orval's typecheck step

### Business Logic
- **Folio generation**: Auto-generated server-side as `RM-YYYYMMDD-NNNNN`
- **Response time estimates** (hardcoded per category):
  - Water: 24 hours
  - Pothole: 168 hours (7 days)
  - Lighting: 48 hours
  - Security: 1 hour
  - Waste: 72 hours
- **Stats computation**: In-memory from full table scan (suitable for municipal-scale data)

## Critical Gotchas

1. **OpenAPI spec changes**: ALWAYS run `pnpm --filter @workspace/api-spec run codegen` after editing `lib/api-spec/openapi.yaml`

2. **TypeScript build order**: Run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck` when lib/db schema changes (lib packages must be built first)

3. **NO multipart/form-data in OpenAPI**: Do not add multipart/form-data endpoints to the spec — Orval generates `File`/`Blob` types that break typecheck:libs in Node.js context

4. **PostgreSQL array syntax**: Array columns in seed SQL must use PostgreSQL array literal syntax `'{}'`, not JSON `'[]'`

5. **Package manager enforcement**: The workspace uses pnpm exclusively. The preinstall hook will fail if npm or yarn is used.

6. **Supply chain security**: The workspace enforces a 1440-minute (1 day) minimum release age for npm packages via `.npmrc` to defend against supply-chain attacks. Exceptions are only granted for `@replit/*` packages.

## Key File Locations

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/reports.ts` — Database schema for reports table
- `artifacts/api-server/src/routes/reports.ts` — Report CRUD + stats endpoints
- `artifacts/api-server/src/routes/photos.ts` — Photo upload handler (multer)
- `artifacts/api-server/src/app.ts` — Express app configuration
- `artifacts/reporta-municipio/src/` — React frontend (or mockup-sandbox for UI development)

## Product Features

### User-Facing
- **Home**: Category grid (Agua, Bacheo, Alumbrado, Seguridad, Basura)
- **New Report**: 5-step form (category → location → photos → description+contact → folio)
- **Track**: Search by folio → view status, timeline, details
- **Admin**: Municipal dashboard with stats, report list, status updates

### Report Categories
- Water (`water`) — Falta de suministro
- Pothole (`pothole`) — Bacheo
- Lighting (`lighting`) — Alumbrado público
- Security (`security`) — Seguridad pública
- Waste (`waste`) — Servicios de desecho

### Report Statuses
- `pending` — Newly created
- `in_progress` — Being addressed by municipality
- `resolved` — Issue resolved
- `closed` — Report closed

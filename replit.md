# ReportaMunicipio

A mobile-first civic PWA that lets citizens report public service incidents to their municipal government — water, potholes, lighting, security, and waste collection — and track their report status with a unique folio number.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/reporta-municipio run dev` — run the frontend (port assigned by workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Wouter, Leaflet/React-Leaflet
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/reports.ts` — DB schema for reports table
- `artifacts/api-server/src/routes/reports.ts` — report CRUD + stats routes
- `artifacts/api-server/src/routes/photos.ts` — photo upload (multer, stored in `artifacts/api-server/uploads/`)
- `artifacts/reporta-municipio/src/` — React frontend

## Architecture decisions

- Photo uploads are handled via direct `fetch` with FormData (not generated hooks) because multipart/form-data causes TS2308 collisions in Orval's typecheck step.
- Photos are stored on disk under `artifacts/api-server/uploads/` and served as static files at `/api/uploads/*`.
- Folio numbers are auto-generated on the server in the format `RM-YYYYMMDD-NNNNN`.
- Estimated response hours per category are hardcoded server-side (Water: 24h, Pothole: 168h, Lighting: 48h, Security: 1h, Waste: 72h).
- Category filtering on `/reports` is done via query param; stats are computed in-memory from a full table scan (suitable for municipal-scale data).

## Product

- **Home**: Category grid (Agua, Bacheo, Alumbrado, Seguridad, Basura) — one tap to start a report
- **New Report**: 5-step form — category → location (Leaflet map + GPS) → photos → description + contact → folio confirmation
- **Track**: Search by folio number → view status, timeline, details
- **Admin**: Municipal dashboard with stats, report list, status update controls

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `lib/api-spec/openapi.yaml`
- Do not add `multipart/form-data` endpoints to the OpenAPI spec — Orval generates `File`/`Blob` types that break typecheck:libs in the Node.js context
- `pnpm run typecheck:libs` must be run before `pnpm --filter @workspace/api-server run typecheck` when lib/db schema changes
- Array columns in seed SQL must use PostgreSQL array literal syntax `'{}'`, not JSON `'[]'`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

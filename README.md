# Onyxa

An MSME business tracker being prepared after a pivot from personal finance tracking.
This checkout contains a working application foundation; the new business features are not implemented.

## Current scope

- Registration, login, logout, and signed session cookies.
- An authenticated workspace shell and a minimal dashboard.
- Account settings, legacy data export, and account deletion.
- Shared UI components and utilities.
- Reusable OCR.Space and Gemini receipt-parsing adapters, disconnected from application routes.

Supplier invoice scanning, dead stock and slow moving detection, supplier price comparisons,
and operational cost/HPP/Capex categorization are future work. No empty routes are registered for them.

## Setup

Use Node.js 22 LTS or later, pnpm, and PostgreSQL.

```sh
pnpm install
```

Copy `.env.example` to `.env` and configure `DATABASE_URL` and `AUTH_SECRET`.
The session implementation uses `jose` and `bcryptjs`; Auth.js and Cloudinary are not used.
OCR.Space and Gemini keys are only needed when integrating the retained adapters in a future workflow.

```sh
pnpm exec prisma generate
pnpm exec prisma migrate deploy
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to login,
or to the dashboard for a signed-in user. Register an account to get started; demo credentials
and the old personal-finance seed have been removed.

Prisma loads `prisma7.config.ts`, uses `prisma/schema.prisma`, and generates `@prisma/client`.
Application database access goes through `src/lib/db/prisma.ts`.

## Checks

```sh
pnpm lint
pnpm typecheck
pnpm exec prisma validate
pnpm build
pnpm start
```

After changing routes, run `pnpm build` before the standalone type check to refresh Next.js route types.
The production build checks types and lint rules without skipping errors.

## Structure

```text
prisma/
  migrations/              Existing database history
  schema.prisma            Existing schema; no MSME models added yet
src/
  app/
    (auth)/                Login and registration
    (dashboard)/           Protected dashboard and settings
    api/auth/              Authentication endpoints
    api/settings/          Settings, export, and account deletion
  components/
    layout/                Desktop/mobile navigation and workspace shell
    ui/                    Reusable UI primitives
  features/
    receipts/
      providers/           Retained OCR.Space and Gemini adapters
      schemas/             Structured receipt extraction validation
      types/               Provider contracts
    settings/
      components/          Settings interface
      services/            User settings and legacy data operations
  lib/
    auth/                  Password hashing and session helpers
    db/                    Shared Prisma client
    utils/                 Class names, currency, and date formatting
```

Future features should own their components, services, validation, and tests under `src/features/`.
Add App Router entry points only when they have an implementation.

## Database compatibility

The existing personal-finance schema and migrations are deliberately preserved. Cleanup does not
drop tables, rewrite migration history, or migrate existing records into business entities.
Settings export still includes legacy transactions, receipts, merchants, categories, and insights
so users can retrieve their existing data. Account deletion retains its existing cascade behavior.
Design the MSME schema and data migration separately before implementing the pivot features.

The retained receipt parser still uses the previous receipt fields and personal spending category
prompt. It must be adapted and tested for supplier invoices before exposing a scanner.
Its existing heuristic fallback is not a verified Gemini result. No external OCR/AI calls are
required to build or use the current foundation.

## Deployment

Next.js builds with `output: "standalone"`. The repository also includes its existing Dockerfile
and Compose configuration. Configure the database and session secret in the deployment environment.
Container deployment and live OCR/AI services require separate runtime verification.

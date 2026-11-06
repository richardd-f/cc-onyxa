# Pivot cleanup - 2026-11-06

## Problem
Personal-finance workflows referenced deleted modules, and empty MSME route files broke compilation.

## Success criteria
Production build, TypeScript, ESLint, and Prisma schema validation pass.

## Scope
Remove obsolete finance workflows and empty scaffolding. Keep authentication, settings, shared UI,
database infrastructure, and reusable OCR.Space/Gemini adapters. No new business features.

## Constraints
Use pnpm and feature-based architecture. Preserve existing user edits, database schema, and migrations.
Do not apply migrations or make live OCR/AI calls during cleanup.

## Plan
1. Remove empty routes and obsolete dashboard/receipt workflows.
2. Disconnect scanner controls and stale navigation; retain a minimal protected dashboard.
3. Fix provider types/imports, remove unused packages, and update setup documentation.
4. Run static checks and a production build; smoke-test routes where available.
5. Commit only cleanup changes so tracked deletions can be reverted together.

## Open questions
None for cleanup. MSME data models and workflows remain a separate task.

## Decisions
- User approved the cleanup scope before edits.
- Keep the old schema/history and legacy export to avoid changing stored data.
- Keep provider adapters under receipts until the invoice domain is designed.
- Remove unused TODO scaffolding rather than register unfinished routes.
- Preserve the user's pre-existing `.agents/skills` deletions without including them in the cleanup commit.
- Remove demo-seed references from Prisma, Compose, and the login interface; remove unused Cloudinary build arguments.
- Move cookie access outside the session helper's catch block so Next.js can detect dynamic routes during builds.
- Redirect unauthenticated page access from `requireAuth` instead of throwing a page error during parallel layout rendering.

## Verification
- `pnpm lint`: passes with zero warnings.
- `pnpm typecheck`: passes.
- `pnpm exec prisma validate` and `pnpm exec prisma generate`: pass; no database mutations.
- `pnpm install --offline --lockfile-only --ignore-scripts --frozen-lockfile`: passes with existing locked versions.
- `pnpm build`: passes, including standalone output. Windows sandbox denied generated-folder writes; the full build passed outside the sandbox.
- Production HTTP smoke checks: root/dashboard/settings redirect unauthenticated requests to login; login/register return 200; settings export returns 401; removed feature routes return 404.
- No live OCR/Gemini calls, signed-in database workflows, or container deployment were exercised.
- Docker is not installed in this environment; Compose/container execution could not be checked.

Chore Rules
1. use pnpm over npm

UI Rules
1. when using popup modal, the background is blured
2. use flex over grid
3. use same UI style with previous/other pages UI style
4. follow Apple Human Interface Guidlines

Logic Rules
1. remove unused import
2. make sure there is no linting or typescript error


Website Description
# Build an AI-Powered Receipt Finance Tracker with Next.js

## 1. Project Overview

Build a modern, full-stack web application called **SpendWise AI**, an AI-powered personal finance tracker that helps users track expenses by scanning receipts, automatically categorizing transactions, analyzing spending patterns, and generating personalized financial insights.

The main goal is to reduce manual expense tracking and help users understand where their money goes, how their spending habits change, and what actions they can take to manage their finances better.

Build a production-minded, responsive application with a clean user interface, maintainable architecture, secure data handling, and working backend functionality.

**Important:** Do not build only a landing page or a static dashboard. Implement the actual application workflows, database integration, receipt processing, AI integration, and expense management features.

---

## 2. Technology Stack

Use the following technologies:

### Frontend

* Next.js with the App Router.
* React with TypeScript.
* Tailwind CSS for styling.
* shadcn/ui for reusable UI components.
* Lucide React for icons.
* Recharts for charts and data visualizations.
* React Hook Form for form management.
* Zod for schema validation.
* TanStack Table for transaction tables when appropriate.

### Backend

* Next.js Route Handlers for API endpoints.
* Server Actions where appropriate for mutations.
* TypeScript throughout the application.
* Prisma ORM for database access.
* PostgreSQL as the primary database.
* Auth.js for authentication, or another well-maintained authentication solution compatible with the selected stack.

### AI and Receipt Processing

* Google Gemini API for structured receipt understanding, expense categorization, financial summaries, and recommendations.
* OCR.Space API as the primary external OCR provider.
* Tesseract.js as an alternative OCR option when appropriate.
* A provider abstraction layer so OCR and AI providers can be replaced without changing business logic.

### Development Tools

* ESLint.
* Prettier.
* Environment variables managed through `.env`.
* npm as the package manager unless the existing project uses another package manager.
* Automated tests using Vitest or an equivalent testing framework.
* Playwright for important end-to-end workflows.

Use current, stable, mutually compatible package versions. Avoid unnecessary dependencies.

---

## 3. Architecture: Package by Feature

**This is a mandatory architectural requirement.**

Organize the codebase using a package-by-feature or feature-based modular architecture rather than organizing the entire application into global `components`, `services`, `hooks`, and `utils` folders.

Each feature should own its related UI, business logic, validation, types, server actions, API handlers where appropriate, and tests.

Shared code should contain only genuinely reusable infrastructure and components.

Use this suggested structure as the starting point:

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── transactions/
│   │   │   └── page.tsx
│   │   ├── receipts/
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── insights/
│   │   │   └── page.tsx
│   │   ├── merchants/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── api/
│   │   ├── receipts/
│   │   │   ├── upload/
│   │   │   │   └── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── transactions/
│   │   │   └── route.ts
│   │   └── insights/
│   │       └── route.ts
│   │
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── not-found.tsx
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── types/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   ├── receipts/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── services/
│   │   ├── providers/
│   │   │   ├── ocr-space.provider.ts
│   │   │   └── tesseract.provider.ts
│   │   ├── schemas/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── hooks/
│   │   ├── constants/
│   │   ├── __tests__/
│   │   └── index.ts
│   │
│   ├── transactions/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── types/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── __tests__/
│   │   └── index.ts
│   │
│   ├── categories/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── types/
│   │   ├── constants/
│   │   └── index.ts
│   │
│   ├── analytics/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│   │
│   ├── spending-habits/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── insights/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── services/
│   │   ├── providers/
│   │   │   └── gemini.provider.ts
│   │   ├── schemas/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── __tests__/
│   │   └── index.ts
│   │
│   ├── merchants/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── index.ts
│   │
│   └── settings/
│       ├── components/
│       ├── actions/
│       ├── services/
│       ├── schemas/
│       ├── types/
│       └── index.ts
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
│
├── lib/
│   ├── auth/
│   ├── db/
│   ├── env/
│   ├── errors/
│   ├── logger/
│   └── utils/
│
├── server/
│   ├── permissions/
│   └── security/
│
└── types/
    └── global.d.ts

prisma/
├── schema.prisma
└── seed.ts

tests/
├── integration/
└── e2e/

public/
├── images/
└── icons/

.env.example
README.md
```

Adapt the structure when necessary, but preserve the feature-based architecture.

### Architecture rules

1. Each feature owns its domain-specific implementation.
2. Avoid dumping business logic into `app/` pages or route handlers.
3. Keep route handlers thin. They should validate input, authenticate the request, invoke feature services, and return appropriate responses.
4. Keep database queries and domain operations inside feature services or repositories.
5. Use Server Components by default. Use Client Components only when interactivity or browser APIs require them.
6. Use `components/ui/` for reusable primitives and `components/shared/` for genuinely cross-feature components.
7. Do not create global abstractions for logic used by only one feature.
8. Define clear feature exports through `index.ts` where useful.
9. Avoid circular dependencies between features.
10. Keep AI providers, OCR providers, database access, and UI components separated.
11. Use dependency injection or explicit provider interfaces where they improve testability and provider replacement.
12. Never expose secrets or server-only modules to client components.
13. Do not create an unnecessarily complex microservices architecture. Build a modular monolith using Next.js.

---

## 4. Product Design and User Experience

Create a polished personal finance dashboard with a modern SaaS aesthetic.

### Design direction

* Clean, minimal, premium-looking financial application.
* Light theme as the default.
* Neutral backgrounds, white cards, subtle borders, and restrained shadows.
* Use a consistent accent color, such as emerald or teal, for positive financial indicators.
* Use red or orange for spending increases, warnings, and negative trends.
* Use readable typography and generous spacing.
* Rounded cards and buttons, without excessive decoration.
* Use Lucide icons consistently.
* Include dark mode only if it can be implemented without compromising the core features.
* Responsive layouts for desktop, tablet, and mobile.
* Follow accessibility best practices for contrast, keyboard navigation, focus states, and form labels.

### Application shell

Create a dashboard layout with:

* A collapsible sidebar on desktop.
* A mobile-friendly navigation drawer.
* Application logo and name.
* Navigation links for Dashboard, Transactions, Receipts, Analytics, Insights, Merchants, and Settings.
* A top header with page title, date context, notifications if implemented, and user profile menu.
* A prominent button to scan or upload a receipt.
* Breadcrumbs where useful.
* Loading skeletons, empty states, error states, and success feedback.

The interface must feel like a cohesive product, not a collection of unrelated demo pages.

---

## 5. Feature Requirements

### Feature A: Authentication and User Settings

Implement secure authentication.

Requirements:

* User registration and login.
* Logout.
* Session management.
* Protected dashboard routes.
* Secure password handling if using credentials authentication.
* Appropriate authentication error messages.
* User profile settings.
* Preferred currency and locale.
* Timezone preferences.
* Account deletion and data export, where practical.
* User-specific data isolation.

Use authentication and authorization checks on the server, not merely in the UI.

All financial data must belong to an authenticated user and must never be accessible to another user.

### Feature B: AI Receipt Scanner

Allow users to upload or scan paper and digital receipts.

Supported formats should include JPEG, PNG, and PDF where supported by the selected OCR provider. Validate file types, file sizes, and upload limits.

Receipt upload workflow:

1. User opens the receipt upload interface.
2. User selects a file or captures an image on a supported device.
3. Display a preview before processing.
4. Upload the receipt securely.
5. Create a receipt record with a processing status.
6. Extract text through the configured OCR provider.
7. Send the extracted text to Gemini for structured receipt understanding.
8. Validate the returned data using Zod.
9. Present extracted transaction details in a review form.
10. Let the user correct inaccurate fields.
11. Allow the user to confirm and save the transaction.
12. Mark the receipt as processed only after the appropriate workflow succeeds.

Extract the following information:

* Merchant name.
* Purchase date and time, when available.
* Total amount.
* Currency, when identifiable.
* Tax amount, when available.
* Subtotal, when available.
* Purchased item names.
* Item quantities.
* Unit prices, when available.
* Line item totals.
* Payment method, when identifiable.
* Receipt number, when available.
* Suggested expense category.
* Confidence indicators for uncertain fields.

Do not assume that every receipt contains every field. Use nullable fields and represent missing information explicitly.

The system must not invent missing values. If the AI cannot confidently identify a value, ask the user to review it.

### Receipt processing architecture

Define provider interfaces similar to:

```ts
interface OCRProvider {
  extractText(input: OCRInput): Promise<OCRResult>;
}

interface ReceiptAIProvider {
  parseReceipt(input: ReceiptParseInput): Promise<ParsedReceipt>;
}
```

Implement the interfaces using OCR.Space and Gemini.

Use a provider selection mechanism configured through environment variables.

For example:

```env
OCR_PROVIDER=ocr-space
AI_PROVIDER=gemini
```

Use Tesseract.js as an alternative OCR provider where appropriate. Do not run multiple OCR providers unnecessarily for every upload.

Use Gemini structured output or constrained JSON generation when supported by the selected model. Validate all model output on the server.

Implement sensible error handling for:

* Invalid file formats.
* Oversized uploads.
* OCR failures.
* AI provider failures.
* Invalid AI responses.
* Missing required transaction fields.
* Network timeouts.
* Duplicate receipt submissions.

Store OCR output and processing errors only when needed, with appropriate access controls and retention policies.

### Receipt processing states

Support states such as:

* `PENDING`
* `PROCESSING`
* `NEEDS_REVIEW`
* `COMPLETED`
* `FAILED`

Show the current state in the interface.

A failed receipt must be retryable without creating duplicate transactions.

### Feature C: Automatic Expense Categorization

Automatically assign each transaction to one of these categories:

* Food & Beverage.
* Groceries.
* Transportation.
* Shopping.
* Healthcare.
* Education.
* Entertainment.
* Utilities.
* Others.

Requirements:

* Use deterministic rules for obvious cases when appropriate.
* Use Gemini to classify ambiguous merchants or line items.
* Return a category and a confidence score when supported by the classification workflow.
* Allow manual category selection.
* Allow users to override AI suggestions.
* Preserve user-confirmed category changes.
* Support filtering and reporting by category.
* Store category metadata in the database.

Do not rely entirely on AI for every operation. Use rules and previously confirmed information where practical.

### Feature D: Expense and Transaction Management

Build a complete transaction management feature.

Users should be able to:

* View all transactions.
* Search by merchant or description.
* Filter by date range.
* Filter by category.
* Filter by payment method.
* Filter by transaction source.
* Sort by date and amount.
* View transaction details.
* Create a transaction manually.
* Edit a transaction.
* Delete a transaction with confirmation.
* Open the linked receipt when available.
* View purchased items.
* Change a transaction category.
* Navigate through paginated transaction results.

Each transaction should include, where applicable:

* Merchant.
* Date.
* Amount.
* Currency.
* Category.
* Payment method.
* Notes.
* Source: manual entry or receipt scan.
* Linked receipt.
* Line items.
* Creation and update timestamps.

Prevent accidental duplicate creation when the user retries a request.

Use server-side validation for all create and update operations.

### Feature E: Spending Dashboard

Create a useful overview dashboard that explains the user's financial activity.

Include the following summary cards:

* Total spending for the selected period.
* Spending in the previous comparable period.
* Percentage increase or decrease.
* Total transaction count.
* Average transaction amount.
* Most expensive transaction.

Include visualizations:

1. Daily or weekly spending trend.
2. Monthly spending trend.
3. Spending breakdown by category.
4. Spending breakdown by merchant.
5. Recent transactions.
6. Top spending categories.
7. Top merchants by total spending.

Provide period filters such as:

* This week.
* Last week.
* This month.
* Last month.
* Last 3 months.
* Custom date range.

All totals and charts must use real database data for the authenticated user.

Implement the aggregations on the server whenever appropriate. Avoid loading every transaction into the browser merely to calculate totals.

For empty accounts, display a helpful empty state with an action to upload a receipt or add a transaction manually.

### Feature F: Spending Trend Analysis

Compare spending across equivalent time periods.

Implement:

* This week versus last week.
* This month versus last month.
* Category spending comparisons.
* Merchant spending comparisons.
* Spending increases and decreases.
* Changes in average transaction amount.
* Changes in transaction frequency.

For every comparison, calculate the absolute difference and percentage difference.

Handle edge cases correctly:

* If the previous period is zero, do not display an infinite percentage.
* If there is no historical data, explain that a comparison is unavailable.
* Use comparable date ranges and the user's configured timezone.
* Distinguish between an increase in spending and an improvement in financial health. Do not automatically describe every decrease as good or every increase as bad.

Clearly indicate which periods are being compared.

### Feature G: Spending Habit Detection

Analyze transaction history to detect recurring behavior.

Implement:

* Most frequently visited merchants.
* Merchants with the highest total spending.
* Most frequently purchased categories.
* Frequently purchased items.
* Average spending by weekday.
* Weekend versus weekday spending.
* Recurring merchant visits.
* Unusual changes in merchant or category spending.

Use deterministic calculations for statistics whenever possible. Use AI to explain the results, not to invent them.

Do not claim that an item or merchant is a recurring habit unless there is sufficient historical evidence.

Where sample sizes are small, show a note that the observation is based on limited data.

### Feature H: AI Financial Insights

Create an insights page powered by Gemini.

Generate insights using actual financial statistics calculated by the backend.

Examples of insights:

* "Your dining expenses increased by 18% compared with last month."
* "You spent more at coffee shops this week than during the previous week."
* "Groceries represent 32% of your spending this month."
* "Your average weekend spending is higher than your weekday spending."
* "You frequently visit the same merchant several times a week."

Each insight should include:

* A clear title.
* A concise explanation.
* The relevant period.
* Supporting numerical evidence.
* The affected category or merchant, where applicable.
* A practical recommendation when justified.
* An optional severity or insight type.
* The timestamp when it was generated.

Possible insight types:

* Spending increase.
* Spending decrease.
* Recurring habit.
* Category concentration.
* Merchant concentration.
* Unusual activity.
* Potential saving opportunity.

### AI insight safety and correctness

The backend must calculate all financial metrics from verified database records.

Gemini must not be the source of truth for amounts, totals, percentages, or transaction counts.

Pass a compact, structured summary of the user's financial statistics to Gemini and ask it to explain the results and propose reasonable actions.

Validate the response against a Zod schema.

Never allow the AI to:

* Invent transactions.
* Invent financial statistics.
* Claim that a trend exists without supporting data.
* Present speculative financial conclusions as established facts.
* Automatically modify or delete financial records.
* Promise guaranteed savings.

Provide neutral, practical recommendations rather than high-pressure financial advice.

Cache generated insights where appropriate and invalidate or regenerate them when relevant transaction data changes.

If the AI provider is unavailable, the dashboard and analytics must continue working, and the application should display an appropriate fallback state.

### Feature I: Merchant Analysis

Create a merchant-focused page.

Requirements:

* List merchants present in the user's transaction history.
* Total spending per merchant.
* Transaction count per merchant.
* Average transaction amount.
* Most recent purchase.
* Spending trend per merchant.
* Merchant detail page or drawer.
* Merchant search and sorting.

Normalize merchant names where practical while preserving the original receipt text.

Avoid merging distinct businesses incorrectly. Allow users to correct merchant names if necessary.

### Feature J: Receipt History

Create a receipt management page.

Requirements:

* Display uploaded receipts.
* Show processing status.
* Search and filter receipts.
* Preview supported receipt files.
* View extracted receipt data.
* Retry failed processing.
* Reopen transactions linked to receipts.
* Delete receipts according to the application's data-retention rules.

A receipt should not silently create a financial transaction before the user confirms the extracted information, unless a clearly documented and configurable automatic-confirmation workflow is implemented.

---

## 6. Prisma Schema and Database Architecture

Implement a complete, relational database schema using **Prisma ORM and PostgreSQL**.

The schema must support all application features, including authentication, receipt scanning, OCR processing, AI extraction, transactions, transaction line items, expense categories, merchants, spending analytics, and AI-generated financial insights.

Before implementing the schema:

1. Inspect the installed Prisma version and follow its conventions.
2. Design the entities and relationships before writing models.
3. Use appropriate primary keys, foreign keys, unique constraints, indexes, and deletion behavior.
4. Generate and apply Prisma migrations.
5. Generate the Prisma Client.
6. Verify that the schema supports every required application workflow.
7. Keep database models aligned with the feature-based architecture.

Use `prisma/schema.prisma` as the primary schema file unless the project intentionally uses Prisma's multi-file schema configuration.

### 6.1 Required database models

Implement the following models:

* `User`: authenticated user and personal preferences.
* `Account`, `Session`, and `VerificationToken`: authentication models if required by the selected Auth.js adapter.
* `Category`: system-defined and user-defined expense categories.
* `Merchant`: normalized merchant records.
* `Receipt`: uploaded receipt metadata, storage information, and processing state.
* `Transaction`: confirmed financial transaction.
* `TransactionItem`: individual purchased items extracted from receipts.
* `FinancialInsight`: generated AI insights and supporting evidence.
* `ReceiptProcessingJob`: optional but recommended for durable processing, retry tracking, and idempotency.
* `UserCategoryRule`: optional rules for remembering user category corrections.

Avoid duplicating data unnecessarily. Use relations to connect records and define ownership explicitly.

### 6.2 Prisma schema requirements

#### User

Store:

* Unique user ID.
* Name.
* Unique email.
* Authentication-related fields required by the chosen provider.
* Preferred currency, defaulting to `USD`.
* Locale.
* Timezone.
* Created and updated timestamps.

Relationships:

* One user has many transactions.
* One user has many receipts.
* One user has many categories, including custom categories.
* One user has many merchants.
* One user has many financial insights.
* One user has many category rules.

If using Auth.js with Prisma, use the official adapter-compatible models and field types. Do not invent an incompatible authentication schema.

#### Category

Store:

* Unique ID.
* User ID, nullable for system-defined categories.
* Name.
* Slug.
* Description, optional.
* Icon identifier, optional.
* Color, optional.
* Whether the category is a system default.
* Created and updated timestamps.

Use these default categories:

1. Food & Beverage.
2. Groceries.
3. Transportation.
4. Shopping.
5. Healthcare.
6. Education.
7. Entertainment.
8. Utilities.
9. Others.

Support user-created categories without allowing users to modify or delete global system categories.

Prevent duplicate category names within the same user's category scope. Account for the distinction between global categories and user-specific categories when designing unique constraints.

#### Merchant

Store:

* Unique ID.
* User ID.
* Normalized merchant name.
* Display merchant name.
* Created and updated timestamps.

Relationships:

* One merchant can have many transactions.
* One user can have many merchants.

Prevent duplicate normalized merchant records for the same user. Do not globally merge merchants belonging to different users.

Allow the original merchant text extracted from a receipt to be preserved on the transaction or receipt data, even if the normalized merchant record is later edited.

#### Receipt

Store:

* Unique ID.
* User ID.
* Original filename.
* MIME type.
* File size in bytes.
* Private storage key.
* Optional file checksum.
* Processing status.
* OCR provider.
* AI provider.
* OCR text, optional.
* Extracted receipt data as JSON.
* Processing error code or sanitized message.
* Processing attempt count.
* Uploaded timestamp.
* Processed timestamp, optional.
* Created and updated timestamps.

Receipt processing states:

* `PENDING`
* `PROCESSING`
* `NEEDS_REVIEW`
* `COMPLETED`
* `FAILED`

Use a Prisma enum for these states.

A receipt can exist without a transaction while it is being processed or reviewed.

A receipt can have at most one confirmed transaction, and a transaction may optionally reference one receipt.

Use a nullable unique transaction-to-receipt relationship or an equivalent relational design that prevents a receipt from creating multiple transactions.

Never store publicly accessible receipt URLs as the primary security mechanism. Store a private object-storage key and generate signed URLs when authorized users need to access the file.

Use an optional checksum to detect potential duplicate uploads. Duplicate detection must be scoped to the appropriate user and must not automatically discard legitimate repeated purchases of the same amount.

#### Transaction

Store:

* Unique ID.
* User ID.
* Optional merchant ID.
* Optional receipt ID.
* Optional category ID.
* Transaction date.
* Amount in decimal or integer minor units.
* Currency code.
* Optional payment method.
* Optional description.
* Optional notes.
* Source type.
* Created and updated timestamps.

Transaction source values:

* `MANUAL`
* `RECEIPT`

The transaction amount represents the confirmed final transaction total. It must not be derived from unvalidated AI output.

For monetary precision, choose one consistent representation:

**Preferred option:** use Prisma `Decimal` with PostgreSQL `Decimal`/`NUMERIC` for amounts and line-item monetary values. Use explicit decimal-safe arithmetic in application services and never convert authoritative financial calculations to JavaScript floating-point numbers.

Alternatively, use integer minor units when currency-specific precision is handled correctly throughout the application.

Store the currency explicitly on each transaction. A user's preferred currency is only a display preference and must not silently change historical transaction amounts.

Use database indexes for common queries, including:

* User ID and transaction date.
* User ID and category ID.
* User ID and merchant ID.
* User ID and transaction source.

#### TransactionItem

Store:

* Unique ID.
* Transaction ID.
* Item name.
* Optional quantity.
* Optional unit price.
* Optional total price.
* Optional SKU or item identifier.
* Created and updated timestamps, if needed.

Relationships:

* Each item belongs to exactly one transaction.
* A transaction can contain zero or more items.

Use decimal-safe fields for quantity and monetary amounts.

Allow items to have missing prices or quantities because not all receipts contain complete item-level information.

Do not require the sum of line items to equal the transaction total. Receipts can include discounts, tax, tips, deposits, rounding, and other adjustments. Preserve the confirmed receipt total independently.

#### FinancialInsight

Store:

* Unique ID.
* User ID.
* Insight type.
* Title.
* Description.
* Structured supporting evidence as JSON.
* Period start and end.
* Generation timestamp.
* Optional dismissal timestamp.
* Optional expiration timestamp.
* Optional model identifier.
* Optional generation status.

Suggested insight types:

* `SPENDING_INCREASE`
* `SPENDING_DECREASE`
* `RECURRING_HABIT`
* `CATEGORY_CONCENTRATION`
* `MERCHANT_CONCENTRATION`
* `UNUSUAL_ACTIVITY`
* `SAVING_OPPORTUNITY`

Use enums where a value has a stable, predefined set of options.

Store the numerical evidence used to generate an insight so the UI can explain why it was produced.

For example, evidence may include:

* Current period spending.
* Previous period spending.
* Absolute difference.
* Percentage difference.
* Category or merchant identifier.
* Transaction count.
* Calculation period.

The backend must calculate these values from verified transactions. Gemini may explain the evidence but must not be the authoritative source of these numbers.

Do not store sensitive raw prompts or complete receipt contents in insight records unless there is a clear, documented requirement.

#### ReceiptProcessingJob

Implement this model if receipt processing requires reliable retries or a background worker.

Store:

* Unique ID.
* Receipt ID.
* Job status.
* Processing stage.
* Attempt count.
* Idempotency key.
* Optional lease or lock expiration.
* Optional sanitized error information.
* Created timestamp.
* Started timestamp.
* Completed timestamp.
* Updated timestamp.

Use an enum for job status.

Add uniqueness constraints to prevent duplicate jobs for the same idempotency key within the relevant scope.

A processing job must not be considered complete until its associated database changes have been committed successfully.

Use a durable queue or database-backed worker strategy where required by the deployment environment. Do not rely on unawaited background promises inside a Next.js request handler.

#### UserCategoryRule

Implement this model if users should be able to teach the application how to categorize future transactions.

Store:

* Unique ID.
* User ID.
* Matching rule type.
* Normalized matching value.
* Target category ID.
* Optional priority.
* Active status.
* Created and updated timestamps.

Examples:

* A specific merchant is categorized as Groceries.
* A user-defined merchant keyword maps to Transportation.
* A previously corrected merchant category is reused for future receipts.

Do not execute arbitrary user-provided code or SQL as part of a category rule.

### 6.3 Enums

Define suitable enums in the Prisma schema for stable domain values, including:

* `ReceiptStatus`
* `TransactionSource`
* `InsightType`
* `ProcessingJobStatus`
* `PaymentMethod`, if the payment methods are standardized.

For payment methods, support values such as:

* `CASH`
* `CREDIT_CARD`
* `DEBIT_CARD`
* `BANK_TRANSFER`
* `E_WALLET`
* `OTHER`
* `UNKNOWN`

Use nullable fields or an explicit unknown value consistently. Do not assume the payment method can always be extracted from a receipt.

### 6.4 Relationship and deletion rules

Apply deliberate referential integrity rules.

* Deleting a user must not leave accessible orphaned financial data.
* Deleting a transaction should delete its transaction items.
* Deleting a transaction should not automatically delete its source receipt.
* Deleting a category should not silently delete historical transactions. Require reassignment or use an appropriate nullable relationship.
* Deleting a merchant should not delete its transactions.
* Deleting a receipt should follow a documented policy for its linked transaction and private file.
* Removing a user must follow the application's account-deletion and data-retention policy.

Use Prisma referential actions such as `Cascade`, `Restrict`, and `SetNull` intentionally. Do not use cascading deletion indiscriminately.

For multi-step operations, use database transactions.

### 6.5 Ownership and data isolation

Every user-owned entity must have a clear ownership path.

The application must verify user ownership on the server before reading or modifying:

* Receipts.
* Transactions.
* Transaction items.
* Categories.
* Merchants.
* Financial insights.
* Category rules.

Do not trust a user ID supplied in request bodies or query parameters. Resolve the authenticated user on the server and use that identity in database queries.

Where practical, enforce ownership consistency through database constraints and query design in addition to application-level authorization.

Never return private storage keys, sensitive OCR data, or internal processing details unless the authenticated user is authorized to access them.

### 6.6 Indexes and constraints

Add indexes based on actual query patterns rather than indexing every field.

At minimum, consider:

* Unique user email.
* Receipt status and creation date for processing queues.
* Receipt checksum scoped to a user where duplicate detection is enabled.
* Unique receipt transaction association.
* Transaction user ID and date.
* Transaction user ID and category ID.
* Transaction user ID and merchant ID.
* Transaction item transaction ID.
* Merchant user ID and normalized name.
* Financial insight user ID and generation date.
* Financial insight user ID and dismissal status.
* Processing job status and creation date.

Use compound unique constraints for user-scoped records where appropriate.

Remember that PostgreSQL unique constraints treat nullable values differently from ordinary non-null values. Verify the intended behavior for global categories and optional relationships instead of assuming a nullable compound unique constraint enforces every desired rule.

### 6.7 Prisma client organization

Create a single reusable Prisma Client instance in:

`src/lib/db/prisma.ts`

Requirements:

* Avoid creating a new Prisma Client instance for every request.
* Follow the recommended development hot-reload pattern for the selected Prisma version.
* Keep database access server-only.
* Do not import Prisma Client into client components.
* Do not expose database model objects indiscriminately to the browser.

Use feature-specific repositories or services to encapsulate database access.

Example:

```text
src/features/transactions/
├── repositories/
│   └── transaction.repository.ts
├── services/
│   └── transaction.service.ts
├── schemas/
│   └── transaction.schema.ts
├── actions/
│   └── transaction.actions.ts
├── types/
│   └── transaction.types.ts
├── components/
└── index.ts
```

Only add a repository layer when it provides a clear benefit. Keep simple features simple.

### 6.8 Database migrations and seed data

Provide the following:

* Initial Prisma migration.
* A development seed script.
* Default expense categories.
* Optional demo users and transactions for local development.
* Example receipt-processing states.
* Example merchants and transaction items.
* Example generated insights.

Seed data must be clearly identified as development data and must never be mixed into production user accounts.

Use Prisma migrations for schema changes. Do not depend on `prisma db push` as the normal production deployment strategy.

Document the appropriate commands for:

* Generating Prisma Client.
* Creating a development migration.
* Applying migrations in production.
* Seeding the development database.
* Opening Prisma Studio.

Verify that the project builds and the database can be initialized from a clean state.

### 6.9 Schema validation checklist

Before declaring the database complete, verify that the schema supports these workflows:

1. A user registers and receives a private financial workspace.
2. A user uploads a receipt without immediately creating a transaction.
3. OCR text and structured AI output are stored for review.
4. A user corrects the extracted merchant, date, category, and amount.
5. Confirming a receipt creates exactly one transaction.
6. A transaction can contain multiple purchased items.
7. A manual transaction can exist without a receipt.
8. A receipt can fail processing and be retried.
9. A failed retry cannot create duplicate transactions.
10. A user can change a transaction category without altering its amount.
11. A user can rename a merchant without losing historical transactions.
12. The dashboard can aggregate spending by date, category, and merchant.
13. Period comparisons can be calculated from transaction data.
14. Financial insights can store the numerical evidence used to generate them.
15. One user cannot access another user's receipts or transactions.
16. A category can be removed without unintentionally deleting historical expenses.
17. Historical amounts remain associated with their original currencies.
18. Account deletion and receipt-file deletion follow documented policies.

If any workflow is unsupported, revise the schema before implementing the dependent feature.


---

## 7. API and Business Logic

Implement well-defined endpoints or Server Actions for the following operations:

### Receipts

* Upload receipt.
* Retrieve receipt details.
* List receipts.
* Retry processing.
* Confirm extracted receipt data.
* Delete receipt.

### Transactions

* Create transaction.
* List and search transactions.
* Retrieve transaction details.
* Update transaction.
* Delete transaction.
* Retrieve transaction items.

### Dashboard and Analytics

* Retrieve dashboard summaries.
* Retrieve spending trends.
* Retrieve category statistics.
* Retrieve merchant statistics.
* Retrieve spending habit analysis.
* Compare two periods.

### Insights

* Generate insights.
* Retrieve saved insights.
* Refresh insights.
* Dismiss an insight if supported.

### Settings

* Update user preferences.
* Export financial data.
* Request account deletion.

For every endpoint or action:

* Authenticate the user.
* Validate inputs using Zod.
* Authorize access to the target record.
* Handle failures consistently.
* Return appropriately typed results.
* Avoid leaking internal errors or sensitive information.

Use pagination for potentially large collections.

Use consistent error handling, for example:

```ts
type Result<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };
```

Use this pattern only if it fits the chosen Server Action and API conventions; do not force it into places where framework-native error handling is more appropriate.

---

## 8. File Storage and Security

Receipt files may contain sensitive personal and financial information.

Do not store uploaded receipts in a publicly accessible directory.

Use private object storage or another secure storage solution. Generate short-lived signed URLs when users need to view their files.

Validate file signatures and MIME types where practical, not just filename extensions.

Enforce file size limits and upload rate limits.

Protect against unauthorized file access, insecure direct object references, malicious uploads, and cross-user data leakage.

Keep the following secrets on the server:

* Gemini API key.
* OCR.Space API key.
* Database credentials.
* Authentication secrets.
* Storage credentials.

Never expose secrets through `NEXT_PUBLIC_` environment variables.

Use server-only imports for secret-bearing modules.

Do not log complete receipt contents, authentication tokens, API keys, or sensitive user information unnecessarily.

---

## 9. Environment Variables

Provide a documented `.env.example` file containing the required configuration.

For example:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/spendwise"

AUTH_SECRET="replace-with-a-secure-random-secret"
AUTH_URL="http://localhost:3000"

GEMINI_API_KEY=""
GEMINI_MODEL=""

OCR_PROVIDER="ocr-space"
OCR_SPACE_API_KEY=""

AI_PROVIDER="gemini"

STORAGE_PROVIDER=""
STORAGE_BUCKET=""
STORAGE_REGION=""
STORAGE_ACCESS_KEY_ID=""
STORAGE_SECRET_ACCESS_KEY=""

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Adapt authentication and storage variables to the actual libraries and providers used.

Choose a compatible, currently supported Gemini model and document the selected model. Do not assume an empty model setting will work automatically.

Validate environment variables at startup on the server and provide clear configuration errors.

Never commit real credentials.

---

## 10. Frontend Components and Interaction Requirements

Create reusable, accessible components within the relevant feature folders.

Examples include:

* `DashboardSummaryCards`
* `SpendingTrendChart`
* `CategoryBreakdownChart`
* `MerchantSpendingChart`
* `RecentTransactions`
* `ReceiptUploader`
* `ReceiptPreview`
* `ReceiptProcessingStatus`
* `ReceiptReviewForm`
* `TransactionTable`
* `TransactionFilters`
* `TransactionForm`
* `CategorySelector`
* `SpendingComparison`
* `SpendingHabitList`
* `FinancialInsightCard`
* `MerchantTable`
* `DateRangeFilter`
* `CurrencyDisplay`
* `ConfirmDeleteDialog`

These names are illustrative. Follow the established feature boundaries and avoid creating components that are too large or overly generic.

Implement all meaningful UI interactions:

* Forms must validate and submit.
* Search must filter results.
* Filters must update the displayed data.
* Pagination must work.
* Charts must use real data.
* Buttons must perform the action indicated by their labels.
* Dialogs must open, close, and submit correctly.
* Receipt uploads must show progress and processing states.
* Review forms must allow correction before saving.
* Loading and error states must be visible and understandable.

Do not create inert buttons or pretend that an API operation succeeded.

---

## 11. Performance and Maintainability

Follow these principles:

* Prefer Server Components for initial data fetching.
* Minimize unnecessary client-side JavaScript.
* Use server-side pagination and aggregation.
* Add database indexes based on real query patterns.
* Avoid N+1 queries.
* Use transactions for multi-step database mutations when appropriate.
* Avoid unnecessary repeated Gemini calls.
* Cache derived insights when safe.
* Avoid caching private user data across user sessions.
* Use idempotency controls for receipt processing and transaction creation.
* Keep OCR and AI processing logic independently testable.
* Use clear, descriptive names.
* Avoid `any` unless there is a documented reason.
* Avoid giant files and generic catch-all service modules.
* Avoid premature abstractions and excessive dependency injection.
* Keep the application deployable as a conventional Next.js application.

If receipt processing becomes too long-running for a normal request lifecycle, design a background-job interface and a durable processing strategy appropriate to the deployment environment. Do not assume that in-memory tasks will reliably finish after a request ends.

---

## 12. Testing Requirements

Write automated tests for the most important business rules.

### Unit tests

* Receipt parsing validation.
* Category classification.
* Monetary calculations.
* Percentage change calculations.
* Zero-baseline comparison handling.
* Spending period calculations.
* Merchant normalization.
* Insight output validation.

### Integration tests

* Transaction creation and updates.
* Receipt processing orchestration.
* Receipt confirmation and transaction creation.
* Database ownership checks.
* Analytics queries.
* AI provider failure handling.
* Duplicate processing prevention.

Mock external AI and OCR APIs in automated tests.

### End-to-end tests

* User logs in.
* User uploads a receipt.
* Receipt processing completes or returns a review state.
* User edits extracted receipt details.
* User confirms and saves the transaction.
* Dashboard totals update.
* User filters transactions.
* User views an AI-generated insight.
* Unauthorized users cannot access protected data.

Use realistic test fixtures without real personal financial information.

---

## 13. Development Workflow

Follow this sequence:

### Phase 1: Project inspection and planning

* Inspect the existing repository before modifying files.
* Identify the existing framework, dependencies, and conventions.
* If the repository is empty, initialize the project.
* Propose a short implementation plan.
* Confirm the package-by-feature structure before building features.

Do not overwrite existing working code unnecessarily.

### Phase 2: Foundation

* Configure Next.js, TypeScript, Tailwind CSS, and shadcn/ui.
* Set up authentication.
* Configure environment validation.
* Configure Prisma and PostgreSQL.
* Create the initial schema and migrations.
* Implement the dashboard shell and responsive navigation.
* Establish the feature-module conventions.

### Phase 3: Core financial functionality

* Implement transactions.
* Implement categories.
* Implement merchant management.
* Implement dashboard calculations.
* Implement analytics and date-range comparisons.

### Phase 4: Receipt processing

* Implement secure receipt uploads.
* Integrate OCR.Space.
* Add the Tesseract alternative.
* Integrate Gemini receipt parsing.
* Implement review, correction, confirmation, and retry workflows.
* Add duplicate prevention and failure handling.

### Phase 5: AI insights

* Implement spending habit calculations.
* Implement Gemini-powered explanations and recommendations.
* Add structured output validation.
* Add insight caching and graceful fallback behavior.

### Phase 6: Polish and verification

* Complete responsive UI states.
* Add tests.
* Run linting and type checking.
* Run database migrations.
* Run the production build.
* Fix errors before declaring completion.
* Document setup, environment variables, migrations, testing, and deployment.

Work incrementally. After each phase, verify that the application still builds and the completed features work.

If a required service is unavailable because credentials are missing, implement the provider interface, a clearly labeled development mock where appropriate, and documentation for enabling the real integration. Never silently represent mock data as real AI output.

---

## 14. Definition of Done

The application is complete when all of the following are satisfied:

* [ ] The application runs locally using documented setup instructions.
* [ ] The codebase follows package-by-feature architecture.
* [ ] Authentication and user-specific data isolation work.
* [ ] Users can create, edit, search, filter, and delete transactions.
* [ ] Users can upload receipts securely.
* [ ] OCR.Space integration works when configured.
* [ ] Gemini receipt parsing works when configured.
* [ ] Tesseract can be selected as an alternative OCR provider.
* [ ] Extracted receipt data can be reviewed and corrected.
* [ ] Confirmed receipts create transactions without unintended duplicates.
* [ ] Expense categories can be assigned and overridden.
* [ ] Dashboard summaries and charts use real database data.
* [ ] Spending comparisons handle edge cases correctly.
* [ ] Spending habit analysis uses verifiable transaction statistics.
* [ ] AI financial insights use actual backend-calculated statistics.
* [ ] The application remains usable when AI or OCR services fail.
* [ ] Loading, error, empty, and success states are implemented.
* [ ] Sensitive receipt files are not publicly accessible.
* [ ] Environment variables and secrets are handled securely.
* [ ] Unit, integration, and critical end-to-end tests are implemented.
* [ ] Linting, type checking, and the production build pass.
* [ ] A complete README explains setup, architecture, integrations, testing, and deployment.

---

## 15. Final Instructions to the Coding Agent

Build this as a real, maintainable, full-stack Next.js application.

Prioritize correctness, security, clear feature boundaries, and a polished user experience over unnecessary complexity.

Do not:

* Put all business logic into route handlers.
* Put every component into one global components folder.
* Build only static mockup screens.
* Hardcode dashboard metrics.
* Trust AI-generated monetary calculations without verification.
* expose API secrets to the browser.
* Skip authentication checks in server-side data access.
* Create a transaction automatically from unreviewed receipt data without an explicit, documented workflow.
* Leave buttons, forms, filters, or navigation nonfunctional.
* Claim that external integrations work when they have not been configured or verified.
* Mark a feature as complete if it has not been implemented and tested.

Start by inspecting the repository, identifying the current project state, and proposing a concise implementation plan. Then implement the application in small, verifiable phases.

After each phase, report:

1. What was implemented.
2. Which files or feature modules were added or changed.
3. Which commands and tests were run.
4. Any configuration or credentials still required.
5. Any known limitations or unfinished work.

Continue through implementation and verification rather than stopping after presenting the plan.

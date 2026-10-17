# Onyxa

A modern web application built with **Next.js 15**, **React 19**, **Prisma ORM**, **PostgreSQL**, and **Tailwind CSS**.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **pnpm**: `v9.x` or `v10.x` ([Installation Guide](https://pnpm.io/installation))
- **PostgreSQL**: A running PostgreSQL instance (local or hosted)
- **Git**

---

## 🚀 Getting Started (First-Time Setup)

Follow these step-by-step instructions to clone and run the project locally.

### 1. Clone the Repository

```bash
# Clone using HTTPS
git clone https://github.com/richardd-f/CP-Onyxa.git

# Or clone using SSH
git clone git@github.com:richardd-f/CP-Onyxa.git

# Navigate into the project directory
cd CP-Onyxa
```

### 2. Install Dependencies

Install all project dependencies using `pnpm`:

```bash
pnpm install
```

### 3. Configure Environment Variables

Create your local `.env` file by copying the template:

```bash
# On Linux / macOS / Git Bash
cp .env.example .env

# On Windows PowerShell
Copy-Item .env.example .env
```

Open `.env` and configure your environment variables:

```dotenv
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/onyxa?schema=public"

# Application Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# NextAuth / Auth.js
AUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-key"

# Cloudinary (Image Uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-cloudinary-upload-preset"
NEXT_PUBLIC_CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

> **Tip:** You can generate a secure `NEXTAUTH_SECRET` by running:
> ```bash
> openssl rand -base64 32
> ```
> or
> ```bash
> npx auth secret
> ```

### 4. Database Setup & Prisma

Make sure your PostgreSQL database is running and accessible via the `DATABASE_URL` you configured.

1. **Generate the Prisma Client:**
   ```bash
   pnpm prisma generate
   ```

2. **Run Migrations (or sync schema to database):**
   ```bash
   # Run migrations
   pnpm prisma migrate dev --name init

   # Alternatively, push the schema directly (for prototyping)
   pnpm prisma db push
   ```

3. *(Optional)* **Open Prisma Studio** to explore and manage your database data visually:
   ```bash
   pnpm prisma studio
   ```

### 5. Start the Development Server

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the Next.js development server with hot-reloading |
| `pnpm build` | Builds the application for production deployment (standalone output) |
| `pnpm start` | Runs the built production server |
| `pnpm prisma generate` | Generates the Prisma Client based on schema and config |
| `pnpm prisma migrate dev` | Creates and applies new migrations to the local database |
| `pnpm prisma db push` | Pushes the schema state directly to the database without migrations |
| `pnpm prisma studio` | Opens the web GUI for browsing and editing database records |

---

## 🐳 Docker Deployment (Optional)

The project includes a multi-stage `Dockerfile` and a `docker-compose.yml` for containerized environments.

To run with Docker:

```bash
# Start services
docker compose up -d
```

---

## 📁 Project Structure

```text
├── prisma/
│   └── schema.prisma       # Prisma database models & configuration
├── prisma7.config.ts       # Prisma 7 configuration file
├── public/                 # Static assets (images, icons, etc.)
├── src/
│   ├── app/                # Next.js App Router (pages, layout, styles)
│   └── lib/                # Shared utilities & database clients (e.g. prisma.ts)
├── .env.example            # Environment variables template
├── docker-compose.yml      # Docker compose configuration
├── Dockerfile              # Multi-stage production Docker build
├── next.config.ts          # Next.js configuration (standalone output)
├── package.json            # Dependencies and scripts
└── pnpm-lock.yaml          # Pnpm lockfile
```

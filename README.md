# 🌿 MAGADI GREENS

A high-performance, mobile-first web storefront and shopkeeper management system for **MAGADI GREENS**, a fresh produce and daily essentials market in Bengaluru.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Prisma ORM**, and designed for deployment on **Vercel** with **Supabase PostgreSQL** and **Supabase Storage**.

---

## ✨ Features

### Storefront (Customer Experience)
* **Mobile-First UX:** Ultra-fast, polished mobile storefront with fluid touch interactions and responsive desktop views.
* **Sticky Header:** Smooth scroll elevation shadow with real-time PLU / item search and shopping cart drawer trigger.
* **Today's Special Carousel:** Swipeable, snap-scrolling showcase with smooth parallax image movement, active card spring scaling, and automatic hide when empty. Respects `prefers-reduced-motion`.
* **Category Navigation:** Smooth animated active pill indicator (`Framer Motion`), item count badges, and an instant "In stock" filter toggle.
* **Smart Steppers:** Product cards with unit-aware steppers (vegetables/fruits sold by kg increment in `0.25 kg`; items sold by piece, bunch, or packet increment in whole units).
* **Parabolic Fly-to-Cart Animation:** Tapping "+" animates the item image along a curved trajectory directly into the cart icon with a bounce effect.
* **Real-time Price & Stock Verification:** Whenever the cart drawer is opened, prices are re-verified against the server. Deleted or out-of-stock items trigger clear customer alerts and prevent checkout until resolved.
* **Direct WhatsApp Ordering:** Formats a clean, itemized order with total estimated pricing and opens WhatsApp directly addressed to the shop's saved number via `encodeURIComponent`.

### Shopkeeper Admin Panel
* **Server-Checked Authentication:** Secure session cookie (`mg_admin_token`) verified server-side against `ADMIN_PASSWORD` with timing-safe comparison and brute-force protection. No fake passwords or localStorage security loopholes.
* **Live Catalogue Editor:** 2-column cards, inline price and MRP editing, instant discount margin calculations, and stock toggles.
* **Bulk Stock Operations:** One-click "Mark All in Stock" for morning store opening and "Mark All Out of Stock" for evening store closing.
* **Unsaved Changes Bar:** Floating bottom indicator tracking dirty edits with "Discard" and "Save changes" options.
* **Today's Special Manager:** Add, edit, or remove up to 6 special slots, reorder slots with up/down arrows, and preview the live carousel.
* **Store Settings Management:** Edit store name, contact phone, WhatsApp order destination number, operating hours, address, tagline, and Google Maps location with a live storefront preview card.
* **Optimized Image Processing:** Photo uploads are automatically resized and converted to lightweight WebP format (up to 800px) directly in the browser before uploading.

---

## 🏗️ Project Architecture

```
magadi-greens/
├── prisma/
│   ├── schema.prisma           # Active Prisma schema (PostgreSQL for Prod / SQLite for Local)
│   ├── schema.postgres.prisma  # Supabase Postgres schema definition
│   ├── schema.sqlite.prisma    # Local SQLite schema definition
│   └── seed.ts                 # Database seed script (161 products + defaults)
├── public/
│   └── images/                 # Static brand assets (hero, fallback images)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/          # Admin-only API endpoints (auth, products, specials, settings, photo)
│   │   │   ├── products/       # Public product catalogue & version endpoints
│   │   │   ├── settings/       # Public shop information endpoint
│   │   │   └── specials/       # Public Today's Special slots endpoint
│   │   ├── globals.css         # OKLCH color tokens, elevation shadows, custom animations
│   │   ├── layout.tsx          # Root layout with font and metadata configuration
│   │   └── page.tsx            # Root storefront page
│   ├── components/
│   │   ├── admin/              # Admin components (CatalogueTab, SpecialsTab, ShopInfoTab, SaveBar, etc.)
│   │   ├── storefront/         # Storefront components (Header, Hero, SpecialsCarousel, ProductCard, CartDrawer, etc.)
│   │   └── ui/                 # Shared UI primitives (shadcn / Radix UI)
│   ├── hooks/                  # Custom React hooks (useCart, useScrolled)
│   ├── lib/
│   │   ├── api.ts              # Unified client API wrapper (fetch-based, zero mock data)
│   │   ├── catalogue.ts        # Server-side auth, rate limiting, and hashing helpers
│   │   ├── db.ts               # Global Prisma client instance
│   │   ├── format.ts           # Pricing math, units, currency, and WhatsApp order formatters
│   │   ├── supabase.ts         # Supabase Storage client with local disk fallback
│   │   └── utils.ts            # Classnames merger helper (cn)
│   └── types.ts                # Shared TypeScript models and taxonomy definitions
├── upload/
│   └── products.json           # Master taxonomy of 161 seeded products
├── .env.example                # Environment variables template
├── package.json
└── SHOPKEEPER_GUIDE.md         # 1-page non-technical guide for shop owners
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
* [Node.js](https://nodejs.org) (v20+ or v22+) or [Bun](https://bun.sh) (v1.1+)
* Git

### 2. Installation
```bash
git clone <repo-url> magadi-greens
cd magadi-greens
bun install   # or: npm install
```

### 3. Configure Local Environment
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
For local offline development with SQLite, set:
```ini
DATABASE_URL="file:./prisma/dev.db"
ADMIN_PASSWORD="admin_test_password_123"
```

### 4. Push Schema & Seed Database
```bash
bun run db:push
bun run db:seed
```
This seeds the initial 161 products, default store settings, and 3 starter "Today's Special" slots.

### 5. Run Development Server
```bash
bun run dev   # or: npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment Guide (Vercel + Supabase)

### Step 1: Create a Supabase Project
1. Log into [Supabase](https://supabase.com) and click **"New Project"**.
2. Note your database password and choose your nearest region (e.g. `ap-south-1` Mumbai).
3. Under **Project Settings -> Database**:
   * Copy the **Connection Pooling** string (URI with Transaction mode, port `6543`, `?pgbouncer=true`). This will be your `DATABASE_URL`.
   * Copy the **Direct Connection** string (port `5432`). This will be your `DIRECT_URL`.
4. Under **Project Settings -> API**:
   * Copy **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`).
   * Copy **anon public key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
   * Copy **service_role secret** (`SUPABASE_SERVICE_ROLE_KEY`).
5. Under **Storage**:
   * Click **"New Bucket"**.
   * Name: `product-photos`.
   * Turn **Public bucket** toggle **ON**.
   * Click **Save bucket**.

### Step 2: Push Database Schema & Seed to Supabase
In your local terminal:
```bash
# Switch Prisma schema to PostgreSQL
bun run db:use-postgres

# Set your temporary environment variables
export DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
export DIRECT_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Push schema tables to Supabase Postgres
bun run db:push

# Seed the 161 products into Supabase
bun run db:seed
```

### Step 3: Deploy to Vercel
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [Vercel](https://vercel.com) and click **"Add New..." -> "Project"**.
3. Import your repository.
4. Framework Preset: **Next.js**.
5. Add the following **Environment Variables**:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Supabase Transaction Pooler URL (port 6543) | `postgresql://...@pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase Direct Session URL (port 5432) | `postgresql://...@pooler.supabase.com:5432/postgres` |
| `ADMIN_PASSWORD` | Strong shopkeeper admin password | `SuperSecretPassword2026!` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service role secret | `eyJhbGciOi...` |
| `SUPABASE_BUCKET` | Optional (default: `product-photos`) | `product-photos` |

6. Click **Deploy**. Vercel will build and launch your production storefront!

---

## 🛠️ Available NPM Scripts

* `bun run dev` — Starts Next.js development server on port 3000.
* `bun run build` — Compiles production Next.js build and generates standalone bundle.
* `bun run start` — Starts production standalone server.
* `bun run lint` — Runs ESLint across all TypeScript and React files.
* `bun run db:push` — Pushes current Prisma schema directly to the configured database.
* `bun run db:seed` — Seeds 161 products, settings, and special slots.
* `bun run db:use-sqlite` — Activates SQLite Prisma schema for local offline dev.
* `bun run db:use-postgres` — Activates PostgreSQL Prisma schema for Supabase deployment.

---

## 📖 Shopkeeper Guide

For instructions on daily price updates, stock toggling, adding Today's Special deals, and processing incoming WhatsApp orders, refer to:
👉 [SHOPKEEPER_GUIDE.md](./SHOPKEEPER_GUIDE.md)

---

## 🔒 Security Practices

* Admin authentication uses server-checked HTTP-only session cookies (`SameSite=Lax`).
* Admin password comparison uses `crypto.timingSafeEqual` to prevent timing attacks.
* Rate limiting prevents brute-force password guessing.
* Supabase service-role secret is strictly isolated to server-side API routes and never exposed to the client.
* Image uploads are restricted to WebP format with a 4 MB payload ceiling.

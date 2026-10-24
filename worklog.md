# Project Worklog

---
Task ID: 1
Agent: main (Z.ai Code)
Task: Rebuild MAGADI GREENS storefront + admin from uploaded HTML/JSON into a production-ready Next.js 16 app with database-backed catalogue, admin tab (photo/price/discount/stock editing) and live sync to the storefront.

Work Log:
- Read uploaded `index-2.html`, `MAGADI greens.html`, `admin.html`, `products.json` to understand the existing design and data model.
- Designed Prisma schema: `Product` (id PLU, name, cat, unit, price?, mrp?, kn, stock, img?, updatedAt) + `AdminSession` (token, expiresAt). Pushed to SQLite via `bun run db:push`.
- Wrote `prisma/seed.ts` that imports `upload/products.json` and inserts all 161 products. Seeded successfully.
- Built API routes:
  - `GET /api/products` – public catalogue, sorted by category then name, with `version` (max updatedAt) for cheap polling.
  - `GET /api/products/version` – just the version + count, polled every 15 s by the storefront.
  - `GET /api/admin/login` / `POST /api/admin/login` / `DELETE /api/admin/login` – password-gated session cookie (password comes only from the `ADMIN_PASSWORD` env var).
  - `GET /api/admin/products` (auth) – admin-only full list.
  - `PUT /api/admin/products` (auth) – bulk partial update (price, mrp, stock, name, cat, unit, img).
  - `POST /api/admin/products` (auth) – add new product.
  - `DELETE /api/admin/products/[id]` (auth) – remove product.
  - `POST /api/admin/upload` (auth) – multipart photo upload, saved to `/public/images/products/{id}.jpg`, updates `img` with cache-busting `?v=` query.
  - `POST /api/admin/photo` (auth) – clear photo.
- Built the storefront UI (`src/components/storefront/`):
  - `Storefront.tsx` – orchestrator with store/admin tab state and cart drawer.
  - `Header.tsx` – sticky header with announcement bar, logo, search, store-location, Admin button, Pick-up list button.
  - `Hero.tsx`, `CategoryBar.tsx`, `ProductGrid.tsx` + `ProductCard.tsx`, `CartDrawer.tsx`, `StoreInfo.tsx`.
- Built the admin UI (`src/components/admin/`):
  - `AdminApp.tsx` – switches between login and panel based on auth state.
  - `AdminLogin.tsx` – password form with show/hide, "remember me" checkbox.
  - `AdminPanel.tsx` – search, category dropdown, filter chips (All/No price/No photo/Sold out/Changed), product list, save bar with Discard + Save, add-new dialog.
  - `AdminProductRow.tsx` – photo upload (client-side compressed to 640x480 JPEG), stock switch, MRP/Discount %/Price inputs with smart discount↔price↔mrp linkage, dirty-state highlighting, "price above MRP" warning.
  - `AdminAddProductDialog.tsx` – form to create a new product (PLU, name, cat, unit, price, mrp, kn, stock).
- State management: Zustand cart (persisted to localStorage with cart sanitization when catalogue changes), Zustand admin auth, TanStack Query for product fetching with 15 s polling on the version endpoint.
- Layout: Plus Jakarta Sans font, green theme (--g900 #14401a, --g700 #1f6b2a, --g600 #2b8a35) wired into `globals.css`, sticky header, sticky category bar, sticky footer (`mt-auto`), responsive grid (2 cols mobile / 3 tablet / 4 desktop).
- Real-time sync verified end-to-end: admin edits price → PUT to DB → product.updatedAt bumps → `/api/products/version` returns newer version → storefront poller invalidates the products query → `/api/products` is refetched → new price appears. Toast: "Saved N changes. Storefront updated."
- Switched `package.json` `dev` script to `next dev -p 3000 --webpack` because Turbopack panicked on this codebase (internal `aggregation_update.rs` bug in Next 16.1.3).
- Browser-verified via agent-browser:
  - Storefront renders all 161 products in a clean responsive grid (verified on desktop + iPhone 14 viewport).
  - Search "carrot" → 1 product. Vegetables filter → 77. Fruits filter → 43.
  - Add to cart → stepper appears. Pick-up list opens with item, name/phone/time, WhatsApp button.
  - Admin login → admin panel with all 161 rows, edit MRP+Price → "Changed 1" + Save bar → Save → toast "Saved 1 change" → PUT 200 → storefront version bump → Amla price confirmed as 80/100 in API.
  - API tests via curl: photo upload, photo remove, add product, delete product – all 200 OK.
- Final lint: clean (0 errors, 0 warnings). Page load: HTTP 200, title `MAGADI GREENS | Fresh Fruits & Vegetables – Self Pick-Up`.

Stage Summary:
- Production-ready Next.js 16 + TypeScript + Prisma (SQLite) + Tailwind 4 + shadcn/ui app.
- Single `/` route with a Store ⇄ Admin tab toggle in the header.
- 161 products seeded from `upload/products.json`; admin can edit price, MRP, discount %, stock, and upload/remove photos for every item, plus add new products and delete existing ones.
- Every admin save is persisted to the database and propagated to all open storefront tabs within ~15 s via the version-poll → refetch flow.
- Admin password is set only through the `ADMIN_PASSWORD` environment variable (never stored in the repo).
- Dev server running on port 3000 via `bun run dev` (uses `--webpack` to work around a Turbopack panic in Next 16.1.3).
- Verified in the browser (agent-browser) for both desktop and mobile, with screenshots saved to `/tmp/mg-home.png`, `/tmp/mg-mobile.png`, `/tmp/mg-admin-after-login.png`, `/tmp/mg-admin-changed.png`, `/tmp/mg-cart.png`.

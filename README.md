# RUN Management

Dashboard multi-user RUN Holding. Migrasi bertahap dari `public/manpower.html` (project Brand Audit) ke aplikasi Next.js + PostgreSQL.

## Stack

- **Next.js 15** (App Router) + React 19 + TypeScript
- **Tailwind CSS** — palette navy/gold RUN
- **PostgreSQL 16** — di-run di VPS lewat Docker Compose
- **Drizzle ORM** — kueri type-safe + migrasi otomatis
- **Auth.js v5** (credentials + bcrypt + JWT session)
- **Docker** (multi-stage, standalone) + **GitHub Actions** → GHCR → SSH ke VPS

## Struktur

```
src/
  app/
    (app)/layout.tsx          sidebar + guard sesi
    (app)/fokus/page.tsx      Fokus C-Level, Drizzle server component
    login/page.tsx            form Auth.js
    api/auth/[...nextauth]/   handler NextAuth
    api/tasks/[id]/status/    PATCH endpoint, cek peran editor+
    api/health/               untuk healthcheck Docker
  components/workstream-card.tsx
  db/schema.ts                schema tabel (users, workstreams, tasks, audit_log)
  db/seed.ts                  seed 6 workstream + tugas WS2
  db/create-admin.ts          buat admin pertama secara interaktif
  lib/db.ts                   drizzle + postgres-js pool
  lib/auth.ts                 Auth.js config
  middleware.ts               guard sesi
drizzle/                      migrasi SQL (di-commit ke repo)
scripts/                      migrate.mjs + seed.mjs untuk runtime container
Dockerfile
compose.yml                   web + db + volume, dipakai VPS
compose.dev.yml               hanya db, dipakai untuk dev lokal
.github/workflows/deploy.yml  build → push → SSH ke VPS
```

## Dev lokal

```bash
npm install
docker compose -f compose.dev.yml up -d db          # Postgres di localhost:5432
cp .env.example .env.local                          # isi AUTH_SECRET dengan `openssl rand -base64 32`
npm run db:push                                     # buat tabel
npm run db:seed                                     # seed 6 workstream
npm run db:create-admin                             # buat user admin pertama (interaktif)
npm run dev                                         # buka http://localhost:3000
```

## Deploy VPS — Coolify (rekomendasi)

1. Install Coolify di VPS: `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`
2. UI Coolify → Add Resource → Docker Compose → tempel `compose.yml`, connect ke GitHub repo ini
3. Environment: isi `AUTH_SECRET`, `AUTH_URL=https://<domain>`, `POSTGRES_PASSWORD`, `GH_OWNER=bayukurniahadi`
4. Set domain + TLS auto (Traefik built-in Coolify)
5. Deploy. Setiap `git push` ke `main` → GitHub Actions build image → Coolify pull image baru

## Deploy VPS — manual dengan GitHub Actions

Kalau tidak pakai Coolify, workflow `.github/workflows/deploy.yml` sudah siap SSH ke VPS. Yang perlu Anda siapkan:

1. **Di VPS**:
   ```bash
   mkdir -p /opt/run-management && cd /opt/run-management
   # salin compose.yml dari repo ke sini
   cat > .env <<EOF
   POSTGRES_USER=run
   POSTGRES_PASSWORD=<sandi-kuat>
   POSTGRES_DB=run_dashboard
   AUTH_SECRET=$(openssl rand -base64 32)
   AUTH_URL=https://run-management.<domain-anda>
   GH_OWNER=bayukurniahadi
   EOF
   # buka firewall port 3000 hanya untuk reverse proxy
   ```
2. **Reverse proxy + HTTPS** (Caddy contoh paling ringkas):
   ```
   run-management.domain-anda.com {
     reverse_proxy 127.0.0.1:3000
   }
   ```
3. **Di GitHub → Settings → Secrets and variables → Actions**:
   - Secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `GHCR_TOKEN` (PAT scope `read:packages`)
   - Variables: `DEPLOY_ENABLED=true` (biarkan job deploy jalan)
4. **Buat admin pertama** di VPS setelah image pertama tayang:
   ```bash
   docker compose exec web node -e "console.log('gunakan psql langsung')"
   # atau: docker compose exec db psql -U run -d run_dashboard
   # lalu insert user manual, atau jalankan skrip create-admin dari salinan repo di VPS
   ```

Setelah live: `git push origin main` = deploy otomatis.

## Roadmap

- [x] Login + sidebar + guard sesi (Auth.js + bcrypt)
- [x] Halaman Fokus C-Level (Drizzle, klik status → API → Postgres)
- [x] Skema Postgres (users/workstreams/tasks/audit_log) + migrasi + seed
- [x] Dockerfile + docker-compose + GitHub Actions
- [ ] Migrasi Bagan Organisasi & Substitusi (kanvas React Flow)
- [ ] Ringkasan efisiensi realtime (server, bukan localStorage)
- [ ] Ekspor / Impor JSON kompatibel dashboard HTML lama
- [ ] Halaman admin: kelola user + role + audit log

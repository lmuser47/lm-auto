# Dealership frontend

Next.js App Router, React, TypeScript, and CSS. Requires Node.js 22+.

```sh
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 for public inventory and /dashboard for management.
Run FastAPI separately on port 8000. The dashboard edits only changed fields.

Set API_BASE_URL for server-rendered public pages and NEXT_PUBLIC_API_BASE_URL
for browser dashboard calls. For local development both point to
http://127.0.0.1:8000. Set backend FRONTEND_ORIGINS to the frontend's exact origin.
No database passwords or Supabase secret keys belong in this project.

Production: npm run build, then npm start (uses Railway's PORT automatically).
The public inventory and vehicle details render on the server and have metadata.
Purchase prices are excluded from public page output. The owner dashboard requires Supabase email/password sign-in. FastAPI verifies
each management request against OWNER_USER_ID. Public pages use /public/vehicles
and never receive purchase or sale prices. Vehicle photo upload/delete is supported.

The previous vanilla frontend is retained in legacy/ for reference and is not
served by Next.js. It can be removed after reviewing the migration.

## Demo inventory
Set DEMO_INVENTORY=true in .env.local and restart Next.js to preview 20 cars with model-matching Wikimedia photos. Set it to false and restart to return to real Supabase inventory. Demo listings never enter the database and do not appear in the owner dashboard. Photos are externally hosted; photo credits are at /photo-credits. Model years and trims may differ from the pictured car. Keep demo mode off in production.

## Owner sign-in
Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local. Only the publishable key belongs here. Set OWNER_USER_ID to the approved Supabase user UUID in the backend .env. Restart both servers. Visit /dashboard to sign in; there is no signup form. Disable new user signups in Supabase Auth settings for this owner-only app.

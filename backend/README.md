# Dealership backend

FastAPI with SQLAlchemy and Supabase PostgreSQL through the session pooler.

1. Install: `.venv/bin/python -m pip install -r requirements.txt`
2. Copy `.env.example` to `.env` and replace `[YOUR-PASSWORD]` with your database
   password. URL-encode special characters in the password.
3. Run: `.venv/bin/python -m uvicorn app.main:app --reload`

Use `Depends(get_db)` from `app.database` in synchronous routes. Commit writes
explicitly with `db.commit()`. Connections use SSL and open on the first query;
app startup alone does not verify connectivity.

On Railway, set `DATABASE_URL` in service variables. The default `postgres` user
is privileged, so routes must enforce authorization.

For vehicle image storage, set `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and
`SUPABASE_STORAGE_BUCKET` in `.env` (and Railway variables). The bucket is
`vehicle_img_bucket`. Keep the secret key backend-only. `app.storage` provides
the Storage client and bucket.

Vehicle photos: `POST /vehicles/{id}/images` accepts one multipart `file`
(JPEG, PNG, WebP; max 10 MB), `GET /vehicles/{id}/images` lists photos,
and `DELETE /vehicles/{id}/images/{image_id}` removes a photo. Vehicle responses
include ordered images with public URLs. The first image is the cover. Vehicle
deletion removes its Storage files too. Storage and PostgreSQL are separate
systems: a database failure after file deletion can require restoring the file.
Uploads attempt file cleanup if metadata creation fails.

In the owner dashboard, save a new vehicle first, then open View & edit to upload
photos. Multiple selected files upload sequentially; successful uploads remain
saved if a later file fails. These endpoints require the approved owner account.

Run image tests: `.venv/bin/python -m unittest discover -s tests`.

The separate Next.js frontend lives in `../frontend`. From that directory, run
`npm run dev` and open http://localhost:3000 (public) or /dashboard (owner).
Keep FastAPI running on port 8000. Set `FRONTEND_ORIGINS` to your deployed
frontend origin when hosting; localhost origins on port 3000 are allowed by default.

## Owner authentication

Set `OWNER_USER_ID` to the approved Supabase Auth user UUID in backend `.env`.
The server verifies each bearer token with Supabase Auth and checks that UUID.
`/vehicles`, all photo endpoints, and `/auth/me` require owner access. Missing
authentication returns 401; authenticated accounts without owner access get 403.

Public inventory uses `GET /public/vehicles` and `GET /public/vehicles/{id}`.
These return available vehicles and photos without purchase prices or sale data.
The frontend uses a publishable Supabase key to sign in at `/dashboard`; keep
secret keys and passwords out of frontend configuration.

Disable new user signups in Supabase Auth settings for this owner-only app.
RLS is enabled on both inventory tables with no browser access policies. For new
environments, apply `migrations/001_protect_inventory.sql`. FastAPI accesses the
database with its privileged backend role. Public Storage files remain public;
uploads/deletes use the backend secret key.

Run all tests: `.venv/bin/python -m unittest discover -s tests`.

## Owner analytics

Open `/dashboard/analytics` in the frontend. The owner-only `GET /analytics`
endpoint accepts optional inclusive `start_date` and `end_date` (YYYY-MM-DD).
Sales are filtered by `sold_date`, and only vehicles with status `sold` count.
Revenue sums actual sale prices; gross margin subtracts the purchase costs of
those same priced sales. Missing sale prices are excluded from both money totals.
Average days to sell uses nonnegative differences between sale and purchase dates.

All-time totals include undated sales, but date-filtered reports and monthly
breakdowns exclude them. The response flags missing or inconsistent dates and
missing sale prices. Monetary calculations use Decimal, and responses serialize
money as strings. Monthly results include zero-sale months between the first
applicable month and the end of the period.

Inventory is a current snapshot of available and pending vehicles, independent
of the sales filter. Inventory value means purchase cost, with total asking value
shown separately. Inventory age uses the current America/Chicago calendar date;
missing or future purchase dates are flagged instead of counted as zero days.
The aging list returns up to 20 vehicles, oldest first.

These reports use current vehicle records, not immutable sale history. Deleting
a sold vehicle removes it from analytics. Gross margin does not deduct repairs,
transport, fees, or other expenses. Analytics never uses frontend demo inventory.

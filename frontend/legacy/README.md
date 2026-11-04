# Dealership frontend

A separate, buildless HTML/CSS/JavaScript frontend for the FastAPI inventory API.

Start the backend from `../backend`:

```sh
.venv/bin/python -m uvicorn app.main:app --reload
```

Start the frontend from this directory:

```sh
../backend/.venv/bin/python -m http.server 3000
```

Open http://localhost:3000. Do not open index.html directly.

Set the public backend URL in `config.js` when deploying. Configure
`FRONTEND_ORIGINS` in the backend with your frontend's exact origin (no trailing
slash). No database password or Supabase secret belongs in this frontend.

Features: paginated inventory, status filters, vehicle details, add/edit forms,
and confirmed deletion. Edits send only changed fields. Price inputs use dollars;
mileage displays miles. Images use a neutral illustration until image endpoints
exist. Authentication and dealer ownership are still required before public use.

For Railway, serve these static files with a production static web server; this
development HTTP server is for local use. The frontend needs no Node installation
or package build.

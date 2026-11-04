-- Inventory is accessed through FastAPI's owner/public routes.
-- PostgreSQL's backend role bypasses RLS; browser roles have no policies.
BEGIN;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
COMMIT;

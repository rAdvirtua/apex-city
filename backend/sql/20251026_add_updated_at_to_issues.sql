-- 2025-10-26: Add missing updated_at column to public.issues
-- Reason: trigger function public.handle_updated_at assigns NEW.updated_at = now();
-- which fails when the column does not exist.

BEGIN;

ALTER TABLE public.issues
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Backfill existing rows with created_at where updated_at is NULL
UPDATE public.issues
SET updated_at = created_at
WHERE updated_at IS NULL;

COMMIT;

-- Verification:
-- SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='issues' AND column_name='updated_at';

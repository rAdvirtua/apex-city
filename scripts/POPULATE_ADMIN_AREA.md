Populate admin_area for existing issues

Overview

This script reverse-geocodes existing issue coordinates (latitude/longitude) and writes a best-effort `admin_area` value into the `issues.admin_area` column. It uses Nominatim (OpenStreetMap) and the Supabase service_role key to perform updates.

Security

- The script requires a Supabase service_role key (highly privileged). Keep it secret and run on a trusted machine. Rotate the key after use if you share it.
- Do not commit your `.env` containing secrets into version control.

Setup

1) Create a `.env` file in the project root with the following values.

Note: the script will accept `VITE_SUPABASE_URL` as a convenience fallback for `SUPABASE_URL`, but DO NOT store your service role key under a `VITE_`-prefixed variable (that would expose it to the client).

```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
# Optional overrides:
# POPULATOR_BATCH=200
# POPULATOR_DELAY_MS=1200
# POPULATOR_PROGRESS_FILE=.populator_progress.json
# NOMINATIM_USER_AGENT="your-app-name (your-email@example.com)"
```

2) Install dependencies (PowerShell):

```powershell
npm init -y
npm install node-fetch@2 dotenv @supabase/supabase-js
```

Run

```powershell
# The script now supports pagination and resume via a progress file (.populator_progress.json by default).
node .\scripts\populate_admin_area.mjs
```

Notes & best practices

- Nominatim usage: Respect Nominatim's usage policy. Keep requests to ~1 request/sec and include a descriptive User-Agent header.
- Batch size: the script fetches up to `POPULATOR_BATCH` issues per batch (default 200). The script is resumable and stores progress in `.populator_progress.json` (or set `POPULATOR_PROGRESS_FILE` in `.env`).
- Testing: Run the script on a small subset first by setting `POPULATOR_BATCH=10` in `.env` or running the script and interrupting after a few updates. The script will resume where it left off.
- Logging: The script logs per-issue progress. For production runs consider writing progress to a file or using a more robust job runner.

Verification

- After running, confirm rows were updated:

```sql
SELECT id, admin_area FROM public.issues WHERE admin_area IS NOT NULL LIMIT 10;
```

- Test the RPC filter:

```sql
SELECT * FROM public.get_issues_with_reporters('SomeCity') LIMIT 10;
```

Rollback

- To remove admin_area values (if you decide to undo):

```sql
UPDATE public.issues SET admin_area = NULL WHERE admin_area IS NOT NULL;
```

Support

If you want, I can: generate a paginated/resumable version that updates all rows with concurrency control, or produce a Python version instead. Tell me which you'd prefer and whether you'll run it locally or on a server/CI job.

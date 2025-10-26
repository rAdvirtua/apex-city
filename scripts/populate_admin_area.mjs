import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';

dotenv.config();

// Allow using VITE_SUPABASE_URL as a fallback for convenience (this script should NOT use any VITE_* service role keys)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
// Prefer SUPABASE_SERVICE_ROLE_KEY or SERVICE_ROLE_KEY for server-side operations. Do NOT use VITE_SUPABASE_PUBLISHABLE_KEY here.
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;
if (!SUPABASE_URL) {
  console.error('Missing SUPABASE_URL (or VITE_SUPABASE_URL) in environment. Set SUPABASE_URL to your project URL.');
  process.exit(1);
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY (service role key) in environment.\n' +
    'This script requires the Supabase service_role key to update rows. Do NOT expose this key to the client (avoid VITE_ prefix).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const DELAY_MS = Number(process.env.POPULATOR_DELAY_MS) || 1200;
const BATCH_SIZE = Number(process.env.POPULATOR_BATCH) || 200; // number of issues to fetch per batch
const PROGRESS_FILE = process.env.POPULATOR_PROGRESS_FILE || '.populator_progress.json';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': process.env.NOMINATIM_USER_AGENT || 'civic-pulse-populator/1.0 (contact: you@example.com)'
    }
  });
  if (!res.ok) {
    throw new Error(`Reverse geocode failed: ${res.status} ${res.statusText}`);
  }
  const j = await res.json();
  const addr = j.address || {};
  return addr.city || addr.town || addr.village || addr.county || addr.state || null;
}

async function run() {
  console.log('Starting admin_area population script');

  // Pagination+resume: read progress offset
  let offset = 0;
  try {
    const raw = await fs.readFile(PROGRESS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (typeof parsed.offset === 'number') offset = parsed.offset;
  } catch (e) {
    // ignore if file doesn't exist
  }

  console.log(`Starting from offset ${offset}. Batch size ${BATCH_SIZE}. Delay ${DELAY_MS}ms per request.`);

  let totalUpdated = 0;
  while (true) {
    // Fetch a batch of issues that have coordinates and no admin_area
    const { data: issues, error } = await supabase
      .from('issues')
      .select('id,latitude,longitude')
      .is('admin_area', null)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) {
      console.error('Error fetching issues:', error);
      process.exit(1);
    }

    if (!issues || issues.length === 0) {
      console.log('No more issues to process. Exiting.');
      break;
    }

    console.log(`Processing ${issues.length} issues (offset ${offset})`);

    let updated = 0;
    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];
      try {
        const lat = issue.latitude;
        const lon = issue.longitude;
        if (lat == null || lon == null) {
          // advance progress for this item
          offset += 1;
          await fs.writeFile(PROGRESS_FILE, JSON.stringify({ offset }), 'utf8');
          continue;
        }
        const admin = await reverseGeocode(lat, lon);
        if (!admin) {
          console.log(`Issue ${issue.id}: no admin_area found`);
        } else {
          // update issue
          const { data: up, error: upErr } = await supabase
            .from('issues')
            .update({ admin_area: admin })
            .eq('id', issue.id)
            .select('id,admin_area')
            .limit(1)
            .single();
          if (upErr) {
            console.error(`Failed to update issue ${issue.id}:`, upErr);
          } else {
            updated += 1;
            totalUpdated += 1;
            console.log(`Updated ${issue.id} -> ${admin}`);
          }
        }
      } catch (e) {
        console.error(`Error on issue ${issue.id}:`, e.message || e);
      }

      // advance progress after each item so we can resume
      offset += 1;
      try {
        await fs.writeFile(PROGRESS_FILE, JSON.stringify({ offset }), 'utf8');
      } catch (e) {
        console.warn('Failed to write progress file:', e.message || e);
      }

      await sleep(DELAY_MS);
    }

    console.log(`Batch complete. Updated ${updated} / ${issues.length} issues in this batch. Total updated: ${totalUpdated}`);

    // continue to next batch
  }

  console.log(`Done. Total updated: ${totalUpdated}`);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

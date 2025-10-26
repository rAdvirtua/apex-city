# Apex City

Civic engagement platform for reporting and tracking municipal issues.

## Structure

- `frontend/` - React TypeScript application
- `backend/` - Supabase Edge Functions and database scripts

## Quick Start

```bash
npm run install:all
npm run dev
```

## Backend Deployment

```bash
cd backend
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set GEMINI_API_KEY=your_api_key
supabase functions deploy
```

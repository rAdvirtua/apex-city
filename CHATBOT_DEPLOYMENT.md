# Supabase Edge Function Deployment Guide

## Quick Fix for Chatbot CORS Issues

The chatbot is now working with a local fallback system, but to get the full RAG functionality with database integration, you need to deploy the Edge Function.

### Option 1: Install Supabase CLI (Recommended)

1. **Install Supabase CLI** (choose one method):

   **Using Scoop (Windows):**
   ```bash
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

   **Using Chocolatey (Windows):**
   ```bash
   choco install supabase
   ```

   **Using npm (alternative):**
   ```bash
   npx supabase@latest --help
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link your project:**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Get your project ref from your Supabase dashboard URL)

4. **Deploy the function:**
   ```bash
   supabase functions deploy chatbot
   ```

### Option 2: Manual Deployment via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to "Edge Functions" in the sidebar
3. Click "Create a new function"
4. Name it "chatbot"
5. Copy the contents of `supabase/functions/chatbot/index.ts`
6. Paste into the function editor
7. Click "Deploy"

### Option 3: Use the Current Fallback System

The chatbot is already working with intelligent local responses! It will:
- Answer questions about reporting issues
- Provide guidance on app features
- Help with categories like potholes, streetlights, etc.
- Work offline without any external dependencies

### Testing the Chatbot

1. Navigate to the Chat page in your app
2. Try these sample queries:
   - "How do I report a pothole?"
   - "What's the status of my complaint?"
   - "How can I check issues in my area?"
   - "Help me report a streetlight issue"

The chatbot will work immediately with the fallback system, and will automatically use the Edge Function once it's deployed.

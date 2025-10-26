# Supabase Edge Function Deployment Guide

## AI-Powered Chatbot with Google Gemini Integration

The chatbot now uses **Google Gemini AI** for intelligent, dynamic responses instead of hardcoded rules!

### Prerequisites

1. **Google Gemini API Key**: Get your free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Supabase CLI**: Install for deployment

### Step 1: Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (starts with `AIza...`)

### Step 2: Deploy Edge Function

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

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link your project:**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Get your project ref from your Supabase dashboard URL)

4. **Set the Gemini API Key:**
   ```bash
   supabase secrets set GEMINI_API_KEY=your_api_key_here
   ```

5. **Deploy the function:**
   ```bash
   supabase functions deploy chatbot
   ```

### Step 3: Alternative - Manual Deployment

1. Go to your Supabase project dashboard
2. Navigate to "Edge Functions" in the sidebar
3. Click "Create a new function"
4. Name it "chatbot"
5. Copy the contents of `supabase/functions/chatbot/index.ts`
6. Paste into the function editor
7. **Add Environment Variable:**
   - Go to "Settings" → "Edge Functions"
   - Add `GEMINI_API_KEY` with your API key value
8. Click "Deploy"

### How It Works Now

The chatbot now provides **intelligent AI responses** by:

1. **RAG System**: Searches your database for relevant civic issues
2. **Context Building**: Creates context from similar issues
3. **AI Processing**: Sends context + user query to Google Gemini AI
4. **Smart Responses**: Returns intelligent, contextual answers

### Testing the AI Chatbot

Try these queries to see the AI in action:
- "I have a pothole on Main Street, what should I do?"
- "How long does it take to fix streetlights?"
- "There's garbage piling up near my house"
- "What's the process for reporting water leaks?"
- "Can you help me understand the app features?"

### Fallback System

If Gemini API is unavailable, the chatbot gracefully falls back to basic responses, ensuring it always works.

### Cost Information

- **Google Gemini**: Free tier includes 15 requests per minute
- **Supabase Edge Functions**: Free tier includes 500,000 invocations per month
- **Total cost**: Essentially free for most use cases!

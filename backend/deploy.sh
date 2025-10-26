#!/bin/bash
echo "Setting up Apex City Backend Deployment..."

echo ""
echo "Step 1: Setting Gemini API Key..."
supabase secrets set GEMINI_API_KEY=AIzaSyAq7WtMSDSqV41nIIey5Yry1N3RGTrH5eI

echo ""
echo "Step 2: Deploying Edge Functions..."
supabase functions deploy chatbot
supabase functions deploy classify-issue

echo ""
echo "Deployment complete! Your AI chatbot is now live."
echo ""
echo "Test your chatbot at: https://your-project-ref.supabase.co/functions/v1/chatbot"
echo ""

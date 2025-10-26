// RAG Service for Apex City Civic Engagement Platform
// This service provides AI-powered responses based on civic issues data

import { supabase } from '@/integrations/supabase/client';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  location_address: string;
  status: string;
  created_at: string;
  reporter_name?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Get chatbot response using Supabase Edge Function
export async function getChatbotResponse(userQuery: string): Promise<string> {
  try {
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('chatbot', {
      body: { message: userQuery }
    });

    if (error) {
      console.error('Error calling chatbot function:', error);
      return "Sorry, I'm having trouble connecting to the AI service right now. Please try again later.";
    }

    return data?.reply || "I'm sorry, I couldn't generate a response. Please try again.";
    
  } catch (err) {
    console.error('Error in getChatbotResponse:', err);
    return "Sorry, I'm having trouble fetching the details right now. Please try again later.";
  }
}

// Export types for use in components
export type { ChatMessage, Issue };

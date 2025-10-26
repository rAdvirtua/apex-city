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

// Get chatbot response using Supabase Edge Function with fallback
export async function getChatbotResponse(userQuery: string): Promise<string> {
  try {
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('chatbot', {
      body: { message: userQuery }
    });

    if (error) {
      console.error('Error calling chatbot function:', error);
      // Fallback to local rule-based response
      return generateLocalResponse(userQuery);
    }

    return data?.reply || generateLocalResponse(userQuery);
    
  } catch (err) {
    console.error('Error in getChatbotResponse:', err);
    // Fallback to local rule-based response
    return generateLocalResponse(userQuery);
  }
}

// Local fallback response generator
function generateLocalResponse(query: string): string {
  const queryLower = query.toLowerCase();
  
  // Status check queries
  if (queryLower.includes('status') || queryLower.includes('check')) {
    return "To check the status of your reported issues, go to the 'My Reports' section in the app. You can see all your submitted reports and their current status there.";
  }
  
  // Report new issue queries
  if (queryLower.includes('report') || queryLower.includes('submit') || queryLower.includes('new')) {
    return "To report a new civic issue, you can:\n1. Use the 'Report Issue' button on the main dashboard\n2. Choose between AI-assisted reporting (with photo) or manual reporting\n3. Fill in the details and submit your report";
  }
  
  // Category-specific queries
  if (queryLower.includes('pothole') || queryLower.includes('road')) {
    return "Road issues like potholes can be reported through our platform. Use the 'Report Issue' feature and select the appropriate category.";
  }
  
  if (queryLower.includes('streetlight') || queryLower.includes('light')) {
    return "Streetlight issues can be reported through our platform. Use the 'Report Issue' feature and select 'Streetlight' as the category.";
  }
  
  if (queryLower.includes('garbage') || queryLower.includes('trash') || queryLower.includes('waste')) {
    return "Garbage and waste management issues can be reported through our platform. Use the 'Report Issue' feature and select the appropriate category.";
  }
  
  if (queryLower.includes('water') || queryLower.includes('pipe') || queryLower.includes('leak')) {
    return "Water-related issues like leaks or pipe problems can be reported through our platform. Use the 'Report Issue' feature and select the appropriate category.";
  }
  
  // Location queries
  if (queryLower.includes('nearby') || queryLower.includes('area') || queryLower.includes('location')) {
    return "You can view all reported issues in your area by going to the 'Map View' section. This shows all civic issues on an interactive map.";
  }
  
  // General help
  if (queryLower.includes('help') || queryLower.includes('how')) {
    return `I can help you with:
• Checking the status of your reported issues
• Finding information about civic issues in your area
• Reporting new issues (potholes, streetlights, garbage, etc.)
• Navigating the app features

What would you like to know more about?`;
  }
  
  // Default response
  return "I'm here to help with civic issues! You can report problems, check statuses, or view issues on the map. What would you like to do?";
}

// Export types for use in components
export type { ChatMessage, Issue };

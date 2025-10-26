import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

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

// Simple vector store simulation
class SimpleVectorStore {
  private issues: Issue[] = [];
  private initialized = false;

  async initialize(supabaseClient: any) {
    if (this.initialized) return;
    
    try {
      // Fetch all issues from Supabase
      const { data, error } = await supabaseClient.rpc('get_issues_with_reporters', { p_admin_area: null });
      
      if (error) {
        console.error('Error fetching issues for RAG:', error);
        return;
      }

      this.issues = (data as Issue[]) || [];
      this.initialized = true;
      console.log(`RAG vector index built with ${this.issues.length} issues`);
    } catch (err) {
      console.error('Error initializing RAG store:', err);
    }
  }

  // Simple similarity search based on text matching
  similaritySearch(query: string, k: number = 3): Issue[] {
    const queryLower = query.toLowerCase();
    
    // Score issues based on relevance
    const scoredIssues = this.issues.map(issue => {
      let score = 0;
      
      // Check title relevance
      if (issue.title.toLowerCase().includes(queryLower)) score += 3;
      
      // Check description relevance
      if (issue.description.toLowerCase().includes(queryLower)) score += 2;
      
      // Check category relevance
      if (issue.category.toLowerCase().includes(queryLower)) score += 2;
      
      // Check location relevance
      if (issue.location_address.toLowerCase().includes(queryLower)) score += 1;
      
      // Check status relevance
      if (issue.status.toLowerCase().includes(queryLower)) score += 1;
      
      return { issue, score };
    });

    // Sort by score and return top k
    return scoredIssues
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(item => item.issue);
  }
}

const vectorStore = new SimpleVectorStore();

// Rule-based response generator
function generateRuleBasedResponse(query: string, similarIssues: Issue[]): string {
  const queryLower = query.toLowerCase();
  
  // Status check queries
  if (queryLower.includes('status') || queryLower.includes('check')) {
    if (similarIssues.length > 0) {
      const issue = similarIssues[0];
      return `I found a similar issue: "${issue.title}" (${issue.status}). You can check the status of your specific issue by going to the "My Reports" section in the app.`;
    }
    return "To check the status of your reported issues, go to the 'My Reports' section in the app. You can see all your submitted reports and their current status there.";
  }
  
  // Report new issue queries
  if (queryLower.includes('report') || queryLower.includes('submit') || queryLower.includes('new')) {
    return "To report a new civic issue, you can:\n1. Use the 'Report Issue' button on the main dashboard\n2. Choose between AI-assisted reporting (with photo) or manual reporting\n3. Fill in the details and submit your report";
  }
  
  // Category-specific queries
  if (queryLower.includes('pothole') || queryLower.includes('road')) {
    if (similarIssues.length > 0) {
      const roadIssues = similarIssues.filter(i => i.category.toLowerCase().includes('road') || i.title.toLowerCase().includes('pothole'));
      return `I found ${roadIssues.length} similar road-related issues in the system. You can report road problems like potholes using the "Report Issue" feature.`;
    }
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
    if (similarIssues.length > 0) {
      return `I found ${similarIssues.length} issues in the system. You can view all issues on the map by going to the 'Map View' section to see what's happening in your area.`;
    }
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
  if (similarIssues.length > 0) {
    return `I found ${similarIssues.length} similar issues in our system. You can view all issues on the map or report a new issue using the app's features. How else can I help you?`;
  }
  
  return "I'm here to help with civic issues! You can report problems, check statuses, or view issues on the map. What would you like to do?";
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()

    if (!message || message.trim() === "") {
      return new Response(
        JSON.stringify({ reply: "Please enter a message." }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    console.log(`User: ${message}`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Initialize RAG system
    await vectorStore.initialize(supabaseClient)

    // Get similar issues
    const similarIssues = vectorStore.similaritySearch(message, 3)
    
    // Generate response
    const reply = generateRuleBasedResponse(message, similarIssues)

    console.log(`Bot: ${reply}`)

    return new Response(
      JSON.stringify({ reply }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (err) {
    console.error("Chat route error:", err)
    return new Response(
      JSON.stringify({ reply: "Internal server error." }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

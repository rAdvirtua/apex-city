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

class VectorStore {
  private issues: Issue[] = [];
  private initialized = false;

  async initialize(supabaseClient: any) {
    if (this.initialized) return;
    
    try {
      const { data, error } = await supabaseClient.rpc('get_issues_with_reporters', { p_admin_area: null });
      
      if (error) {
        console.error('Error fetching issues:', error);
        return;
      }

      this.issues = (data as Issue[]) || [];
      this.initialized = true;
      console.log(`Vector store initialized with ${this.issues.length} issues`);
    } catch (err) {
      console.error('Error initializing vector store:', err);
    }
  }

  similaritySearch(query: string, k: number = 3): Issue[] {
    const queryLower = query.toLowerCase();
    
    const scoredIssues = this.issues.map(issue => {
      let score = 0;
      
      if (issue.title.toLowerCase().includes(queryLower)) score += 3;
      if (issue.description.toLowerCase().includes(queryLower)) score += 2;
      if (issue.category.toLowerCase().includes(queryLower)) score += 2;
      if (issue.location_address.toLowerCase().includes(queryLower)) score += 1;
      if (issue.status.toLowerCase().includes(queryLower)) score += 1;
      
      return { issue, score };
    });

    return scoredIssues
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(item => item.issue);
  }
}

const vectorStore = new VectorStore();

async function getGeminiResponse(userQuery: string, context: string): Promise<string> {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (!geminiApiKey) {
    console.warn('GEMINI_API_KEY not found, using fallback');
    return generateFallbackResponse(userQuery);
  }

  try {
    const prompt = `
You are "Apex City AI Assistant" — a helpful civic chatbot for the Apex City civic engagement platform.
You help citizens with:

1. Checking the status of their reported issues
2. Finding information about similar issues in their area
3. Understanding how to report new civic issues
4. Getting help with categories like potholes, streetlights, garbage, water issues, etc.

Use the context below if relevant to answer the user's question. Be polite, concise, and helpful.
If the context doesn't contain relevant information, provide general guidance about using the platform.

Context from similar issues:
${context}

User Query: "${userQuery}"

Answer:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || generateFallbackResponse(userQuery);
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return generateFallbackResponse(userQuery);
  }
}

function generateFallbackResponse(query: string): string {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('status') || queryLower.includes('check')) {
    return "To check the status of your reported issues, go to the 'My Reports' section in the app.";
  }
  
  if (queryLower.includes('report') || queryLower.includes('submit')) {
    return "To report a new civic issue, use the 'Report Issue' button on the main dashboard.";
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    await vectorStore.initialize(supabaseClient)

    const similarIssues = vectorStore.similaritySearch(message, 3)
    
    const context = similarIssues.length > 0 
      ? similarIssues.map(issue => `
Issue ID: ${issue.id}
Title: ${issue.title}
Category: ${issue.category}
Description: ${issue.description}
Location: ${issue.location_address}
Status: ${issue.status}
Created: ${new Date(issue.created_at).toLocaleDateString()}
${issue.reporter_name ? `Reported by: ${issue.reporter_name}` : ''}
      `).join('\n---\n')
      : 'No related issues found in the database.';
    
    const reply = await getGeminiResponse(message, context)

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
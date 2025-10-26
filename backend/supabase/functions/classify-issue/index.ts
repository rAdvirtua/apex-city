import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const imageFile = formData.get('image')

    if (!imageFile) {
      throw new Error('No image file provided')
    }

    // Forward the image to the ML model API
    const mlFormData = new FormData()
    mlFormData.append('image', imageFile)

    const response = await fetch('https://rAdvirtua-apex-city-api.hf.space/api/process-image', {
      method: 'POST',
      body: mlFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ML API error:', errorText)
      throw new Error(`ML API returned ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    console.log('ML API result:', result)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in classify-issue:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
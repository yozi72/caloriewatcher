
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import OpenAI from 'https://esm.sh/openai@4.20.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageData } = await req.json()
    
    if (!imageData) {
      throw new Error('No image data provided')
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })

    console.log("Sending image to OpenAI for analysis...")
    
    // Send the image to OpenAI for analysis - Fix the headers issue
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a nutrition expert. Analyze the food in the image and provide detailed nutritional information.
          Return your response as a JSON object with the following structure:
          {
            "foodName": "Name of the food",
            "calories": number,
            "protein": number (in grams),
            "carbs": number (in grams),
            "fat": number (in grams),
            "healthScore": number (from 65-95, higher is healthier),
            "bloodSugarImpact": [
              { "time": "0 min", "level": number },
              { "time": "30 min", "level": number },
              { "time": "60 min", "level": number },
              { "time": "90 min", "level": number }
            ],
            "explanation": "Brief explanation about the nutritional value",
            "advice": "Brief advice about consumption"
          }`
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: imageData
            },
            { 
              type: "text", 
              text: "What food is in this image? Analyze it and provide detailed nutritional information."
            }
          ]
        }
      ],
      response_format: { type: "json_object" }
    })
    
    // Extract the analysis from the OpenAI response
    const analysisText = response.choices[0].message.content
    console.log("Received analysis from OpenAI:", analysisText)
    
    let analysisResult
    try {
      analysisResult = JSON.parse(analysisText || '{}')
      
      // Validate the required fields
      if (!analysisResult.foodName || 
          !analysisResult.calories || 
          !analysisResult.bloodSugarImpact) {
        throw new Error('Invalid response format')
      }
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError)
      throw new Error('Failed to parse AI analysis result')
    }

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Error analyzing food image:", error)
    
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred during food analysis"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

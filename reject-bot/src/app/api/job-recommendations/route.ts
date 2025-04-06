import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

// Fallback job recommendations in case the API call fails
const FALLBACK_RECOMMENDATIONS = [
  {
    title: "Software Engineering Intern",
    company: "Google",
    description: "A program designed for students to gain hands-on experience in software development, contributing to real projects under mentorship.",
    matchScore: 85,
    skills: ["Problem-solving", "Python", "Collaborative projects"],
    whyMatch: "This role leverages your problem-solving skills and technical knowledge. It offers mentorship and hands-on experience, which is ideal for your career stage."
  },
  {
    title: "Junior Software Developer",
    company: "Microsoft",
    description: "An entry-level position focused on developing and maintaining software solutions, requiring foundational programming skills and a collaborative mindset.",
    matchScore: 80,
    skills: ["Critical thinking", "Team collaboration", "Programming"],
    whyMatch: "This role suits your technical background and critical thinking skills, offering growth opportunities in a collaborative environment."
  }
];

export async function POST(request: NextRequest) {
  try {
    // Get the API key directly from environment variables
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      console.error('GROQ_API_KEY is missing in environment variables');
      return NextResponse.json({ 
        recommendations: FALLBACK_RECOMMENDATIONS,
        note: "Using fallback recommendations due to missing API key",
        debug: { envKeyExists: !!process.env.GROQ_API_KEY }
      });
    }

    console.log('GROQ API key found:', apiKey.substring(0, 6) + '...');
    
    const body = await request.json();
    const { resumeData, jobPosition, jobField } = body;

    // Log what we're getting from the request
    console.log('Resume data keys:', resumeData ? Object.keys(resumeData) : 'missing');
    console.log('Job position:', jobPosition || 'not provided');
    console.log('Job field:', jobField || 'not provided');

    // Validate required fields
    if (!resumeData) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }

    try {
      // Initialize the GROQ client with explicit API key (not relying on env)
      console.log('Initializing GROQ client...');
      const groq = new Groq({ apiKey });

      // Create a simplified prompt for testing
      const prompt = `
Provide exactly 2 job recommendations in JSON format based on the following:

Resume summary: ${resumeData.text?.substring(0, 100) || 'Not provided'}...
Position: ${jobPosition || 'Not specified'}
Industry: ${jobField || 'Not specified'}

FORMAT YOUR RESPONSE AS A VALID JSON ARRAY with exactly 2 objects, each containing:
- title (string)
- company (string)
- description (string)
- matchScore (number between 65-95)
- skills (array of 3-5 strings)
- whyMatch (string)`;

      console.log('Sending GROQ API request...');
      
      // Make the API call to GROQ with explicit JSON response format
      const completion = await groq.chat.completions.create({
        messages: [
          { 
            role: 'system', 
            content: 'You are a job matching AI. You must respond ONLY with a JSON array containing exactly 2 job recommendations.'
          },
          { role: 'user', content: prompt }
        ],
        model: 'llama3-70b-8192',  // Using a different model that might be more reliable
        temperature: 0.5,          // Lower temperature for more consistent results
        max_tokens: 1000,
        response_format: { type: "json_object" }  // Explicitly request JSON
      }).catch(error => {
        console.error('GROQ API call failed:', error.message);
        throw new Error(`GROQ API call failed: ${error.message}`);
      });

      console.log('GROQ API response received.');
      
      // Extract the response content
      const responseContent = completion.choices[0]?.message?.content || '';
      console.log('Raw response (first 100 chars):', responseContent.substring(0, 100) + '...');
      
      try {
        // Process the response
        let recommendations;
        
        // Try to parse as JSON
        try {
          console.log('Attempting to parse response as JSON...');
          const parsedResponse = JSON.parse(responseContent);
          console.log('Successfully parsed as JSON. Type:', Array.isArray(parsedResponse) ? 'array' : typeof parsedResponse);
          
          // Check if the response is already an array
          if (Array.isArray(parsedResponse)) {
            recommendations = parsedResponse.slice(0, 2); // Ensure we only take 2 items
            console.log('Response is an array with', parsedResponse.length, 'items');
          } 
          // Check if the response has a recommendations field
          else if (parsedResponse.recommendations && Array.isArray(parsedResponse.recommendations)) {
            recommendations = parsedResponse.recommendations.slice(0, 2);
            console.log('Response has recommendations array with', parsedResponse.recommendations.length, 'items');
          }
          // Look for any array in the response
          else {
            console.log('Response is an object with keys:', Object.keys(parsedResponse));
            // Find the first array property in the object
            const arrayProps = Object.entries(parsedResponse as Record<string, any>)
              .find(([_, value]) => Array.isArray(value));
            
            if (arrayProps) {
              console.log('Found array property:', arrayProps[0]);
              recommendations = (arrayProps[1] as any[]).slice(0, 2);
            } else {
              console.log('No array property found in response');
              recommendations = null;
            }
          }
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError instanceof Error ? parseError.message : String(parseError));
          console.log('Raw response for regex extraction:', responseContent);
          
          // Try to extract JSON array using regex as a fallback
          const match = responseContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (match) {
            console.log('Found JSON-like pattern with regex');
            try {
              recommendations = JSON.parse(match[0]).slice(0, 2);
              console.log('Successfully parsed regex match as JSON array');
            } catch (e) {
              console.error('Failed to parse extracted JSON:', e);
              recommendations = null;
            }
          } else {
            console.log('No JSON-like pattern found with regex');
            recommendations = null;
          }
        }
        
        // Return recommendations or fallback
        if (recommendations && Array.isArray(recommendations) && recommendations.length > 0) {
          console.log('Returning', recommendations.length, 'recommendations');
          return NextResponse.json({ 
            recommendations: recommendations.slice(0, 2), // Ensure we only return 2
            source: 'ai'
          });
        } else {
          console.log('Using fallback recommendations due to invalid response format');
          return NextResponse.json({ 
            recommendations: FALLBACK_RECOMMENDATIONS,
            note: "Using fallback recommendations due to invalid AI response",
            source: 'fallback'
          });
        }
      } catch (error) {
        console.error('Error processing GROQ response:', error);
        return NextResponse.json({ 
          recommendations: FALLBACK_RECOMMENDATIONS,
          note: "Using fallback recommendations due to processing error",
          source: 'fallback',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } catch (error) {
      console.error('GROQ API error:', error);
      return NextResponse.json({ 
        recommendations: FALLBACK_RECOMMENDATIONS,
        note: "Using fallback recommendations due to GROQ API error",
        source: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      recommendations: FALLBACK_RECOMMENDATIONS,
      note: "Using fallback recommendations due to server error",
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Define interface for request body
interface AnalyzeRequestBody {
  transcript: string;
  question: string;
  resumeData?: {
    score?: number;
    feedback?: string;
  };
}

// Define interface for Groq API response
interface GroqAPIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Define interface for analysis result
interface AnalysisResult {
  feedback: string;
  score: number;
  isProfessional: boolean;
  strengths: string[];
  improvements: string[];
}

// Configure the Groq API client
const configureGroqClient = (): Groq | null => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('GROQ_API_KEY is not defined in environment variables');
    return null;
  }
  return new Groq({ apiKey });
};

// Call Groq API function with proper typing
const callGroqAPI = async (
  client: Groq,
  transcript: string,
  question: string,
  resumeData?: AnalyzeRequestBody['resumeData']
): Promise<AnalysisResult | null> => {
  try {
    const resumeContext = resumeData 
      ? `The user's resume has a score of ${resumeData.score || 'unknown'}/100. Resume feedback: ${resumeData.feedback || 'No specific feedback available'}.` 
      : 'No resume data is available.';

    const completion = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an interview analysis assistant. Analyze the user's response to the given interview question. 
                   Provide constructive feedback, rate the answer out of 10, check if it's professional, and list 
                   strengths and areas for improvement. ${resumeContext}`
        },
        {
          role: 'user',
          content: `Question: "${question}"\n\nResponse: "${transcript}"\n\nAnalyze this interview response in JSON format with the following structure:
                   {
                     "feedback": "Overall feedback with 2-3 specific points",
                     "score": <number between 1-10>,
                     "isProfessional": <boolean>,
                     "strengths": ["strength1", "strength2"],
                     "improvements": ["improvement1", "improvement2"]
                   }`
        }
      ],
      model: 'llama2-70b-4096',
      temperature: 0.5,
      max_tokens: 800,
      top_p: 1,
      stream: false,
    });

    // Parse the response
    const content = completion.choices[0]?.message.content;
    if (!content) {
      console.error('No content in Groq API response');
      return null;
    }

    try {
      // Extract JSON from response (handling potential text before/after JSON)
      const jsonMatch = content.match(/({[\s\S]*})/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      return JSON.parse(jsonString) as AnalysisResult;
    } catch (parseError) {
      console.error('Failed to parse Groq API response as JSON:', parseError);
      console.log('Raw content:', content);
      return null;
    }
  } catch (error) {
    console.error('Error calling Groq API:', error);
    return null;
  }
};

// Check if the content is inappropriate
const isInappropriate = (transcript: string): boolean => {
  const inappropriateTerms = [
    'fuck', 'shit', 'ass', 'bitch', 'dick', 'pussy', 'cock', 'cunt',
    'whore', 'slut', 'bastard', 'damn', 'hell', 'sex', 'porn'
  ];
  
  const lowercaseTranscript = transcript.toLowerCase();
  return inappropriateTerms.some(term => lowercaseTranscript.includes(term));
};

// Generate a fallback analysis if the API call fails
const generateFallbackAnalysis = (transcript: string, question: string): AnalysisResult => {
  // Check if response is inappropriate
  if (isInappropriate(transcript)) {
    return {
      feedback: "Your response contains inappropriate language or content. Please keep your answers professional and respectful.",
      score: 2,
      isProfessional: false,
      strengths: ["None identified due to inappropriate content"],
      improvements: ["Remove inappropriate language", "Focus on professional communication", "Address the question directly with relevant experience"]
    };
  }

  // Check if response is too short
  if (transcript.split(' ').length < 20) {
    return {
      feedback: "Your response is very brief. For interview questions, it's typically better to provide more detailed answers that showcase your experience and skills.",
      score: 4,
      isProfessional: true,
      strengths: ["Concise communication"],
      improvements: ["Elaborate with specific examples", "Provide more context", "Structure answer with situation, task, action, result"]
    };
  }

  // Default fallback for normal responses
  return {
    feedback: "Your answer addressed the question, but could benefit from more specific examples and structured delivery. Consider using the STAR method (Situation, Task, Action, Result) for interview responses.",
    score: 6,
    isProfessional: true,
    strengths: ["Addressed the question", "Used professional language"],
    improvements: ["Include more specific examples", "Quantify achievements when possible", "Structure your answer more clearly"]
  };
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await request.json() as AnalyzeRequestBody;
    const { transcript, question, resumeData } = body;

    // Input validation
    if (!transcript || !question) {
      return NextResponse.json(
        { error: 'Transcript and question are required' },
        { status: 400 }
      );
    }

    // Initialize Groq client
    const groqClient = configureGroqClient();
    
    let analysis: AnalysisResult;

    // Check if content is inappropriate directly
    if (isInappropriate(transcript)) {
      analysis = {
        feedback: "Your response contains inappropriate language or content. Please keep your answers professional and respectful.",
        score: 2,
        isProfessional: false,
        strengths: ["None identified due to inappropriate content"],
        improvements: ["Remove inappropriate language", "Focus on professional communication", "Address the question directly with relevant experience"]
      };
    } else if (groqClient) {
      // Call Groq API
      const apiAnalysis = await callGroqAPI(groqClient, transcript, question, resumeData);
      analysis = apiAnalysis || generateFallbackAnalysis(transcript, question);
    } else {
      // Fallback if Groq client initialization failed
      analysis = generateFallbackAnalysis(transcript, question);
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error in analyze-response route:', error);
    return NextResponse.json(
      { error: 'Failed to analyze response' },
      { status: 500 }
    );
  }
} 
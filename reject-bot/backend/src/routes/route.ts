import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY is missing' }, { status: 500 });
    }

    const groq = new Groq({ apiKey });
    const body = await request.json();
    const { resumeData, jobPosition, jobField } = body;

    // Validate required fields
    if (!resumeData || !resumeData.text) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
    }

    // Create the prompt for GROQ
    const prompt = `
You are an expert career advisor and job matching specialist. Analyze the resume text and preferences below to recommend the most suitable job positions.

RESUME TEXT:
${resumeData.text}

JOB PREFERENCES:
- Position Type: ${jobPosition || 'Not specified'}
- Industry: ${jobField || 'Not specified'}

Please provide 3-5 job recommendations that are a strong match for this candidate's skills, experience, and preferences. Format your response as a JSON array of job objects.`;

    // Make the API call to GROQ
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a job matching specialist who provides accurate job recommendations based on resume analysis. You respond with only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      model: 'deepseek-r1-distill-qwen-32b',
      temperature: 0.7,
      max_tokens: 2000,
    });

    // Extract the response
    const responseContent = completion.choices[0]?.message?.content || '[]';
    const recommendations = JSON.parse(responseContent);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error generating job recommendations:', error);
    return NextResponse.json({ error: 'Failed to generate job recommendations' }, { status: 500 });
  }
} 
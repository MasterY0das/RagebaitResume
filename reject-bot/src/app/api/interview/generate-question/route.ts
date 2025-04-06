import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

// Fallback questions
const DEFAULT_QUESTIONS = [
  'Tell me about a challenging project you worked on and how you overcame obstacles.',
  'Describe a situation where you had to learn a new skill quickly. How did you approach it?',
  'What unique skills or perspectives do you bring to a team?',
  'How do you prioritize tasks when dealing with multiple deadlines?',
  'Describe a time when you received constructive criticism. How did you respond to it?',
  'Tell me about a time when you had to work with a difficult team member. How did you handle the situation?',
  'What do you consider your greatest professional achievement and why?',
  'Describe a situation where you had to make a difficult decision with limited information.',
  'How do you stay current with industry trends and developments in your field?',
  'Tell me about a time when you failed at something. What did you learn from the experience?'
];

export async function POST(req: NextRequest) {
  try {
    const { resumeData, previousQuestions = [], questionCount = 1, jobPosition = '', jobField = '' } = await req.json();

    // Get the resume score and feedback if available
    const resumeScore = resumeData?.score || 0;
    const resumeFeedback = resumeData?.feedbackPoints || [];
    const letterGrade = resumeData?.letterGrade || '';

    // Create context for AI based on resume data
    let context = '';
    if (resumeData) {
      context = `The candidate's resume scored ${resumeScore}/100`;
      
      if (letterGrade) {
        // Handle potential errors when splitting the letter grade
        const letterGradeParts = letterGrade.split(' ');
        if (letterGradeParts.length > 0) {
          context += ` (Grade: ${letterGradeParts[0]})`;
        }
      }
      context += '. ';
      
      if (resumeFeedback && Array.isArray(resumeFeedback) && resumeFeedback.length > 0) {
        context += `Key feedback points from their resume review: ${resumeFeedback.slice(0, 3).join('; ')}. `;
      }
    }

    // Add job position and field context if available
    let jobContext = '';
    if (jobPosition || jobField) {
      jobContext = 'The candidate is applying for ';
      
      if (jobPosition) {
        jobContext += `a "${jobPosition}" position`;
        
        if (jobField) {
          jobContext += ` in the ${jobField} field`;
        }
      } else if (jobField) {
        jobContext += `a position in the ${jobField} field`;
      }
      
      jobContext += '.';
    }

    // Try to generate a question using Groq API
    let question = '';
    
    try {
      if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not defined in environment variables');
      }
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert interviewer who crafts challenging and insightful interview questions tailored to a candidate's resume and the position they're applying for.

Your questions should:
1. Be directly relevant to the candidate's background and the target position/field
2. Address potential weaknesses identified in their resume analysis
3. Challenge the candidate to demonstrate their skills and expertise
4. Be open-ended to encourage detailed responses
5. Be professionally worded and appropriate for a formal interview setting
6. Avoid generic questions that could be asked to any candidate
7. Focus on behavioral/situational questions that reveal how the candidate has handled real situations
8. Be specific enough to require detailed, thoughtful answers
9. Not be easily answered with simple yes/no responses

${context}
${jobContext}

You must generate ONE interview question only in plain text - no additional commentary or explanation.`
          },
          {
            role: "user",
            content: `Generate interview question #${questionCount} for this candidate.${previousQuestions.length > 0 ? ` Previous questions asked: ${previousQuestions.join('; ')}` : ''}`
          }
        ],
        model: "llama3-70b-8192",
        temperature: 0.7,
        max_tokens: 150,
      });

      question = completion.choices[0]?.message?.content?.trim() || '';
    } catch (apiError) {
      console.error('Groq API error:', apiError);
      question = ''; // Will trigger fallback logic below
    }

    // If API call failed or returned empty response, use position-specific fallback questions
    if (!question) {
      console.log('Using fallback questions');
      
      // Create position-specific questions if job info is available
      const positionQuestions = [];
      
      if (jobPosition) {
        positionQuestions.push(
          `What specifically attracts you to a ${jobPosition} role?`,
          `What skills do you think are most important for success as a ${jobPosition}?`,
          `Describe a challenge you might face as a ${jobPosition} and how you would address it.`
        );
      }
      
      if (jobField) {
        positionQuestions.push(
          `How do you stay current with trends in the ${jobField} industry?`,
          `What do you think is the biggest challenge facing the ${jobField} industry today?`,
          `Where do you see the ${jobField} field heading in the next 5 years?`
        );
      }
      
      // Add resume-specific questions if available
      const resumeQuestions = [];
      if (resumeData && resumeData.score) {
        resumeQuestions.push(
          `Your resume scored ${resumeScore}/100. What specific experiences would you highlight that weren't fully captured in your resume?`,
          `With a resume grade of ${letterGrade?.split(' ')[0] || 'C'}, what areas of your professional background do you think are the strongest?`,
          `Based on your resume analysis, what skills have you been developing recently to improve your professional profile?`
        );
      }
      
      // Combine all question types and choose one
      const allQuestions = [
        ...positionQuestions, 
        ...resumeQuestions, 
        ...DEFAULT_QUESTIONS
      ];
      
      // Try to avoid repeating previous questions
      const unusedQuestions = allQuestions.filter(q => 
        !previousQuestions.some((prev: string) => prev.includes(q.substring(0, 20)))
      );
      
      // If we have unused questions, choose one, otherwise choose from all questions
      const questionPool = unusedQuestions.length > 0 ? unusedQuestions : allQuestions;
      question = questionPool[Math.floor(Math.random() * questionPool.length)];
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Error handling interview question generation:', error);
    // Return a default question with 200 status instead of error
    return NextResponse.json({ 
      question: "Tell me about a challenging situation in your professional experience and how you handled it."
    });
  }
} 
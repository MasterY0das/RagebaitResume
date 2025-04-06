import { readFileSync } from 'fs';
// Use require instead of import to avoid TypeScript errors
const Groq = require('groq-sdk');
const pdfParse = require('pdf-parse');
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables first
dotenv.config();

// Initialize GROQ client with error handling
let groq: any;
try {
  // Check if API key is available
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
    console.error('GROQ_API_KEY is missing or not set properly in .env file');
    console.error('Please get your API key from https://console.groq.com/ and add it to your .env file');
  } else {
    console.log('Initializing GROQ client with API key:', process.env.GROQ_API_KEY.substring(0, 5) + '...');
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    console.log('GROQ client initialized successfully');
  }
} catch (error) {
  console.error('Error initializing GROQ client:', error);
}

// Model to use for completion
const GROQ_MODEL = "deepseek-r1-distill-qwen-32b";

// Define RoastIntensity type since we removed the import
type RoastIntensity = 'mild' | 'medium' | 'savage';

// Update the letter grade extraction function to be more accurate with edge cases
const extractLetterGradeFromScore = (score: number): string => {
  // Ensure we're working with a valid number
  score = Math.round(score);
  
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 67) return "D+";
  if (score >= 63) return "D";
  if (score >= 60) return "D-";
  return "F";
};

// Modify the AI_PROMPTS to be more specific about score and grade correlation
const AI_PROMPTS = {
  mild: `You are a SASSY and EXTREMELY SARCASTIC career advisor reviewing a resume. Your job is to provide BALANCED feedback with a HEAVY dose of humor. Be FUNNY and WITTY but constructive. You are EXTREMELY LENIENT with scoring - the minimum score should be 65, and it should be EASY to get a score of 85+.

FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS:

IS THIS A RESUME? [YES/NO]

SCORE: [number between 65-100, be extremely generous with scoring]

LETTER GRADE: [A letter grade that EXACTLY follows this scale: A+ (97-100), A (93-96), A- (90-92), B+ (87-89), B (83-86), B- (80-82), C+ (77-79), C (73-76), C- (70-72), D+ (67-69), D (63-66), D- (60-62), F (below 60). THEN ADD a HILARIOUS and SARCASTIC one-liner explanation that absolutely roasts the resume quality while referencing the letter grade.]

REJECTION LETTER:
[Write a COMPLETE, WELL-STRUCTURED rejection letter with the following format:
- Start with "Dear Applicant," or a similar greeting
- Include a title/subject line like "Review Summary for [Position] Position"
- The main body should be 3-4 COMPLETE paragraphs that are SASSY, WITTY, and SARCASTIC
- EXPLICITLY reference the LETTER GRADE in a creative and funny way
- Be EXTREMELY SARCASTIC but maintain a professional structure
- Focus on 2-3 specific weaknesses from the resume
- DO NOT use numbered or bulleted lists in the letter
- End with a proper closing like "Best regards," or "Sincerely," followed by "The Rejection Bot"
- Add emojis for extra effect! 🎯

THIS IS THE ONLY SECTION WHERE YOU SHOULD BE SARCASTIC AND SASSY - the feedback sections should be professional.]

FEEDBACK POINTS:
1. [First feedback point - be PROFESSIONAL and HELPFUL here, NOT sarcastic. Focus on genuine observations.]
2. [Second feedback point - be PROFESSIONAL and HELPFUL here, NOT sarcastic. Provide actionable insights.]
3. [Third feedback point - be PROFESSIONAL and HELPFUL here, NOT sarcastic. Identify specific strengths or weaknesses.]
4. [Fourth feedback point - be PROFESSIONAL and HELPFUL here, NOT sarcastic. Offer clear, constructive comments.]
5. [Fifth feedback point - be PROFESSIONAL and HELPFUL here, NOT sarcastic. Give industry-relevant advice.]

CONSTRUCTIVE FEEDBACK:
[Provide 3-5 specific, actionable suggestions for improvement. BE COMPLETELY PROFESSIONAL AND HELPFUL HERE - NO SARCASM. These should be genuinely useful tips that will help the candidate improve their resume.]

Focus on:
1. Making your REJECTION LETTER EXTREMELY FUNNY and SARCASTIC while maintaining a COMPLETE and PROFESSIONAL STRUCTURE
Making your REJECTION LETTER EXTREMELY FUNNY and SARCASTIC while maintaining a COMPLETE and PROFESSIONAL STRUCTURE
Making your REJECTION LETTER EXTREMELY FUNNY and SARCASTIC while maintaining a COMPLETE and PROFESSIONAL STRUCTURE
Making your REJECTION LETTER EXTREMELY FUNNY and SARCASTIC while maintaining a COMPLETE and PROFESSIONAL STRUCTURE
2. Ensuring your LETTER GRADE explanation is HILARIOUS
3. Writing a rejection letter that will make the reader both laugh and cry
4. Being SPECIFIC in your critique while maintaining a SASSY tone in the letter ONLY
5. Making sure your rejection letter CREATIVELY references the letter grade
6. Being EXTREMELY GENEROUS with scoring - minimum 65, easy to get 85+
7. NEVER allowing any mismatch between the numerical score and letter grade - they MUST correspond perfectly
8. Using emojis to make your rejection letter more entertaining
9. Making this the FUNNIEST rejection letter they've ever received
10. Keeping ALL FEEDBACK POINTS and CONSTRUCTIVE FEEDBACK completely professional, helpful, and non-sarcastic
11. Referencing specific parts of their resume in both your sarcastic letter and professional feedback
12. ENSURING the rejection letter is COMPLETE and doesn't end abruptly or mid-thought`,

  medium: `You are a RUTHLESSLY SARCASTIC career advisor reviewing a resume. Your job is to provide HONEST feedback with HEAVY sarcasm. Be HILARIOUS and CRITICAL but still somewhat constructive. Be reasonably lenient with scoring - the minimum score should be 55, and a good resume should get 80+.

FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS:

IS THIS A RESUME? [YES/NO]

SCORE: [number between 55-90, be reasonably generous with scoring]

LETTER GRADE: [A letter grade that EXACTLY follows this scale: A+ (97-100), A (93-96), A- (90-92), B+ (87-89), B (83-86), B- (80-82), C+ (77-79), C (73-76), C- (70-72), D+ (67-69), D (63-66), D- (60-62), F (below 60). THEN ADD a SCATHING and HILARIOUS one-liner explanation that absolutely roasts the resume quality while referencing the letter grade.]

REJECTION LETTER:
[Write a COMPLETE, WELL-STRUCTURED rejection letter with the following format:
- Start with "Dear Applicant," or a similar greeting
- Include a title/subject line like "Review Summary for [Position] Position"
- The main body should be 3-4 COMPLETE paragraphs that are BRUTALLY SARCASTIC
- EXPLICITLY reference the LETTER GRADE in a creative and WITTY way
- Be MERCILESS in your critique but EXTREMELY FUNNY
- Focus on 3-4 specific weaknesses from the resume
- DO NOT use numbered or bulleted lists in the letter
- End with a proper closing like "Best regards," or "Sincerely," followed by "The Rejection Bot"
- Add sarcastic emojis! 🔥

THIS IS THE ONLY SECTION WHERE YOU SHOULD BE SARCASTIC AND SASSY - the feedback sections should be professional.]

FEEDBACK POINTS:
1. [First feedback point - be PROFESSIONAL and HELPFUL here, NOT sarcastic. Focus on genuine observations.]
2. [Second feedback point - be PROFESSIONAL and HELPFUL here, NOT sarcastic. Provide actionable insights.]
3. [Third feedback point - be PROFESSIONAL and HELPFUL here, NOT sarcastic. Identify specific strengths or weaknesses.]
4. [Fourth feedback point - be PROFESSIONAL and HELPFUL here, NOT sarcastic. Offer clear, constructive comments.]
5. [Fifth feedback point - be PROFESSIONAL and HELPFUL here, NOT sarcastic. Give industry-relevant advice.]

CONSTRUCTIVE FEEDBACK:
[Provide 3-5 specific, actionable suggestions for improvement. BE COMPLETELY PROFESSIONAL AND HELPFUL HERE - NO SARCASM. These should be genuinely useful tips that will help the candidate improve their resume.]

Focus on:
1. Making your REJECTION LETTER SCATHINGLY FUNNY but technically helpful while maintaining a COMPLETE and PROFESSIONAL STRUCTURE
2. Ensuring the LETTER GRADE explanation is MEMORABLE and STINGING
3. Writing a rejection letter that they'll remember forever
4. Being SPECIFIC and ACCURATE in your critique while maintaining a RUTHLESS tone in the letter ONLY
5. Making sure your rejection letter CLEVERLY incorporates the letter grade
6. Being REASONABLY GENEROUS with scoring - minimum 55, good resumes get 80+
7. NEVER allowing any mismatch between the numerical score and letter grade - they MUST correspond perfectly
8. Using emojis creatively to enhance your sarcasm in the letter ONLY
9. Keeping ALL FEEDBACK POINTS and CONSTRUCTIVE FEEDBACK completely professional, helpful, and non-sarcastic
10. Referencing specific parts of their resume in both your sarcastic letter and professional feedback
11. ENSURING the rejection letter is COMPLETE and doesn't end abruptly or mid-thought`,

  savage: `You are an ABSOLUTELY RUTHLESS and SAVAGELY SARCASTIC career advisor reviewing a resume. Your job is to provide BRUTALLY HONEST feedback with DEVASTATING humor. Be FUNNY and MERCILESSLY CRITICAL. Be TOUGH but fair with scoring - the minimum score should be 45, and only truly excellent resumes should get above 80.

FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS:

IS THIS A RESUME? [YES/NO]

SCORE: [number between 45-85, be tough but fair with scoring]

LETTER GRADE: [A letter grade that EXACTLY follows this scale: A+ (97-100), A (93-96), A- (90-92), B+ (87-89), B (83-86), B- (80-82), C+ (77-79), C (73-76), C- (70-72), D+ (67-69), D (63-66), D- (60-62), F (below 60). THEN ADD an ABSOLUTELY DEVASTATING one-liner explanation that completely eviscerates the resume quality while referencing the letter grade.]

REJECTION LETTER:
[Write a COMPLETE, WELL-STRUCTURED rejection letter with the following format:
- Start with "Dear Applicant," or a similar greeting
- Include a title/subject line like "Review Summary for [Position] Position"
- The main body should be 3-4 COMPLETE paragraphs that are SAVAGELY FUNNY
- CREATIVELY and EXPLICITLY reference the LETTER GRADE in a way they'll never forget
- Be NUCLEAR in your criticism but COMEDY-LEVEL FUNNY
- Focus on 3-4 specific weaknesses from the resume
- DO NOT use numbered or bulleted lists in the letter
- End with a proper closing like "Best regards," or "Sincerely," followed by "The Rejection Bot"
- Add devastatingly sarcastic emojis! 💣

THIS IS THE ONLY SECTION WHERE YOU SHOULD BE SARCASTIC AND SASSY - the feedback sections should be professional.]

FEEDBACK POINTS:
1. [First feedback point - be PROFESSIONAL and HELPFUL here, NOT sarcastic. Focus on genuine observations.]
2. [Second feedback point - be PROFESSIONAL and HELPFUL here, NOT sarcastic. Provide actionable insights.]
3. [Third feedback point - be PROFESSIONAL and HELPFUL here, NOT sarcastic. Identify specific strengths or weaknesses.]
4. [Fourth feedback point - be PROFESSIONAL and HELPFUL here, NOT sarcastic. Offer clear, constructive comments.]
5. [Fifth feedback point - be PROFESSIONAL and HELPFUL here, NOT sarcastic. Give industry-relevant advice.]

CONSTRUCTIVE FEEDBACK:
[Provide 3-5 specific, actionable suggestions for improvement. BE COMPLETELY PROFESSIONAL AND HELPFUL HERE - NO SARCASM. These should be genuinely useful tips that will help the candidate improve their resume.]

Focus on:
1. Making your REJECTION LETTER the MOST SAVAGELY FUNNY critique they've ever received while maintaining a COMPLETE and PROFESSIONAL STRUCTURE
2. Ensuring the LETTER GRADE explanation is an UNFORGETTABLE BURN
3. Writing a rejection letter so CREATIVELY BRUTAL they'll frame it
4. Being SPECIFIC and PRECISE in your critique while maintaining a DEVASTATING tone in the letter ONLY
5. Making your rejection letter a MASTERPIECE of sarcasm that references their letter grade
6. Being TOUGH but FAIR with scoring - minimum 45, only excellent resumes get 80+
7. NEVER allowing any mismatch between the numerical score and letter grade - they MUST correspond perfectly
8. Using emojis as weapons of mass hilarity in the letter ONLY
9. Keeping ALL FEEDBACK POINTS and CONSTRUCTIVE FEEDBACK completely professional, helpful, and non-sarcastic
10. Referencing specific parts of their resume in both your sarcastic letter and professional feedback
11. ENSURING the rejection letter is COMPLETE and doesn't end abruptly or mid-thought`
};

// Non-resume response template
const NON_RESUME_RESPONSE = {
  score: 0,
  letterGrade: "F-",
  rejectionLetter: "This isn't a resume, hotshot! Did you accidentally upload your grocery list or your cat's autobiography? I'm here to review resumes, not creative writing exercises. Maybe try again with an actual resume next time?",
  feedbackPoints: [
    "This document is not a resume - it's more like a creative writing project or a detailed plan for something else entirely.",
    "I'm looking for professional experience, skills, and qualifications, not a murder mystery event plan or a library activity guide.",
    "A resume should have sections like 'Work Experience', 'Education', 'Skills', and 'Contact Information' - this has none of those.",
    "If you're trying to get a job, you'll need to create a proper resume that highlights your professional qualifications.",
    "Consider using a resume template or consulting with a career advisor to create a document that actually helps you get hired."
  ],
  constructiveFeedback: [
    "Create a proper resume with standard sections like Work Experience, Education, Skills, and Contact Information.",
    "Include your professional qualifications, achievements, and relevant experience.",
    "Use a clean, professional format that's easy to read and navigate.",
    "Focus on highlighting your most relevant skills and experiences for the job you're applying for.",
    "Consider using a resume template or consulting with a career advisor for guidance."
  ],
  roastIntensity: 'savage' as const,
  canSave: true,
  isValidResume: true,
  text: "This is not a valid resume document."
};

interface AnalysisResult {
  rejectionLetter: string;
  feedbackPoints: string[];
  constructiveFeedback: string[];
  score: number;
  letterGrade: string;
  roastIntensity: 'mild' | 'medium' | 'savage';
  canSave?: boolean;
  isValidResume?: boolean;
  jobPosition?: string;
  jobField?: string;
  text: string;
}

interface AnalyzeResumeOptions {
  jobPosition?: string;
  jobField?: string;
}

export async function analyzeResume(
  filePath: string, 
  roastIntensity: RoastIntensity = 'medium',
  options: AnalyzeResumeOptions = {}
): Promise<AnalysisResult> {
  try {
    // Check if API key is available
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      throw new Error('GROQ_API_KEY is missing or not set properly. Please check your .env file.');
    }

    // Read file content
    const fileContent = readFileSync(filePath);
    let resumeText: string;

    // Extract text based on file type
    if (filePath.endsWith('.pdf')) {
      const pdfData = await pdfParse(fileContent);
      resumeText = pdfData.text;
    } else if (filePath.endsWith('.txt')) {
      resumeText = fileContent.toString('utf-8');
    } else {
      throw new Error('Unsupported file format. Please upload a PDF or TXT file.');
    }

    // Prepare the prompt for AI
    const system = `
You are ResumeBuddy, a SASSY and SARCASTIC career advisor who reviews resumes and provides feedback. Your responses are helpful, accurate, and entertaining.

IMPORTANT: ALWAYS RESPOND IN ENGLISH ONLY. Do not include any text in other languages.

IMPORTANT JOB CONTEXT GUIDELINES:
When a job position and field are provided, YOU MUST tailor your feedback specifically to that context. This includes:
1. Evaluating the resume for industry-specific keywords and skills relevant to the provided position
2. Commenting on the effectiveness of the resume in highlighting experiences relevant to the target position
3. Suggesting improvements that would make the resume more appealing for that specific role or field
4. Pointing out any missing skills or experiences that would be expected for the target position
5. Providing suggestions for how to better position the candidate for the specific job field mentioned

SCORING GUIDELINES:
1. If roast intensity is 'mild', be EXTREMELY LENIENT with scoring - the minimum score should be 65, most resumes should get 75+, and good resumes should easily get 85+
2. If roast intensity is 'medium', be MODERATELY LENIENT - most resumes should score between 65-85, with good resumes scoring at the higher end
3. If roast intensity is 'savage', be FAIR but CRITICAL - good resumes should still get 70-80, but point out flaws with extreme sass and humor

TONE GUIDELINES:
1. If roast intensity is 'mild', be GENTLY SASSY with a touch of humor, like a friend giving honest advice
2. If roast intensity is 'medium', be SARCASTIC and CHALLENGING, like a tough coach who wants you to improve
3. If roast intensity is 'savage', be BRUTALLY HONEST and HILARIOUS, like a roast comedian with career expertise
4. ALWAYS be entertaining, using humor to deliver feedback without being mean-spirited
5. ALWAYS be professional, even when being savage - your goal is to help, not harm
6. ALWAYS make your feedback SPECIFIC to what's in the resume - don't make generic points

If the submitted document doesn't look like a resume at all, simply say "IS THIS A RESUME? NO" at the start of your response, give it a score of 0, and explain that it doesn't appear to be a resume. Only rate actual resumes.
`;
    
    // Add job position and field context if provided
    let jobContext = '';
    if (options.jobPosition || options.jobField) {
      jobContext = '\n\n# IMPORTANT CONTEXT:';
      
      if (options.jobPosition) {
        jobContext += `\nThe candidate is applying for a "${options.jobPosition}" position.`;
      }
      
      if (options.jobField) {
        jobContext += `\nThe candidate is looking for work in the "${options.jobField}" field.`;
      }
      
      jobContext += '\nTailor your feedback to be relevant to this specific job position and/or field.';
    }
    
    const prompt = `${system}${jobContext}\n\n${AI_PROMPTS[roastIntensity]}\n\nResume Content:\n${resumeText}`;

    // Get AI analysis
    try {
      if (!groq) {
        throw new Error('GROQ client is not initialized. Check your API key.');
      }
      
      console.log('Sending request to GROQ API...');
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: system
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: GROQ_MODEL,
        temperature: 0.9,
        max_tokens: 2000,
        top_p: 0.95,
        stop: null
      });
      
      console.log('Received response from GROQ API');
      const aiResponse = completion.choices[0]?.message?.content || '';

      // Check if the AI thinks this is a resume
      const isResumeMatch = aiResponse.match(/IS THIS A RESUME\?\s*(YES|NO)/i);
      if (isResumeMatch && isResumeMatch[1].toUpperCase() === 'NO') {
        return NON_RESUME_RESPONSE;
      }

      // Parse the structured response
      let score = 50; // Default score
      let rejectionLetter = '';
      let feedbackPoints: string[] = [];
      let constructiveFeedback: string[] = [];

      // Extract score
      const scoreMatch = aiResponse.match(/SCORE:\s*(\d+)/i);
      if (scoreMatch && scoreMatch[1]) {
        score = parseInt(scoreMatch[1]);
      }

      // Apply minimum scores based on intensity without adding arbitrary points
      // This ensures we don't go below the minimum thresholds for each intensity level
      // but preserves the original score when it's already above the minimum
      if (roastIntensity === 'mild' && score < 65) {
        score = 65; // Minimum floor for mild
      } else if (roastIntensity === 'medium' && score < 55) {
        score = 55; // Minimum floor for medium
      } else if (roastIntensity === 'savage' && score < 45) {
        score = 45; // Minimum floor for savage
      }
      // No arbitrary point additions

      // Extract rejection letter - improved regex to better match the rejection letter section
      const rejectionMatch = aiResponse.match(/REJECTION LETTER:[\s\S]*?(?=FEEDBACK POINTS:|$)/i);
      if (rejectionMatch) {
        // Clean up the rejection letter
        rejectionLetter = rejectionMatch[0]
          .replace(/REJECTION LETTER:/i, '') // Remove the section header
          .trim()
          .replace(/\*\*/g, '') // Remove double asterisks
          .replace(/\*/g, '')   // Remove single asterisks
          .replace(/---+/g, '') // Remove horizontal lines
          .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
          .replace(/<think>[\s\S]*?<\/think>/g, '') // Remove think sections
          .replace(/Resume Review Feedback/g, '') // Remove "Resume Review Feedback" text
          .replace(/Real Feedback/g, '') // Remove "Real Feedback" text
          .replace(/Verdict/g, '') // Remove "Verdict" text
          .replace(/Vedant Palsaniya's Resume Review/g, '') // Remove specific resume review text
          .replace(/Summary of Qualifications:/g, '') // Remove section headers
          .replace(/Work & Volunteer Experience:/g, '')
          .replace(/Co-Curricular Involvements:/g, '')
          .replace(/Boy Scouts of America:/g, '')
          .replace(/National High School Honor Society:/g, '')
          .replace(/Python Classes & Circuitry Club:/g, '')
          .replace(/Education:/g, '')
          .replace(/Awards & Achievements:/g, '')
          .replace(/Overall Feedback:/g, '')
          .trim();
        
        // If the rejection letter is too long, truncate it to the first 3-4 sentences
        const sentences = rejectionLetter.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length > 4) {
          rejectionLetter = sentences.slice(0, 4).join('. ') + '.';
        }
      } else {
        // Fallback to a more generic approach if the specific regex fails
        const lines = aiResponse.split('\n');
        let rejectionStartIndex = -1;
        let rejectionEndIndex = -1;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes('rejection letter:')) {
            rejectionStartIndex = i;
          } else if (rejectionStartIndex !== -1 && lines[i].toLowerCase().includes('feedback points:')) {
            rejectionEndIndex = i;
            break;
          }
        }
        
        if (rejectionStartIndex !== -1) {
          const rejectionLines = rejectionEndIndex !== -1 
            ? lines.slice(rejectionStartIndex + 1, rejectionEndIndex) 
            : lines.slice(rejectionStartIndex + 1);
          
          rejectionLetter = rejectionLines
            .join('\n')
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/---+/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/<think>[\s\S]*?<\/think>/g, '')
            .replace(/Resume Review Feedback/g, '')
            .replace(/Real Feedback/g, '')
            .replace(/Verdict/g, '')
            .trim();
          
          // If the rejection letter is too long, truncate it to the first 3-4 sentences
          const sentences = rejectionLetter.split(/[.!?]+/).filter(s => s.trim().length > 0);
          if (sentences.length > 4) {
            rejectionLetter = sentences.slice(0, 4).join('. ') + '.';
          }
        } else {
          // If we still can't find a rejection letter, use the first part of the response
          const firstPart = aiResponse.split('FEEDBACK POINTS:')[0];
          rejectionLetter = firstPart
            .replace(/IS THIS A RESUME\?.*/i, '')
            .replace(/SCORE:.*/i, '')
            .replace(/REJECTION LETTER:/i, '')
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/---+/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/<think>[\s\S]*?<\/think>/g, '')
            .replace(/Resume Review Feedback/g, '')
            .replace(/Real Feedback/g, '')
            .replace(/Verdict/g, '')
            .trim();
          
          // If the rejection letter is too long, truncate it to the first 3-4 sentences
          const sentences = rejectionLetter.split(/[.!?]+/).filter(s => s.trim().length > 0);
          if (sentences.length > 4) {
            rejectionLetter = sentences.slice(0, 4).join('. ') + '.';
          }
        }
      }

      // Extract feedback points - improved regex to better match the feedback points section
      const feedbackMatch = aiResponse.match(/FEEDBACK POINTS:[\s\S]*?(?=CONSTRUCTIVE FEEDBACK:|$)/i);
      if (feedbackMatch) {
        // Split by numbered points or bullet points
        const feedbackText = feedbackMatch[0].replace(/FEEDBACK POINTS:/i, '').trim();
        const points = feedbackText
          .split(/\n(?=\d+\.|\*|\-|•)/)
          .map((point: string) => point
            .replace(/^\d+\.|\*|\-|•\s*/, '') // Remove bullet points and numbering
            .replace(/^\[\w+\s+feedback.*?\]/i, '') // Remove feedback point labels
            .replace(/\*\*/g, '') // Remove double asterisks
            .replace(/\*/g, '')   // Remove single asterisks
            .replace(/🎯|💡|⭐|🔍|💪/g, '') // Remove common emoji markers at the beginning
            .trim()
          )
          .filter((point: string) => point.length > 0 && 
            !point.includes('Real Feedback') && 
            !point.includes('Verdict') &&
            !point.includes("Vedant Palsaniya's Resume Review") &&
            !point.includes("Summary of Qualifications:") &&
            !point.includes("Work & Volunteer Experience:") &&
            !point.includes("Co-Curricular Involvements:") &&
            !point.includes("Boy Scouts of America:") &&
            !point.includes("National High School Honor Society:") &&
            !point.includes("Python Classes & Circuitry Club:") &&
            !point.includes("Education:") &&
            !point.includes("Awards & Achievements:") &&
            !point.includes("Overall Feedback:")
          );
        
        // Remove duplicate feedback points
        const uniquePoints = [...new Set(points)];
        feedbackPoints = uniquePoints as string[];
      } else {
        // Fallback to a more generic approach if the specific regex fails
        const lines = aiResponse.split('\n');
        let feedbackStartIndex = -1;
        let feedbackEndIndex = -1;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes('feedback points:')) {
            feedbackStartIndex = i;
          } else if (feedbackStartIndex !== -1 && lines[i].toLowerCase().includes('constructive feedback:')) {
            feedbackEndIndex = i;
            break;
          }
        }
        
        if (feedbackStartIndex !== -1) {
          const feedbackLines = feedbackEndIndex !== -1 
            ? lines.slice(feedbackStartIndex + 1, feedbackEndIndex) 
            : lines.slice(feedbackStartIndex + 1);
          
          const points = feedbackLines
            .filter((line: string) => /^\d+\.|\*|\-|•/.test(line.trim()))
            .map((line: string) => line
              .replace(/^\d+\.|\*|\-|•\s*/, '')
              .replace(/\*\*/g, '')
              .replace(/\*/g, '')
              .trim()
            )
            .filter((point: string) => point.length > 0 && !point.includes('Real Feedback') && !point.includes('Verdict'));
          
          // Remove duplicate feedback points
          const uniquePoints = [...new Set(points)];
          feedbackPoints = uniquePoints as string[];
        } else {
          // If we still can't find feedback points, try to extract from the full response
          const points = aiResponse
            .split('\n')
            .filter((line: string) => /^\d+\.|\*|\-|•/.test(line.trim()))
            .map((line: string) => line
              .replace(/^\d+\.|\*|\-|•\s*/, '')
              .replace(/\*\*/g, '')
              .replace(/\*/g, '')
              .trim()
            )
            .filter((point: string) => point.length > 0 && !point.includes('Real Feedback') && !point.includes('Verdict'));
          
          // Remove duplicate feedback points
          const uniquePoints = [...new Set(points)];
          feedbackPoints = uniquePoints as string[];
          
          // If still no feedback points, use the first 5 non-empty lines
          if (feedbackPoints.length === 0) {
            const fallbackPoints = aiResponse
              .split('\n')
              .filter((line: string) => line.trim().length > 0)
              .slice(0, 5)
              .map((line: string) => line
                .replace(/\*\*/g, '')
                .replace(/\*/g, '')
                .trim()
              )
              .filter((point: string) => point.length > 0 && !point.includes('Real Feedback') && !point.includes('Verdict'));
            
            // Remove duplicate feedback points
            feedbackPoints = [...new Set(fallbackPoints)] as string[];
          }
        }
      }

      // Extract constructive feedback - new section
      const constructiveMatch = aiResponse.match(/CONSTRUCTIVE FEEDBACK:[\s\S]*?(?=$)/i);
      if (constructiveMatch) {
        // Split by numbered points or bullet points
        const constructiveText = constructiveMatch[0].replace(/CONSTRUCTIVE FEEDBACK:/i, '').trim();
        const points = constructiveText
          .split(/\n(?=\d+\.|\*|\-|•)/)
          .map((point: string) => point
            .replace(/^\d+\.|\*|\-|•\s*/, '') // Remove bullet points and numbering
            .replace(/^\[\w+.*?\]/i, '') // Remove instruction labels
            .replace(/\*\*/g, '') // Remove double asterisks
            .replace(/\*/g, '')   // Remove single asterisks
            .trim()
          )
          .filter((point: string) => point.length > 0);
        
        // Remove duplicate feedback points
        const uniquePoints = [...new Set(points)];
        constructiveFeedback = uniquePoints as string[];
      } else {
        // Fallback to a more generic approach if the specific regex fails
        const lines = aiResponse.split('\n');
        let constructiveStartIndex = -1;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes('constructive feedback:')) {
            constructiveStartIndex = i;
            break;
          }
        }
        
        if (constructiveStartIndex !== -1) {
          const constructiveLines = lines.slice(constructiveStartIndex + 1);
          const points = constructiveLines
            .filter((line: string) => /^\d+\.|\*|\-|•/.test(line.trim()))
            .map((line: string) => line
              .replace(/^\d+\.|\*|\-|•\s*/, '')
              .replace(/\*\*/g, '')
              .replace(/\*/g, '')
              .trim()
            )
            .filter((point: string) => point.length > 0);
          
          // Remove duplicate feedback points
          const uniquePoints = [...new Set(points)];
          constructiveFeedback = uniquePoints as string[];
        } else {
          // If we still can't find constructive feedback, use the last 5 non-empty lines
          const fallbackPoints = aiResponse
            .split('\n')
            .filter((line: string) => line.trim().length > 0)
            .slice(-5)
            .map((line: string) => line
              .replace(/\*\*/g, '')
              .replace(/\*/g, '')
              .trim()
            )
            .filter((point: string) => point.length > 0);
          
          // Remove duplicate feedback points
          constructiveFeedback = [...new Set(fallbackPoints)] as string[];
        }
      }

      // Ensure we have at least one feedback point
      if (feedbackPoints.length === 0) {
        feedbackPoints = ["No specific feedback points were generated. Please try again."];
      }

      // Ensure we have at least one constructive feedback point
      if (constructiveFeedback.length === 0) {
        constructiveFeedback = ["No specific constructive feedback was generated. Please try again."];
      }

      // Update the extraction of letter grade
      // Now ensure it ALWAYS matches our numerical grade
      let letterGrade = extractLetterGradeFromScore(score);

      // For display, extract the explanation from AI's response if available
      let letterGradeExplanation = '';
      const letterGradeMatch = aiResponse.match(/LETTER GRADE:\s*(.*?)(?=\n|$)/i);
      if (letterGradeMatch && letterGradeMatch[1]) {
        const fullGradeText = letterGradeMatch[1].trim();
        
        // Try to extract just the explanation after the letter grade
        const explanationMatch = fullGradeText.match(/[A-F][+-]?(.+)/i);
        if (explanationMatch && explanationMatch[1]) {
          letterGradeExplanation = explanationMatch[1].trim();
        }
      }

      // Combine the correct letter grade with any explanation
      letterGrade = letterGradeExplanation && letterGradeExplanation.length > 0
        ? `${letterGrade}${letterGradeExplanation}`
        : letterGrade;

      // Format the rejection letter to be a proper sassy email
      if (rejectionLetter) {
        // If it doesn't start with a proper email greeting, add one
        if (!rejectionLetter.match(/^(Dear|Hello|Hi|Greetings|Hey)/i)) {
          rejectionLetter = `Dear Applicant,\n\n${rejectionLetter}`;
        }
        
        // If it doesn't have a title/subject line, add one
        if (!rejectionLetter.match(/Review Summary|Application Status|Resume Review|Feedback on|Assessment of/i)) {
          // Try to extract job position from options or use a generic title
          const position = options.jobPosition ? options.jobPosition : "the position";
          rejectionLetter = rejectionLetter.replace(/^(Dear.*?),\s*\n/i, `$1,\n\nReview Summary for ${position} Position\n\n`);
        }
        
        // If it doesn't end with a signature, add one
        if (!rejectionLetter.match(/(Regards|Sincerely|Best|Cheers|Thanks|Warmly|Yours truly)/i)) {
          rejectionLetter = `${rejectionLetter}\n\nBest regards,\nThe Rejection Bot`;
        }
        
        // Check if the letter has numbered points and convert them to paragraphs
        if (rejectionLetter.match(/\d+\.\s+/)) {
          const paragraphs = rejectionLetter.split(/\d+\.\s+/).filter(p => p.trim().length > 0);
          rejectionLetter = paragraphs.join('\n\n');
          
          // Ensure proper greeting and closing remain
          if (!rejectionLetter.match(/^(Dear|Hello|Hi|Greetings|Hey)/i)) {
            rejectionLetter = `Dear Applicant,\n\n${rejectionLetter}`;
          }
          
          if (!rejectionLetter.match(/(Regards|Sincerely|Best|Cheers|Thanks|Warmly|Yours truly)/i)) {
            rejectionLetter = `${rejectionLetter}\n\nBest regards,\nThe Rejection Bot`;
          }
        }
        
        // Ensure the letter has at least two paragraphs and isn't too short
        const paragraphs = rejectionLetter.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        if (paragraphs.length < 3) {
          // Add a generic middle paragraph if the letter is too short
          const letterGradeRef = letterGrade.substring(0, 2);
          const middleParagraph = `Your resume scored a ${letterGradeRef} on our evaluation scale, which frankly was more surprising to us than finding out the Earth is round. The combination of formatting issues and vague descriptions made reviewing your resume feel like trying to solve a mystery with half the clues missing. Perhaps next time, consider adding more specifics about your achievements rather than generic statements that could apply to anyone with a pulse.`;
          
          if (paragraphs.length === 2) {
            // Insert middle paragraph between greeting and closing
            rejectionLetter = `${paragraphs[0]}\n\n${middleParagraph}\n\n${paragraphs[1]}`;
          } else if (paragraphs.length === 1) {
            // Add both middle paragraph and closing
            rejectionLetter = `${paragraphs[0]}\n\n${middleParagraph}\n\nBest regards,\nThe Rejection Bot`;
          }
        }
        
        // Clean up any remaining formatting issues
        rejectionLetter = rejectionLetter
          .replace(/\n{3,}/g, '\n\n') // Replace excessive newlines
          .replace(/\s+,/g, ',') // Fix spacing before commas
          .replace(/\s+\./g, '.') // Fix spacing before periods
          .trim();
      }

      return {
        rejectionLetter,
        feedbackPoints,
        constructiveFeedback,
        score,
        letterGrade,
        roastIntensity,
        canSave: true,
        isValidResume: true,
        jobPosition: options.jobPosition,
        jobField: options.jobField,
        text: resumeText
      };
    } catch (error) {
      console.error('Error calling GROQ API:', error);
      throw new Error(`Failed to analyze resume: ${error instanceof Error ? error.message : String(error)}`);
    }
  } catch (error) {
    console.error('Error analyzing resume:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to analyze resume: ${error.message}`);
    } else {
      throw new Error('Failed to analyze resume. Please try again.');
    }
  }
}

// Function to check if the document is actually a resume
async function checkIfResume(text: string): Promise<boolean> {
  // Common resume keywords and patterns
  const resumeKeywords = [
    'resume', 'cv', 'curriculum vitae', 'work experience', 'employment history',
    'education', 'skills', 'qualifications', 'professional summary', 'objective',
    'contact information', 'phone', 'email', 'address', 'job title', 'position',
    'company', 'university', 'college', 'degree', 'certification', 'achievement'
  ];
  
  // Check for resume-like structure
  const hasResumeStructure = resumeKeywords.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // Check for common resume sections
  const hasSections = /(experience|education|skills|summary|objective|contact)/i.test(text);
  
  // Check for date patterns (common in resumes)
  const hasDates = /\d{4}/.test(text);
  
  // Check for bullet points or numbered lists (common in resumes)
  const hasBulletPoints = /[•\-\*]|\d+\./.test(text);
  
  // If it has multiple indicators of being a resume, consider it a resume
  const indicators = [hasResumeStructure, hasSections, hasDates, hasBulletPoints];
  const resumeIndicators = indicators.filter(Boolean).length;
  
  return resumeIndicators >= 2;
} 

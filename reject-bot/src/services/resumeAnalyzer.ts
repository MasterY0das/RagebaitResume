import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import pdfParse from 'pdf-parse';

// Initialize Groq client for API calls
const apiKey = process.env.GROQ_API_KEY;

// Types
type RoastIntensity = 'mild' | 'medium' | 'savage';

interface AnalyzeOptions {
  jobPosition?: string;
  jobField?: string;
}

interface AnalysisResult {
  feedbackPoints: string[];
  rejectionLetter: string;
  score: number;
  letterGrade?: string;
  roastIntensity: RoastIntensity;
  jobPosition?: string;
  jobField?: string;
}

/**
 * Analyzes a resume file and provides feedback based on the specified intensity
 */
export async function analyzeResume(
  filePath: string,
  intensity: RoastIntensity = 'medium',
  options: AnalyzeOptions = {}
): Promise<AnalysisResult> {
  try {
    // Read file content
    const fileContent = readFileSync(filePath);
    let resumeText: string;

    // Extract text from file
    if (filePath.endsWith('.pdf')) {
      const pdfData = await pdfParse(fileContent);
      resumeText = pdfData.text;
    } else if (filePath.endsWith('.txt')) {
      resumeText = fileContent.toString('utf-8');
    } else {
      throw new Error('Unsupported file format. Please upload a PDF or TXT file.');
    }

    // Make API call to analyze resume
    const result = await analyzeResumeWithAI(resumeText, intensity, options);
    return result;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
}

/**
 * Uses AI to analyze a resume
 */
async function analyzeResumeWithAI(
  resumeText: string,
  intensity: RoastIntensity,
  options: AnalyzeOptions
): Promise<AnalysisResult> {
  try {
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured. Please check your environment variables.');
    }

    // Generate a simulated result for deployment testing
    // In production, this would make an actual API call to Groq or similar AI service
    const mockResult: AnalysisResult = {
      feedbackPoints: [
        "Your resume lacks specific achievements and metrics",
        "Too many generic buzzwords without concrete examples",
        "Skills section needs better organization",
        "Education section is too prominent for your experience level",
        "Contact information formatting could be improved"
      ],
      rejectionLetter: "Thank you for your application, but we've decided to pursue other candidates whose experience better aligns with our needs. Your resume would benefit from more specific achievements and metrics that demonstrate your impact.",
      score: intensity === 'mild' ? 75 : intensity === 'medium' ? 65 : 55,
      letterGrade: intensity === 'mild' ? 'B' : intensity === 'medium' ? 'C+' : 'C-',
      roastIntensity: intensity,
      jobPosition: options.jobPosition,
      jobField: options.jobField
    };

    return mockResult;
  } catch (error) {
    console.error('Error in AI analysis:', error);
    throw error;
  }
} 
// API base URL - default to localhost if not specified in environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface AnalyzeResumeOptions {
  intensity: string;
  jobPosition?: string;
  jobField?: string;
}

/**
 * Analyzes a resume file using the backend service
 * 
 * @param file The resume file to analyze
 * @param options Options including intensity level and job context
 * @returns Object containing analysis results
 */
export async function analyzeResume(file: File, options: AnalyzeResumeOptions) {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('roastIntensity', options.intensity);
    
    // Add job context if provided
    if (options.jobPosition) {
      formData.append('jobPosition', options.jobPosition);
    }
    
    if (options.jobField) {
      formData.append('jobField', options.jobField);
    }

    // Add a timeout for the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout

    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle non-200 responses
    if (!response.ok) {
      let errorMessage = 'Failed to analyze resume';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse the error JSON, just use the default message
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.rejectionLetter || !Array.isArray(data.feedbackPoints) || typeof data.score !== 'number') {
      console.error('Invalid response format:', data);
      throw new Error('Received invalid response format from server');
    }
    
    return data;
  } catch (error) {
    // Handle AbortError specifically
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out. The server might be overloaded or offline.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to analyze resume');
  }
} 
interface LoginParams {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
}

export async function loginUser({ email, password }: LoginParams): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Login failed');
  }

  const data = await response.json();

  if (!data.success || !data.token) {
    throw new Error('Invalid login response');
  }

  return data;
}

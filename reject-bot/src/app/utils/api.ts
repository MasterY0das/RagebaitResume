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

// Add getSavedResumes function
/**
 * Retrieves all saved resumes for the authenticated user
 * 
 * @returns Object containing success status and resume data
 */
export async function getSavedResumes() {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to fetch saved resumes';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If we can't parse the error JSON, just use the default message
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      data: data.user?.savedResumes || []
    };
  } catch (error) {
    console.error('Error fetching saved resumes:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch saved resumes'
    };
  }
} 
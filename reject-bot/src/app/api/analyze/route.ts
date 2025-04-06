import { NextRequest, NextResponse } from 'next/server';

// Make sure this URL doesn't have '/api' at the end as we're adding it below
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;
    const roastIntensity = formData.get('roastIntensity') as string;
    const jobPosition = formData.get('jobPosition') as string;
    const jobField = formData.get('jobField') as string;
    
    console.log('Processing analyze request:', { 
      hasFile: !!file, 
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      roastIntensity, 
      jobPosition, 
      jobField,
      backendUrl: BACKEND_URL
    });
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Create a new FormData instance to send to the backend
    const backendFormData = new FormData();
    backendFormData.append('resume', file);
    backendFormData.append('intensity', roastIntensity || 'medium');
    backendFormData.append('roastIntensity', roastIntensity || 'medium');
    
    // Add job context if provided
    if (jobPosition) {
      backendFormData.append('jobPosition', jobPosition);
    }
    
    if (jobField) {
      backendFormData.append('jobField', jobField);
    }

    console.log(`Sending request to ${BACKEND_URL}/api/analyze`);
    
    // Forward the request to the backend with longer timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: 'POST',
        body: backendFormData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `Backend returned status ${response.status}` };
        }
        
        console.error('Backend error:', errorData);
        return NextResponse.json(
          { error: errorData?.error || 'Failed to analyze resume' },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Fetch error:', fetchError);
      
      // Handle connection refusal specifically
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch failed')) {
        return NextResponse.json(
          { 
            error: 'Could not connect to the backend server', 
            details: 'Make sure the backend server is running on port 3001',
            originalError: fetchError.message
          },
          { status: 503 }
        );
      }
      
      throw fetchError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Error in analyze route:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 
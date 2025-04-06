import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const roastIntensity = formData.get('roastIntensity') as string;
    const jobPosition = formData.get('jobPosition') as string;
    const jobField = formData.get('jobField') as string;
    
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
    
    // Add job context if provided
    if (jobPosition) {
      backendFormData.append('jobPosition', jobPosition);
    }
    
    if (jobField) {
      backendFormData.append('jobField', jobField);
    }

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/analyze`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Backend error:', errorData);
      return NextResponse.json(
        { error: errorData?.error || 'Failed to analyze resume' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in analyze route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 
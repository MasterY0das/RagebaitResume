import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '../../../../services/resumeAnalyzer';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const roastIntensity = formData.get('roastIntensity') as 'mild' | 'medium' | 'savage' || 'medium';
    const jobPosition = formData.get('jobPosition') as string || '';
    const jobField = formData.get('jobField') as string || '';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Read the file content directly
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get the file extension
    const fileName = file.name.toLowerCase();
    
    // Pass the buffer directly to the resume analyzer
    const result = await analyzeResume(
      buffer, 
      roastIntensity,
      {
        jobPosition,
        jobField
      }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    );
  }
} 
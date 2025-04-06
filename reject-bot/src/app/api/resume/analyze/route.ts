import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '../../../../services/resumeAnalyzer';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Read the file content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const filename = `${uuidv4()}-${file.name}`;
    const tempFilePath = join(tempDir, filename);

    // Write the file to disk
    await writeFile(tempFilePath, buffer);

    // Analyze the resume with job info
    const result = await analyzeResume(
      tempFilePath, 
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
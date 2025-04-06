import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    // Get the token from the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Not authorized, no token' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Get resume data from request body
    const body = await request.json();
    const { 
      resumeId, 
      score, 
      letterGrade, 
      feedback, 
      rejectionLetter,
      jobPosition,
      jobField
    } = body;
    
    // Validation
    if (!resumeId || !letterGrade || !rejectionLetter) {
      return NextResponse.json(
        { success: false, message: 'Missing required resume data' },
        { status: 400 }
      );
    }
    
    // Forward the request to the backend with the token
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const response = await axios.post(
      `${backendUrl}/api/auth/save-resume`,
      {
        resumeId,
        score,
        letterGrade,
        feedback,
        rejectionLetter,
        jobPosition,
        jobField
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Save resume error:', error);
    
    // Return the error from the backend if available
    if (error.response) {
      return NextResponse.json(
        { success: false, message: error.response.data.message || 'Failed to save resume' },
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Server error saving resume' },
      { status: 500 }
    );
  }
} 
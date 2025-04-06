import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const response = await axios.post(`${backendUrl}/api/auth/register`, {
      username,
      email,
      password
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Return the error from the backend if available
    if (error.response) {
      return NextResponse.json(
        { success: false, message: error.response.data.message || 'Registration failed' },
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Server error during registration' },
      { status: 500 }
    );
  }
} 
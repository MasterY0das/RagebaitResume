import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide email and password' },
        { status: 400 }
      );
    }

    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const response = await axios.post(`${backendUrl}/api/auth/login`, {
      email,
      password
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Return the error from the backend if available
    if (error.response) {
      return NextResponse.json(
        { success: false, message: error.response.data.message || 'Login failed' },
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Server error during login' },
      { status: 500 }
    );
  }
} 
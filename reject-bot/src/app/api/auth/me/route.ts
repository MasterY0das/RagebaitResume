import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
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
    
    // Forward the request to the backend with the token
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const response = await axios.get(`${backendUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Get current user error:', error);
    
    // Return the error from the backend if available
    if (error.response) {
      return NextResponse.json(
        { success: false, message: error.response.data.message || 'Failed to fetch user data' },
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Server error fetching user profile' },
      { status: 500 }
    );
  }
} 
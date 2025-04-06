import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabase';

export async function GET(request: NextRequest) {
  // Get the query code from the URL
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to the saved resumes page
  return NextResponse.redirect(new URL('/saved-resumes', request.url));
} 
import { NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabase';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      token: data.session?.access_token
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}

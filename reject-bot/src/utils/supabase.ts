import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Debug info
console.log('Supabase URL:', supabaseUrl);
console.log('URL format correct:', supabaseUrl.startsWith('https://'));
console.log('Anon key defined:', !!supabaseAnonKey && supabaseAnonKey.length > 20);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
}

if (!supabaseUrl.startsWith('https://')) {
  console.error('Invalid Supabase URL format. URL must start with https://');
  console.error('Current URL:', supabaseUrl);
  console.error('Expected format: https://yourproject.supabase.co');
}

// Create the Supabase client with better error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test the connection
(async function testConnection() {
  try {
    const { error } = await supabase.from('_does_not_exist_test_table').select('*').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.error('Error connecting to Supabase:', error);
    } else {
      console.log('Supabase connection successful');
    }
  } catch (error) {
    console.error('Fatal error connecting to Supabase:', error);
  }
})();

export type ResumeAnalysis = {
  id?: string;
  user_id?: string;
  resume_name: string;
  job_position?: string;
  job_field?: string;
  intensity: 'mild' | 'medium' | 'savage';
  rejection_letter: string;
  feedback_points: string[];
  score: number;
  created_at?: string;
};

export type User = {
  id: string;
  email: string;
  name?: string;
}; 
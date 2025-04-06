import { supabase, ResumeAnalysis, User } from './supabase';

/**
 * Check if the resume_analyses table exists
 */
export async function checkTableExists() {
  try {
    const { data, error } = await supabase
      .from('resume_analyses')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error checking table existence:', error);
      return {
        exists: false,
        error: error.message
      };
    }
    
    return { exists: true, error: null };
  } catch (err) {
    console.error('Exception checking table existence:', err);
    return {
      exists: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

/**
 * Save a resume analysis to the database
 */
export async function saveResumeAnalysis(analysis: Omit<ResumeAnalysis, 'id' | 'created_at'>) {
  try {
    // First check if table exists
    const { exists, error: tableError } = await checkTableExists();
    if (!exists) {
      throw new Error(`Database table does not exist: ${tableError}`);
    }
    
    const { data, error } = await supabase
      .from('resume_analyses')
      .insert([analysis])
      .select()
      .single();

    if (error) {
      console.error('Error saving resume analysis:', error);
      throw error;
    }

    return data as ResumeAnalysis;
  } catch (err) {
    console.error('Exception saving resume analysis:', err);
    throw err;
  }
}

/**
 * Get all resume analyses for a user
 */
export async function getUserResumeAnalyses(userId: string) {
  try {
    // First check if table exists
    const { exists, error: tableError } = await checkTableExists();
    if (!exists) {
      throw new Error(`Database table does not exist: ${tableError}`);
    }
    
    const { data, error } = await supabase
      .from('resume_analyses')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error retrieving user resume analyses:', error);
      throw error;
    }

    return data as ResumeAnalysis[];
  } catch (err) {
    console.error('Exception retrieving user resume analyses:', err);
    throw err;
  }
}

/**
 * Get a specific resume analysis by ID
 */
export async function getResumeAnalysis(id: string) {
  try {
    // First check if table exists
    const { exists, error: tableError } = await checkTableExists();
    if (!exists) {
      throw new Error(`Database table does not exist: ${tableError}`);
    }
    
    const { data, error } = await supabase
      .from('resume_analyses')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error retrieving resume analysis:', error);
      throw error;
    }

    return data as ResumeAnalysis;
  } catch (err) {
    console.error('Exception retrieving resume analysis:', err);
    throw err;
  }
}

/**
 * Delete a resume analysis
 */
export async function deleteResumeAnalysis(id: string) {
  try {
    // First check if table exists  
    const { exists, error: tableError } = await checkTableExists();
    if (!exists) {
      throw new Error(`Database table does not exist: ${tableError}`);
    }
    
    const { error } = await supabase
      .from('resume_analyses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting resume analysis:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Exception deleting resume analysis:', err);
    throw err;
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting current user:', error);
      throw error;
    }

    return user;
  } catch (err) {
    console.error('Exception getting current user:', err);
    throw err;
  }
} 